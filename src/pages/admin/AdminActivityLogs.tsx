import { useState, useMemo, useEffect } from 'react'
import {
  Search,
  Clock,
  Shield,
  Tag,
  Package,
  ShoppingBag,
  Truck,
  LogIn,
  LogOut,
  RefreshCw,
} from 'lucide-react'
import type { ActivityLog, ActivityActionType } from '../../data/types'
import { ActivityService } from '../../services/db'

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week'>('all')

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const data = await ActivityService.getAll()
      setLogs(data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  // Filtered logs
  const filteredLogs = useMemo(() => {
    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

    return logs.filter((log) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        log.description.toLowerCase().includes(q) ||
        log.id.toLowerCase().includes(q) ||
        (log.relatedId && log.relatedId.toLowerCase().includes(q)) ||
        log.adminId.toLowerCase().includes(q)

      const matchesAction = actionFilter === 'all' || log.action === actionFilter

      let matchesDate = true
      if (dateFilter === 'today') {
        matchesDate = log.timestamp.startsWith(todayStr)
      } else if (dateFilter === 'week') {
        matchesDate = log.timestamp >= sevenDaysAgo
      }

      return matchesSearch && matchesAction && matchesDate
    })
  }, [logs, searchQuery, actionFilter, dateFilter])

  // Helper icon for action types
  const getActionBadge = (action: ActivityActionType) => {
    switch (action) {
      case 'admin_login':
        return { label: 'Admin Login', className: 'act-badge act-badge--info', icon: LogIn }
      case 'admin_logout':
        return { label: 'Admin Logout', className: 'act-badge act-badge--muted', icon: LogOut }
      case 'product_added':
        return { label: 'Product Added', className: 'act-badge act-badge--success', icon: Package }
      case 'product_edited':
        return { label: 'Product Edited', className: 'act-badge act-badge--info', icon: Package }
      case 'product_price_changed':
        return { label: 'Price Changed', className: 'act-badge act-badge--warning', icon: Tag }
      case 'product_availability_changed':
        return { label: 'Availability Changed', className: 'act-badge act-badge--warning', icon: Tag }
      case 'product_deleted':
        return { label: 'Product Deleted', className: 'act-badge act-badge--danger', icon: Package }
      case 'order_status_updated':
        return { label: 'Order Updated', className: 'act-badge act-badge--success', icon: ShoppingBag }
      case 'order_cancelled':
        return { label: 'Order Cancelled', className: 'act-badge act-badge--danger', icon: ShoppingBag }
      case 'delivery_pricing_updated':
      case 'delivery_settings_changed':
        return { label: 'Delivery Settings', className: 'act-badge act-badge--gold', icon: Truck }
      default:
        return { label: action, className: 'act-badge act-badge--muted', icon: Shield }
    }
  }

  return (
    <div className="admin-activity-logs">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h2>Activity History & Audit Trail</h2>
          <p>
            Permanent, tamper-proof record of all admin activities, catalog updates, price modifications, and status changes.
          </p>
        </div>
        <button className="btn btn--outline btn--sm" onClick={fetchLogs} disabled={isLoading}>
          <RefreshCw size={14} className={isLoading ? 'spin-icon' : ''} /> Refresh Log
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-input">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search logs by keyword, description, Order ID, or Product ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="admin-filter-selects">
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            <option value="all">All Action Types ({logs.length})</option>
            <option value="admin_login">Admin Logins</option>
            <option value="admin_logout">Admin Logouts</option>
            <option value="product_added">Products Added</option>
            <option value="product_edited">Products Edited</option>
            <option value="product_price_changed">Price Changes</option>
            <option value="product_availability_changed">Availability Changes</option>
            <option value="product_deleted">Products Deleted</option>
            <option value="order_status_updated">Order Status Updates</option>
            <option value="order_cancelled">Order Cancellations</option>
            <option value="delivery_pricing_updated">Delivery Setting Changes</option>
          </select>

          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as any)}>
            <option value="all">All Dates</option>
            <option value="today">Today Only</option>
            <option value="week">Past 7 Days</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="admin-card">
        <div className="admin-card__header">
          <h3>
            Audit Records <span className="text-muted">({filteredLogs.length} events recorded)</span>
          </h3>
          <span className="audit-info-tag">🔒 Read-only security audit log</span>
        </div>

        <div className="admin-card__body">
          {filteredLogs.length === 0 ? (
            <div className="admin-empty-state">
              <p>No activity logs found for the selected filters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Timestamp & ID</th>
                    <th>Action</th>
                    <th>Description</th>
                    <th>Related Entity</th>
                    <th>Admin Identity</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => {
                    const badge = getActionBadge(log.action)
                    const Icon = badge.icon
                    const formattedDate = new Date(log.timestamp).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                    const formattedTime = new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })

                    return (
                      <tr key={log.id}>
                        <td>
                          <div className="log-time-cell">
                            <span className="log-date">{formattedDate}</span>
                            <span className="log-time">
                              <Clock size={11} /> {formattedTime}
                            </span>
                            <span className="log-id">{log.id}</span>
                          </div>
                        </td>
                        <td>
                          <span className={badge.className}>
                            <Icon size={12} /> {badge.label}
                          </span>
                        </td>
                        <td>
                          <p className="log-description-text">{log.description}</p>
                          {(log.previousValue !== undefined || log.newValue !== undefined) && (
                            <div className="log-values-comparison">
                              {log.previousValue !== undefined && (
                                <span className="log-val-prev">
                                  <b>Old:</b>{' '}
                                  {typeof log.previousValue === 'object'
                                    ? JSON.stringify(log.previousValue).slice(0, 50) + '...'
                                    : String(log.previousValue)}
                                </span>
                              )}
                              {log.newValue !== undefined && (
                                <span className="log-val-new">
                                  <b>New:</b>{' '}
                                  {typeof log.newValue === 'object'
                                    ? JSON.stringify(log.newValue).slice(0, 50) + '...'
                                    : String(log.newValue)}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          {log.relatedId ? (
                            <span className="related-id-badge">{log.relatedId}</span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td>
                          <span className="admin-id-text">{log.adminId}</span>
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
    </div>
  )
}
