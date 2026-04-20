// src/pages/NotFoundPage.jsx
import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '70vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem',
    }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🌸</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
        404
      </h1>
      <h2 style={{ fontWeight: 800, margin: '0.75rem 0 0.5rem' }}>Oops! Page Not Found</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: 400, lineHeight: 1.7, marginBottom: '1.5rem' }}>
        The page you're looking for doesn't exist or has been moved. Let's get you back to shopping!
      </p>
      <div className="d-flex gap-3 flex-wrap justify-content-center">
        <Link to="/" className="btn-gs-primary">
          <i className="bi bi-house"></i> Go Home
        </Link>
        <Link to="/products" className="btn-gs-outline">
          <i className="bi bi-bag"></i> Shop Products
        </Link>
      </div>
    </div>
  )
}