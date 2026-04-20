from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework import viewsets
from .models import County, PickupStation
from .serializers import CountySerializer, PickupStationSerializer


class CountyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = County.objects.filter(is_active=True).prefetch_related('pickup_stations')
    serializer_class = CountySerializer
    lookup_field = 'slug'


class PickupStationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PickupStation.objects.filter(is_active=True).select_related('county')
    serializer_class = PickupStationSerializer
    lookup_field = 'slug'
    filterset_fields = ['county__slug']


router = DefaultRouter()
router.register('counties', CountyViewSet, basename='counties')
router.register('stations', PickupStationViewSet, basename='stations')

urlpatterns = [path('', include(router.urls))]