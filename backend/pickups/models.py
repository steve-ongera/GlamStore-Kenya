from django.db import models
from django.utils.text import slugify


class County(models.Model):
    """Kenya has 47 counties"""
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    code = models.CharField(max_length=5, unique=True, help_text='County code e.g. NRB')
    is_active = models.BooleanField(default=True)
    # Base delivery fee for this county (door-to-door)
    delivery_fee = models.DecimalField(max_digits=8, decimal_places=2, default=200.00)

    class Meta:
        verbose_name_plural = 'Counties'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class PickupStation(models.Model):
    """Each county can have multiple pickup stations"""
    county = models.ForeignKey(County, on_delete=models.CASCADE, related_name='pickup_stations')
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, max_length=250)
    address = models.CharField(max_length=300)
    town = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    # Pickup fee (cheaper than door delivery)
    pickup_fee = models.DecimalField(max_digits=8, decimal_places=2, default=100.00)
    # Contact
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    # Operating hours
    operating_hours = models.CharField(max_length=200, default='Mon-Sat: 8AM - 6PM')
    # Location
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['county__name', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            base = f'{self.county.slug}-{slugify(self.name)}'
            self.slug = base
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.name} ({self.county.name})'