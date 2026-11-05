import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Product } from '../data/types'
import { ProductService } from '../services/db'
import { useToast } from './ToastContext'

interface ProductContextValue {
  products: Product[]
  isLoading: boolean
  refreshProducts: () => Promise<void>
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product | null>
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product | null>
  toggleAvailability: (id: string) => Promise<Product | null>
  deleteProduct: (id: string) => Promise<boolean>
}

const ProductContext = createContext<ProductContextValue | undefined>(undefined)

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToast()

  const refreshProducts = useCallback(async () => {
    try {
      const data = await ProductService.getAll()
      setProducts(data)
    } catch (e) {
      console.error('Failed to fetch products', e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshProducts()
  }, [refreshProducts])

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProd = await ProductService.add(productData)
      setProducts((prev) => [newProd, ...prev])
      showToast(`Product "${newProd.name}" added successfully!`, 'success')
      return newProd
    } catch (err) {
      showToast('Failed to add product', 'error')
      console.error(err)
      return null
    }
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const updated = await ProductService.update(id, updates)
      if (updated) {
        setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)))
        showToast(`Product "${updated.name}" updated!`, 'success')
      }
      return updated
    } catch (err) {
      showToast('Failed to update product', 'error')
      console.error(err)
      return null
    }
  }

  const toggleAvailability = async (id: string) => {
    try {
      const updated = await ProductService.toggleAvailability(id)
      if (updated) {
        setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)))
        showToast(
          `"${updated.name}" is now ${updated.isAvailable ? 'Available' : 'Out of Stock'}`,
          updated.isAvailable ? 'success' : 'warning'
        )
      }
      return updated
    } catch (err) {
      showToast('Failed to change product availability', 'error')
      console.error(err)
      return null
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const success = await ProductService.delete(id)
      if (success) {
        setProducts((prev) => prev.filter((p) => p.id !== id))
        showToast('Product deleted successfully', 'info')
      }
      return success
    } catch (err) {
      showToast('Failed to delete product', 'error')
      console.error(err)
      return false
    }
  }

  return (
    <ProductContext.Provider
      value={{
        products,
        isLoading,
        refreshProducts,
        addProduct,
        updateProduct,
        toggleAvailability,
        deleteProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductContext)
  if (!ctx) throw new Error('useProducts must be used within a ProductProvider')
  return ctx
}
