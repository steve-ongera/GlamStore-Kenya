import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="gs-footer">
      <div className="gs-footer-top">
        <div className="container-gs">
          <div className="row g-4">
            {/* Brand */}
            <div className="col-lg-3 col-md-6">
              <div className="gs-footer-brand">
                <Link to="/" className="gs-logo">Glam<span>Store</span></Link>
                <p>
                  Kenya's #1 beauty & fashion destination. Authentic perfumes, human hair,
                  beauty services, and fashion for every occasion — delivered to your county.
                </p>
                <div className="gs-footer-socials">
                  {[
                    { icon: 'bi-instagram', href: '#' },
                    { icon: 'bi-facebook', href: '#' },
                    { icon: 'bi-tiktok', href: '#' },
                    { icon: 'bi-twitter-x', href: '#' },
                    { icon: 'bi-whatsapp', href: '#' },
                  ].map(s => (
                    <a key={s.icon} href={s.href} className="gs-social-btn">
                      <i className={`bi ${s.icon}`}></i>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Shop */}
            <div className="col-lg-2 col-md-6 col-6">
              <div className="gs-footer-title">Shop</div>
              <ul className="gs-footer-links">
                {[
                  ['Perfumes', '/category/perfumes'],
                  ['Human Hair', '/category/hair'],
                  ['Beauty Services', '/category/beauty'],
                  ["Women's Fashion", '/category/womens-clothing'],
                  ["Men's Fashion", '/category/mens-clothing'],
                  ['Girls Dresses', '/category/girls-dresses'],
                  ['New Arrivals', '/products?new=true'],
                  ['Best Sellers', '/products?best=true'],
                  ['Flash Sales', '/products?sale=true'],
                ].map(([label, to]) => (
                  <li key={label}><Link to={to}>{label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Account */}
            <div className="col-lg-2 col-md-6 col-6">
              <div className="gs-footer-title">My Account</div>
              <ul className="gs-footer-links">
                {[
                  ['My Profile', '/profile'],
                  ['My Orders', '/orders'],
                  ['My Wishlist', '/wishlist'],
                  ['My Cart', '/cart'],
                  ['Track Order', '/track-order'],
                  ['Login', '/login'],
                  ['Register', '/register'],
                ].map(([label, to]) => (
                  <li key={label}><Link to={to}>{label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Information */}
            <div className="col-lg-2 col-md-6 col-6">
              <div className="gs-footer-title">Information</div>
              <ul className="gs-footer-links">
                {[
                  ['About Us', '/about'],
                  ['Contact Us', '/contact'],
                  ['FAQ', '/faq'],
                  ['Privacy Policy', '/privacy'],
                  ['Terms & Conditions', '/terms'],
                  ['Return Policy', '/returns'],
                  ['Pickup Stations', '/pickups'],
                  ['Delivery Info', '/delivery'],
                ].map(([label, to]) => (
                  <li key={label}><Link to={to}>{label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="col-lg-3 col-md-6">
              <div className="gs-footer-title">Contact Us</div>
              <ul className="gs-footer-links">
                <li style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.83rem', marginBottom: '0.6rem', display: 'flex', gap: '8px' }}>
                  <i className="bi bi-geo-alt" style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }}></i>
                  Nairobi, Kenya
                </li>
                <li style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.83rem', marginBottom: '0.6rem', display: 'flex', gap: '8px' }}>
                  <i className="bi bi-telephone" style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }}></i>
                  +254 700 000 000
                </li>
                <li style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.83rem', marginBottom: '0.6rem', display: 'flex', gap: '8px' }}>
                  <i className="bi bi-envelope" style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }}></i>
                  hello@glamstore.co.ke
                </li>
                <li style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.83rem', marginBottom: '1rem', display: 'flex', gap: '8px' }}>
                  <i className="bi bi-clock" style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }}></i>
                  Mon–Sat: 8AM – 8PM
                </li>
              </ul>
              {/* Newsletter */}
              <div style={{ marginTop: '0.75rem' }}>
                <div className="gs-footer-title" style={{ marginBottom: '0.6rem' }}>Newsletter</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="email"
                    placeholder="Your email..."
                    style={{
                      flex: 1, padding: '8px 12px',
                      borderRadius: 'var(--radius-pill)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.08)',
                      color: '#fff',
                      fontSize: '0.8rem',
                      outline: 'none',
                    }}
                  />
                  <button className="btn-gs-primary" style={{ padding: '8px 14px', borderRadius: 'var(--radius-pill)', flexShrink: 0 }}>
                    <i className="bi bi-send"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container-gs">
        <div className="gs-footer-bottom">
          <span>© {new Date().getFullYear()} GlamStore Kenya. All rights reserved.</span>
          <div className="gs-payment-icons">
            <span>We accept:</span>
            {['M-PESA', 'VISA', 'MC', 'COD'].map(p => (
              <span key={p} className="gs-pay-icon">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}