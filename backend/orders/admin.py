# orders/admin.py
from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem, Coupon


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product_name', 'unit_price', 'subtotal']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'customer_name', 'status', 'total', 'payment_method', 'delivery_method', 'created_at']
    list_filter = ['status', 'payment_method', 'delivery_method', 'payment_status']
    search_fields = ['order_number', 'customer_name', 'customer_email', 'customer_phone']
    readonly_fields = ['id', 'order_number', 'created_at']
    inlines = [OrderItemInline]


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_type', 'discount_value', 'is_active', 'times_used', 'valid_until']
    list_editable = ['is_active']