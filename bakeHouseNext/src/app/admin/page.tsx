'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Truck,
  History,
  LogOut,
  ExternalLink,
  Menu as MenuIcon,
  X,
  Bell,
  ShieldCheck,
} from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import type { Order, Product, OrderStatus } from '@/types'

import AdminOverview from './components/AdminOverview'
import AdminMenuManagement from './components/AdminMenuManagement'
import AdminOrderManagement from './components/AdminOrderManagement'
import AdminDeliverySettings from './components/AdminDeliverySettings'
import AdminActivityLogs from './components/AdminActivityLogs'

import './adminDashboard.css'

type AdminTab = 'overview' | 'orders' | 'menu' | 'delivery' | 'activity'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Data states
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrderForView, setSelectedOrderForView] = useState<Order | null>(null)

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch('/api/admin/orders'),
        fetch('/api/admin/products'),
      ])

      if (ordersRes.status === 401 || productsRes.status === 401) {
        showToast('Session expired. Please log in.', 'warning')
        router.push('/admin/login')
        return
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData.orders || [])
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(Array.isArray(productsData) ? productsData : [])
      }
    } catch (e) {
      console.error('Error loading admin data', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Order status update handler
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, reason?: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, cancellation_reason: reason }),
      })

      if (res.ok) {
        const updated = await res.json()
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o)))
        showToast(`Order #${orderId} set to "${status}"`, 'success')
        return updated
      } else {
        showToast('Failed to update order status', 'error')
        return null
      }
    } catch {
      showToast('Network error updating status', 'error')
      return null
    }
  }

  // Product CRUD handlers
  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })

      if (res.ok) {
        const created = await res.json()
        setProducts((prev) => [created, ...prev])
        showToast(`Added product "${created.name}"`, 'success')
        return created
      } else {
        const err = await res.json()
        showToast(err.error || 'Failed to add product', 'error')
        return null
      }
    } catch {
      showToast('Network error adding product', 'error')
      return null
    }
  }

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (res.ok) {
        const updated = await res.json()
        setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)))
        showToast(`Updated "${updated.name}"`, 'success')
        return updated
      } else {
        const err = await res.json()
        showToast(err.error || 'Failed to update product', 'error')
        return null
      }
    } catch {
      showToast('Network error updating product', 'error')
      return null
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id))
        showToast('Product deleted', 'info')
        return true
      } else {
        showToast('Failed to delete product', 'error')
        return false
      }
    } catch {
      showToast('Network error deleting product', 'error')
      return false
    }
  }

  const handleToggleAvailability = async (id: string) => {
    const product = products.find((p) => p.id === id)
    if (!product) return null

    try {
      const newAvailability = !product.is_available
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: newAvailability }),
      })

      if (res.ok) {
        const updated = await res.json()
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, is_available: newAvailability } : p)))
        showToast(
          `"${product.name}" is now ${newAvailability ? 'Available' : 'Out of Stock'}`,
          newAvailability ? 'success' : 'warning'
        )
        return updated
      } else {
        showToast('Failed to update availability', 'error')
        return null
      }
    } catch {
      showToast('Network error updating availability', 'error')
      return null
    }
  }

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    showToast('Logged out of admin dashboard', 'info')
    router.push('/admin/login')
    router.refresh()
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrderForView(order)
    setActiveTab('orders')
  }

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__top">
          <div className="admin-sidebar__brand">
            <img
              src="https://ik.imagekit.io/sufiyanImages/almaas%20bakery.png"
              alt="Al Maas Bakery"
              className="admin-brand-logo"
            />
            <div className="admin-brand-text">
              <h3>AL MAAS</h3>
              <span>BAKERY ADMIN</span>
            </div>
          </div>
          <button
            className="admin-sidebar__close"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          <button
            className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('overview')
              setIsSidebarOpen(false)
            }}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('orders')
              setIsSidebarOpen(false)
            }}
          >
            <ShoppingBag size={18} />
            <span>Orders</span>
            {pendingOrdersCount > 0 && (
              <span className="admin-nav-badge">{pendingOrdersCount}</span>
            )}
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('menu')
              setIsSidebarOpen(false)
            }}
          >
            <Package size={18} />
            <span>Menu & Products</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'delivery' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('delivery')
              setIsSidebarOpen(false)
            }}
          >
            <Truck size={18} />
            <span>Delivery Rates</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('activity')
              setIsSidebarOpen(false)
            }}
          >
            <History size={18} />
            <span>Activity Logs</span>
          </button>
        </nav>

        <div className="admin-sidebar__bottom">
          <Link href="/" target="_blank" className="admin-sidebar__external-link">
            <ExternalLink size={16} /> View Live Storefront
          </Link>

          <div className="admin-user-card">
            <div className="admin-user-avatar">
              <ShieldCheck size={20} color="var(--gold)" />
            </div>
            <div className="admin-user-info">
              <strong>Master Admin</strong>
              <span>admin@al-maas.com</span>
            </div>
            <button className="admin-logout-btn" onClick={handleLogout} title="Sign Out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Top Header Bar */}
        <header className="admin-topbar">
          <div className="admin-topbar__left">
            <button
              className="admin-hamburger"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Toggle admin sidebar"
            >
              <MenuIcon size={22} />
            </button>
            <span className="admin-topbar__location">
              Al Maas Bakery Dashboard · Sultan Palya Main Road, Bengaluru
            </span>
          </div>

          <div className="admin-topbar__actions">
            {pendingOrdersCount > 0 && (
              <button
                className="admin-notification-btn"
                onClick={() => setActiveTab('orders')}
                title={`${pendingOrdersCount} pending orders`}
              >
                <Bell size={18} />
                <span className="admin-notification-dot" />
              </button>
            )}
            <Link href="/" target="_blank" className="btn btn--outline btn--sm">
              <ExternalLink size={14} /> Open Store
            </Link>
          </div>
        </header>

        {/* Tab View Container */}
        <div className="admin-content-view">
          {activeTab === 'overview' && (
            <AdminOverview
              orders={orders}
              products={products}
              onSelectTab={(tab) => setActiveTab(tab)}
              onViewOrder={handleViewOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrderManagement
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              selectedOrder={selectedOrderForView}
              onCloseOrderDetails={() => setSelectedOrderForView(null)}
            />
          )}

          {activeTab === 'menu' && (
            <AdminMenuManagement
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onToggleAvailability={handleToggleAvailability}
            />
          )}

          {activeTab === 'delivery' && <AdminDeliverySettings />}

          {activeTab === 'activity' && <AdminActivityLogs />}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  )
}

