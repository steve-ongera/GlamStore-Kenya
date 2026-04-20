# pickups/admin.py
from django.contrib import admin
from .models import County, PickupStation


class PickupStationInline(admin.TabularInline):
    model = PickupStation
    extra = 1


@admin.register(County)
class CountyAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'delivery_fee', 'is_active']
    list_editable = ['delivery_fee', 'is_active']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [PickupStationInline]


@admin.register(PickupStation)
class PickupStationAdmin(admin.ModelAdmin):
    list_display = ['name', 'county', 'town', 'pickup_fee', 'is_active']
    list_filter = ['county', 'is_active']
    list_editable = ['pickup_fee', 'is_active']
    search_fields = ['name', 'address', 'town']