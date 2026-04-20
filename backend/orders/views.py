from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db import transaction

from .models import Cart, CartItem, Order, OrderItem, Coupon
from .serializers import CartSerializer, CartItemSerializer, OrderSerializer, CreateOrderSerializer
from products.models import Product, ProductVariant
from pickups.models import County, PickupStation


class CartViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def _get_cart(self, request):
        if request.user.is_authenticated:
            cart, _ = Cart.objects.get_or_create(user=request.user)
        else:
            session_key = request.session.session_key
            if not session_key:
                request.session.create()
                session_key = request.session.session_key
            cart, _ = Cart.objects.get_or_create(session_key=session_key)
        return cart

    def list(self, request):
        cart = self._get_cart(request)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add(self, request):
        cart = self._get_cart(request)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        variant_id = request.data.get('variant_id')

        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        variant = None
        if variant_id:
            try:
                variant = ProductVariant.objects.get(id=variant_id, product=product)
            except ProductVariant.DoesNotExist:
                return Response({'error': 'Variant not found'}, status=status.HTTP_404_NOT_FOUND)

        item, created = CartItem.objects.get_or_create(
            cart=cart, product=product, variant=variant,
            defaults={'quantity': quantity}
        )
        if not created:
            item.quantity += quantity
            item.save()

        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def update_item(self, request):
        cart = self._get_cart(request)
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

        if quantity <= 0:
            item.delete()
        else:
            item.quantity = quantity
            item.save()

        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        cart = self._get_cart(request)
        item_id = request.data.get('item_id')
        CartItem.objects.filter(id=item_id, cart=cart).delete()
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def clear(self, request):
        cart = self._get_cart(request)
        cart.items.all().delete()
        return Response({'detail': 'Cart cleared'})

    @action(detail=False, methods=['post'])
    def validate_coupon(self, request):
        from django.utils import timezone
        code = request.data.get('code', '')
        cart = self._get_cart(request)
        try:
            coupon = Coupon.objects.get(
                code__iexact=code,
                is_active=True,
                valid_from__lte=timezone.now(),
                valid_until__gte=timezone.now()
            )
        except Coupon.DoesNotExist:
            return Response({'error': 'Invalid or expired coupon'}, status=status.HTTP_400_BAD_REQUEST)

        if coupon.usage_limit and coupon.times_used >= coupon.usage_limit:
            return Response({'error': 'Coupon usage limit reached'}, status=status.HTTP_400_BAD_REQUEST)

        if cart.total < coupon.minimum_order:
            return Response({'error': f'Minimum order of Ksh {coupon.minimum_order} required'},
                            status=status.HTTP_400_BAD_REQUEST)

        discount = coupon.discount_value
        if coupon.discount_type == 'percent':
            discount = (coupon.discount_value / 100) * cart.total

        return Response({'discount': float(discount), 'coupon_code': code})


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post']

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items')

    @transaction.atomic
    def create(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Get cart
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Your cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        if not cart.items.exists():
            return Response({'error': 'Your cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate delivery fee
        delivery_fee = 0
        pickup_station = None
        delivery_county = None

        if data['delivery_method'] == 'pickup':
            pickup_station = PickupStation.objects.get(id=data['pickup_station_id'])
            delivery_fee = float(pickup_station.pickup_fee)
        else:
            delivery_county = County.objects.get(id=data['delivery_county_id'])
            delivery_fee = float(delivery_county.delivery_fee)

        subtotal = float(cart.total)

        # Apply coupon
        discount = 0
        if data.get('coupon_code'):
            from django.utils import timezone
            try:
                coupon = Coupon.objects.get(code__iexact=data['coupon_code'], is_active=True,
                                            valid_from__lte=timezone.now(), valid_until__gte=timezone.now())
                if coupon.discount_type == 'percent':
                    discount = (coupon.discount_value / 100) * subtotal
                else:
                    discount = float(coupon.discount_value)
                coupon.times_used += 1
                coupon.save()
            except Coupon.DoesNotExist:
                pass

        total = subtotal + delivery_fee - discount

        # Create order
        order = Order.objects.create(
            user=request.user,
            delivery_method=data['delivery_method'],
            pickup_station=pickup_station,
            delivery_street=data.get('delivery_street', ''),
            delivery_town=data.get('delivery_town', ''),
            delivery_county=delivery_county,
            customer_name=data['customer_name'],
            customer_email=data['customer_email'],
            customer_phone=data['customer_phone'],
            payment_method=data['payment_method'],
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            discount=discount,
            total=total,
            notes=data.get('notes', ''),
        )

        # Create order items
        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                product_slug=item.product.slug,
                variant_info=f'{item.variant.get_variant_type_display()}: {item.variant.value}' if item.variant else '',
                quantity=item.quantity,
                unit_price=item.unit_price,
                subtotal=item.subtotal,
            )
            # Deduct stock
            item.product.stock -= item.quantity
            item.product.save(update_fields=['stock'])

        cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)