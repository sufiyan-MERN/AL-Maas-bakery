'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Clock, Package, Tag, LogIn, LogOut, RefreshCw, Shield } from 'lucide-react'
import type { ActivityLog } from '@/types'

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/activity')
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || [])
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        (log.description || '').toLowerCase().includes(q) ||
        (log.admin_id || '').toLowerCase().includes(q) ||
        (log.action || '').toLowerCase().includes(q)

      const matchesAction = actionFilter === 'all' || log.action === actionFilter
      return matchesSearch && matchesAction
    })
  }, [logs, searchQuery, actionFilter])

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase()
    if (act.includes('LOGIN')) {
      return { label: 'Admin Login', className: 'act-badge act-badge--info', icon: LogIn }
    }
    if (act.includes('LOGOUT')) {
      return { label: 'Admin Logout', className: 'act-badge act-badge--muted', icon: LogOut }
    }
    if (act.includes('CREATED') || act.includes('ADD')) {
      return { label: 'Product Created', className: 'act-badge act-badge--success', icon: Package }
    }
    if (act.includes('PRICE')) {
      return { label: 'Price Changed', className: 'act-badge act-badge--warning', icon: Tag }
    }
    if (act.includes('DELIVERY')) {
      return { label: 'Delivery Settings', className: 'act-badge act-badge--gold', icon: Shield }
    }
    return { label: action, className: 'act-badge act-badge--info', icon: Clock }
  }

  return (
    <div className="admin-activity-logs">
      <div className="admin-page-header">
        <div>
          <h2>System Audit & Activity Logs</h2>
          <p>
            Immutable audit record of all administrative actions, product edits, rate adjustments, and logins.
          </p>
        </div>
        <button
          className="btn btn--outline btn--sm"
          onClick={fetchLogs}
          disabled={isLoading}
        >
          <RefreshCw size={14} className={isLoading ? 'spin-icon' : ''} /> Refresh Logs
        </button>
      </div>

      <div className="admin-filter-bar">
        <div className="admin-search-input">
          <Search size={18} color="var(--gold)" />
          <input
            type="text"
            placeholder="Search activity description, user, action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="admin-filter-selects">
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            <option value="all">All Actions</option>
            <option value="ADMIN_LOGIN">Admin Logins</option>
            <option value="PRODUCT_CREATED">Product Created</option>
            <option value="PRODUCT_UPDATED">Product Updated</option>
            <option value="PRODUCT_DELETED">Product Deleted</option>
            <option value="ORDER_STATUS_UPDATED">Order Status Updated</option>
            <option value="DELIVERY_SETTINGS_UPDATED">Delivery Settings</option>
          </select>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card__body" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action Type</th>
                  <th>Description</th>
                  <th>Admin Actor</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="admin-empty-state">
                      {isLoading ? 'Loading logs...' : 'No activity logged yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const badge = getActionBadge(log.action)
                    const IconComponent = badge.icon
                    const dateObj = log.created_at ? new Date(log.created_at) : null

                    return (
                      <tr key={log.id}>
                        <td>
                          <div className="log-time-cell">
                            <span className="log-date">
                              {dateObj ? dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                            </span>
                            <span className="log-time">
                              <Clock size={12} />
                              {dateObj ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className={badge.className}>
                            <IconComponent size={12} />
                            {badge.label}
                          </span>
                        </td>

                        <td>
                          <p className="log-description-text">{log.description}</p>
                        </td>

                        <td>
                          <span className="admin-id-text">{log.admin_id || 'admin'}</span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

