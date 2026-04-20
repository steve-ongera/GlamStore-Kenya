// src/context/ToastContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const iconMap = { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', warning: 'bi-exclamation-triangle-fill', info: 'bi-info-circle-fill' }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="gs-toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`gs-toast ${t.type}`}>
            <i className={`bi ${iconMap[t.type] || iconMap.info}`}></i>
            <span>{t.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} style={{ marginLeft: 'auto', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
              <i className="bi bi-x"></i>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)