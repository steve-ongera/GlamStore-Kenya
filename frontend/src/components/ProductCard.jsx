import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { formatPrice } from '../utils/api'

function Stars({ rating }) {
  return (
    <span className="gs-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <i key={i} className={`bi ${i <= Math.round(rating) ? 'bi-star-fill' : i - 0.5 <= rating ? 'bi-star-half' : 'bi-star'}`}></i>
      ))}
    </span>
  )
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [wishlisted, setWishlisted] = useState(false)
  const [adding, setAdding] = useState(false)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setAdding(true)
    const ok = await addToCart(product.id)
    if (ok) toast(`"${product.name}" added to cart! 🛍️`)
    else toast('Could not add to cart', 'error')
    setAdding(false)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setWishlisted(!wishlisted)
    toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist! 💕', wishlisted ? 'info' : 'success')
  }

  const img = product.main_image || '/placeholder.jpg'

  return (
    <Link to={`/products/${product.slug}`} className={`gs-product-card ${!product.is_in_stock ? 'gs-out-of-stock' : ''}`}>
      <div className="gs-product-img-wrap">
        <img src={img} alt={product.name} loading="lazy" />

        {/* Badges */}
        <div className="gs-badge-wrap">
          {product.is_new_arrival && <span className="gs-badge gs-badge-new">New</span>}
          {product.is_best_seller && <span className="gs-badge gs-badge-best">Best</span>}
          {product.discount_percent > 0 && <span className="gs-badge gs-badge-sale">-{product.discount_percent}%</span>}
          {product.is_featured && !product.discount_percent && <span className="gs-badge gs-badge-hot">Hot</span>}
        </div>

        {/* Wishlist btn */}
        <button className={`gs-wish-btn ${wishlisted ? 'active' : ''}`} onClick={handleWishlist} aria-label="Wishlist">
          <i className={`bi ${wishlisted ? 'bi-heart-fill' : 'bi-heart'}`}></i>
        </button>

        {/* Quick add */}
        {product.is_in_stock && (
          <div className="gs-quick-add" onClick={handleAddToCart}>
            {adding ? <><i className="bi bi-hourglass"></i> Adding...</> : <><i className="bi bi-bag-plus"></i> Add to Cart</>}
          </div>
        )}
        {!product.is_in_stock && (
          <div className="gs-quick-add" style={{ background: 'rgba(100,100,100,0.9)' }}>
            <i className="bi bi-x-circle"></i> Out of Stock
          </div>
        )}
      </div>

      <div className="gs-product-info">
        {product.brand_name && <div className="gs-product-brand">{product.brand_name}</div>}
        <div className="gs-product-name">{product.name}</div>

        {product.review_count > 0 && (
          <div className="gs-product-rating">
            <Stars rating={product.average_rating} />
            <span className="gs-rating-count">({product.review_count})</span>
          </div>
        )}

        <div className="gs-product-price">
          <span className="gs-price">{formatPrice(product.price)}</span>
          {product.compare_price && (
            <span className="gs-price-old">{formatPrice(product.compare_price)}</span>
          )}
          {product.discount_percent > 0 && (
            <span className="gs-discount-badge">{product.discount_percent}% OFF</span>
          )}
        </div>

        {product.is_low_stock && product.is_in_stock && (
          <div className="gs-stock-low">
            <i className="bi bi-exclamation-circle-fill"></i> Only a few left!
          </div>
        )}
      </div>
    </Link>
  )
}