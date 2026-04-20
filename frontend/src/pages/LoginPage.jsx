// src/pages/LoginPage.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../utils/api'

export default function LoginPage() {
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)

  const handleChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setErrors(p => ({ ...p, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email'
    if (!form.password) errs.password = 'Password is required'
    return errs
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast('Welcome back! 💕')
      navigate('/')
    } catch (err) {
      toast(getErrorMessage(err), 'error')
    }
    setLoading(false)
  }

  return (
    <div className="gs-auth-page">
      <div className="gs-auth-card">
        <div className="gs-auth-header">
          <div className="auth-logo">GlamStore 💄</div>
          <p>Welcome back! Login to your account</p>
        </div>
        <div className="gs-auth-body">
          <form onSubmit={handleSubmit}>
            <div className="gs-form-group">
              <label className="gs-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  name="email"
                  className={`gs-input ${errors.email ? 'error' : ''}`}
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                <i className="bi bi-envelope" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
              </div>
              {errors.email && <div className="gs-error-msg"><i className="bi bi-exclamation-circle"></i>{errors.email}</div>}
            </div>

            <div className="gs-form-group">
              <label className="gs-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  className={`gs-input ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
              {errors.password && <div className="gs-error-msg"><i className="bi bi-exclamation-circle"></i>{errors.password}</div>}
            </div>

            <div className="d-flex justify-content-end mb-3">
              <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn-gs-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '1rem' }} disabled={loading}>
              {loading ? <><i className="bi bi-hourglass"></i> Logging in...</> : <><i className="bi bi-box-arrow-in-right"></i> Login</>}
            </button>
          </form>

          <div className="gs-divider"><span>OR CONTINUE WITH</span></div>

          <button style={{
            width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)',
            border: '2px solid var(--border)', background: 'var(--white)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <i className="bi bi-google" style={{ color: '#ea4335' }}></i>
            Continue with Google
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}