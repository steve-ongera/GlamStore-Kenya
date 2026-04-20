import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import api, { formatPrice } from '../utils/api'

const HERO_SLIDES = [
  {
    title: 'Feel the Magic of Luxury Perfumes',
    subtitle: 'Exclusive fragrances for every personality',
    tag: '🌸 New Arrivals',
    cta: 'Shop Perfumes',
    link: '/category/perfumes',
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    color: '#e91e8c',
  },
  {
    title: 'Premium Human Hair Collection',
    subtitle: '100% authentic — wigs, extensions & more',
    tag: '💇 Hair Collection',
    cta: 'Shop Hair',
    link: '/category/hair',
    bg: 'linear-gradient(135deg, #2d1b69 0%, #11998e 100%)',
    color: '#ffb347',
  },
  {
    title: "Women's Fashion Starts Here",
    subtitle: 'Dresses, tops & more for every occasion',
    tag: '👗 Fashion',
    cta: 'Shop Now',
    link: '/category/womens-clothing',
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #c0176f 100%)',
    color: '#fff',
  },
]

const CATEGORIES = [
  { name: 'Girls Perfumes', emoji: '🌸', slug: 'perfumes?gender=girls' },
  { name: 'Boys Perfumes', emoji: '💙', slug: 'perfumes?gender=boys' },
  { name: 'Boss Collection', emoji: '👑', slug: 'perfumes?sub=boss' },
  { name: 'Baby Scents', emoji: '🍼', slug: 'perfumes?gender=babies' },
  { name: 'Human Hair', emoji: '💇', slug: 'hair' },
  { name: 'Waxing', emoji: '✨', slug: 'beauty?sub=waxing' },
  { name: 'Microblading', emoji: '💄', slug: 'beauty?sub=microblading' },
  { name: 'Stick-ons', emoji: '💅', slug: 'stickons' },
  { name: "Women's Fashion", emoji: '👗', slug: 'womens-clothing' },
  { name: "Men's Fashion", emoji: '👔', slug: 'mens-clothing' },
  { name: "Girls Dresses", emoji: '🎀', slug: 'girls-dresses' },
  { name: 'Accessories', emoji: '👜', slug: 'accessories' },
]

// Countdown hook
function useCountdown(targetHours = 8) {
  const [time, setTime] = useState({ h: targetHours, m: 59, s: 59 })
  useEffect(() => {
    const t = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev
        if (s > 0) return { h, m, s: s - 1 }
        if (m > 0) return { h, m: m - 1, s: 59 }
        if (h > 0) return { h: h - 1, m: 59, s: 59 }
        return { h: targetHours, m: 59, s: 59 }
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])
  return time
}

function HeroSlider() {
  const [active, setActive] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % HERO_SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [])
  const slide = HERO_SLIDES[active]
  return (
    <div className="gs-hero">
      <div className="gs-hero-slide" style={{ background: slide.bg, minHeight: 420 }}>
        <div className="container-gs">
          <div className="gs-hero-content">
            <span className="hero-tag">{slide.tag}</span>
            <h1>{slide.title}</h1>
            <p>{slide.subtitle}</p>
            <div className="d-flex gap-3 flex-wrap">
              <Link to={slide.link} className="btn-gs-primary">
                {slide.cta} <i className="bi bi-arrow-right"></i>
              </Link>
              <Link to="/products" className="btn-gs-white">
                View All
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="slider-dots">
        {HERO_SLIDES.map((_, i) => (
          <div key={i} className={`slider-dot ${i === active ? 'active' : ''}`} onClick={() => setActive(i)} />
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [loading, setLoading] = useState(true)
  const countdown = useCountdown(8)

  useEffect(() => {
    document.title = 'GlamStore Kenya – Perfumes, Hair, Beauty & Fashion'
    const fetchAll = async () => {
      try {
        const [f, n, b] = await Promise.all([
          api.get('/products/featured/'),
          api.get('/products/new_arrivals/'),
          api.get('/products/best_sellers/'),
        ])
        setFeatured(f.data.results || f.data)
        setNewArrivals(n.data.results || n.data)
        setBestSellers(b.data.results || b.data)
      } catch (_) {}
      setLoading(false)
    }
    fetchAll()
  }, [])

  return (
    <div>
      <HeroSlider />

      {/* Mobile search hint */}
      <div className="d-md-none" style={{ height: 8, background: 'var(--bg2)' }} />

      <div className="container-gs">

        {/* Categories */}
        <section className="gs-section">
          <div className="gs-section-header">
            <h2 className="gs-section-title">Shop by Category</h2>
            <Link to="/products" className="gs-section-link">See All <i className="bi bi-arrow-right"></i></Link>
          </div>
          <div className="gs-cat-grid">
            {CATEGORIES.map(cat => (
              <Link key={cat.slug} to={`/category/${cat.slug}`} className="gs-cat-card">
                <span className="cat-emoji">{cat.emoji}</span>
                <span className="cat-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Flash Sale */}
        <section className="gs-section">
          <div className="gs-flash-sale-bar">
            <div className="gs-flash-label">
              <i className="bi bi-lightning-charge-fill"></i>
              Flash Sale
            </div>
            <div className="gs-countdown">
              <div className="gs-count-block">
                <span className="num">{String(countdown.h).padStart(2, '0')}</span>
                <span className="lbl">Hrs</span>
              </div>
              <span className="gs-count-sep">:</span>
              <div className="gs-count-block">
                <span className="num">{String(countdown.m).padStart(2, '0')}</span>
                <span className="lbl">Min</span>
              </div>
              <span className="gs-count-sep">:</span>
              <div className="gs-count-block">
                <span className="num">{String(countdown.s).padStart(2, '0')}</span>
                <span className="lbl">Sec</span>
              </div>
            </div>
            <Link to="/products?sale=true" className="btn-gs-white">
              Shop Flash Sale <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
          {loading ? (
            <div className="gs-products-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="gs-skeleton-card">
                  <div className="gs-skeleton" style={{ aspectRatio: 1 }}></div>
                  <div style={{ padding: '0.85rem' }}>
                    <div className="gs-skeleton" style={{ height: 14, marginBottom: 8, borderRadius: 6 }}></div>
                    <div className="gs-skeleton" style={{ height: 12, width: '60%', borderRadius: 6 }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="gs-products-grid">
              {featured.slice(0, 6).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>

        {/* Promo Banners */}
        <section className="gs-section">
          <div className="gs-mini-banners">
            <Link to="/category/perfumes" className="gs-promo-banner"
              style={{ background: 'linear-gradient(135deg, #1a1a2e, #e91e8c)' }}>
              <div className="gs-promo-content">
                <h3>Luxury Perfumes 🌸</h3>
                <p>Girls, Boys, Boss & Baby</p>
                <span className="btn-gs-white" style={{ fontSize: '0.8rem', padding: '7px 16px' }}>
                  Shop Now <i className="bi bi-arrow-right"></i>
                </span>
              </div>
            </Link>
            <Link to="/category/hair" className="gs-promo-banner"
              style={{ background: 'linear-gradient(135deg, #11998e, #38ef7d)' }}>
              <div className="gs-promo-content">
                <h3>Human Hair 💇</h3>
                <p>Wigs & Extensions</p>
                <span className="btn-gs-white" style={{ fontSize: '0.8rem', padding: '7px 16px' }}>
                  Shop Now <i className="bi bi-arrow-right"></i>
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="gs-section">
          <div className="gs-section-header">
            <h2 className="gs-section-title">New Arrivals ✨</h2>
            <Link to="/products?new=true" className="gs-section-link">View All <i className="bi bi-arrow-right"></i></Link>
          </div>
          {loading ? (
            <div className="gs-spinner"></div>
          ) : newArrivals.length > 0 ? (
            <div className="gs-products-grid">
              {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="gs-empty">
              <div className="empty-icon">🛍️</div>
              <h4>Coming Soon!</h4>
              <p>New arrivals will be listed here.</p>
            </div>
          )}
        </section>

        {/* 3 Feature Strips */}
        <section className="gs-section">
          <div className="row g-3">
            {[
              { icon: 'bi-truck', title: 'Countrywide Delivery', text: 'We deliver to all 47 counties. Pick up at your nearest station.' },
              { icon: 'bi-shield-check', title: '100% Authentic', text: 'All products are verified and sourced from trusted suppliers.' },
              { icon: 'bi-arrow-return-left', title: 'Easy Returns', text: '7-day return policy on eligible items. No questions asked.' },
              { icon: 'bi-headset', title: '24/7 Support', text: 'Our team is always ready to help you via WhatsApp & email.' },
            ].map(f => (
              <div key={f.title} className="col-md-3 col-6">
                <div style={{
                  background: 'var(--white)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '1.25rem',
                  textAlign: 'center',
                  height: '100%',
                }}>
                  <i className={`bi ${f.icon}`} style={{ fontSize: '2rem', color: 'var(--primary)', display: 'block', marginBottom: '0.75rem' }}></i>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.4rem' }}>{f.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.text}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Best Sellers */}
        <section className="gs-section">
          <div className="gs-section-header">
            <h2 className="gs-section-title">Best Sellers 🔥</h2>
            <Link to="/products?best=true" className="gs-section-link">View All <i className="bi bi-arrow-right"></i></Link>
          </div>
          {loading ? (
            <div className="gs-spinner"></div>
          ) : bestSellers.length > 0 ? (
            <div className="gs-products-grid">
              {bestSellers.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="gs-empty">
              <div className="empty-icon">⭐</div>
              <h4>Coming Soon!</h4>
              <p>Best sellers will be listed here.</p>
            </div>
          )}
        </section>

      </div>
    </div>
  )
}