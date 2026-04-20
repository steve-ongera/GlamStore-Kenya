// src/components/PrivateRoute.jsx
import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="gs-spinner" style={{ minHeight: '60vh' }}></div>
  return user ? <Outlet /> : <Navigate to="/login" replace />
}