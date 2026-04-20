// src/pages/RegisterPage.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../utils/api'

export default function RegisterPage() {
  const { register } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '', password2: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setErrors(p => ({ ...p, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.first_name) errs.first_name = 'First name required'
    if (!form.last_name) errs.last_name = 'Last name required'
    if (!form.email) errs.email = 'Email required'
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (form.password !== form.password2) errs.password2 = 'Passwords do not match'
    return errs
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await register(form)
      toast('Account created! Welcome to GlamStore 💕')
      navigate('/')
    } catch (err) {
      toast(getErrorMessage(err), 'error')
    }
    setLoading(false)
  }

  const fields = [
    { name: 'first_name', label: 'First Name', type: 'text', placeholder: 'Jane', half: true },
    { name: 'last_name', label: 'Last Name', type: 'text', placeholder: 'Doe', half: true },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'jane@example.com' },
    { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+254 700 000 000' },
    { name: 'password', label: 'Password', type: 'password', placeholder: 'Min. 8 characters', half: true },
    { name: 'password2', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password', half: true },
  ]

  return (
    <div className="gs-auth-page">
      <div className="gs-auth-card" style={{ maxWidth: 520 }}>
        <div className="gs-auth-header">
          <div className="auth-logo">GlamStore 💄</div>
          <p>Create your account & start shopping!</p>
        </div>
        <div className="gs-auth-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {fields.map(f => (
                <div key={f.name} className={f.half ? 'col-6' : 'col-12'}>
                  <div className="gs-form-group" style={{ marginBottom: 0 }}>
                    <label className="gs-label">{f.label}</label>
                    <input type={f.type} name={f.name} className={`gs-input ${errors[f.name] ? 'error' : ''}`}
                      placeholder={f.placeholder} value={form[f.name]} onChange={handleChange} />
                    {errors[f.name] && <div className="gs-error-msg"><i className="bi bi-exclamation-circle"></i>{errors[f.name]}</div>}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ margin: '1.25rem 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              By creating an account you agree to our{' '}
              <Link to="/terms" style={{ color: 'var(--primary)' }}>Terms & Conditions</Link> and{' '}
              <Link to="/privacy" style={{ color: 'var(--primary)' }}>Privacy Policy</Link>.
            </div>

            <button type="submit" className="btn-gs-primary" style={{ width: '100%', justifyContent: 'center', padding: 12, fontSize: '1rem' }} disabled={loading}>
              {loading ? <><i className="bi bi-hourglass"></i> Creating Account...</> : <><i className="bi bi-person-plus"></i> Create Account</>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}