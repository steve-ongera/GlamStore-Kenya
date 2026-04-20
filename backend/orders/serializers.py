from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem
from products.serializers import ProductListSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.UUIDField(write_only=True)
    variant_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    subtotal = serializers.ReadOnlyField()
    unit_price = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'variant_id', 'variant', 'quantity', 'unit_price', 'subtotal']
        read_only_fields = ['variant']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.ReadOnlyField()
    item_count = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total', 'item_count']


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'variant_info', 'quantity', 'unit_price', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    delivery_method_display = serializers.CharField(source='get_delivery_method_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'status_display',
            'delivery_method', 'delivery_method_display',
            'pickup_station', 'delivery_street', 'delivery_town', 'delivery_county',
            'customer_name', 'customer_email', 'customer_phone',
            'subtotal', 'delivery_fee', 'discount', 'total',
            'payment_method', 'payment_method_display', 'payment_status', 'payment_reference',
            'notes', 'items', 'created_at',
        ]
        read_only_fields = ['id', 'order_number', 'status', 'subtotal', 'total', 'created_at']


class CreateOrderSerializer(serializers.Serializer):
    delivery_method = serializers.ChoiceField(choices=['pickup', 'delivery'])
    pickup_station_id = serializers.IntegerField(required=False, allow_null=True)
    delivery_street = serializers.CharField(required=False, allow_blank=True)
    delivery_town = serializers.CharField(required=False, allow_blank=True)
    delivery_county_id = serializers.IntegerField(required=False, allow_null=True)
    customer_name = serializers.CharField()
    customer_email = serializers.EmailField()
    customer_phone = serializers.CharField()
    payment_method = serializers.ChoiceField(choices=['mpesa', 'card', 'cod', 'bank'])
    coupon_code = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        if data['delivery_method'] == 'pickup' and not data.get('pickup_station_id'):
            raise serializers.ValidationError({'pickup_station_id': 'Pickup station is required.'})
        if data['delivery_method'] == 'delivery' and not data.get('delivery_county_id'):
            raise serializers.ValidationError({'delivery_county_id': 'County is required for door delivery.'})
        return data