// src/utils/api.js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function request(method, endpoint, data = null, options = {}) {
  const token = localStorage.getItem('access_token')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const config = { method, headers }
  if (data) config.body = JSON.stringify(data)

  let res = await fetch(`${BASE_URL}${endpoint}`, config)

  // Try to refresh token if 401
  if (res.status === 401 && token) {
    const refresh = localStorage.getItem('refresh_token')
    if (refresh) {
      const refreshRes = await fetch(`${BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      })
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        localStorage.setItem('access_token', refreshData.access)
        headers['Authorization'] = `Bearer ${refreshData.access}`
        res = await fetch(`${BASE_URL}${endpoint}`, { ...config, headers })
      } else {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
      }
    }
  }

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(JSON.stringify(json))
    err.data = json
    err.status = res.status
    throw err
  }
  return { data: json, status: res.status }
}

const api = {
  get: (endpoint, options) => request('GET', endpoint, null, options),
  post: (endpoint, data, options) => request('POST', endpoint, data, options),
  put: (endpoint, data, options) => request('PUT', endpoint, data, options),
  patch: (endpoint, data, options) => request('PATCH', endpoint, data, options),
  delete: (endpoint, options) => request('DELETE', endpoint, null, options),
}

export default api

export const formatPrice = (amount) =>
  `Ksh ${Number(amount).toLocaleString('en-KE', { minimumFractionDigits: 0 })}`

export const getErrorMessage = (err) => {
  try {
    const data = JSON.parse(err.message)
    const msgs = Object.values(data).flat()
    return msgs[0] || 'Something went wrong'
  } catch {
    return 'Something went wrong'
  }
}