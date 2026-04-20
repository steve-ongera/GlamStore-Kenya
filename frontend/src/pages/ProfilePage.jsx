// src/pages/ProfilePage.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api, { getErrorMessage } from '../utils/api'

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', phone: user?.phone || '' })
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '' })
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('profile')

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.patch('/auth/profile/', form)
      updateUser(res.data)
      toast('Profile updated! ✅')
    } catch (err) {
      toast(getErrorMessage(err), 'error')
    }
    setSaving(false)
  }

  const handlePwChange = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/auth/change-password/', pwForm)
      toast('Password changed successfully! 🔒')
      setPwForm({ old_password: '', new_password: '' })
    } catch (err) {
      toast(getErrorMessage(err), 'error')
    }
    setSaving(false)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
    toast('Logged out. See you soon! 👋')
  }

  return (
    <div className="container-gs" style={{ padding: '1.5rem', maxWidth: 720 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.25rem' }}>
        My Account
      </h1>

      {/* Profile card */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), var(--accent2))',
        borderRadius: 'var(--radius-lg)', padding: '1.5rem',
        display: 'flex', alignItems: 'center', gap: '1.25rem',
        marginBottom: '1.5rem', color: '#fff',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', fontWeight: 800, flexShrink: 0,
        }}>
          {user?.first_name?.[0]}{user?.last_name?.[0]}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800 }}>
            {user?.first_name} {user?.last_name}
          </div>
          <div style={{ opacity: 0.85, fontSize: '0.875rem' }}>{user?.email}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="gs-tab-nav" style={{ marginBottom: '1.5rem' }}>
        {['profile', 'security', 'logout'].map(t => (
          <button key={t} className={`gs-tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'profile' ? '👤 Profile' : t === 'security' ? '🔒 Security' : '🚪 Logout'}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleSave} style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
          <h5 style={{ fontWeight: 800, marginBottom: '1.25rem' }}>Personal Information</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="gs-label">First Name</label>
              <input className="gs-input" value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} />
            </div>
            <div className="col-md-6">
              <label className="gs-label">Last Name</label>
              <input className="gs-input" value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} />
            </div>
            <div className="col-12">
              <label className="gs-label">Email Address</label>
              <input className="gs-input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
            </div>
            <div className="col-12">
              <label className="gs-label">Phone Number</label>
              <input className="gs-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+254 7XX XXX XXX" />
            </div>
          </div>
          <button type="submit" className="btn-gs-primary" style={{ marginTop: '1.25rem', padding: '10px 28px' }} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {tab === 'security' && (
        <form onSubmit={handlePwChange} style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
          <h5 style={{ fontWeight: 800, marginBottom: '1.25rem' }}>Change Password</h5>
          <div className="gs-form-group">
            <label className="gs-label">Current Password</label>
            <input type="password" className="gs-input" value={pwForm.old_password} onChange={e => setPwForm(p => ({ ...p, old_password: e.target.value }))} />
          </div>
          <div className="gs-form-group">
            <label className="gs-label">New Password</label>
            <input type="password" className="gs-input" value={pwForm.new_password} onChange={e => setPwForm(p => ({ ...p, new_password: e.target.value }))} placeholder="Min. 8 characters" />
          </div>
          <button type="submit" className="btn-gs-primary" style={{ padding: '10px 28px' }} disabled={saving}>
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}

      {tab === 'logout' && (
        <div style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
          <h5 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Logout from GlamStore?</h5>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You'll need to login again to access your account.</p>
          <button onClick={handleLogout} style={{
            background: 'var(--danger)', color: '#fff', borderRadius: 'var(--radius-pill)',
            padding: '10px 32px', fontWeight: 800, fontSize: '0.95rem',
            display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          }}>
            <i className="bi bi-box-arrow-right"></i> Yes, Logout
          </button>
        </div>
      )}
    </div>
  )
}