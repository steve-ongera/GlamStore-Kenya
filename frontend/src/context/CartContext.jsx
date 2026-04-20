import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], total: 0, item_count: 0 })
  const [loading, setLoading] = useState(false)

  const fetchCart = async () => {
    try {
      const res = await api.get('/orders/cart/')
      setCart(res.data)
    } catch (_) {}
  }

  useEffect(() => { fetchCart() }, [])

  const addToCart = async (product_id, quantity = 1, variant_id = null) => {
    setLoading(true)
    try {
      const res = await api.post('/orders/cart/add/', { product_id, quantity, variant_id })
      setCart(res.data)
      return true
    } catch (e) {
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateItem = async (item_id, quantity) => {
    const res = await api.post('/orders/cart/update_item/', { item_id, quantity })
    setCart(res.data)
  }

  const removeItem = async (item_id) => {
    const res = await api.post('/orders/cart/remove_item/', { item_id })
    setCart(res.data)
  }

  const clearCart = async () => {
    await api.post('/orders/cart/clear/')
    setCart({ items: [], total: 0, item_count: 0 })
  }

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateItem, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)