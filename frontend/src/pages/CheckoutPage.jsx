import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api, { formatPrice, getErrorMessage } from '../utils/api'

const STEPS = ['Delivery', 'Payment', 'Review']

export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [counties, setCounties] = useState([])
  const [selectedCounty, setSelectedCounty] = useState(null)
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponLoading, setCouponLoading] = useState(false)

  const [form, setForm] = useState({
    delivery_method: 'pickup',
    pickup_station_id: null,
    delivery_street: '',
    delivery_town: '',
    delivery_county_id: null,
    customer_name: user ? `${user.first_name} ${user.last_name}` : '',
    customer_email: user?.email || '',
    customer_phone: user?.phone || '',
    payment_method: 'mpesa',
    notes: '',
  })

  useEffect(() => {
    api.get('/pickups/counties/').then(res => setCounties(res.data.results || res.data))
  }, [])

  useEffect(() => {
    if (selectedCounty) {
      api.get(`/pickups/stations/?county__slug=${selectedCounty.slug}`)
        .then(res => setStations(res.data.results || res.data))
    }
  }, [selectedCounty])

  const handleChange = (key, val) => setForm(p => ({ ...p, [key]: val }))

  const deliveryFee = () => {
    if (form.delivery_method === 'pickup' && form.pickup_station_id) {
      const st = stations.find(s => s.id === form.pickup_station_id)
      return st ? Number(st.pickup_fee) : 0
    }
    if (form.delivery_method === 'delivery' && form.delivery_county_id) {
      const co = counties.find(c => c.id === form.delivery_county_id)
      return co ? Number(co.delivery_fee) : 0
    }
    return 0
  }

  const subtotal = Number(cart.total)
  const fee = deliveryFee()
  const total = subtotal + fee - couponDiscount

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const res = await api.post('/orders/cart/validate_coupon/', { code: couponCode })
      setCouponDiscount(res.data.discount)
      toast(`Coupon applied! You save ${formatPrice(res.data.discount)} 🎉`)
    } catch (err) {
      toast(getErrorMessage(err), 'error')
    }
    setCouponLoading(false)
  }

  const validateStep0 = () => {
    if (form.delivery_method === 'pickup' && !form.pickup_station_id) {
      toast('Please select a pickup station', 'error'); return false
    }
    if (form.delivery_method === 'delivery' && !form.delivery_county_id) {
      toast('Please select a county for delivery', 'error'); return false
    }
    if (!form.customer_name || !form.customer_email || !form.customer_phone) {
      toast('Please fill in your contact details', 'error'); return false
    }
    return true
  }

  const placeOrder = async () => {
    setLoading(true)
    try {
      const payload = { ...form, coupon_code: couponCode }
      const res = await api.post('/orders/', payload)
      await clearCart()
      toast('Order placed successfully! 🎉')
      navigate('/orders')
    } catch (err) {
      toast(getErrorMessage(err), 'error')
    }
    setLoading(false)
  }

  return (
    <div className="container-gs" style={{ padding: '1.5rem' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
        Checkout
      </h1>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: 0 }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: i <= step ? 'var(--primary)' : 'var(--border)',
                color: i <= step ? '#fff' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.85rem', flexShrink: 0,
                transition: 'all 0.3s',
              }}>
                {i < step ? <i className="bi bi-check-lg"></i> : i + 1}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: i === step ? 800 : 500, color: i === step ? 'var(--primary)' : 'var(--text-muted)' }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < step ? 'var(--primary)' : 'var(--border)', margin: '0 12px', transition: 'background 0.3s' }}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">

          {/* Step 0: Delivery */}
          {step === 0 && (
            <div>
              {/* Contact info */}
              <div style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1rem' }}>
                <h5 style={{ fontWeight: 800, marginBottom: '1rem' }}>📞 Contact Information</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="gs-label">Full Name</label>
                    <input className="gs-input" value={form.customer_name} onChange={e => handleChange('customer_name', e.target.value)} placeholder="Full name" />
                  </div>
                  <div className="col-md-6">
                    <label className="gs-label">Phone Number</label>
                    <input className="gs-input" value={form.customer_phone} onChange={e => handleChange('customer_phone', e.target.value)} placeholder="+254 7XX XXX XXX" />
                  </div>
                  <div className="col-12">
                    <label className="gs-label">Email Address</label>
                    <input className="gs-input" type="email" value={form.customer_email} onChange={e => handleChange('customer_email', e.target.value)} placeholder="email@example.com" />
                  </div>
                </div>
              </div>

              {/* Delivery method */}
              <div style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1rem' }}>
                <h5 style={{ fontWeight: 800, marginBottom: '1rem' }}>🚚 Delivery Method</h5>
                <div className="d-flex gap-3 mb-3 flex-wrap">
                  {[
                    { value: 'pickup', label: '🏪 Pickup Station', sub: 'Pick up at a station near you' },
                    { value: 'delivery', label: '🚚 Door Delivery', sub: 'Delivered to your address' },
                  ].map(opt => (
                    <div key={opt.value}
                      onClick={() => handleChange('delivery_method', opt.value)}
                      style={{
                        flex: 1, minWidth: 180, padding: '1rem',
                        border: `2px solid ${form.delivery_method === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius)',
                        background: form.delivery_method === opt.value ? 'var(--primary-xlight)' : 'var(--white)',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: form.delivery_method === opt.value ? 'var(--primary)' : 'var(--text)' }}>{opt.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{opt.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Pickup station selector */}
                {form.delivery_method === 'pickup' && (
                  <div className="gs-pickup-map">
                    <h6 style={{ fontWeight: 800, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Select Pickup Station</h6>
                    <div className="gs-county-select">
                      <label className="gs-label">Select County</label>
                      <select className="gs-input"
                        onChange={e => {
                          const co = counties.find(c => c.id === Number(e.target.value))
                          setSelectedCounty(co || null)
                          handleChange('pickup_station_id', null)
                        }}>
                        <option value="">-- Select County --</option>
                        {counties.map(co => (
                          <option key={co.id} value={co.id}>{co.name}</option>
                        ))}
                      </select>
                    </div>
                    {stations.length > 0 && (
                      <div>
                        <label className="gs-label">Select Station</label>
                        <div className="gs-station-list">
                          {stations.map(st => (
                            <div key={st.id}
                              className={`gs-station-card ${form.pickup_station_id === st.id ? 'selected' : ''}`}
                              onClick={() => handleChange('pickup_station_id', st.id)}>
                              <div className="station-name">{st.name}</div>
                              <div className="station-addr"><i className="bi bi-geo-alt"></i> {st.address}, {st.town}</div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                                <div className="station-fee">Pickup Fee: {formatPrice(st.pickup_fee)}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{st.operating_hours}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedCounty && stations.length === 0 && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>No pickup stations in this county yet.</p>
                    )}
                  </div>
                )}

                {/* Door delivery */}
                {form.delivery_method === 'delivery' && (
                  <div className="row g-3 mt-1">
                    <div className="col-12">
                      <label className="gs-label">Street Address</label>
                      <input className="gs-input" value={form.delivery_street} onChange={e => handleChange('delivery_street', e.target.value)} placeholder="Street / Building name" />
                    </div>
                    <div className="col-md-6">
                      <label className="gs-label">Town / Area</label>
                      <input className="gs-input" value={form.delivery_town} onChange={e => handleChange('delivery_town', e.target.value)} placeholder="e.g. Westlands" />
                    </div>
                    <div className="col-md-6">
                      <label className="gs-label">County</label>
                      <select className="gs-input"
                        onChange={e => handleChange('delivery_county_id', Number(e.target.value))}>
                        <option value="">-- Select County --</option>
                        {counties.map(co => (
                          <option key={co.id} value={co.id}>{co.name} — Ksh {co.delivery_fee}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1rem' }}>
                <label className="gs-label">Order Notes (optional)</label>
                <textarea className="gs-input" rows={3} value={form.notes} onChange={e => handleChange('notes', e.target.value)} placeholder="Special instructions..."></textarea>
              </div>

              <button className="btn-gs-primary" style={{ padding: '12px 32px', fontSize: '1rem' }}
                onClick={() => { if (validateStep0()) setStep(1) }}>
                Continue to Payment <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <div>
              <div style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
                <h5 style={{ fontWeight: 800, marginBottom: '1rem' }}>💳 Payment Method</h5>
                {[
                  { value: 'mpesa', label: 'M-Pesa', icon: '📱', desc: 'Pay via M-Pesa Paybill or Till number' },
                  { value: 'card', label: 'Credit/Debit Card', icon: '💳', desc: 'Visa, Mastercard accepted' },
                  { value: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive your order' },
                  { value: 'bank', label: 'Bank Transfer', icon: '🏦', desc: 'Direct bank transfer' },
                ].map(opt => (
                  <div key={opt.value}
                    onClick={() => handleChange('payment_method', opt.value)}
                    style={{
                      padding: '1rem', marginBottom: '0.75rem',
                      border: `2px solid ${form.payment_method === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius)',
                      background: form.payment_method === opt.value ? 'var(--primary-xlight)' : 'var(--white)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s',
                    }}>
                    <span style={{ fontSize: '1.5rem' }}>{opt.icon}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: form.payment_method === opt.value ? 'var(--primary)' : 'var(--text)' }}>{opt.label}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        border: `2px solid ${form.payment_method === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                        background: form.payment_method === opt.value ? 'var(--primary)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {form.payment_method === opt.value && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }}></div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button className="btn-gs-outline" onClick={() => setStep(0)} style={{ padding: '11px 24px' }}>
                  <i className="bi bi-arrow-left"></i> Back
                </button>
                <button className="btn-gs-primary" onClick={() => setStep(2)} style={{ padding: '11px 24px', fontSize: '1rem' }}>
                  Review Order <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div>
              <div style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1rem' }}>
                <h5 style={{ fontWeight: 800, marginBottom: '1rem' }}>🛍️ Order Items</h5>
                {cart.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                    <img src={item.product?.main_image || '/placeholder.jpg'} alt="" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{item.product?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{formatPrice(item.subtotal)}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1rem' }}>
                <h5 style={{ fontWeight: 800, marginBottom: '1rem' }}>📋 Order Details</h5>
                <table style={{ width: '100%', fontSize: '0.875rem' }}>
                  <tbody>
                    {[
                      ['Customer', form.customer_name],
                      ['Phone', form.customer_phone],
                      ['Email', form.customer_email],
                      ['Delivery Method', form.delivery_method === 'pickup' ? 'Pickup Station' : 'Door Delivery'],
                      ['Payment', form.payment_method.toUpperCase()],
                    ].map(([k, v]) => (
                      <tr key={k}>
                        <td style={{ padding: '6px 0', color: 'var(--text-muted)', width: '40%' }}>{k}</td>
                        <td style={{ padding: '6px 0', fontWeight: 600 }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-gs-outline" onClick={() => setStep(1)} style={{ padding: '11px 24px' }}>
                  <i className="bi bi-arrow-left"></i> Back
                </button>
                <button className="btn-gs-primary" onClick={placeOrder} disabled={loading}
                  style={{ flex: 1, justifyContent: 'center', padding: '12px', fontSize: '1rem' }}>
                  {loading ? <><i className="bi bi-hourglass"></i> Placing Order...</> : <><i className="bi bi-check-circle"></i> Place Order — {formatPrice(total)}</>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="col-lg-4">
          <div className="gs-order-summary">
            <h5>Order Summary</h5>
            {cart.items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                <span style={{ maxWidth: '65%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.product?.name} × {item.quantity}
                </span>
                <span style={{ fontWeight: 700 }}>{formatPrice(item.subtotal)}</span>
              </div>
            ))}
            <div className="gs-summary-row" style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
              <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
            </div>
            <div className="gs-summary-row">
              <span>Delivery Fee</span>
              <span style={{ color: fee === 0 ? 'var(--text-muted)' : 'var(--text)' }}>
                {fee === 0 ? 'TBD' : formatPrice(fee)}
              </span>
            </div>
            {couponDiscount > 0 && (
              <div className="gs-summary-row" style={{ color: 'var(--success)' }}>
                <span>Coupon Discount</span><span>− {formatPrice(couponDiscount)}</span>
              </div>
            )}
            <div className="gs-summary-row total">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>

            {/* Coupon */}
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <label className="gs-label">Coupon Code</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="text" className="gs-input" placeholder="Enter code"
                  value={couponCode} onChange={e => setCouponCode(e.target.value)}
                  style={{ flex: 1, fontSize: '0.82rem' }} />
                <button className="btn-gs-outline" onClick={applyCoupon} disabled={couponLoading}
                  style={{ padding: '8px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}