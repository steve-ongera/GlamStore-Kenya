import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = [
  {
    label: '🌸 Perfumes',
    slug: 'perfumes',
    subs: ['Girls Perfumes', 'Boys Perfumes', 'Boss Collection', 'Babies', 'Unisex'],
  },
  {
    label: '💇 Human Hair',
    slug: 'hair',
    subs: ['Wigs', 'Extensions', 'Braids', 'Natural Hair'],
  },
  {
    label: '✨ Beauty Services',
    slug: 'beauty',
    subs: ['Waxing', 'Microblading', 'Stick-ons', 'Nail Art'],
  },
  {
    label: '👗 Women & Ladies',
    slug: 'womens-clothing',
    subs: ['Dresses', 'Tops', 'Skirts', 'Jumpsuits', 'Lingerie'],
  },
  {
    label: '👔 Men\'s Fashion',
    slug: 'mens-clothing',
    subs: ['Shirts', 'Trousers', 'Suits', 'Casual'],
  },
  {
    label: '🎀 Girls Dresses',
    slug: 'girls-dresses',
    subs: ['Casual', 'Party', 'School', 'Babies'],
  },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [expandedCat, setExpandedCat] = React.useState(null)

  const handleLogout = async () => {
    await logout()
    onClose()
    navigate('/')
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`gs-sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className={`gs-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="gs-sidebar-header">
          <Link to="/" className="gs-logo" onClick={onClose}>
            Glam<span>Store</span>
          </Link>
          <button className="sidebar-close" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* User info */}
        {user ? (
          <div className="gs-sidebar-user">
            <div className="d-flex align-items-center">
              <div className="user-avatar">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </div>
              <div>
                <div className="user-name">{user.first_name} {user.last_name}</div>
                <div className="user-email">{user.email}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="gs-sidebar-user">
            <div className="d-flex gap-2">
              <Link to="/login" onClick={onClose} className="btn-gs-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem', padding: '8px 12px' }}>
                <i className="bi bi-box-arrow-in-right"></i> Login
              </Link>
              <Link to="/register" onClick={onClose} className="btn-gs-outline" style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem', padding: '8px 12px' }}>
                Register
              </Link>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="gs-sidebar-nav">
          <div className="nav-section-label">Shop by Category</div>

          {CATEGORIES.map(cat => (
            <div key={cat.slug}>
              <a
                onClick={() => setExpandedCat(expandedCat === cat.slug ? null : cat.slug)}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-chevron-right" style={{
                  transform: expandedCat === cat.slug ? 'rotate(90deg)' : 'rotate(0)',
                  transition: 'transform 0.2s',
                }}></i>
                {cat.label}
              </a>
              {expandedCat === cat.slug && (
                <div className="subcats">
                  {cat.subs.map(sub => (
                    <Link
                      key={sub}
                      to={`/category/${cat.slug}?sub=${encodeURIComponent(sub)}`}
                      onClick={onClose}
                    >
                      <i className="bi bi-dot"></i>
                      {sub}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="nav-section-label" style={{ marginTop: '0.75rem' }}>My Account</div>

          <Link to="/orders" onClick={onClose}>
            <i className="bi bi-box-seam"></i> My Orders
          </Link>
          <Link to="/wishlist" onClick={onClose}>
            <i className="bi bi-heart"></i> Wishlist
          </Link>
          <Link to="/cart" onClick={onClose}>
            <i className="bi bi-bag"></i> My Cart
          </Link>
          {user && (
            <>
              <Link to="/profile" onClick={onClose}>
                <i className="bi bi-person"></i> My Profile
              </Link>
              <a onClick={handleLogout} style={{ cursor: 'pointer', color: 'var(--danger) !important' }}>
                <i className="bi bi-box-arrow-right" style={{ color: 'var(--danger)' }}></i>
                <span style={{ color: 'var(--danger)' }}>Logout</span>
              </a>
            </>
          )}

          <div className="nav-section-label" style={{ marginTop: '0.75rem' }}>Help</div>
          <Link to="/track-order" onClick={onClose}>
            <i className="bi bi-geo-alt"></i> Track Order
          </Link>
          <Link to="/contact" onClick={onClose}>
            <i className="bi bi-headset"></i> Contact Us
          </Link>
        </nav>

        {/* Socials */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.6rem' }}>FOLLOW US</div>
          <div className="d-flex gap-2">
            {[
              { icon: 'bi-instagram', href: '#', bg: '#e1306c' },
              { icon: 'bi-facebook', href: '#', bg: '#1877f2' },
              { icon: 'bi-tiktok', href: '#', bg: '#000' },
              { icon: 'bi-whatsapp', href: '#', bg: '#25d366' },
            ].map(s => (
              <a key={s.icon} href={s.href}
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: s.bg, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem'
                }}>
                <i className={`bi ${s.icon}`}></i>
              </a>
            ))}
          </div>
        </div>
      </aside>
    </>
  )
}