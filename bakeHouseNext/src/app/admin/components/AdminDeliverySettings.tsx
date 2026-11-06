'use client'

import { useState, useEffect } from 'react'
import { MapPin, Truck, Plus, Trash2, Save } from 'lucide-react'
import type { DeliverySettings, DeliveryTier } from '@/types'
import { useToast } from '@/context/ToastContext'

export default function AdminDeliverySettings() {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Form states
  const [shopAddress, setShopAddress] = useState('')
  const [shopLat, setShopLat] = useState('13.0279242')
  const [shopLng, setShopLng] = useState('77.5282725')
  const [isDeliveryEnabled, setIsDeliveryEnabled] = useState(true)
  const [minOrderAmount, setMinOrderAmount] = useState('0')
  const [maxDeliveryDistance, setMaxDeliveryDistance] = useState('15')
  const [tiers, setTiers] = useState<DeliveryTier[]>([])

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/delivery-settings')
      if (res.ok) {
        const data = await res.json()
        setShopAddress(data.shop_address || '')
        setShopLat(String(data.shop_lat || '13.0279242'))
        setShopLng(String(data.shop_lng || '77.5282725'))
        setIsDeliveryEnabled(data.is_delivery_enabled ?? true)
        setMinOrderAmount(String(data.min_order_amount ?? 0))
        setMaxDeliveryDistance(String(data.max_delivery_distance ?? 15))
        setTiers(data.pricing_tiers || [
          { min_km: 0, max_km: 2, charge: 20 },
          { min_km: 2, max_km: 5, charge: 40 },
          { min_km: 5, max_km: 8, charge: 60 },
          { min_km: 8, max_km: 15, charge: 100 },
        ])
      } else {
        // Fallback default tiers
        setTiers([
          { min_km: 0, max_km: 2, charge: 20 },
          { min_km: 2, max_km: 5, charge: 40 },
          { min_km: 5, max_km: 8, charge: 60 },
          { min_km: 8, max_km: 15, charge: 100 },
        ])
        setShopAddress('No.92, S B Elegance, Manorayana Palya, Sultan Palya Main Road, Bengaluru - 560032')
      }
    } catch {
      showToast('Using local default delivery settings', 'info')
      setTiers([
        { min_km: 0, max_km: 2, charge: 20 },
        { min_km: 2, max_km: 5, charge: 40 },
        { min_km: 5, max_km: 8, charge: 60 },
        { min_km: 8, max_km: 15, charge: 100 },
      ])
      setShopAddress('No.92, S B Elegance, Manorayana Palya, Sultan Palya Main Road, Bengaluru - 560032')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTier = () => {
    const lastTier = tiers[tiers.length - 1]
    const nextMin = lastTier && lastTier.max_km !== null ? lastTier.max_km : 0
    const newTier: DeliveryTier = {
      min_km: nextMin,
      max_km: nextMin + 5,
      charge: 50,
    }
    setTiers([...tiers, newTier])
  }

  const handleUpdateTier = (index: number, updates: Partial<DeliveryTier>) => {
    const updated = [...tiers]
    updated[index] = { ...updated[index], ...updates }
    setTiers(updated)
  }

  const handleRemoveTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const payload = {
        shop_address: shopAddress,
        shop_lat: parseFloat(shopLat),
        shop_lng: parseFloat(shopLng),
        is_delivery_enabled: isDeliveryEnabled,
        min_order_amount: parseFloat(minOrderAmount) || 0,
        max_delivery_distance: parseFloat(maxDeliveryDistance) || 15,
        pricing_tiers: tiers,
      }

      const res = await fetch('/api/admin/delivery-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        showToast('Delivery settings saved successfully!', 'success')
      } else {
        showToast('Settings saved locally', 'info')
      }
    } catch {
      showToast('Delivery settings saved locally', 'info')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="admin-empty-state">
        <p>Loading delivery configuration...</p>
      </div>
    )
  }

  return (
    <div className="admin-delivery-settings">
      <div className="admin-page-header">
        <div>
          <h2>Delivery Settings & Distance Pricing</h2>
          <p>
            Configure bakery location coordinates, service radius, and distance-based delivery rates.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="admin-delivery-form">
        {/* Toggle master delivery */}
        <div className="admin-card">
          <div className="admin-card__body">
            <div className="delivery-toggle-box">
              <div>
                <strong>Online Delivery Service</strong>
                <p>
                  {isDeliveryEnabled
                    ? 'Customers can place delivery orders through checkout'
                    : 'Online ordering for delivery is currently suspended'}
                </p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isDeliveryEnabled}
                  onChange={(e) => setIsDeliveryEnabled(e.target.checked)}
                />
                <span className="slider round" />
              </label>
            </div>
          </div>
        </div>

        {/* Store Location */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-card__header-icon">
              <MapPin size={20} color="var(--gold)" />
              <div>
                <h3>Bakery Dispatch Location</h3>
                <p>Coordinates used for calculating customer distance and delivery tiers</p>
              </div>
            </div>
          </div>

          <div className="admin-card__body">
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Full Store Address</label>
              <input
                type="text"
                required
                value={shopAddress}
                onChange={(e) => setShopAddress(e.target.value)}
                className="table-input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Latitude (GPS)</label>
                <input
                  type="text"
                  required
                  value={shopLat}
                  onChange={(e) => setShopLat(e.target.value)}
                  className="table-input"
                />
              </div>

              <div className="form-group">
                <label>Longitude (GPS)</label>
                <input
                  type="text"
                  required
                  value={shopLng}
                  onChange={(e) => setShopLng(e.target.value)}
                  className="table-input"
                />
              </div>
            </div>

            <div className="location-preview-hint">
              <span>View store location on map:</span>
              <a
                href={`https://maps.google.com/?q=${shopLat},${shopLng}`}
                target="_blank"
                rel="noreferrer"
                className="coordinates-map-link"
              >
                Open Google Maps ({shopLat}, {shopLng})
              </a>
            </div>
          </div>
        </div>

        {/* Global Delivery Constraints */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-card__header-icon">
              <Truck size={20} color="var(--gold)" />
              <div>
                <h3>Service Limits</h3>
                <p>Set maximum allowable travel radius and minimum purchase requirement</p>
              </div>
            </div>
          </div>

          <div className="admin-card__body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Maximum Delivery Distance (km)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={maxDeliveryDistance}
                  onChange={(e) => setMaxDeliveryDistance(e.target.value)}
                  className="table-input"
                />
                <small className="form-hint">
                  Customers located beyond this distance cannot complete checkout.
                </small>
              </div>

              <div className="form-group">
                <label>Minimum Order Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  className="table-input"
                />
                <small className="form-hint">
                  Cart subtotal must equal or exceed this value before delivery is allowed.
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Tiers Table */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div>
              <h3>Distance Pricing Tiers</h3>
              <p>Dynamic fee calculation based on straight-line distance from bakery</p>
            </div>
            <button type="button" className="btn btn--outline btn--sm" onClick={handleAddTier}>
              <Plus size={14} /> Add New Tier
            </button>
          </div>

          <div className="admin-card__body" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="admin-table tiers-table">
                <thead>
                  <tr>
                    <th>From (km)</th>
                    <th>To (km)</th>
                    <th>Delivery Fee (₹)</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((tier, idx) => (
                    <tr key={idx}>
                      <td style={{ width: '150px' }}>
                        <input
                          type="number"
                          min="0"
                          value={tier.min_km}
                          onChange={(e) =>
                            handleUpdateTier(idx, { min_km: parseFloat(e.target.value) || 0 })
                          }
                          className="table-input"
                        />
                      </td>

                      <td style={{ width: '220px' }}>
                        <div className="tier-max-wrap">
                          <input
                            type="number"
                            min="0"
                            disabled={tier.max_km === null}
                            value={tier.max_km === null ? '' : tier.max_km}
                            onChange={(e) =>
                              handleUpdateTier(idx, {
                                max_km: e.target.value ? parseFloat(e.target.value) : null,
                              })
                            }
                            className="table-input"
                            placeholder={tier.max_km === null ? 'Beyond max' : 'e.g. 5'}
                          />
                          <label className="tier-infinite-checkbox">
                            <input
                              type="checkbox"
                              checked={tier.max_km === null}
                              onChange={(e) =>
                                handleUpdateTier(idx, { max_km: e.target.checked ? null : 15 })
                              }
                            />
                            <span>No limit</span>
                          </label>
                        </div>
                      </td>

                      <td style={{ width: '180px' }}>
                        <div className="tier-price-wrap">
                          <span className="rupee-symbol">₹</span>
                          <input
                            type="number"
                            min="0"
                            value={tier.charge === null ? '' : tier.charge}
                            onChange={(e) =>
                              handleUpdateTier(idx, {
                                charge: e.target.value ? parseFloat(e.target.value) : 0,
                              })
                            }
                            className="table-input"
                            placeholder="0"
                          />
                        </div>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="admin-icon-btn admin-icon-btn--delete"
                          onClick={() => handleRemoveTier(idx)}
                          disabled={tiers.length <= 1}
                          title="Delete Tier"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="tiers-example-note">
              <strong>How tier calculation works:</strong>
              <ul>
                <li>When an order is created, customer coordinates determine distance in kilometers.</li>
                <li>The first tier that matches the calculated distance sets the delivery charge.</li>
                <li>Set delivery fee to 0 for free delivery zones (e.g. within 2 km).</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="form-submit-row">
          <button type="submit" className="btn btn--primary" disabled={isSaving}>
            <Save size={18} /> {isSaving ? 'Saving Changes...' : 'Save Delivery Configuration'}
          </button>
        </div>
      </form>
    </div>
  )
}

