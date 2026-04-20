import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function BottomNav() {
  const { pathname } = useLocation()
  const { cart } = useCart()
  const items = [
    { label: 'Home', icon: 'bi-house', path: '/' },
    { label: 'Categories', icon: 'bi-grid', path: '/products' },
    { label: 'Cart', icon: 'bi-bag', path: '/cart', badge: cart.item_count },
    { label: 'Wishlist', icon: 'bi-heart', path: '/wishlist' },
    { label: 'Account', icon: 'bi-person', path: '/profile' },
  ]
  return (
    <div className="gs-bottom-nav">
      <div className="gs-bottom-nav-inner">
        {items.map(item => (
          <Link key={item.path} to={item.path} className={`gs-bnav-item ${pathname === item.path ? 'active' : ''}`}>
            <i className={`bi ${pathname === item.path ? item.icon.replace('-', '-fill') : item.icon}`}></i>
            {item.badge > 0 && <span className="badge">{item.badge}</span>}
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}