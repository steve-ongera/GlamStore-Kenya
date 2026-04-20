"""
Management command to seed 50+ GlamStore products with real local images.

Images are loaded from: D:/gadaf/Documents/images/jumia/
(On Linux/Mac the path is passed via --images-dir argument)

Usage:
    python manage.py seed_products
    python manage.py seed_products --images-dir "D:/gadaf/Documents/images/jumia"
    python manage.py seed_products --clear          # wipe existing products first
"""

import os
import random
import shutil
from pathlib import Path
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.core.files import File
from django.utils.text import slugify
from django.conf import settings

from products.models import (
    MainCategory, SubCategory, Brand,
    Product, ProductImage, ProductVariant,
)
from pickups.models import County


# ──────────────────────────────────────────────────────────────────────────────
#  CATALOGUE DATA
# ──────────────────────────────────────────────────────────────────────────────

BRANDS = [
    "Chanel", "Dior", "Gucci", "Versace", "Armani",
    "Victoria's Secret", "Bath & Body Works", "La Riche Directions",
    "Revlon", "L'Oréal", "Maybelline", "MAC", "Fenty Beauty",
    "Zara", "H&M", "SHEIN", "Fashion Nova", "Ankara Glam",
    "Braiding Queen", "Silk & Glory",
]

# (main_slug, sub_name, gender, name, short_desc, desc, price, compare_price, stock)
PRODUCTS_DATA = [

    # ── PERFUMES – GIRLS ──────────────────────────────────────────────────────
    ("perfumes", "Girls Perfumes", "girls",
     "Chanel Chance Eau Tendre 100ml",
     "A fresh floral scent perfect for young ladies.",
     "Chanel Chance Eau Tendre is a luminous, soft, and fresh fragrance. "
     "Top notes of grapefruit and quince, heart of hyacinth and jasmine, "
     "base of white musk and iris. Ideal for daytime wear.",
     3500, 4500, 30),

    ("perfumes", "Girls Perfumes", "girls",
     "Victoria's Secret Bombshell 50ml",
     "Bold, flirty, and irresistibly feminine.",
     "Bombshell by Victoria's Secret is a rich and playful fragrance featuring "
     "notes of purple passion fruit, Shangri-la peony, and vanilla orchid. "
     "A crowd favourite for any occasion.",
     1800, 2400, 45),

    ("perfumes", "Girls Perfumes", "girls",
     "Dior Miss Dior Blooming Bouquet 75ml",
     "A delicate peony-led scent for the modern girl.",
     "Miss Dior Blooming Bouquet opens with sparkling Sicilian mandarin and "
     "pink peony petals. The white musk base lingers beautifully all day.",
     4200, 5500, 20),

    ("perfumes", "Girls Perfumes", "girls",
     "Zara Woman Gardenia 80ml",
     "Affordable luxury with a floral heart.",
     "Zara Woman Gardenia captures the essence of fresh white flowers with "
     "top notes of bergamot, heart of gardenia and jasmine, warm woody base.",
     900, 1200, 60),

    ("perfumes", "Girls Perfumes", "girls",
     "Gucci Bloom 50ml EDP",
     "Intense white floral for the free-spirited woman.",
     "Gucci Bloom is a rich, full white floral fragrance inspired by a garden "
     "in full bloom. Natural tuberose, jasmine and Rangoon creeper unite.",
     5500, 6800, 18),

    # ── PERFUMES – BOYS ───────────────────────────────────────────────────────
    ("perfumes", "Boys Perfumes", "boys",
     "Versace Eros Pour Homme 100ml",
     "A powerful, fresh mint fragrance for bold men.",
     "Versace Eros opens with fresh mint leaves and Italian lemon zest. "
     "Green apple and geranium form the heart, with a base of vanilla, vetiver "
     "and oakmoss. A signature scent for the modern Kenyan man.",
     4800, 6000, 25),

    ("perfumes", "Boys Perfumes", "boys",
     "Armani Acqua di Giò 75ml",
     "The freshest marine scent for everyday wear.",
     "Acqua di Gio is inspired by the Mediterranean sea. Aquatic notes, "
     "bergamot, neroli and white musk create an effortlessly cool fragrance.",
     5200, 6500, 22),

    ("perfumes", "Boys Perfumes", "boys",
     "Dior Sauvage EDP 60ml",
     "Radically fresh, ruggedly masculine.",
     "Dior Sauvage is a woody, spicy fragrance featuring pepper, bergamot, "
     "elemi resin and labdanum. One of the best-selling men's fragrances worldwide.",
     5800, 7200, 15),

    ("perfumes", "Boys Perfumes", "boys",
     "Zara Man Silver 100ml",
     "Premium fragrance at an accessible price.",
     "Zara Man Silver is a fresh, clean scent with top notes of bergamot, "
     "cardamom, and lavender. A great entry-level luxury fragrance.",
     850, 1100, 70),

    ("perfumes", "Boys Perfumes", "boys",
     "Axe Dark Temptation Body Spray 150ml",
     "Irresistible chocolate-woods scent for young men.",
     "Dark Temptation blends warm chocolate, amber and sandalwood for a "
     "uniquely seductive body spray. Long-lasting and affordable.",
     450, 600, 100),

    # ── PERFUMES – BOSS COLLECTION ────────────────────────────────────────────
    ("perfumes", "Boss Collection", "unisex",
     "Hugo Boss Bottled Night 100ml",
     "A sophisticated night-time scent for the executive.",
     "Hugo Boss Bottled Night features cardamom, birch and jasmine on a base "
     "of oakmoss and sandalwood. Perfect for boardroom dinners and gala nights.",
     5500, 7000, 12),

    ("perfumes", "Boss Collection", "unisex",
     "Chanel Bleu de Chanel EDP 100ml",
     "Timeless, noble, and unmistakably Chanel.",
     "Bleu de Chanel blends citrus freshness with deep woody notes. "
     "Lemon, mint, pink pepper, ginger and sandalwood create a masterpiece "
     "for the distinguished professional.",
     8500, 10500, 10),

    ("perfumes", "Boss Collection", "unisex",
     "Tom Ford Oud Wood 50ml",
     "Rare oud for the connoisseur of luxury.",
     "Tom Ford Oud Wood is a warm, smoky fragrance featuring rare oud wood, "
     "sandalwood, Chinese pepper, and amber. An investment scent.",
     12000, 15000, 8),

    # ── PERFUMES – BABIES ─────────────────────────────────────────────────────
    ("perfumes", "Babies", "babies",
     "Johnson's Baby Cologne 125ml",
     "Gentle, hypoallergenic scent for your little one.",
     "Johnson's Baby Cologne is specially formulated for babies' delicate skin. "
     "No parabens, no dyes. A soft, clean scent that's safe from day one.",
     550, 700, 80),

    ("perfumes", "Babies", "babies",
     "Mustela Musti Baby Cologne 50ml",
     "Premium French baby fragrance — gentle on newborns.",
     "Musti by Mustela is a hypoallergenic, alcohol-free cologne designed "
     "for babies from birth. Notes of soft powder, white musk and sweet violet.",
     1200, 1600, 35),

    # ── HUMAN HAIR ────────────────────────────────────────────────────────────
    ("hair", "Wigs", "women",
     "Brazilian Body Wave Wig 16 inch",
     "Silky body wave lace front wig — pre-plucked hairline.",
     "This premium Brazilian human hair body wave wig features a 13x4 lace "
     "front with pre-plucked natural hairline and baby hairs. 150% density, "
     "can be dyed and bleached. Comes with adjustable straps.",
     8500, 12000, 20),

    ("hair", "Wigs", "women",
     "Kinky Curly Full Lace Wig 14 inch",
     "Natural Afro kinky curls — 100% human hair.",
     "Full lace wig with 4C natural kinky curly pattern. 180% density, "
     "natural black colour. Glueless option available. Perfect for protective styling.",
     7200, 9500, 15),

    ("hair", "Wigs", "women",
     "Straight Bob Lace Closure Wig 12 inch",
     "Chic bob cut with a natural hairline.",
     "This sleek straight bob wig has a 4x4 lace closure with a natural-looking "
     "part. Glossy and smooth — low maintenance and beginner-friendly.",
     5500, 7000, 25),

    ("hair", "Extensions", "women",
     "Peruvian Straight Hair Bundle 3pcs 18inch",
     "Silky straight bundles — double drawn and full.",
     "Three bundles of Peruvian straight human hair, 18 inches each. "
     "Double drawn from root to tip. Tangle-free, shed-free. Can be coloured.",
     6000, 8000, 18),

    ("hair", "Braids", "women",
     "Jumbo Kanekalon Braiding Hair 6pcs Pack",
     "Soft, lightweight braiding hair — reduced itch formula.",
     "Professional-grade Kanekalon braiding hair for box braids, goddess braids "
     "and twists. Heat-resistant. Pack of 6 — enough for a full head.",
     800, 1100, 90),

    # ── BEAUTY SERVICES / WAXING ──────────────────────────────────────────────
    ("beauty", "Waxing", "women",
     "Nair Hair Removal Cream 368g",
     "Smooth, hair-free skin in 3 minutes — no waxing strips needed.",
     "Nair Hair Removal Cream dissolves unwanted hair at the root for results "
     "that last up to 8 weeks longer than shaving. Enriched with baby oil "
     "for moisturised, silky skin. Safe for legs, underarms and bikini area.",
     1200, 1600, 55),

    ("beauty", "Waxing", "women",
     "Veet Ready-to-Use Wax Strips 20pcs",
     "Salon-quality wax strips for at-home use.",
     "Veet Ready-to-Use Wax Strips remove hair from the root for up to 4 weeks "
     "of smooth skin. Suitable for sensitive skin. Includes 4 perfect finish wipes.",
     950, 1300, 65),

    ("beauty", "Waxing", "women",
     "Hot Wax Beans Kit 300g + Heater",
     "Professional hard wax for sensitive areas.",
     "This complete at-home waxing kit includes 300g of stripless hard wax beans "
     "and a wax heater. Ideal for face, underarms, bikini and Brazilian waxing. "
     "Low temperature, gentle on skin.",
     1800, 2500, 40),

    # ── BEAUTY – MICROBLADING ─────────────────────────────────────────────────
    ("beauty", "Microblading", "women",
     "Microblading Starter Kit 18-Piece",
     "Professional eyebrow microblading kit for permanent-look brows.",
     "Complete microblading kit including: disposable microblading pens (10), "
     "practice skin, pigment (brown & black), mapping string, ruler, numbing cream "
     "and aftercare balm. Great for practitioners and students.",
     3500, 4800, 30),

    ("beauty", "Microblading", "women",
     "Eyebrow Pigment Ink Set — 12 Shades",
     "Long-lasting brow pigments for microblading and PMU.",
     "Set of 12 professional microblading/PMU pigments. Colours range from ash "
     "blonde to deep ebony. Formulated for sensitive skin, REACH compliant, "
     "fade-resistant for 12–18 months.",
     2200, 3000, 25),

    # ── BEAUTY – STICK-ONS ────────────────────────────────────────────────────
    ("beauty", "Stick-ons", "women",
     "Press-On Nails Set — Almond Stiletto 24pcs",
     "Salon-quality press-on nails — no UV lamp needed.",
     "24-piece press-on nail set in a chic nude-pink ombre almond shape. "
     "Includes adhesive tabs and nail glue. Lasts up to 2 weeks. Reusable.",
     850, 1200, 80),

    ("beauty", "Stick-ons", "women",
     "3D Nail Art Stickers — Flowers & Gems 10 Sheets",
     "Add instant glam to any nail look.",
     "10 sheets of 3D self-adhesive nail stickers featuring flowers, butterflies "
     "and crystal gems. Compatible with gel, acrylic and natural nails.",
     450, 700, 120),

    ("beauty", "Stick-ons", "women",
     "Eyelash Extensions Individual Fans 0.07mm D Curl",
     "Professional individual eyelash fans for volume sets.",
     "Pre-made volume fans in 0.07mm thickness, D curl. Available in 8–14mm mix. "
     "PBT material — lightweight and natural-looking. For professional use.",
     1500, 2000, 45),

    ("beauty", "Stick-ons", "women",
     "Self-Adhesive Eyelashes — Wispy Drama 5 Pairs",
     "No glue needed — dramatic wispy lashes in seconds.",
     "5 pairs of self-adhesive wispy false lashes with built-in strip adhesive. "
     "Cruelty-free, reusable up to 15 times. Apply and remove in under 60 seconds.",
     650, 900, 90),

    # ── WOMEN'S CLOTHING ──────────────────────────────────────────────────────
    ("womens-clothing", "Dresses", "women",
     "Ankara Wrap Maxi Dress",
     "Vibrant African print wrap dress for any occasion.",
     "This stunning Ankara wrap maxi dress is made from 100% cotton African "
     "wax print fabric. Features a V-neckline, flutter sleeves and a side "
     "slit. Available in sizes S–3XL. Dry clean recommended.",
     2800, 3800, 35),

    ("womens-clothing", "Dresses", "women",
     "Bodycon Bandage Dress — Little Black",
     "The ultimate figure-hugging little black dress.",
     "This bandage bodycon dress hugs every curve beautifully. Made from "
     "stretch nylon-spandex blend. Knee-length, strapless, boning-supported. "
     "Perfect for nights out and parties.",
     2200, 3200, 40),

    ("womens-clothing", "Dresses", "women",
     "Off-Shoulder Ruffle Summer Dress",
     "Breezy floral dress for beach and brunch.",
     "Light and airy off-shoulder dress with ruffle hem detail. 100% polyester "
     "chiffon fabric. Available in multiple floral prints. Great for Kenyan weather.",
     1800, 2500, 50),

    ("womens-clothing", "Tops", "women",
     "Linen Crop Top — 5 Colours",
     "Breathable linen crop top for everyday effortless style.",
     "This simple yet stylish linen crop top is a wardrobe staple. "
     "Available in white, beige, black, sage green and dusty pink. "
     "Pairs perfectly with high-waisted trousers or skirts.",
     950, 1400, 70),

    ("womens-clothing", "Tops", "women",
     "Sequin Halter Party Top",
     "Dazzle at every event with this shimmering halter top.",
     "Fully sequinned halter neck top with a back tie closure. Stretch lining "
     "for comfort. Pairs with wide-leg trousers or miniskirts.",
     1600, 2200, 30),

    ("womens-clothing", "Skirts", "women",
     "Pleated Midi Skirt — Satin Finish",
     "Elegant satin-finish pleated skirt for office and evenings.",
     "This floor-grazing midi skirt in satin-finish polyester drapes "
     "beautifully with every movement. Elasticated waistband. Machine washable.",
     1700, 2400, 45),

    ("womens-clothing", "Jumpsuits", "women",
     "Wide-Leg Cargo Jumpsuit",
     "Trendy utility jumpsuit with cargo pockets.",
     "This wide-leg cargo jumpsuit is the perfect blend of fashion and function. "
     "Features zippered chest pockets, adjustable straps and a belted waist. "
     "Available in khaki, black and olive.",
     2500, 3500, 28),

    # ── MEN'S CLOTHING ────────────────────────────────────────────────────────
    ("mens-clothing", "Shirts", "men",
     "Classic Oxford Button-Down Shirt",
     "Crisp, versatile Oxford shirt for work and weekend.",
     "A wardrobe essential — this classic Oxford weave button-down shirt "
     "is made from 100% cotton. Slim fit with a breast pocket. "
     "Available in white, blue, grey and pink.",
     1800, 2500, 50),

    ("mens-clothing", "Shirts", "men",
     "African Print Kitenge Shirt — Men",
     "Bold Kitenge casual shirt for the fashion-forward Kenyan man.",
     "This vibrant Kitenge shirt features traditional East African geometric "
     "prints. Short-sleeved with a camp collar. Proudly made in Kenya.",
     1500, 2000, 40),

    ("mens-clothing", "Trousers", "men",
     "Slim Fit Chino Trousers",
     "Smart-casual chinos in premium cotton twill.",
     "These slim-fit chinos are made from 98% cotton, 2% elastane for comfort "
     "and stretch. Side pockets and back welt pockets. Available in beige, "
     "navy, olive and black.",
     2200, 3000, 45),

    ("mens-clothing", "Suits", "men",
     "Two-Piece Business Suit — Charcoal Grey",
     "Sharp, well-tailored suit for the Kenyan professional.",
     "This two-piece charcoal grey suit features a notched lapel, two-button "
     "fastening and slim-cut trousers. Fully lined jacket. Dry clean only. "
     "Available in sizes 36–52.",
     8500, 12000, 15),

    ("mens-clothing", "Casual", "men",
     "Graphic Oversized Tee — Street Art Series",
     "Bold street art graphics on an oversized drop-shoulder tee.",
     "100% heavy cotton 280gsm oversized tee with a vintage washed finish. "
     "Features bold Nairobi street art prints. Drop shoulder cut. "
     "Available in sizes S–3XL.",
     1200, 1700, 60),

    ("mens-clothing", "Casual", "men",
     "Denim Jogger Jeans — Slim Tapered",
     "Jogger-style denim with the comfort of sweatpants.",
     "These innovative denim joggers combine the look of jeans with the comfort "
     "of tracksuit bottoms. Elasticated waistband and cuffed ankles. "
     "Slim tapered fit, mid-wash indigo.",
     2000, 2800, 35),

    # ── GIRLS DRESSES ─────────────────────────────────────────────────────────
    ("girls-dresses", "Casual", "girls",
     "Butterfly Tulle Party Dress — Ages 2–10",
     "Magical butterfly-print tulle dress for your little princess.",
     "This enchanting party dress features a butterfly print overlay on soft "
     "tulle, with a satin lining and a big bow at the back. Machine washable. "
     "Available in pink, blue and lilac.",
     1500, 2000, 50),

    ("girls-dresses", "Casual", "girls",
     "Denim Pinafore Dress — Ages 3–12",
     "Cute and practical denim pinafore for everyday wear.",
     "This adjustable-strap denim pinafore is a girls' wardrobe essential. "
     "A-line silhouette with front patch pockets. Pairs with any top or tee.",
     1200, 1700, 45),

    ("girls-dresses", "Party", "girls",
     "Sequin Princess Ball Gown — Ages 4–14",
     "Your little one will feel like royalty in this sparkly ball gown.",
     "Full sequinned bodice with an organza skirt — perfect for birthday parties, "
     "Christmas and celebrations. Zip back fastening with a big bow. "
     "Available in pink, gold, red and silver.",
     2500, 3500, 30),

    ("girls-dresses", "School", "girls",
     "School Uniform Dress — Navy Pinstripe",
     "Smart, durable school dress approved for Kenyan primary schools.",
     "This long-sleeve school dress is made from a durable poly-cotton blend. "
     "Button-front, Peter Pan collar, side pockets. Machine washable and "
     "colour-fast. Available in sizes 2–16 years.",
     900, 1300, 80),

    ("girls-dresses", "Babies", "babies",
     "Floral Smocked Baby Dress — 0–24 months",
     "Handmade smocked dress for baby girls — heirloom quality.",
     "This delicate smocked baby dress is made from 100% soft cotton. "
     "Elbow sleeves, scalloped collar and a back button closure. "
     "Hand-embroidered floral smocking. Machine washable on gentle cycle.",
     1100, 1600, 40),

    # ── EXTRA PRODUCTS TO HIT 50 ──────────────────────────────────────────────
    ("perfumes", "Girls Perfumes", "girls",
     "La Vie Est Belle EDP 50ml — Lancôme",
     "The scent of happiness — iris and praline.",
     "La Vie Est Belle is a sweet, feminine fragrance with notes of iris, "
     "patchouli, vanilla and praline. A gift of happiness for any woman.",
     4500, 6000, 18),

    ("hair", "Extensions", "women",
     "Clip-In Hair Extensions 7pcs 20inch — Ombre",
     "Instant length and volume — clip in, clip out.",
     "7-piece clip-in hair extension set in a beautiful brown-to-blonde ombre. "
     "Made from Remy human hair. Blends seamlessly with natural hair.",
     3500, 5000, 22),

    ("womens-clothing", "Dresses", "women",
     "Cut-Out Midi Dress — Elegant Evening",
     "Sophisticated cut-out design for formal events.",
     "This structured midi dress features tasteful waist cut-outs and a side "
     "slit. Made from crepe fabric. Available in red, black and champagne.",
     3200, 4500, 20),

    ("mens-clothing", "Shirts", "men",
     "Linen Short-Sleeve Shirt — Safari Style",
     "Breathable linen shirt ideal for Kenya's warm climate.",
     "100% pure linen short-sleeve shirt with chest pockets and a spread collar. "
     "Perfect for casual Fridays, safaris and beach days.",
     1600, 2200, 40),

    ("girls-dresses", "Party", "girls",
     "Rainbow Tutu Dress — Ages 1–8",
     "Colourful, fun tutu dress for birthdays and playdates.",
     "This cheerful rainbow tutu dress is made from layers of soft organza "
     "tulle over a soft lining. Elastic waistband, comfortable for all-day wear.",
     1300, 1900, 55),

    ("beauty", "Stick-ons", "women",
     "Rhinestone Body Gems Pack — 500pcs",
     "Crystal body stickers for festivals and events.",
     "500 self-adhesive rhinestone body gems in assorted sizes. "
     "Skin-safe adhesive, waterproof for up to 24 hours. "
     "Perfect for concerts, festivals and photoshoots.",
     700, 1000, 75),

    ("perfumes", "Boys Perfumes", "boys",
     "Invictus Paco Rabanne EDT 100ml",
     "The champion's fragrance — aquatic and woody.",
     "Invictus by Paco Rabanne opens with sea notes and grapefruit, "
     "deepened by jasmine and guaiac wood. A sporty, victorious scent.",
     5500, 7000, 20),

    ("hair", "Wigs", "women",
     "Goddess Loc Wig — 18inch Boho Style",
     "Bohemian loc wig with curly ends — festival-ready.",
     "Pre-loced boho goddess wig in a natural black to brown ombre. "
     "Glueless, adjustable straps. Curly ends give a stunning bohemian finish.",
     9500, 13000, 12),

    ("womens-clothing", "Skirts", "women",
     "Leather Mini Skirt — Faux PU",
     "Edgy faux leather mini skirt — a street-style staple.",
     "High-waisted faux leather mini skirt with a back zip closure. "
     "Available in black, brown and burgundy. Pairs with oversized blazers.",
     1400, 2000, 35),

    ("mens-clothing", "Casual", "men",
     "Bomber Jacket — Satin Varsity",
     "Retro satin bomber jacket with contrast sleeves.",
     "This classic satin varsity bomber features snap button closure, "
     "ribbed collar, cuffs and hem. Fully lined with side pockets. "
     "Available in multiple colour combos.",
     3500, 5000, 25),
]


# ──────────────────────────────────────────────────────────────────────────────
#  MAIN CATEGORY SETUP
# ──────────────────────────────────────────────────────────────────────────────

MAIN_CATEGORIES = {
    "perfumes":        ("Perfumes", "🌸"),
    "hair":            ("Human Hair", "💇"),
    "beauty":          ("Beauty & Services", "✨"),
    "womens-clothing": ("Women's Fashion", "👗"),
    "mens-clothing":   ("Men's Fashion", "👔"),
    "girls-dresses":   ("Girls Dresses", "🎀"),
}

SUB_CATEGORIES = {
    "perfumes":        ["Girls Perfumes", "Boys Perfumes", "Boss Collection", "Babies", "Unisex"],
    "hair":            ["Wigs", "Extensions", "Braids", "Natural Hair"],
    "beauty":          ["Waxing", "Microblading", "Stick-ons", "Nail Art"],
    "womens-clothing": ["Dresses", "Tops", "Skirts", "Jumpsuits", "Lingerie"],
    "mens-clothing":   ["Shirts", "Trousers", "Suits", "Casual"],
    "girls-dresses":   ["Casual", "Party", "School", "Babies"],
}

VARIANT_DATA = {
    "perfumes": [
        ("volume", ["30ml", "50ml", "75ml", "100ml"]),
    ],
    "hair": [
        ("length", ["10 inch", "12 inch", "14 inch", "16 inch", "18 inch", "20 inch", "22 inch"]),
    ],
    "beauty": [],
    "womens-clothing": [
        ("size", ["XS", "S", "M", "L", "XL", "2XL", "3XL"]),
        ("color", ["Black", "White", "Pink", "Red", "Blue", "Beige", "Green"]),
    ],
    "mens-clothing": [
        ("size", ["S", "M", "L", "XL", "2XL", "3XL"]),
        ("color", ["Black", "White", "Navy", "Grey", "Khaki"]),
    ],
    "girls-dresses": [
        ("size", ["0-12M", "1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y", "7-8Y", "9-10Y", "11-12Y"]),
    ],
}


class Command(BaseCommand):
    help = "Seed 50+ products with local images from D:/gadaf/Documents/images/jumia"

    def add_arguments(self, parser):
        parser.add_argument(
            "--images-dir",
            type=str,
            default=r"D:\gadaf\Documents\images\jumia",
            help="Path to folder containing product images",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all existing products before seeding",
        )

    def handle(self, *args, **options):
        images_dir = Path(options["images_dir"])
        self.stdout.write(f"\n📂 Image directory: {images_dir}")

        # Collect all available images
        image_files = self._collect_images(images_dir)
        self.stdout.write(f"🖼️  Found {len(image_files)} image(s)\n")

        if not image_files:
            self.stdout.write(self.style.WARNING(
                "⚠️  No images found! Products will be created without images.\n"
                f"   Please add images to: {images_dir}\n"
                "   Supported formats: JPG, JPEG, PNG, WEBP, GIF\n"
            ))

        # Optionally clear existing products
        if options["clear"]:
            self.stdout.write("🗑️  Clearing existing products...")
            Product.objects.all().delete()
            ProductImage.objects.all().delete()
            self.stdout.write("   Done.\n")

        # Build lookup maps
        brand_map = self._ensure_brands()
        main_cat_map = self._ensure_main_categories()
        sub_cat_map = self._ensure_sub_categories(main_cat_map)

        created = 0
        skipped = 0
        img_idx = 0  # rotating image index

        for row in PRODUCTS_DATA:
            (main_slug, sub_name, gender,
             name, short_desc, desc,
             price, compare_price, stock) = row

            # Skip if already exists
            if Product.objects.filter(name=name).exists():
                self.stdout.write(f"   ↷ Skipping (exists): {name}")
                skipped += 1
                continue

            main_cat = main_cat_map.get(main_slug)
            if not main_cat:
                self.stdout.write(self.style.WARNING(f"   ⚠ Unknown category: {main_slug}"))
                continue

            sub_key = f"{main_slug}::{sub_name}"
            sub_cat = sub_cat_map.get(sub_key)
            if not sub_cat:
                self.stdout.write(self.style.WARNING(f"   ⚠ Unknown sub-category: {sub_name}"))
                continue

            # Pick a brand
            brand_name = random.choice([b for b in BRANDS if b])
            brand = brand_map[brand_name]

            # Create product
            product = Product.objects.create(
                name=name,
                brand=brand,
                main_category=main_cat,
                sub_category=sub_cat,
                gender=gender,
                short_description=short_desc,
                description=desc,
                price=Decimal(str(price)),
                compare_price=Decimal(str(compare_price)),
                cost_price=Decimal(str(round(price * 0.55))),
                stock=stock,
                low_stock_threshold=5,
                is_active=True,
                is_featured=random.random() < 0.3,
                is_new_arrival=random.random() < 0.4,
                is_best_seller=random.random() < 0.25,
                weight=Decimal(str(random.randint(50, 500))),
            )

            # Attach images (use 2–4 images per product, rotating)
            num_imgs = min(random.randint(2, 4), len(image_files)) if image_files else 0
            for i in range(num_imgs):
                img_path = image_files[img_idx % len(image_files)]
                img_idx += 1
                try:
                    self._attach_image(product, img_path, is_main=(i == 0))
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"      ⚠ Image error ({img_path.name}): {e}"))

            # Add variants
            variants_spec = VARIANT_DATA.get(main_slug, [])
            for variant_type, values in variants_spec:
                chosen = random.sample(values, min(len(values), random.randint(2, len(values))))
                for val in chosen:
                    price_adj = Decimal(str(random.choice([0, 0, 0, 100, 200, -100])))
                    ProductVariant.objects.get_or_create(
                        product=product,
                        variant_type=variant_type,
                        value=val,
                        defaults={
                            "stock": random.randint(0, 30),
                            "price_adjustment": price_adj,
                            "is_active": True,
                        },
                    )

            created += 1
            self.stdout.write(self.style.SUCCESS(
                f"   ✓ [{created:02d}] {name[:60]} | Ksh {price:,} | {num_imgs} img(s)"
            ))

        self.stdout.write("\n" + "─" * 60)
        self.stdout.write(self.style.SUCCESS(
            f"✅ Done!  Created: {created}  |  Skipped: {skipped}  |  Total products: {Product.objects.count()}"
        ))

    # ──────────────────────────────────────────────────────────────────────────
    #  HELPERS
    # ──────────────────────────────────────────────────────────────────────────

    def _collect_images(self, directory: Path):
        """Return a sorted list of all image files in the directory (recursive)."""
        extensions = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
        images = []
        if directory.exists():
            for ext in extensions:
                images.extend(directory.rglob(f"*{ext}"))
                images.extend(directory.rglob(f"*{ext.upper()}"))
        return sorted(set(images))

    def _attach_image(self, product: Product, img_path: Path, is_main: bool = False):
        """Copy image file into Django media and create a ProductImage record."""
        media_root = Path(settings.MEDIA_ROOT)
        dest_dir = media_root / "products"
        dest_dir.mkdir(parents=True, exist_ok=True)

        # Build a unique filename
        slug_bit = product.slug[:30]
        ext = img_path.suffix.lower()
        dest_name = f"{slug_bit}_{random.randint(10000, 99999)}{ext}"
        dest_path = dest_dir / dest_name

        shutil.copy2(str(img_path), str(dest_path))

        # Create the DB record with a relative media path
        relative = f"products/{dest_name}"
        ProductImage.objects.create(
            product=product,
            image=relative,
            alt_text=product.name,
            is_main=is_main,
        )

    def _ensure_brands(self):
        brand_map = {}
        for name in BRANDS:
            brand, _ = Brand.objects.get_or_create(
                name=name,
                defaults={"slug": slugify(name), "is_active": True},
            )
            brand_map[name] = brand
        self.stdout.write(f"🏷️  Brands ready: {len(brand_map)}")
        return brand_map

    def _ensure_main_categories(self):
        cat_map = {}
        for slug, (name, icon) in MAIN_CATEGORIES.items():
            cat, _ = MainCategory.objects.get_or_create(
                slug=slug,
                defaults={"name": name, "icon": icon, "is_active": True},
            )
            cat_map[slug] = cat
        self.stdout.write(f"📂 Main categories ready: {len(cat_map)}")
        return cat_map

    def _ensure_sub_categories(self, main_cat_map):
        sub_map = {}
        for main_slug, sub_names in SUB_CATEGORIES.items():
            main_cat = main_cat_map.get(main_slug)
            if not main_cat:
                continue
            for sub_name in sub_names:
                sub_slug = f"{main_slug}-{slugify(sub_name)}"
                sub, _ = SubCategory.objects.get_or_create(
                    slug=sub_slug,
                    defaults={
                        "name": sub_name,
                        "main_category": main_cat,
                        "is_active": True,
                    },
                )
                sub_map[f"{main_slug}::{sub_name}"] = sub
        self.stdout.write(f"📁 Sub-categories ready: {len(sub_map)}")
        return sub_map