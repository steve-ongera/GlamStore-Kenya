from rest_framework import serializers
from .models import MainCategory, SubCategory, Brand, Product, ProductImage, ProductVariant, Review, Wishlist, Banner


class MainCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MainCategory
        fields = ['id', 'name', 'slug', 'description', 'image', 'icon', 'order']


class SubCategorySerializer(serializers.ModelSerializer):
    main_category_name = serializers.CharField(source='main_category.name', read_only=True)
    main_category_slug = serializers.CharField(source='main_category.slug', read_only=True)

    class Meta:
        model = SubCategory
        fields = ['id', 'name', 'slug', 'description', 'image', 'main_category', 'main_category_name',
                  'main_category_slug', 'order']


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'logo']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_main', 'order']


class ProductVariantSerializer(serializers.ModelSerializer):
    variant_type_display = serializers.CharField(source='get_variant_type_display', read_only=True)

    class Meta:
        model = ProductVariant
        fields = ['id', 'variant_type', 'variant_type_display', 'value', 'stock', 'price_adjustment',
                  'image', 'is_active']


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'user_name', 'rating', 'title', 'body', 'is_verified_purchase', 'created_at']
        read_only_fields = ['user_name', 'is_verified_purchase', 'created_at']

    def get_user_name(self, obj):
        return f'{obj.user.first_name} {obj.user.last_name[0]}.'


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    main_image = serializers.SerializerMethodField()
    discount_percent = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    sub_category_name = serializers.CharField(source='sub_category.name', read_only=True)
    main_category_name = serializers.CharField(source='main_category.name', read_only=True)
    main_category_slug = serializers.CharField(source='main_category.slug', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True, allow_null=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'brand_name', 'short_description',
            'price', 'compare_price', 'discount_percent',
            'main_image', 'is_in_stock', 'is_featured', 'is_new_arrival',
            'is_best_seller', 'average_rating', 'review_count',
            'main_category_name', 'main_category_slug', 'sub_category_name', 'gender',
        ]

    def get_main_image(self, obj):
        img = obj.main_image
        if img:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(img.image.url)
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer"""
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    main_category = MainCategorySerializer(read_only=True)
    sub_category = SubCategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    discount_percent = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'sku', 'brand', 'main_category', 'sub_category', 'gender',
            'short_description', 'description', 'meta_title', 'meta_description',
            'price', 'compare_price', 'discount_percent',
            'stock', 'is_in_stock', 'is_low_stock', 'is_featured', 'is_new_arrival', 'is_best_seller',
            'images', 'variants', 'reviews',
            'average_rating', 'review_count',
            'weight', 'created_at',
        ]


class WishlistSerializer(serializers.ModelSerializer):
    products = ProductListSerializer(many=True, read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'products']


class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ['id', 'title', 'subtitle', 'image', 'link', 'position', 'order']