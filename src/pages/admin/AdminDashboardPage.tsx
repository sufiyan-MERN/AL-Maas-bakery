import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { AuthService, OrderService, ProductService } from '../../services/db'
import { useToast } from '../../context/ToastContext'
import type { Order, Product, OrderStatus } from '../../data/types'

// Admin Subsections
import AdminOverview from './AdminOverview'
import AdminMenuManagement from './AdminMenuManagement'
import AdminOrderManagement from './AdminOrderManagement'
import AdminDeliverySettings from './AdminDeliverySettings'
import AdminActivityLogs from './AdminActivityLogs'

import './adminDashboard.css'

type AdminTab = 'overview' | 'orders' | 'menu' | 'delivery' | 'activity'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Data states
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrderForView, setSelectedOrderForView] = useState<Order | null>(null)

  // 1. Verify authentication
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      showToast('Please log in to access the admin dashboard', 'warning')
      navigate('/admin/login', { replace: true })
    }
  }, [navigate, showToast])

  // 2. Fetch live data
  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const [ordersData, productsData] = await Promise.all([
        OrderService.getAll(),
        ProductService.getAll(),
      ])
      setOrders(ordersData)
      setProducts(productsData)
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
      const updated = await OrderService.updateStatus(orderId, status, reason)
      if (updated) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)))
        showToast(`Order #${orderId} status set to "${status}"`, 'success')
      }
      return updated
    } catch {
      showToast('Failed to update order status', 'error')
      return null
    }
  }

  // Product CRUD handlers
  const handleAddProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const created = await ProductService.add(productData)
      setProducts((prev) => [created, ...prev])
      showToast(`Added product "${created.name}"`, 'success')
      return created
    } catch {
      showToast('Failed to add product', 'error')
      return null
    }
  }

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const updated = await ProductService.update(id, updates)
      if (updated) {
        setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)))
        showToast(`Updated "${updated.name}"`, 'success')
      }
      return updated
    } catch {
      showToast('Failed to update product', 'error')
      return null
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      const success = await ProductService.delete(id)
      if (success) {
        setProducts((prev) => prev.filter((p) => p.id !== id))
        showToast('Product deleted', 'info')
      }
      return success
    } catch {
      showToast('Failed to delete product', 'error')
      return false
    }
  }

  const handleToggleAvailability = async (id: string) => {
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
    } catch {
      showToast('Failed to change availability', 'error')
      return null
    }
  }

  // Handle Logout
  const handleLogout = async () => {
    await AuthService.logout()
    showToast('Logged out of admin dashboard', 'info')
    navigate('/admin/login')
  }

  // Helper to open order details modal directly
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
          <a href="/" target="_blank" rel="noreferrer" className="admin-sidebar__external-link">
            <ExternalLink size={16} /> View Live Storefront
          </a>

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
            <a href="/" target="_blank" rel="noreferrer" className="btn btn--outline btn--sm">
              <ExternalLink size={14} /> Open Store
            </a>
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
