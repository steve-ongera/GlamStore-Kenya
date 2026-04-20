import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const CATEGORIES = [
  { name: 'Perfumes', slug: 'perfumes', icon: '🌸' },
  { name: 'Human Hair', slug: 'hair', icon: '💇' },
  { name: 'Waxing & Beauty', slug: 'beauty', icon: '✨' },
  { name: 'Microblading', slug: 'microblading', icon: '💄' },
  { name: "Women's Clothes", slug: 'womens-clothing', icon: '👗' },
  { name: "Men's Fashion", slug: 'mens-clothing', icon: '👔' },
  { name: "Girls Dresses", slug: 'girls-dresses', icon: '🎀' },
  { name: 'Stick-ons', slug: 'stickons', icon: '💅' },
]

export default function Navbar({ onMenuOpen }) {
  const { user } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-marquee">
          <span>🚚 FREE delivery on orders above Ksh 2,000</span>
          <span>🌸 New Arrivals Every Week!</span>
          <span>💄 Authentic Products Only</span>
          <span>📦 Pick up in your county</span>
          <span>🔒 Secure Checkout</span>
          <span>🚚 FREE delivery on orders above Ksh 2,000</span>
          <span>🌸 New Arrivals Every Week!</span>
          <span>💄 Authentic Products Only</span>
          <span>📦 Pick up in your county</span>
          <span>🔒 Secure Checkout</span>
        </div>
        <div className="topbar-links">
          <Link to="/orders">Track Order</Link>
          <Link to={user ? '/profile' : '/login'}>Account</Link>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="gs-navbar">
        <div className="container-fluid">
          {/* Hamburger (mobile) */}
          <button
            className="gs-hamburger"
            onClick={onMenuOpen}
            aria-label="Open menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Logo */}
          <Link to="/" className="gs-logo">
            Glam<span>Store</span>
          </Link>

          {/* Search */}
          <div className="gs-search">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search perfumes, hair, clothes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="gs-search-btn">
                <i className="bi bi-search"></i>
              </button>
            </form>
          </div>

          {/* Actions */}
          <div className="gs-nav-actions">
            {user ? (
              <Link to="/profile" className="gs-nav-btn">
                <i className="bi bi-person-circle"></i>
                <span>{user.first_name}</span>
              </Link>
            ) : (
              <Link to="/login" className="gs-nav-btn">
                <i className="bi bi-person"></i>
                <span>Login</span>
              </Link>
            )}
            <Link to="/wishlist" className="gs-nav-btn">
              <i className="bi bi-heart"></i>
              <span>Wishlist</span>
            </Link>
            <Link to="/orders" className="gs-nav-btn">
              <i className="bi bi-box-seam"></i>
              <span>Orders</span>
            </Link>
            <Link to="/cart" className="gs-nav-btn">
              <i className="bi bi-bag"></i>
              <span>Cart</span>
              {cart.item_count > 0 && (
                <span className="badge">{cart.item_count > 99 ? '99+' : cart.item_count}</span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Search Row */}
      <div className="gs-mobile-search d-md-none">
        <div className="gs-search" style={{ maxWidth: '100%' }}>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="gs-search-btn">
              <i className="bi bi-search"></i>
            </button>
          </form>
        </div>
      </div>

      {/* Category Bar */}
      <div className="gs-catbar">
        <div className="gs-catbar-inner">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="gs-catbar-item"
            >
              <span className="cat-icon">{cat.icon}</span>
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}