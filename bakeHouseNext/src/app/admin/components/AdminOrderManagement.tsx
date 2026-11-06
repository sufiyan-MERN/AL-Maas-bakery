'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Eye, Phone, MessageCircle, Truck, X } from 'lucide-react'
import type { Order, OrderStatus } from '@/types'
import { useToast } from '@/context/ToastContext'

interface AdminOrderManagementProps {
  orders: Order[]
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, reason?: string) => Promise<Order | null>
  selectedOrder?: Order | null
  onCloseOrderDetails?: () => void
}

export default function AdminOrderManagement({
  orders,
  onUpdateOrderStatus,
  selectedOrder: initialSelectedOrder,
  onCloseOrderDetails,
}: AdminOrderManagementProps) {
  const { showToast } = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week'>('all')

  const [activeOrder, setActiveOrder] = useState<Order | null>(initialSelectedOrder || null)
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null)
  const [cancellationReason, setCancellationReason] = useState('')

  useEffect(() => {
    if (initialSelectedOrder) {
      setActiveOrder(initialSelectedOrder)
    }
  }, [initialSelectedOrder])

  const filteredOrders = useMemo(() => {
    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

    return orders.filter((o) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        o.id.toLowerCase().includes(q) ||
        (o.customer_name || '').toLowerCase().includes(q) ||
        (o.mobile || '').includes(q) ||
        (o.city || '').toLowerCase().includes(q) ||
        (o.street || '').toLowerCase().includes(q)

      const matchesStatus = statusFilter === 'all' || o.status === statusFilter

      let matchesDate = true
      const orderDate = o.created_at || ''
      if (dateFilter === 'today') {
        matchesDate = orderDate.startsWith(todayStr)
      } else if (dateFilter === 'week') {
        matchesDate = orderDate >= sevenDaysAgo
      }

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [orders, searchQuery, statusFilter, dateFilter])

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    if (newStatus === 'cancelled') {
      setCancelOrderId(orderId)
      return
    }
    const updated = await onUpdateOrderStatus(orderId, newStatus)
    if (updated && activeOrder && activeOrder.id === orderId) {
      setActiveOrder(updated)
    }
  }

  const handleConfirmCancel = async () => {
    if (!cancelOrderId) return
    const updated = await onUpdateOrderStatus(cancelOrderId, 'cancelled', cancellationReason)
    if (updated && activeOrder && activeOrder.id === cancelOrderId) {
      setActiveOrder(updated)
    }
    setCancelOrderId(null)
    setCancellationReason('')
  }

  const closeDetails = () => {
    setActiveOrder(null)
    if (onCloseOrderDetails) onCloseOrderDetails()
  }

  return (
    <div className="admin-order-management">
      <div className="admin-page-header">
        <div>
          <h2>Order Management</h2>
          <p>Track incoming bakery orders, update preparation stages, and dispatch deliveries.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-input">
          <Search size={18} color="var(--gold)" />
          <input
            type="text"
            placeholder="Search by Order ID, customer, mobile, area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="admin-filter-selects">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as any)}>
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">Past 7 Days</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-card">
        <div className="admin-card__body" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Info</th>
                  <th>Items</th>
                  <th>Delivery Address</th>
                  <th>Financials</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="admin-empty-state">
                      No orders found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong className="order-id-link" onClick={() => setActiveOrder(order)}>
                          {order.id}
                        </strong>
                        <span className="order-time-text">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          }) + ' · ' + new Date(order.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : ''}
                        </span>
                      </td>

                      <td>
                        <span className="customer-name">{order.customer_name}</span>
                        <div className="customer-contact-links">
                          <a href={`tel:${order.mobile}`} className="contact-link">
                            <Phone size={12} /> {order.mobile}
                          </a>
                          {order.whatsapp && (
                            <a
                              href={`https://wa.me/${order.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="contact-link contact-link--wa"
                            >
                              <MessageCircle size={12} /> WhatsApp
                            </a>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="order-items-summary">
                          {order.items && order.items.length > 0
                            ? order.items.map((i) => `${i.product_name} (×${i.quantity})`).join(', ')
                            : 'No items recorded'}
                        </span>
                        <span className="order-items-count">
                          {order.items ? order.items.reduce((s, i) => s + i.quantity, 0) : 0} items
                        </span>
                      </td>

                      <td>
                        <span className="delivery-area-text">
                          {order.address_line1}, {order.street}, {order.city} - {order.pincode}
                        </span>
                        {order.delivery_distance !== undefined && order.delivery_distance !== null && (
                          <span className="distance-badge">
                            <Truck size={12} /> {order.delivery_distance} km
                          </span>
                        )}
                      </td>

                      <td>
                        <strong className="final-total-text">₹{order.total}</strong>
                        <span className="fee-text">Fee: ₹{order.delivery_charge}</span>
                      </td>

                      <td>
                        <select
                          className={`status-select status-select--${order.status}`}
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value as OrderStatus)
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
                          title="View Details"
                          onClick={() => setActiveOrder(order)}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {activeOrder && (
        <div className="admin-modal-overlay" onClick={closeDetails}>
          <div
            className="admin-modal-card admin-order-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div className="admin-order-modal__title-wrap">
                <span className="order-date-full">
                  Placed on{' '}
                  {activeOrder.created_at
                    ? new Date(activeOrder.created_at).toLocaleString()
                    : 'Unknown date'}
                </span>
                <h3>Order #{activeOrder.id}</h3>
              </div>
              <button className="admin-modal-close" onClick={closeDetails}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-order-modal__body">
              {/* Status Update Bar */}
              <div className="order-modal-status-bar">
                <div>
                  <span>Current Status:</span>
                  <select
                    className={`status-select status-select--${activeOrder.status}`}
                    value={activeOrder.status}
                    onChange={(e) =>
                      handleStatusChange(activeOrder.id, e.target.value as OrderStatus)
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Two column customer / delivery info */}
              <div className="order-modal-info-grid">
                <div className="order-modal-info-box">
                  <h4>Customer Information</h4>
                  <div className="info-item">
                    <span>Name</span>
                    <strong>{activeOrder.customer_name}</strong>
                  </div>
                  <div className="info-item">
                    <span>Phone</span>
                    <a href={`tel:${activeOrder.mobile}`} className="phone-link">
                      <Phone size={14} /> {activeOrder.mobile}
                    </a>
                  </div>
                  {activeOrder.whatsapp && (
                    <div className="info-item">
                      <span>WhatsApp</span>
                      <a
                        href={`https://wa.me/${activeOrder.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="wa-link"
                      >
                        <MessageCircle size={14} /> {activeOrder.whatsapp}
                      </a>
                    </div>
                  )}
                </div>

                <div className="order-modal-info-box">
                  <h4>Delivery Address</h4>
                  <p style={{ fontSize: '0.88rem', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                    {activeOrder.address_line1}
                    {activeOrder.address_line2 ? `, ${activeOrder.address_line2}` : ''}
                    <br />
                    {activeOrder.street}, {activeOrder.city} - {activeOrder.pincode}
                  </p>
                  {activeOrder.delivery_distance !== undefined && activeOrder.delivery_distance !== null && (
                    <div className="info-item">
                      <span>Distance</span>
                      <strong>{activeOrder.delivery_distance} km from shop</strong>
                    </div>
                  )}
                  {activeOrder.delivery_instructions && (
                    <div style={{ marginTop: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <strong>Instructions:</strong> {activeOrder.delivery_instructions}
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="order-modal-items">
                <h4>Ordered Items</h4>
                <div className="order-modal-items-list">
                  {activeOrder.items && activeOrder.items.length > 0 ? (
                    activeOrder.items.map((item, idx) => (
                      <div key={idx} className="order-modal-item">
                        {item.product_image && (
                          <img src={item.product_image} alt={item.product_name} />
                        )}
                        <div className="order-modal-item-info">
                          <strong>{item.product_name}</strong>
                          <span>₹{item.unit_price} each</span>
                        </div>
                        <span className="order-modal-item-qty">×{item.quantity}</span>
                        <strong className="order-modal-item-subtotal">
                          ₹{item.subtotal}
                        </strong>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No individual items available.
                    </p>
                  )}
                </div>
              </div>

              {/* Financial Totals */}
              <div className="order-modal-totals">
                <div className="modal-total-row">
                  <span>Items Subtotal</span>
                  <span>₹{activeOrder.subtotal}</span>
                </div>
                <div className="modal-total-row">
                  <span>Delivery Charge</span>
                  <span>₹{activeOrder.delivery_charge}</span>
                </div>
                <div className="modal-total-row modal-total-row--final">
                  <span>Final Total</span>
                  <span>₹{activeOrder.total}</span>
                </div>
              </div>
            </div>

            <div className="admin-modal-actions" style={{ padding: '16px 24px' }}>
              <button className="btn btn--outline" onClick={closeDetails}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelOrderId && (
        <div className="admin-modal-overlay" onClick={() => setCancelOrderId(null)}>
          <div
            className="admin-modal-card admin-modal-card--danger"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Cancel Order #{cancelOrderId}?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '8px 0 16px' }}>
              Please provide a reason for cancelling this order:
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Out of stock, customer requested cancellation, delivery unavailable..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="table-input"
              style={{ marginBottom: '20px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button className="btn btn--outline" onClick={() => setCancelOrderId(null)}>
                Keep Order
              </button>
              <button className="btn btn--danger" onClick={handleConfirmCancel}>
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

