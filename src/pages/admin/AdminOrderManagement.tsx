import { useState, useMemo, useEffect } from 'react'
import {
  Search,
  Eye,
  Phone,
  MessageCircle,
  Truck,
  XCircle,
  X,
} from 'lucide-react'
import type { Order, OrderStatus } from '../../data/types'

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

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week'>('all')

  // Selected Order for detail view modal
  const [activeOrder, setActiveOrder] = useState<Order | null>(initialSelectedOrder || null)

  // Cancel order modal state
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null)
  const [cancellationReason, setCancellationReason] = useState('')

  // Sync if parent updates initialSelectedOrder
  useEffect(() => {
    if (initialSelectedOrder) {
      setActiveOrder(initialSelectedOrder)
    }
  }, [initialSelectedOrder])

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

    return orders.filter((o) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        o.id.toLowerCase().includes(q) ||
        o.customer.fullName.toLowerCase().includes(q) ||
        o.customer.mobile.includes(q) ||
        o.customer.city.toLowerCase().includes(q) ||
        o.customer.streetArea.toLowerCase().includes(q)

      const matchesStatus = statusFilter === 'all' || o.status === statusFilter

      let matchesDate = true
      if (dateFilter === 'today') {
        matchesDate = o.createdAt.startsWith(todayStr)
      } else if (dateFilter === 'week') {
        matchesDate = o.createdAt >= sevenDaysAgo
      }

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [orders, searchQuery, statusFilter, dateFilter])

  // Handle quick status change
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    if (newStatus === 'cancelled') {
      setCancelOrderId(orderId)
      return
    }
    const updated = await onUpdateOrderStatus(orderId, newStatus)
    if (updated && activeOrder?.id === orderId) {
      setActiveOrder(updated)
    }
  }

  // Handle confirm cancel
  const handleConfirmCancel = async () => {
    if (!cancelOrderId) return
    const updated = await onUpdateOrderStatus(cancelOrderId, 'cancelled', cancellationReason.trim())
    if (updated && activeOrder?.id === cancelOrderId) {
      setActiveOrder(updated)
    }
    setCancelOrderId(null)
    setCancellationReason('')
  }

  return (
    <div className="admin-order-management">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h2>Customer Orders</h2>
          <p>Real-time order pipeline, customer deliveries, status updates, and tracking.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-input">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by Order ID, customer name, mobile, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="admin-filter-selects">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses ({orders.length})</option>
            <option value="pending">Pending ({orders.filter((o) => o.status === 'pending').length})</option>
            <option value="confirmed">Confirmed ({orders.filter((o) => o.status === 'confirmed').length})</option>
            <option value="preparing">Preparing ({orders.filter((o) => o.status === 'preparing').length})</option>
            <option value="out_for_delivery">Out for Delivery ({orders.filter((o) => o.status === 'out_for_delivery').length})</option>
            <option value="delivered">Delivered ({orders.filter((o) => o.status === 'delivered').length})</option>
            <option value="cancelled">Cancelled ({orders.filter((o) => o.status === 'cancelled').length})</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
          >
            <option value="all">All Dates</option>
            <option value="today">Today's Orders</option>
            <option value="week">Past 7 Days</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-card">
        <div className="admin-card__header">
          <h3>
            Orders List <span className="text-muted">({filteredOrders.length} found)</span>
          </h3>
        </div>

        <div className="admin-card__body">
          {filteredOrders.length === 0 ? (
            <div className="admin-empty-state">
              <p>No customer orders match the selected criteria.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID & Date</th>
                    <th>Customer</th>
                    <th>Delivery Area</th>
                    <th>Distance & Fee</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })
                    const formattedTime = new Date(order.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })

                    return (
                      <tr key={order.id}>
                        <td>
                          <strong className="order-id-link" onClick={() => setActiveOrder(order)}>
                            {order.id}
                          </strong>
                          <span className="order-time-text">
                            {formattedDate} · {formattedTime}
                          </span>
                        </td>
                        <td>
                          <span className="customer-name">{order.customer.fullName}</span>
                          <div className="customer-contact-links">
                            <a href={`tel:${order.customer.mobile}`} className="contact-link">
                              <Phone size={12} /> {order.customer.mobile}
                            </a>
                            {order.customer.whatsapp && (
                              <a
                                href={`https://wa.me/91${order.customer.whatsapp.replace(/\D/g, '')}`}
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
                          <span className="delivery-area-text">
                            {order.customer.streetArea}, {order.customer.city}
                          </span>
                        </td>
                        <td>
                          <span className="distance-badge">
                            <Truck size={12} /> {order.deliveryDistanceKm} km
                          </span>
                          <span className="fee-text">₹{order.deliveryCharge}</span>
                        </td>
                        <td>
                          <span className="order-items-count">
                            {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
                          </span>
                        </td>
                        <td>
                          <strong className="final-total-text">₹{order.finalTotal}</strong>
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
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn--outline btn--sm"
                            onClick={() => setActiveOrder(order)}
                          >
                            <Eye size={14} /> View
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {activeOrder && (
        <div
          className="admin-modal-overlay"
          onClick={() => {
            setActiveOrder(null)
            if (onCloseOrderDetails) onCloseOrderDetails()
          }}
        >
          <div className="admin-modal-card admin-order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="admin-order-modal__title-wrap">
                <span className="section-label">ORDER DETAILS</span>
                <h3>{activeOrder.id}</h3>
                <span className="order-date-full">
                  Placed on {new Date(activeOrder.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              <button
                className="admin-modal-close"
                onClick={() => {
                  setActiveOrder(null)
                  if (onCloseOrderDetails) onCloseOrderDetails()
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-order-modal__body">
              {/* Status Bar */}
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
                {activeOrder.status !== 'cancelled' && (
                  <button
                    className="btn btn--danger btn--sm"
                    onClick={() => setCancelOrderId(activeOrder.id)}
                  >
                    Cancel Order
                  </button>
                )}
              </div>

              {activeOrder.cancellationReason && (
                <div className="cancellation-alert">
                  <strong>Cancellation Reason:</strong> {activeOrder.cancellationReason}
                </div>
              )}

              {/* Grid: Customer & Delivery Info */}
              <div className="order-modal-info-grid">
                <div className="order-modal-info-box">
                  <h4>Customer Information</h4>
                  <div className="info-item">
                    <span>Full Name:</span>
                    <strong>{activeOrder.customer.fullName}</strong>
                  </div>
                  <div className="info-item">
                    <span>Mobile:</span>
                    <a href={`tel:${activeOrder.customer.mobile}`} className="phone-link">
                      <Phone size={14} /> {activeOrder.customer.mobile}
                    </a>
                  </div>
                  {activeOrder.customer.whatsapp && (
                    <div className="info-item">
                      <span>WhatsApp:</span>
                      <a
                        href={`https://wa.me/91${activeOrder.customer.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="wa-link"
                      >
                        <MessageCircle size={14} /> {activeOrder.customer.whatsapp}
                      </a>
                    </div>
                  )}
                </div>

                <div className="order-modal-info-box">
                  <h4>Delivery Details</h4>
                  <div className="info-item">
                    <span>Address:</span>
                    <strong>{activeOrder.customer.formattedAddress}</strong>
                  </div>
                  <div className="info-item">
                    <span>Calculated Distance:</span>
                    <span>
                      <b>{activeOrder.deliveryDistanceKm} km</b> from Al Maas Bakery
                    </span>
                  </div>
                  <div className="info-item">
                    <span>Delivery Fee:</span>
                    <span>₹{activeOrder.deliveryCharge}</span>
                  </div>
                  {activeOrder.customer.deliveryInstructions && (
                    <div className="info-item">
                      <span>Instructions:</span>
                      <em>"{activeOrder.customer.deliveryInstructions}"</em>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="order-modal-items">
                <h4>Ordered Items ({activeOrder.items.length})</h4>
                <div className="order-modal-items-list">
                  {activeOrder.items.map((item) => (
                    <div key={item.productId} className="order-modal-item">
                      <img src={item.image} alt={item.name} />
                      <div className="order-modal-item-info">
                        <strong>{item.name}</strong>
                        <span>₹{item.price} each</span>
                      </div>
                      <div className="order-modal-item-qty">Qty: {item.quantity}</div>
                      <div className="order-modal-item-subtotal">₹{item.subtotal}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="order-modal-totals">
                <div className="modal-total-row">
                  <span>Product Subtotal:</span>
                  <span>₹{activeOrder.subtotal}</span>
                </div>
                <div className="modal-total-row">
                  <span>Delivery Charge ({activeOrder.deliveryDistanceKm} km):</span>
                  <span>₹{activeOrder.deliveryCharge}</span>
                </div>
                <div className="modal-total-row modal-total-row--final">
                  <span>Final Total:</span>
                  <span>₹{activeOrder.finalTotal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Dialog */}
      {cancelOrderId && (
        <div className="admin-modal-overlay" onClick={() => setCancelOrderId(null)}>
          <div className="admin-modal-card admin-modal-card--danger" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-icon-danger">
              <XCircle size={36} color="#c62828" />
            </div>
            <h3>Cancel Order #{cancelOrderId}?</h3>
            <p>
              Please enter an optional reason for cancelling this customer order. This action will be recorded in the audit history.
            </p>
            <div className="form-group" style={{ textAlign: 'left', marginTop: '16px' }}>
              <label>Cancellation Reason</label>
              <textarea
                rows={2}
                placeholder="e.g. Out of stock ingredients, customer requested cancellation, delivery unavailable"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
              />
            </div>
            <div className="admin-modal-actions">
              <button className="btn btn--outline" onClick={() => setCancelOrderId(null)}>
                Go Back
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
