import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/api'

export default function CartPage() {
  const { cart, updateItem, removeItem } = useCart()
  const navigate = useNavigate()

  if (cart.items.length === 0) return (
    <div className="container-gs gs-empty" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="empty-icon">🛍️</div>
      <h4>Your Cart is Empty</h4>
      <p>Looks like you haven't added anything yet. Start shopping!</p>
      <Link to="/products" className="btn-gs-primary">Browse Products</Link>
    </div>
  )

  const DELIVERY_ESTIMATE = 150

  return (
    <div className="container-gs" style={{ padding: '1.5rem' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.25rem' }}>
        🛍️ My Cart ({cart.item_count} item{cart.item_count !== 1 ? 's' : ''})
      </h1>

      <div className="row g-4">
        {/* Cart Items */}
        <div className="col-lg-8">
          {cart.items.map(item => (
            <div key={item.id} className="gs-cart-item">
              <img src={item.product?.main_image || '/placeholder.jpg'} alt={item.product_name} />
              <div className="gs-cart-item-info">
                <Link to={`/products/${item.product?.slug}`} className="gs-cart-item-name">
                  {item.product?.name || item.product_name}
                </Link>
                {item.variant && <div className="gs-cart-item-variant">{item.variant}</div>}
                <div className="gs-cart-item-price">{formatPrice(item.unit_price)}</div>
              </div>
              <div className="d-flex flex-column align-items-end gap-2">
                <div className="gs-qty-wrap">
                  <button className="gs-qty-btn" onClick={() => updateItem(item.id, item.quantity - 1)}>−</button>
                  <input className="gs-qty-input" type="number" value={item.quantity} readOnly style={{ fontSize: '0.9rem' }} />
                  <button className="gs-qty-btn" onClick={() => updateItem(item.id, item.quantity + 1)}>+</button>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>{formatPrice(item.subtotal)}</div>
                <button onClick={() => removeItem(item.id)} style={{ color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="bi bi-trash"></i> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="col-lg-4">
          <div className="gs-order-summary">
            <h5>Order Summary</h5>
            <div className="gs-summary-row"><span>Subtotal</span><span>{formatPrice(cart.total)}</span></div>
            <div className="gs-summary-row"><span>Delivery Fee</span><span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Calculated at checkout</span></div>
            <div className="gs-summary-row total"><span>Estimated Total</span><span>{formatPrice(cart.total)}</span></div>

            <button className="btn-gs-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: '0.75rem', fontSize: '1rem' }}
              onClick={() => navigate('/checkout')}>
              Proceed to Checkout <i className="bi bi-arrow-right"></i>
            </button>
            <Link to="/products" style={{ display: 'block', textAlign: 'center', marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <i className="bi bi-arrow-left"></i> Continue Shopping
            </Link>

            {/* Coupon */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
              <div className="gs-label">Have a coupon?</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="text" className="gs-input" placeholder="Enter coupon code" style={{ flex: 1 }} />
                <button className="btn-gs-outline" style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}>Apply</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}