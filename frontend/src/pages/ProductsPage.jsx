import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useParams, Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import api from '../utils/api'

const SORT_OPTIONS = [
  { label: 'Newest First', value: '-created_at' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Name A–Z', value: 'name' },
]

const GENDER_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Women/Ladies', value: 'women' },
  { label: 'Men', value: 'men' },
  { label: 'Girls', value: 'girls' },
  { label: 'Boys', value: 'boys' },
  { label: 'Babies', value: 'babies' },
  { label: 'Unisex', value: 'unisex' },
]

export default function ProductsPage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  const search = searchParams.get('search') || ''
  const ordering = searchParams.get('ordering') || '-created_at'
  const gender = searchParams.get('gender') || ''
  const minPrice = searchParams.get('min_price') || ''
  const maxPrice = searchParams.get('max_price') || ''
  const isNew = searchParams.get('new') === 'true'
  const isBest = searchParams.get('best') === 'true'

  const fetchProducts = useCallback(async (pg = 1) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (slug) params.set('main_category__slug', slug)
    if (search) params.set('search', search)
    if (ordering) params.set('ordering', ordering)
    if (gender) params.set('gender', gender)
    if (minPrice) params.set('min_price', minPrice)
    if (maxPrice) params.set('max_price', maxPrice)
    if (isNew) params.set('is_new_arrival', 'true')
    if (isBest) params.set('is_best_seller', 'true')
    params.set('page', pg)

    try {
      const res = await api.get(`/products/?${params}`)
      const data = res.data
      const results = data.results || data
      setTotalCount(data.count || results.length)
      setHasNext(!!data.next)
      if (pg === 1) setProducts(results)
      else setProducts(prev => [...prev, ...results])
    } catch (_) {}
    setLoading(false)
  }, [slug, search, ordering, gender, minPrice, maxPrice, isNew, isBest])

  useEffect(() => {
    setPage(1)
    fetchProducts(1)
    document.title = `${slug ? slug.replace(/-/g, ' ') : 'All Products'} | GlamStore Kenya`
  }, [fetchProducts])

  const updateParam = (key, val) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val)
    else p.delete(key)
    setSearchParams(p)
  }

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    fetchProducts(next)
  }

  const pageTitle = slug
    ? slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : search ? `Search: "${search}"` : 'All Products'

  return (
    <div className="container-gs" style={{ padding: '1rem 1.5rem' }}>
      {/* Breadcrumb */}
      <div className="gs-breadcrumb">
        <Link to="/">Home</Link>
        <span className="sep"><i className="bi bi-chevron-right"></i></span>
        {slug && <><Link to="/products">Products</Link><span className="sep"><i className="bi bi-chevron-right"></i></span></>}
        <span className="current">{pageTitle}</span>
      </div>

      <div className="row g-3">
        {/* Filter panel – desktop */}
        <div className="col-lg-2 d-none d-lg-block">
          <FiltersPanel gender={gender} minPrice={minPrice} maxPrice={maxPrice} updateParam={updateParam} />
        </div>

        {/* Main content */}
        <div className="col-lg-10">
          {/* Toolbar */}
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{pageTitle}</h1>
              {!loading && <small style={{ color: 'var(--text-muted)' }}>{totalCount} products found</small>}
            </div>
            <div className="d-flex gap-2 align-items-center">
              {/* Mobile filter btn */}
              <button
                className="btn-gs-outline d-lg-none"
                onClick={() => setFilterOpen(!filterOpen)}
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
              >
                <i className="bi bi-sliders"></i> Filters
              </button>
              {/* Sort */}
              <select
                className="gs-input"
                style={{ width: 'auto', padding: '6px 12px' }}
                value={ordering}
                onChange={e => updateParam('ordering', e.target.value)}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Gender tabs */}
          <div className="d-flex gap-2 flex-wrap mb-3">
            {GENDER_OPTIONS.map(g => (
              <button
                key={g.value}
                onClick={() => updateParam('gender', g.value)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 'var(--radius-pill)',
                  border: '2px solid ' + (gender === g.value ? 'var(--primary)' : 'var(--border)'),
                  background: gender === g.value ? 'var(--primary)' : 'var(--white)',
                  color: gender === g.value ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Mobile filters dropdown */}
          {filterOpen && (
            <div className="d-lg-none mb-3" style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
              <FiltersPanel gender={gender} minPrice={minPrice} maxPrice={maxPrice} updateParam={updateParam} />
            </div>
          )}

          {/* Products grid */}
          {loading && page === 1 ? (
            <div className="gs-products-grid">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="gs-skeleton-card">
                  <div className="gs-skeleton" style={{ aspectRatio: 1 }}></div>
                  <div style={{ padding: '0.85rem' }}>
                    <div className="gs-skeleton" style={{ height: 14, marginBottom: 8, borderRadius: 6 }}></div>
                    <div className="gs-skeleton" style={{ height: 12, width: '60%', borderRadius: 6 }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="gs-empty">
              <div className="empty-icon">🔍</div>
              <h4>No Products Found</h4>
              <p>Try different filters or search terms.</p>
              <Link to="/products" className="btn-gs-primary">Browse All Products</Link>
            </div>
          ) : (
            <>
              <div className="gs-products-grid">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              {hasNext && (
                <div className="text-center mt-4">
                  <button
                    onClick={loadMore}
                    className="btn-gs-outline"
                    disabled={loading}
                    style={{ padding: '10px 32px' }}
                  >
                    {loading ? <><i className="bi bi-hourglass"></i> Loading...</> : 'Load More Products'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function FiltersPanel({ gender, minPrice, maxPrice, updateParam }) {
  return (
    <div className="gs-filter-panel">
      <div style={{ fontWeight: 800, marginBottom: '1rem', fontSize: '0.95rem' }}>
        <i className="bi bi-sliders" style={{ color: 'var(--primary)', marginRight: 6 }}></i>
        Filters
      </div>

      <div className="gs-filter-section">
        <div className="gs-filter-title">Price Range (Ksh)</div>
        <div className="gs-price-inputs">
          <input
            type="number"
            className="gs-input"
            placeholder="Min"
            value={minPrice}
            onChange={e => updateParam('min_price', e.target.value)}
            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
          />
          <input
            type="number"
            className="gs-input"
            placeholder="Max"
            value={maxPrice}
            onChange={e => updateParam('max_price', e.target.value)}
            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
          />
        </div>
      </div>

      <div className="gs-filter-section">
        <div className="gs-filter-title">Availability</div>
        <label className="gs-check-item">
          <input type="checkbox" /> <label>In Stock Only</label>
        </label>
        <label className="gs-check-item">
          <input type="checkbox" /> <label>On Sale</label>
        </label>
        <label className="gs-check-item">
          <input type="checkbox" /> <label>New Arrivals</label>
        </label>
      </div>

      <button
        onClick={() => updateParam('min_price', '') || updateParam('max_price', '') || updateParam('gender', '')}
        style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', color: 'var(--text-muted)' }}
      >
        <i className="bi bi-x-circle"></i> Clear Filters
      </button>
    </div>
  )
}