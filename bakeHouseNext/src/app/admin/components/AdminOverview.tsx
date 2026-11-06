'use client'

import { useMemo } from 'react'
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  DollarSign,
  Package,
  ArrowUpRight,
  Eye,
} from 'lucide-react'
import type { Order, Product, OrderStatus } from '@/types'

interface AdminOverviewProps {
  orders: Order[]
  products: Product[]
  onSelectTab: (tab: 'orders' | 'menu' | 'delivery' | 'activity') => void
  onViewOrder: (order: Order) => void
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void
}

export default function AdminOverview({
  orders,
  products,
  onSelectTab,
  onViewOrder,
  onUpdateOrderStatus,
}: AdminOverviewProps) {
  const stats = useMemo(() => {
    const totalOrders = orders.length
    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)

    const todayOrders = orders.filter((o) => (o.created_at || '').startsWith(todayStr))
    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0)
    const todayRevenue = todayOrders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0)

    const pendingOrders = orders.filter((o) => o.status === 'pending').length
    const preparingOrders = orders.filter((o) => o.status === 'preparing').length
    const outForDeliveryOrders = orders.filter((o) => o.status === 'out_for_delivery').length
    const completedOrders = orders.filter((o) => o.status === 'delivered').length
    const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length

    const totalProducts = products.length
    const availableProducts = products.filter((p) => p.is_available !== false).length
    const outOfStockProducts = totalProducts - availableProducts

    return {
      totalOrders,
      todayOrdersCount: todayOrders.length,
      totalRevenue,
      todayRevenue,
      pendingOrders,
      preparingOrders,
      outForDeliveryOrders,
      completedOrders,
      cancelledOrders,
      totalProducts,
      availableProducts,
      outOfStockProducts,
    }
  }, [orders, products])

  const recentOrders = useMemo(() => {
    return [...orders].slice(0, 6)
  }, [orders])

  return (
    <div className="admin-overview">
      <div className="admin-page-header">
        <div>
          <h2>Dashboard Overview</h2>
          <p>Real-time analytics, order activity, and inventory summary for Al Maas Bakery.</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--gold">
            <DollarSign size={24} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__label">Total Revenue</span>
            <h3 className="stat-card__value">₹{stats.totalRevenue.toLocaleString()}</h3>
            <span className="stat-card__meta">
              <TrendingUp size={14} color="#2e7d32" /> ₹{stats.todayRevenue.toLocaleString()} today
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--navy">
            <ShoppingBag size={24} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__label">Total Orders</span>
            <h3 className="stat-card__value">{stats.totalOrders}</h3>
            <span className="stat-card__meta">
              <b>{stats.todayOrdersCount}</b> placed today
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--warning">
            <Clock size={24} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__label">Pending Orders</span>
            <h3 className="stat-card__value">{stats.pendingOrders}</h3>
            <span className="stat-card__meta">Needs action</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--success">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__label">Delivered Orders</span>
            <h3 className="stat-card__value">{stats.completedOrders}</h3>
            <span className="stat-card__meta">{stats.outForDeliveryOrders} out for delivery</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--brown">
            <Package size={24} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__label">Menu Items</span>
            <h3 className="stat-card__value">{stats.totalProducts}</h3>
            <span className="stat-card__meta">
              {stats.outOfStockProducts > 0 ? (
                <span style={{ color: '#c62828' }}>{stats.outOfStockProducts} out of stock</span>
              ) : (
                <span style={{ color: '#2e7d32' }}>All in stock</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Two-Column Grid */}
      <div className="admin-overview-grid">
        <div className="admin-card">
          <div className="admin-card__header">
            <div>
              <h3>Recent Orders</h3>
              <p>Latest customer requests awaiting action</p>
            </div>
            <button className="btn btn--outline btn--sm" onClick={() => onSelectTab('orders')}>
              View All Orders <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="admin-card__body">
            {recentOrders.length === 0 ? (
              <div className="admin-empty-state">
                <p>No orders received yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <strong className="order-id-link" onClick={() => onViewOrder(order)}>
                            {order.id}
                          </strong>
                          <span className="order-time-text">
                            {order.created_at ? new Date(order.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            }) : ''}
                          </span>
                        </td>
                        <td>
                          <span className="customer-name">{order.customer_name}</span>
                          <span className="customer-phone">{order.mobile}</span>
                        </td>
                        <td>
                          <span className="order-items-summary">
                            {order.items && order.items.length > 0
                              ? order.items.map((i) => `${i.product_name} (×${i.quantity})`).join(', ')
                              : 'Items details'}
                          </span>
                        </td>
                        <td>
                          <strong>₹{order.total}</strong>
                        </td>
                        <td>
                          <select
                            className={`status-select status-select--${order.status}`}
                            value={order.status}
                            onChange={(e) =>
                              onUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                            }
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>
                          <button
                            className="admin-icon-btn"
                            title="View Full Details"
                            onClick={() => onViewOrder(order)}
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="admin-overview-sidebar">
          <div className="admin-card">
            <div className="admin-card__header">
              <h3>Order Distribution</h3>
            </div>
            <div className="admin-card__body">
              <div className="status-bars-list">
                <div className="status-bar-item">
                  <div className="status-bar-item__top">
                    <span>Pending</span>
                    <strong>{stats.pendingOrders}</strong>
                  </div>
                  <div className="status-bar-track">
                    <div
                      className="status-bar-fill status-bar-fill--pending"
                      style={{
                        width: `${stats.totalOrders ? (stats.pendingOrders / stats.totalOrders) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="status-bar-item">
                  <div className="status-bar-item__top">
                    <span>Preparing in Kitchen</span>
                    <strong>{stats.preparingOrders}</strong>
                  </div>
                  <div className="status-bar-track">
                    <div
                      className="status-bar-fill status-bar-fill--preparing"
                      style={{
                        width: `${stats.totalOrders ? (stats.preparingOrders / stats.totalOrders) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="status-bar-item">
                  <div className="status-bar-item__top">
                    <span>Out for Delivery</span>
                    <strong>{stats.outForDeliveryOrders}</strong>
                  </div>
                  <div className="status-bar-track">
                    <div
                      className="status-bar-fill status-bar-fill--out-for-delivery"
                      style={{
                        width: `${stats.totalOrders ? (stats.outForDeliveryOrders / stats.totalOrders) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="status-bar-item">
                  <div className="status-bar-item__top">
                    <span>Delivered</span>
                    <strong>{stats.completedOrders}</strong>
                  </div>
                  <div className="status-bar-track">
                    <div
                      className="status-bar-fill status-bar-fill--delivered"
                      style={{
                        width: `${stats.totalOrders ? (stats.completedOrders / stats.totalOrders) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="status-bar-item">
                  <div className="status-bar-item__top">
                    <span>Cancelled</span>
                    <strong>{stats.cancelledOrders}</strong>
                  </div>
                  <div className="status-bar-track">
                    <div
                      className="status-bar-fill status-bar-fill--cancelled"
                      style={{
                        width: `${stats.totalOrders ? (stats.cancelledOrders / stats.totalOrders) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card__header">
              <h3>Quick Actions</h3>
            </div>
            <div className="admin-card__body admin-quick-actions">
              <button
                className="btn btn--outline admin-quick-btn"
                onClick={() => onSelectTab('menu')}
              >
                + Add New Bakery Product
              </button>
              <button
                className="btn btn--outline admin-quick-btn"
                onClick={() => onSelectTab('delivery')}
              >
                ⚙️ Adjust Delivery Rates & Radius
              </button>
              <button
                className="btn btn--outline admin-quick-btn"
                onClick={() => onSelectTab('activity')}
              >
                📋 View Audit Logs & History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

