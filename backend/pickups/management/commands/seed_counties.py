"""
Management command to seed all 47 Kenya counties with sample pickup stations.

Usage:
    python manage.py seed_counties
"""
from django.core.management.base import BaseCommand
from pickups.models import County, PickupStation

KENYA_COUNTIES = [
    ("Mombasa", "MSA", 200), ("Kwale", "KWL", 350), ("Kilifi", "KLF", 350),
    ("Tana River", "TNR", 450), ("Lamu", "LMU", 500), ("Taita-Taveta", "TTV", 400),
    ("Garissa", "GRS", 500), ("Wajir", "WJR", 550), ("Mandera", "MND", 600),
    ("Marsabit", "MRS", 550), ("Isiolo", "ISL", 450), ("Meru", "MRU", 350),
    ("Tharaka-Nithi", "THN", 400), ("Embu", "EMB", 350), ("Kitui", "KTI", 350),
    ("Machakos", "MKS", 250), ("Makueni", "MKN", 300), ("Nyandarua", "NYD", 300),
    ("Nyeri", "NYR", 300), ("Kirinyaga", "KRN", 300), ("Murang'a", "MRG", 250),
    ("Kiambu", "KMB", 150), ("Turkana", "TRK", 600), ("West Pokot", "WPK", 500),
    ("Samburu", "SMB", 500), ("Trans Nzoia", "TNZ", 350), ("Uasin Gishu", "USG", 350),
    ("Elgeyo-Marakwet", "EGM", 400), ("Nandi", "NND", 350), ("Baringo", "BRN", 400),
    ("Laikipia", "LKP", 350), ("Nakuru", "NKR", 250), ("Narok", "NRK", 350),
    ("Kajiado", "KJD", 200), ("Kericho", "KRC", 350), ("Bomet", "BMT", 400),
    ("Kakamega", "KKM", 350), ("Vihiga", "VHG", 400), ("Bungoma", "BNM", 350),
    ("Busia", "BSA", 400), ("Siaya", "SYA", 400), ("Kisumu", "KSM", 350),
    ("Homa Bay", "HMB", 400), ("Migori", "MGR", 400), ("Kisii", "KSI", 350),
    ("Nyamira", "NYM", 400), ("Nairobi", "NRB", 100),
]

SAMPLE_STATIONS = {
    "Nairobi": [
        ("CBD Pickup Point", "Tom Mboya St, CBD", "Nairobi", 50),
        ("Westlands Station", "Westlands Mall, Ring Road", "Westlands", 80),
        ("Eastlands Pickup", "Jogoo Road, Eastlands", "Eastlands", 80),
        ("Ngong Road Hub", "Prestige Plaza, Ngong Road", "Ngong Road", 80),
        ("Thika Road Station", "Garden City Mall, Thika Rd", "Kasarani", 100),
    ],
    "Mombasa": [
        ("Mombasa CBD", "Moi Avenue, CBD", "Mombasa", 80),
        ("Nyali Station", "Nyali Centre, Links Road", "Nyali", 100),
    ],
    "Kisumu": [
        ("Kisumu CBD", "Oginga Odinga Street", "Kisumu", 80),
    ],
    "Nakuru": [
        ("Nakuru Town", "Kenyatta Avenue", "Nakuru", 80),
    ],
    "Kiambu": [
        ("Thika Town Hub", "Kenyatta Highway, Thika", "Thika", 80),
    ],
}


class Command(BaseCommand):
    help = 'Seed all 47 Kenya counties and sample pickup stations'

    def handle(self, *args, **kwargs):
        created_counties = 0
        created_stations = 0

        for name, code, delivery_fee in KENYA_COUNTIES:
            county, created = County.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'delivery_fee': delivery_fee,
                    'is_active': True,
                }
            )
            if created:
                created_counties += 1
                self.stdout.write(f'  ✓ County: {name}')

            # Add sample stations
            if name in SAMPLE_STATIONS:
                for st_name, address, town, pickup_fee in SAMPLE_STATIONS[name]:
                    _, st_created = PickupStation.objects.get_or_create(
                        county=county,
                        name=st_name,
                        defaults={
                            'address': address,
                            'town': town,
                            'pickup_fee': pickup_fee,
                            'operating_hours': 'Mon–Sat: 8AM – 7PM',
                            'is_active': True,
                        }
                    )
                    if st_created:
                        created_stations += 1

        self.stdout.write(self.style.SUCCESS(
            f'\n✅ Done! Created {created_counties} counties and {created_stations} pickup stations.'
        ))