from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('categories', views.MainCategoryViewSet, basename='categories')
router.register('subcategories', views.SubCategoryViewSet, basename='subcategories')
router.register('brands', views.BrandViewSet, basename='brands')
router.register('', views.ProductViewSet, basename='products')
router.register('banners', views.BannerViewSet, basename='banners')
router.register('wishlist', views.WishlistViewSet, basename='wishlist')

urlpatterns = [
    path('', include(router.urls)),
]