from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import County, PickupStation
from .serializers import CountySerializer, PickupStationSerializer


class CountyViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CountySerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    pagination_class = None  # Return all counties — only 47 in Kenya

    def get_queryset(self):
        return County.objects.filter(is_active=True).prefetch_related('pickup_stations').order_by('name')


class PickupStationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PickupStationSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterable_fields = ['county__slug', 'county__id']
    search_fields = ['name', 'town']
    pagination_class = None  # Return all stations for a county

    def get_queryset(self):
        qs = PickupStation.objects.filter(is_active=True).select_related('county')
        county_id = self.request.query_params.get('county_id')
        county_slug = self.request.query_params.get('county__slug')
        if county_id:
            qs = qs.filter(county__id=county_id)
        if county_slug:
            qs = qs.filter(county__slug=county_slug)
        return qs