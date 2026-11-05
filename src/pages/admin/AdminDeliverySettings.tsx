import { useState, useEffect } from 'react'
import {
  MapPin,
  Truck,
  Plus,
  Trash2,
  Save,
  Sliders,
} from 'lucide-react'
import type { DeliverySettings, DeliveryTier } from '../../data/types'
import { DeliverySettingsService } from '../../services/db'
import { useToast } from '../../context/ToastContext'

export default function AdminDeliverySettings() {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Form states
  const [shopAddress, setShopAddress] = useState('')
  const [shopLat, setShopLat] = useState('')
  const [shopLng, setShopLng] = useState('')
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
      const data = await DeliverySettingsService.get()
      setShopAddress(data.shopAddress)
      setShopLat(String(data.shopLat))
      setShopLng(String(data.shopLng))
      setIsDeliveryEnabled(data.isDeliveryEnabled)
      setMinOrderAmount(String(data.minOrderAmount))
      setMaxDeliveryDistance(String(data.maxDeliveryDistance))
      setTiers([...data.tiers])
    } catch {
      showToast('Failed to load delivery settings', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Add new tier
  const handleAddTier = () => {
    const lastTier = tiers[tiers.length - 1]
    const nextMin = lastTier && lastTier.maxKm ? lastTier.maxKm : 0
    const newTier: DeliveryTier = {
      id: `tier-${Date.now()}`,
      minKm: nextMin,
      maxKm: nextMin + 5,
      price: 50,
    }
    setTiers([...tiers, newTier])
  }

  // Update existing tier
  const handleUpdateTier = (index: number, updates: Partial<DeliveryTier>) => {
    const updated = [...tiers]
    updated[index] = { ...updated[index], ...updates }
    setTiers(updated)
  }

  // Remove tier
  const handleRemoveTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index))
  }

  // Save Settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const updatedSettings: DeliverySettings = {
        shopAddress: shopAddress.trim(),
        shopLat: parseFloat(shopLat) || 13.0279242,
        shopLng: parseFloat(shopLng) || 77.5282725,
        isDeliveryEnabled,
        minOrderAmount: parseFloat(minOrderAmount) || 0,
        maxDeliveryDistance: parseFloat(maxDeliveryDistance) || 15,
        tiers: tiers.map((t) => ({
          ...t,
          minKm: Number(t.minKm),
          maxKm: t.maxKm === null ? null : Number(t.maxKm),
          price: t.price === null ? null : Number(t.price),
        })),
      }

      await DeliverySettingsService.update(updatedSettings)
      showToast('Delivery settings and pricing tiers saved successfully! 🚀', 'success')
    } catch (err) {
      console.error(err)
      showToast('Failed to update delivery settings', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="admin-delivery-settings">
        <div className="admin-empty-state">
          <p>Loading delivery configuration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-delivery-settings">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h2>Delivery Settings & Distance Pricing</h2>
          <p>
            Configure bakery shop location coordinates, maximum delivery radius, minimum order value, and distance-based delivery rates.
          </p>
        </div>
        <button className="btn btn--gold" onClick={handleSave} disabled={isSaving}>
          <Save size={18} /> {isSaving ? 'Saving Changes...' : 'Save Settings'}
        </button>
      </div>

      <form onSubmit={handleSave} className="admin-delivery-form">
        {/* Card 1: Shop Location & Coordinates */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-card__header-icon">
              <MapPin size={20} color="var(--gold)" />
              <div>
                <h3>Bakery Shop Location & Origin Coordinates</h3>
                <p>All delivery distance calculations originate from these fixed coordinates.</p>
              </div>
            </div>
          </div>

          <div className="admin-card__body">
            <div className="form-group">
              <label>Bakery Address</label>
              <input
                type="text"
                required
                value={shopAddress}
                onChange={(e) => setShopAddress(e.target.value)}
                placeholder="Shop address..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Shop Latitude (lat) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={shopLat}
                  onChange={(e) => setShopLat(e.target.value)}
                  placeholder="e.g. 13.0279242"
                />
              </div>

              <div className="form-group">
                <label>Shop Longitude (lng) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={shopLng}
                  onChange={(e) => setShopLng(e.target.value)}
                  placeholder="e.g. 77.5282725"
                />
              </div>
            </div>

            <div className="location-preview-hint">
              <span>📍 Coordinates Verified:</span>
              <a
                href={`https://www.google.com/maps?q=${shopLat},${shopLng}`}
                target="_blank"
                rel="noreferrer"
                className="coordinates-map-link"
              >
                View on Google Maps ({shopLat}, {shopLng})
              </a>
            </div>
          </div>
        </div>

        {/* Card 2: General Delivery Rules */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-card__header-icon">
              <Sliders size={20} color="var(--gold)" />
              <div>
                <h3>General Delivery Policies</h3>
                <p>Toggle delivery availability, set max radius and minimum order value.</p>
              </div>
            </div>
          </div>

          <div className="admin-card__body">
            <div className="delivery-toggle-box">
              <div>
                <strong>Enable Customer Delivery</strong>
                <p>When turned off, customers cannot select delivery during checkout.</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isDeliveryEnabled}
                  onChange={(e) => setIsDeliveryEnabled(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>

            <div className="form-row" style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Maximum Delivery Distance (km) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={maxDeliveryDistance}
                  onChange={(e) => setMaxDeliveryDistance(e.target.value)}
                  placeholder="e.g. 15"
                />
                <small className="form-hint">
                  Customers beyond this distance will be notified delivery is unavailable.
                </small>
              </div>

              <div className="form-group">
                <label>Minimum Order Amount (₹, optional)</label>
                <input
                  type="number"
                  min="0"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  placeholder="0 for no minimum"
                />
                <small className="form-hint">
                  Minimum cart subtotal required to place a delivery order.
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Distance Pricing Tiers */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-card__header-icon">
              <Truck size={20} color="var(--gold)" />
              <div>
                <h3>Distance-Based Delivery Pricing Tiers</h3>
                <p>
                  Custom rates applied automatically as the customer specifies their delivery address.
                </p>
              </div>
            </div>
            <button type="button" className="btn btn--outline btn--sm" onClick={handleAddTier}>
              <Plus size={16} /> Add Range Tier
            </button>
          </div>

          <div className="admin-card__body">
            <div className="table-responsive">
              <table className="admin-table tiers-table">
                <thead>
                  <tr>
                    <th>From (km)</th>
                    <th>To (km)</th>
                    <th>Delivery Charge (₹)</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((tier, idx) => (
                    <tr key={tier.id}>
                      <td>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          className="table-input"
                          value={tier.minKm}
                          onChange={(e) =>
                            handleUpdateTier(idx, { minKm: parseFloat(e.target.value) || 0 })
                          }
                        />
                      </td>
                      <td>
                        <div className="tier-max-wrap">
                          <input
                            type="number"
                            step="0.5"
                            min="0.5"
                            className="table-input"
                            disabled={tier.maxKm === null}
                            value={tier.maxKm === null ? '' : tier.maxKm}
                            placeholder="Infinity"
                            onChange={(e) =>
                              handleUpdateTier(idx, {
                                maxKm: e.target.value === '' ? null : parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                          <label className="tier-infinite-checkbox">
                            <input
                              type="checkbox"
                              checked={tier.maxKm === null}
                              onChange={(e) =>
                                handleUpdateTier(idx, {
                                  maxKm: e.target.checked ? null : 15,
                                })
                              }
                            />
                            <span>No max</span>
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="tier-price-wrap">
                          <span className="rupee-symbol">₹</span>
                          <input
                            type="number"
                            min="0"
                            className="table-input"
                            disabled={tier.price === null}
                            value={tier.price === null ? '' : tier.price}
                            placeholder="0"
                            onChange={(e) =>
                              handleUpdateTier(idx, {
                                price: e.target.value === '' ? null : parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`tier-avail-toggle ${
                            tier.price !== null ? 'tier-avail-toggle--active' : 'tier-avail-toggle--disabled'
                          }`}
                          onClick={() =>
                            handleUpdateTier(idx, {
                              price: tier.price === null ? 50 : null,
                            })
                          }
                        >
                          {tier.price !== null ? 'Deliverable' : 'Unavailable'}
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="admin-icon-btn admin-icon-btn--delete"
                          onClick={() => handleRemoveTier(idx)}
                          title="Remove Tier"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="tiers-example-note">
              <strong>Example configured rules:</strong>
              <ul>
                {tiers.map((t) => (
                  <li key={t.id}>
                    {t.minKm} km to {t.maxKm ? `${t.maxKm} km` : 'above'}:{' '}
                    {t.price !== null ? `₹${t.price}` : 'Delivery marked as unavailable'}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Save Button */}
        <div className="form-submit-row">
          <button type="submit" className="btn btn--gold btn--lg" disabled={isSaving}>
            <Save size={18} /> {isSaving ? 'Saving All Settings...' : 'Save All Delivery Configurations'}
          </button>
        </div>
      </form>
    </div>
  )
}
