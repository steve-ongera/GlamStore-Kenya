from django.db import models
import uuid


class Cart(models.Model):
    user = models.OneToOneField('core.User', on_delete=models.CASCADE, related_name='cart', null=True, blank=True)
    session_key = models.CharField(max_length=100, blank=True, null=True, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Cart #{self.id}'

    @property
    def total(self):
        return sum(item.subtotal for item in self.items.all())

    @property
    def item_count(self):
        return self.items.aggregate(total=models.Sum('quantity'))['total'] or 0


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    variant = models.ForeignKey('products.ProductVariant', on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['cart', 'product', 'variant']

    @property
    def unit_price(self):
        base = self.product.price
        if self.variant:
            base += self.variant.price_adjustment
        return base

    @property
    def subtotal(self):
        return self.unit_price * self.quantity

    def __str__(self):
        return f'{self.quantity}x {self.product.name}'


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Payment'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('packed', 'Packed'),
        ('shipped', 'Shipped'),
        ('ready_pickup', 'Ready for Pickup'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]

    PAYMENT_METHODS = [
        ('mpesa', 'M-Pesa'),
        ('card', 'Credit/Debit Card'),
        ('cod', 'Cash on Delivery'),
        ('bank', 'Bank Transfer'),
    ]

    DELIVERY_METHODS = [
        ('pickup', 'Pickup Station'),
        ('delivery', 'Door Delivery'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=20, unique=True, blank=True)
    user = models.ForeignKey('core.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Delivery
    delivery_method = models.CharField(max_length=20, choices=DELIVERY_METHODS, default='pickup')
    pickup_station = models.ForeignKey(
        'pickups.PickupStation', on_delete=models.SET_NULL, null=True, blank=True, related_name='orders'
    )
    # Door delivery address
    delivery_street = models.CharField(max_length=255, blank=True)
    delivery_town = models.CharField(max_length=100, blank=True)
    delivery_county = models.ForeignKey(
        'pickups.County', on_delete=models.SET_NULL, null=True, blank=True, related_name='delivery_orders'
    )

    # Customer info (snapshot)
    customer_name = models.CharField(max_length=200)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20)

    # Pricing
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    # Payment
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='mpesa')
    payment_status = models.CharField(max_length=20, default='unpaid')
    payment_reference = models.CharField(max_length=100, blank=True)
    mpesa_transaction_id = models.CharField(max_length=50, blank=True)

    # Notes
    notes = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.order_number:
            last = Order.objects.order_by('-created_at').first()
            num = (last.order_number.replace('GS', '') if last and last.order_number else '1000')
            try:
                self.order_number = f'GS{int(num) + 1}'
            except ValueError:
                self.order_number = f'GS{str(self.id)[:6].upper()}'
        super().save(*args, **kwargs)

    def __str__(self):
        return f'Order {self.order_number}'


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=255)  # snapshot
    product_slug = models.SlugField()  # snapshot
    variant_info = models.CharField(max_length=200, blank=True)  # snapshot
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f'{self.quantity}x {self.product_name} (Order {self.order.order_number})'


class Coupon(models.Model):
    DISCOUNT_TYPES = [
        ('percent', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    ]
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPES)
    discount_value = models.DecimalField(max_digits=8, decimal_places=2)
    minimum_order = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    times_used = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()

    def __str__(self):
        return self.code