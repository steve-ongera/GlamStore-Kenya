# 💄 GlamStore Kenya – Full Stack E-Commerce

Kenya's #1 beauty & fashion e-commerce platform.
**Perfumes · Human Hair · Waxing · Microblading · Stick-ons · Women/Men/Girls Fashion**

---

## 🗂️ Project Structure

```
glamstore/
├── backend/                  # Django REST API
│   ├── backend/              # Django project config
│   │   ├── settings.py
│   │   └── urls.py
│   ├── core/                 # Custom User, Address
│   ├── products/             # Products, Categories, Brands, Reviews
│   ├── orders/               # Cart, Orders, Coupons
│   ├── pickups/              # Counties, Pickup Stations
│   └── requirements.txt
│
└── frontend/                 # React + Vite
    ├── index.html            # SEO + Bootstrap + Google Fonts
    ├── styles/main.css       # Responsive girly theme
    ├── src/
    │   ├── main.jsx          # React entry
    │   ├── App.jsx           # Router setup
    │   ├── context/          # Auth, Cart, Toast
    │   ├── utils/api.js      # Fetch wrapper + token refresh
    │   ├── components/       # Navbar, Sidebar, Footer, ProductCard…
    │   └── pages/            # All pages
    └── package.json
```

---

## ⚙️ Backend Setup (Django)

```bash
cd backend

# 1. Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create Django project wrapper (if not existing)
django-admin startproject backend .

# 4. Apply migrations
python manage.py makemigrations core products orders pickups
python manage.py migrate

# 5. Seed all 47 Kenya counties + pickup stations
python manage.py seed_counties

# 6. Create superuser
python manage.py createsuperuser

# 7. Run the server
python manage.py runserver
```

**Admin Panel:** http://localhost:8000/admin/

### API Endpoints

| Resource         | Endpoint                          |
|-----------------|-----------------------------------|
| Auth Register   | `POST /api/auth/register/`        |
| Auth Login      | `POST /api/auth/login/`           |
| Auth Logout     | `POST /api/auth/logout/`          |
| Token Refresh   | `POST /api/auth/token/refresh/`   |
| Profile         | `GET/PATCH /api/auth/profile/`    |
| Products        | `GET /api/products/`              |
| Product Detail  | `GET /api/products/{slug}/`       |
| Related         | `GET /api/products/{slug}/related/` |
| Featured        | `GET /api/products/featured/`     |
| New Arrivals    | `GET /api/products/new_arrivals/` |
| Best Sellers    | `GET /api/products/best_sellers/` |
| Categories      | `GET /api/products/categories/`   |
| Brands          | `GET /api/products/brands/`       |
| Wishlist        | `GET /api/products/wishlist/`     |
| Toggle Wishlist | `POST /api/products/wishlist/toggle/` |
| Cart            | `GET /api/orders/cart/`           |
| Add to Cart     | `POST /api/orders/cart/add/`      |
| Update Cart     | `POST /api/orders/cart/update_item/` |
| Remove from Cart| `POST /api/orders/cart/remove_item/` |
| Validate Coupon | `POST /api/orders/cart/validate_coupon/` |
| Orders          | `GET/POST /api/orders/`           |
| Counties        | `GET /api/pickups/counties/`      |
| Pickup Stations | `GET /api/pickups/stations/`      |

---

## 🎨 Frontend Setup (React + Vite)

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Create .env file
echo "VITE_API_URL=http://localhost:8000/api" > .env

# 3. Run dev server
npm run dev
```

**Frontend:** http://localhost:3000

### Build for Production
```bash
npm run build
```

---

## 🌟 Features

### Products
- ✅ Main categories: Perfumes, Hair, Beauty, Clothing
- ✅ Sub-categories: Girls/Boys/Boss/Babies perfumes, Waxing, Microblading, Stick-ons, Women's/Men's/Girls' fashion
- ✅ Product variants (size, color, scent, volume, length)
- ✅ Image gallery with thumbnails
- ✅ Star ratings & reviews
- ✅ Wishlist / heart button
- ✅ Quick add to cart on hover
- ✅ Low stock alerts
- ✅ New arrival / best seller / featured badges
- ✅ Discount percentage display
- ✅ SEO slugs for all products and categories

### Shopping Experience
- ✅ Flash sale countdown timer
- ✅ Hero slider with auto-advance
- ✅ Responsive product grid (2 cols mobile → 5 cols desktop)
- ✅ Filter by price, gender, availability
- ✅ Search with query parameters
- ✅ Sort by price, newest, name
- ✅ Load more pagination

### Cart & Checkout
- ✅ Persistent cart (session-based for guests)
- ✅ Coupon code validation
- ✅ 3-step checkout (Delivery → Payment → Review)
- ✅ Pickup station selector (per county, variable fees)
- ✅ Door delivery with county-based pricing
- ✅ M-Pesa, card, COD, bank transfer

### User Account
- ✅ Email + password authentication
- ✅ JWT with auto token refresh
- ✅ Order history with expandable details
- ✅ Profile editing
- ✅ Password change

### Design & UX
- ✅ Girly pink + purple gradient theme
- ✅ Playfair Display + Nunito typography
- ✅ Drawable sidebar on mobile screens
- ✅ Mobile bottom navigation bar
- ✅ Category nav bar (horizontal scroll)
- ✅ Topbar announcement marquee
- ✅ Toast notifications
- ✅ Loading skeletons
- ✅ Empty states
- ✅ 404 page

### Kenya-Specific
- ✅ All 47 counties seeded
- ✅ Per-county delivery fees (Ksh 100–600)
- ✅ Per-station pickup fees (Ksh 50–150)
- ✅ M-Pesa as primary payment option
- ✅ Ksh currency formatting
- ✅ Africa/Nairobi timezone

---

## 🚀 Production Deployment

### Backend
1. Set `DEBUG=False` in `.env`
2. Configure PostgreSQL database
3. Set a strong `SECRET_KEY`
4. Run `python manage.py collectstatic`
5. Use Gunicorn + Nginx

### Frontend
1. Update `VITE_API_URL` to your production API URL
2. Run `npm run build`
3. Serve `dist/` with Nginx

---

## 🎨 Theme Customization

Edit `frontend/styles/main.css` CSS variables:

```css
:root {
  --primary: #e91e8c;       /* Hot pink */
  --accent2: #a855f7;       /* Purple */
  --secondary: #ff6b35;     /* Orange */
  --font-display: 'Playfair Display', serif;
  --font-body: 'Nunito', sans-serif;
}
```

---

Built with ❤️ for Kenya's beauty queens and kings 👑