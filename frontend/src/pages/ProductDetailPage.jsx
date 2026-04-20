import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import api, { formatPrice } from '../utils/api'

function Stars({ rating, size = 'normal' }) {
  const fs = size === 'large' ? '1.1rem' : '0.85rem'
  return (
    <span className="gs-stars" style={{ fontSize: fs }}>
      {[1, 2, 3, 4, 5].map(i => (
        <i key={i} className={`bi ${i <= Math.round(rating) ? 'bi-star-fill' : 'bi-star'}`}></i>
      ))}
    </span>
  )
}

export default function ProductDetailPage() {
  const { slug } = useParams()
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [activeTab, setActiveTab] = useState('description')
  const [selectedVariants, setSelectedVariants] = useState({})
  const [qty, setQty] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const [pRes, rRes] = await Promise.all([
          api.get(`/products/${slug}/`),
          api.get(`/products/${slug}/related/`),
        ])
        setProduct(pRes.data)
        setRelated(rRes.data.results || rRes.data)
        document.title = `${pRes.data.meta_title || pRes.data.name} | GlamStore Kenya`
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (_) {}
      setLoading(false)
    }
    fetch()
  }, [slug])

  const handleAddToCart = async () => {
    if (!product?.is_in_stock) return
    setAdding(true)
    const variantId = Object.values(selectedVariants)[0] || null
    const ok = await addToCart(product.id, qty, variantId)
    if (ok) toast(`"${product.name}" added to cart! 🛍️`)
    else toast('Could not add to cart', 'error')
    setAdding(false)
  }

  const variantsByType = product?.variants?.reduce((acc, v) => {
    if (!acc[v.variant_type]) acc[v.variant_type] = []
    acc[v.variant_type].push(v)
    return acc
  }, {}) || {}

  if (loading) return (
    <div className="container-gs" style={{ padding: '2rem 1.5rem' }}>
      <div className="row g-4">
        <div className="col-md-5">
          <div className="gs-skeleton" style={{ aspectRatio: 1, borderRadius: 'var(--radius)' }}></div>
        </div>
        <div className="col-md-7">
          {[240, 160, 80, 120, 200].map((w, i) => (
            <div key={i} className="gs-skeleton" style={{ height: i === 0 ? 32 : 16, width: `${w}px`, marginBottom: 16, maxWidth: '100%', borderRadius: 8 }}></div>
          ))}
        </div>
      </div>
    </div>
  )

  if (!product) return (
    <div className="container-gs gs-empty" style={{ minHeight: '60vh' }}>
      <div className="empty-icon">😕</div>
      <h4>Product Not Found</h4>
      <p>This product may have been removed or is unavailable.</p>
      <Link to="/products" className="btn-gs-primary">Continue Shopping</Link>
    </div>
  )

  const images = product.images?.length > 0 ? product.images : [{ image: '/placeholder.jpg', alt_text: product.name }]

  return (
    <div>
      {/* SEO meta */}
      {product.meta_description && (
        <script dangerouslySetInnerHTML={{ __html: `
          document.querySelector('meta[name="description"]')?.setAttribute('content', '${product.meta_description.replace(/'/g, "\\'")}');
        ` }} />
      )}

      <div className="container-gs" style={{ padding: '1rem 1.5rem' }}>
        {/* Breadcrumb */}
        <div className="gs-breadcrumb">
          <Link to="/">Home</Link>
          <span className="sep"><i className="bi bi-chevron-right"></i></span>
          <Link to={`/category/${product.main_category?.slug}`}>{product.main_category?.name}</Link>
          <span className="sep"><i className="bi bi-chevron-right"></i></span>
          <Link to={`/products?sub=${product.sub_category?.slug}`}>{product.sub_category?.name}</Link>
          <span className="sep"><i className="bi bi-chevron-right"></i></span>
          <span className="current">{product.name}</span>
        </div>

        <div className="gs-product-detail">
          <div className="row g-4">
            {/* Gallery */}
            <div className="col-md-5">
              <div className="gs-detail-gallery">
                <div className="gs-main-img">
                  <img
                    src={images[activeImg]?.image || '/placeholder.jpg'}
                    alt={images[activeImg]?.alt_text || product.name}
                  />
                </div>
                {images.length > 1 && (
                  <div className="gs-thumb-strip">
                    {images.map((img, i) => (
                      <div
                        key={i}
                        className={`gs-thumb ${i === activeImg ? 'active' : ''}`}
                        onClick={() => setActiveImg(i)}
                      >
                        <img src={img.image} alt={img.alt_text || product.name} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="col-md-7">
              <div className="gs-detail-info">
                {product.brand && <div className="gs-detail-brand">{product.brand.name}</div>}
                <h1 className="gs-detail-name">{product.name}</h1>

                {/* Rating */}
                {product.review_count > 0 && (
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Stars rating={product.average_rating} size="large" />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{product.average_rating}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({product.review_count} reviews)</span>
                  </div>
                )}

                {/* Price */}
                <div className="gs-detail-price-wrap">
                  <span className="gs-detail-price">{formatPrice(product.price)}</span>
                  {product.compare_price && (
                    <span className="gs-detail-old-price">{formatPrice(product.compare_price)}</span>
                  )}
                  {product.discount_percent > 0 && (
                    <span className="gs-detail-discount">{product.discount_percent}% OFF</span>
                  )}
                </div>

                {/* Stock */}
                <div style={{ marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 700 }}>
                  {product.is_in_stock ? (
                    <span style={{ color: 'var(--success)' }}>
                      <i className="bi bi-check-circle-fill"></i> In Stock
                      {product.is_low_stock && <span style={{ color: 'var(--warning)', marginLeft: 8 }}> — Only {product.stock} left!</span>}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--danger)' }}>
                      <i className="bi bi-x-circle-fill"></i> Out of Stock
                    </span>
                  )}
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.7 }}>
                  {product.short_description}
                </p>

                {/* Variants */}
                {Object.entries(variantsByType).map(([type, variants]) => (
                  <div key={type} className="gs-variants">
                    <div className="gs-variant-label">
                      {type.charAt(0).toUpperCase() + type.slice(1)}:
                      <span style={{ color: 'var(--primary)', fontWeight: 700, marginLeft: 6 }}>
                        {selectedVariants[type] ? variants.find(v => v.id === selectedVariants[type])?.value : 'Select'}
                      </span>
                    </div>
                    <div className="gs-variant-options">
                      {variants.map(v => (
                        <button
                          key={v.id}
                          className={`gs-variant-btn ${selectedVariants[type] === v.id ? 'active' : ''} ${v.stock === 0 ? 'sold-out' : ''}`}
                          onClick={() => setSelectedVariants(prev => ({ ...prev, [type]: v.id }))}
                          disabled={v.stock === 0}
                        >
                          {v.value}
                          {v.price_adjustment > 0 && <span style={{ fontSize: '0.7rem', marginLeft: 4 }}>+{formatPrice(v.price_adjustment)}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Qty + Actions */}
                <div style={{ margin: '1rem 0 0.5rem' }}>
                  <div className="gs-variant-label">Quantity:</div>
                  <div className="gs-qty-wrap" style={{ marginTop: '0.5rem' }}>
                    <button className="gs-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                    <input className="gs-qty-input" type="number" value={qty} min={1} readOnly />
                    <button className="gs-qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
                  </div>
                </div>

                <div className="gs-add-to-cart-wrap">
                  <button
                    className="btn-gs-primary gs-btn-add-cart"
                    onClick={handleAddToCart}
                    disabled={!product.is_in_stock || adding}
                  >
                    {adding ? <><i className="bi bi-hourglass"></i> Adding...</> : <><i className="bi bi-bag-plus"></i> Add to Cart</>}
                  </button>
                  <button className="gs-btn-buy-now" disabled={!product.is_in_stock}>
                    <i className="bi bi-lightning-charge-fill"></i> Buy Now
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => setWishlisted(!wishlisted)}
                    style={{ border: '2px solid var(--border)', color: wishlisted ? 'var(--primary)' : 'var(--text-muted)', background: wishlisted ? 'var(--primary-xlight)' : 'var(--white)' }}
                    title="Add to Wishlist"
                  >
                    <i className={`bi ${wishlisted ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                  </button>
                </div>

                {/* Delivery info */}
                <div className="gs-delivery-info">
                  <div className="info-row">
                    <i className="bi bi-truck"></i>
                    <div>
                      <strong>Delivery available to all 47 counties</strong>
                      <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>Delivery fees vary by county. Choose pickup or door delivery at checkout.</div>
                    </div>
                  </div>
                  <div className="info-row">
                    <i className="bi bi-shop"></i>
                    <div>
                      <strong>Pickup Stations Available</strong>
                      <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>Pick up at your nearest station for a lower fee.</div>
                    </div>
                  </div>
                  <div className="info-row">
                    <i className="bi bi-arrow-return-left"></i>
                    <div>
                      <strong>7-Day Return Policy</strong>
                    </div>
                  </div>
                </div>

                {/* Share */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Share:</span>
                  {[
                    { icon: 'bi-whatsapp', color: '#25d366', href: `https://wa.me/?text=${encodeURIComponent(product.name + ' ' + window.location.href)}` },
                    { icon: 'bi-facebook', color: '#1877f2', href: '#' },
                    { icon: 'bi-twitter-x', color: '#000', href: '#' },
                  ].map(s => (
                    <a key={s.icon} href={s.href} target="_blank" rel="noreferrer"
                      style={{ width: 32, height: 32, borderRadius: '50%', background: s.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                      <i className={`bi ${s.icon}`}></i>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="gs-product-tabs">
            <div className="gs-tab-nav">
              {['description', 'reviews', 'shipping'].map(tab => (
                <button key={tab} className={`gs-tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'reviews' && ` (${product.review_count})`}
                </button>
              ))}
            </div>
            <div className="gs-tab-content">
              {activeTab === 'description' && (
                <div dangerouslySetInnerHTML={{ __html: product.description?.replace(/\n/g, '<br>') || product.short_description }} />
              )}
              {activeTab === 'reviews' && (
                <div>
                  {product.reviews?.length === 0 ? (
                    <div className="gs-empty" style={{ padding: '2rem' }}>
                      <div className="empty-icon">⭐</div>
                      <h4>No Reviews Yet</h4>
                      <p>Be the first to review this product!</p>
                    </div>
                  ) : (
                    product.reviews?.map(r => (
                      <div key={r.id} className="gs-review-card">
                        <div className="gs-review-header">
                          <div>
                            <div className="gs-review-author">{r.user_name}</div>
                            <Stars rating={r.rating} />
                          </div>
                          <span className="gs-review-date">{new Date(r.created_at).toLocaleDateString('en-KE')}</span>
                        </div>
                        {r.title && <div className="gs-review-title">{r.title}</div>}
                        <div className="gs-review-body">{r.body}</div>
                        {r.is_verified_purchase && (
                          <div style={{ marginTop: 6, fontSize: '0.72rem', color: 'var(--success)', fontWeight: 700 }}>
                            <i className="bi bi-patch-check-fill"></i> Verified Purchase
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
              {activeTab === 'shipping' && (
                <div>
                  <p><strong>🚚 Door Delivery:</strong> Available to all 47 counties. Fees vary by county (Ksh 150 – Ksh 500).</p>
                  <p style={{ marginTop: '1rem' }}><strong>🏪 Pickup Stations:</strong> Pick up at your nearest station. Fees from Ksh 50 – Ksh 150.</p>
                  <p style={{ marginTop: '1rem' }}><strong>⏱ Delivery Time:</strong> Nairobi: 1–2 days. Other counties: 2–5 business days.</p>
                  <p style={{ marginTop: '1rem' }}><strong>🔄 Returns:</strong> 7-day return for eligible items in original condition.</p>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <section className="gs-section">
              <div className="gs-section-header">
                <h2 className="gs-section-title">You May Also Like</h2>
                <Link to={`/category/${product.main_category?.slug}`} className="gs-section-link">
                  View More <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
              <div className="gs-products-grid">
                {related.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}