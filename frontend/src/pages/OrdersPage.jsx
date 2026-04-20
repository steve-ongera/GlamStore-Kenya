// src/pages/OrdersPage.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { formatPrice } from '../utils/api'

const STATUS_COLORS = {
  pending: { bg: '#fff7ed', color: '#f59e0b', icon: 'bi-clock' },
  confirmed: { bg: '#eff6ff', color: '#3b82f6', icon: 'bi-check-circle' },
  processing: { bg: '#fdf4ff', color: '#a855f7', icon: 'bi-gear' },
  packed: { bg: '#f0fdf4', color: '#22c55e', icon: 'bi-box' },
  shipped: { bg: '#eff6ff', color: '#3b82f6', icon: 'bi-truck' },
  ready_pickup: { bg: '#f0fdf4', color: '#22c55e', icon: 'bi-shop' },
  delivered: { bg: '#f0fdf4', color: '#16a34a', icon: 'bi-check2-all' },
  cancelled: { bg: '#fef2f2', color: '#ef4444', icon: 'bi-x-circle' },
  refunded: { bg: '#fff1f2', color: '#e11d48', icon: 'bi-arrow-return-left' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    document.title = 'My Orders | GlamStore Kenya'
    api.get('/orders/').then(res => {
      setOrders(res.data.results || res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="gs-spinner" style={{ minHeight: '60vh' }}></div>

  if (orders.length === 0) return (
    <div className="container-gs gs-empty" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="empty-icon">📦</div>
      <h4>No Orders Yet</h4>
      <p>You haven't placed any orders. Start shopping!</p>
      <Link to="/products" className="btn-gs-primary">Browse Products</Link>
    </div>
  )

  return (
    <div className="container-gs" style={{ padding: '1.5rem' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.25rem' }}>
        📦 My Orders ({orders.length})
      </h1>

      {orders.map(order => {
        const st = STATUS_COLORS[order.status] || STATUS_COLORS.pending
        const isExpanded = expandedId === order.id

        return (
          <div key={order.id} style={{
            background: 'var(--white)', border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius)', marginBottom: '1rem', overflow: 'hidden',
          }}>
            {/* Order header */}
            <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}
              onClick={() => setExpandedId(isExpanded ? null : order.id)}
              className="cursor-pointer" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', cursor: 'pointer' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Order #{order.order_number}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(order.created_at).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
              <span style={{
                marginLeft: 'auto', background: st.bg, color: st.color,
                padding: '5px 12px', borderRadius: 'var(--radius-pill)',
                fontSize: '0.78rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <i className={`bi ${st.icon}`}></i>
                {order.status_display}
              </span>
              <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>
                {formatPrice(order.total)}
              </div>
              <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'}`} style={{ color: 'var(--text-muted)' }}></i>
            </div>

            {/* Expanded */}
            {isExpanded && (
              <div style={{ borderTop: '1px solid var(--border)', padding: '1.25rem' }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Items</div>
                    {order.items?.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                        <span>{item.product_name} × {item.quantity}</span>
                        <span style={{ fontWeight: 700 }}>{formatPrice(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="col-md-6">
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivery</div>
                    <div style={{ fontSize: '0.875rem' }}>
                      <div><strong>Method:</strong> {order.delivery_method_display}</div>
                      {order.pickup_station && <div><strong>Station:</strong> Pickup Station</div>}
                      <div><strong>Payment:</strong> {order.payment_method_display}</div>
                      <div><strong>Payment Status:</strong> <span style={{ color: order.payment_status === 'paid' ? 'var(--success)' : 'var(--warning)', fontWeight: 700 }}>{order.payment_status}</span></div>
                    </div>
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--bg2)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                        <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                        <span>Delivery</span><span>{formatPrice(order.delivery_fee)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)', borderTop: '1px solid var(--border)', paddingTop: 6, marginTop: 4 }}>
                        <span>Total</span><span>{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}