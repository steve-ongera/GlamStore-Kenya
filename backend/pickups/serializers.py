from rest_framework import serializers
from .models import County, PickupStation


class PickupStationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PickupStation
        fields = ['id', 'name', 'slug', 'address', 'town', 'description',
                  'pickup_fee', 'phone', 'email', 'operating_hours',
                  'latitude', 'longitude', 'is_active']


class CountySerializer(serializers.ModelSerializer):
    pickup_stations = PickupStationSerializer(many=True, read_only=True)

    class Meta:
        model = County
        fields = ['id', 'name', 'slug', 'code', 'delivery_fee', 'pickup_stations']