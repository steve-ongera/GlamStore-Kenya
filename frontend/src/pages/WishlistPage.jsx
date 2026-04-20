// src/pages/WishlistPage.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import api from '../utils/api'

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState({ products: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'My Wishlist | GlamStore Kenya'
    api.get('/products/wishlist/').then(res => {
      setWishlist(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="gs-spinner" style={{ minHeight: '60vh' }}></div>

  return (
    <div className="container-gs" style={{ padding: '1.5rem' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.25rem' }}>
        💕 My Wishlist ({wishlist.products.length})
      </h1>

      {wishlist.products.length === 0 ? (
        <div className="gs-empty">
          <div className="empty-icon">💕</div>
          <h4>Your Wishlist is Empty</h4>
          <p>Save products you love by clicking the heart icon.</p>
          <Link to="/products" className="btn-gs-primary">Discover Products</Link>
        </div>
      ) : (
        <div className="gs-products-grid">
          {wishlist.products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}