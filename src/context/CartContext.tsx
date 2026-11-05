import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Product, CartItem } from '../data/types'
import { useToast } from './ToastContext'

interface CartContextValue {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

const CART_STORAGE_KEY = 'almaas_cart_items_v1'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      console.error('Failed to load cart from storage', e)
      return []
    }
  })

  const [isCartOpen, setIsCartOpen] = useState(false)
  const { showToast } = useToast()

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch (e) {
      console.error('Failed to save cart to storage', e)
    }
  }, [items])

  const addToCart = useCallback(
    (product: Product, quantity: number = 1) => {
      if (product.isAvailable === false) {
        showToast(`"${product.name}" is currently out of stock.`, 'warning')
        return
      }

      setItems((prev) => {
        const existingIndex = prev.findIndex((i) => i.product.id === product.id)
        if (existingIndex > -1) {
          const updated = [...prev]
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          }
          return updated
        }
        return [...prev, { product, quantity }]
      })
      showToast(`Added "${product.name}" to cart!`, 'success')
    },
    [showToast]
  )

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId))
    } else {
      setItems((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
      )
    }
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    try {
      localStorage.removeItem(CART_STORAGE_KEY)
    } catch (e) {
      console.error(e)
    }
  }, [])

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0)
  const subtotal = items.reduce((acc, i) => {
    const price = i.product.discountPrice ?? i.product.price
    return acc + price * i.quantity
  }, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
