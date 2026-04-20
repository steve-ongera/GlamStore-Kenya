from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class MainCategory(models.Model):
    """Top-level categories: Perfumes, Hair, Beauty Services, Clothing"""
    CATEGORY_ICONS = {
        'perfumes': '🌸',
        'hair': '💇',
        'beauty': '✨',
        'clothing': '👗',
    }

    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, max_length=150)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    icon = models.CharField(max_length=10, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = 'Main Category'
        verbose_name_plural = 'Main Categories'
        ordering = ['order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class SubCategory(models.Model):
    """
    Sub-categories:
    Perfumes -> Girls, Boys, Boss, Babies, Unisex
    Hair -> Wigs, Extensions, Braids, Natural
    Beauty -> Waxing, Microblading, Stick-ons, Nails
    Clothing -> Women/Ladies, Men, Girls Dresses
    """
    main_category = models.ForeignKey(MainCategory, on_delete=models.CASCADE, related_name='subcategories')
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, max_length=200)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='subcategories/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = 'Sub Category'
        verbose_name_plural = 'Sub Categories'
        ordering = ['order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            base = f'{self.main_category.slug}-{slugify(self.name)}'
            self.slug = base
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.main_category.name} > {self.name}'


class Brand(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    logo = models.ImageField(upload_to='brands/', blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    GENDER_CHOICES = [
        ('women', 'Women / Ladies'),
        ('men', 'Men'),
        ('girls', 'Girls'),
        ('boys', 'Boys'),
        ('babies', 'Babies'),
        ('unisex', 'Unisex'),
    ]

    # Core fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=300)
    sku = models.CharField(max_length=50, unique=True, blank=True)
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    main_category = models.ForeignKey(MainCategory, on_delete=models.CASCADE, related_name='products')
    sub_category = models.ForeignKey(SubCategory, on_delete=models.CASCADE, related_name='products')
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='unisex')

    # Descriptions (SEO-friendly)
    short_description = models.CharField(max_length=500)
    description = models.TextField()
    meta_title = models.CharField(max_length=70, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)

    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    compare_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True,
                                        help_text='Original price before discount')
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # Inventory
    stock = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=5)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=False)
    is_best_seller = models.BooleanField(default=False)

    # Physical attributes
    weight = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text='Weight in grams')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['main_category', 'sub_category']),
            models.Index(fields=['is_active', 'is_featured']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1
            self.slug = slug
        if not self.sku:
            self.sku = str(self.id)[:8].upper()
        if not self.meta_title:
            self.meta_title = self.name[:70]
        if not self.meta_description:
            self.meta_description = self.short_description[:160]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    @property
    def discount_percent(self):
        if self.compare_price and self.compare_price > self.price:
            return int(((self.compare_price - self.price) / self.compare_price) * 100)
        return 0

    @property
    def is_in_stock(self):
        return self.stock > 0

    @property
    def is_low_stock(self):
        return 0 < self.stock <= self.low_stock_threshold

    @property
    def main_image(self):
        img = self.images.filter(is_main=True).first()
        return img or self.images.first()

    @property
    def average_rating(self):
        reviews = self.reviews.all()
        if reviews.exists():
            return round(sum(r.rating for r in reviews) / reviews.count(), 1)
        return 0

    @property
    def review_count(self):
        return self.reviews.count()


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    alt_text = models.CharField(max_length=200, blank=True)
    is_main = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-is_main', 'order']

    def save(self, *args, **kwargs):
        if self.is_main:
            ProductImage.objects.filter(product=self.product, is_main=True).update(is_main=False)
        super().save(*args, **kwargs)


class ProductVariant(models.Model):
    """For sizes, scents, colors etc."""
    VARIANT_TYPES = [
        ('size', 'Size'),
        ('color', 'Color'),
        ('scent', 'Scent / Fragrance'),
        ('volume', 'Volume / ML'),
        ('length', 'Length'),
        ('type', 'Type'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    variant_type = models.CharField(max_length=20, choices=VARIANT_TYPES)
    value = models.CharField(max_length=100)  # e.g. "XL", "Rose Gold", "100ml"
    stock = models.PositiveIntegerField(default=0)
    price_adjustment = models.DecimalField(max_digits=8, decimal_places=2, default=0,
                                           help_text='Price added to/subtracted from base price')
    image = models.ImageField(upload_to='variants/', blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['product', 'variant_type', 'value']

    def __str__(self):
        return f'{self.product.name} - {self.get_variant_type_display()}: {self.value}'


class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey('core.User', on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=200, blank=True)
    body = models.TextField()
    is_verified_purchase = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['product', 'user']
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} - {self.product.name} ({self.rating}★)'


class Wishlist(models.Model):
    user = models.OneToOneField('core.User', on_delete=models.CASCADE, related_name='wishlist')
    products = models.ManyToManyField(Product, blank=True, related_name='wishlisted_by')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.email} wishlist'


class Banner(models.Model):
    POSITION_CHOICES = [
        ('hero', 'Hero Slider'),
        ('mid', 'Mid Page Banner'),
        ('category', 'Category Banner'),
    ]
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=300, blank=True)
    image = models.ImageField(upload_to='banners/')
    link = models.CharField(max_length=300, blank=True)
    position = models.CharField(max_length=20, choices=POSITION_CHOICES, default='hero')
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title