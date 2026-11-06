'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Phone,
  User,
  ShoppingBag,
  Truck,
  CheckCircle,
  ArrowLeft,
  MessageCircle,
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import './checkoutPage.css'

interface PlacedOrderData {
  id: string
  subtotal: number
  delivery_charge: number
  total: number
  status: string
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const { showToast } = useToast()

  // Form states
  const [fullName, setFullName] = useState('')
  const [mobile, setMobile] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [sameAsMobile, setSameAsMobile] = useState(true)
  const [houseNumber, setHouseNumber] = useState('')
  const [streetArea, setStreetArea] = useState('')
  const [city, setCity] = useState('Bengaluru')
  const [pinCode, setPinCode] = useState('')
  const [deliveryInstructions, setDeliveryInstructions] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [placedOrder, setPlacedOrder] = useState<PlacedOrderData | null>(null)

  const deliveryFee = 40 // Standard flat rate preview
  const finalTotal = subtotal + deliveryFee

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim() || !mobile.trim() || !houseNumber.trim() || !streetArea.trim()) {
      showToast('Please fill in all mandatory fields', 'warning')
      return
    }

    if (items.length === 0) {
      showToast('Your shopping bag is empty', 'warning')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        customer_name: fullName.trim(),
        mobile: mobile.trim(),
        whatsapp: (sameAsMobile ? mobile : whatsapp).trim(),
        address_line1: houseNumber.trim(),
        address_line2: '',
        street: streetArea.trim(),
        city: city.trim(),
        pincode: pinCode.trim() || '560032',
        delivery_instructions: deliveryInstructions.trim(),
        delivery_address: `${houseNumber.trim()}, ${streetArea.trim()}, ${city.trim()}`,
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setPlacedOrder(data.order)
        clearCart()
        showToast('Order placed successfully!', 'success')
      } else {
        showToast(data.error || 'Failed to place order. Please try again.', 'error')
      }
    } catch {
      showToast('Network error while placing order.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 1. Order Placed Confirmation Screen
  if (placedOrder) {
    return (
      <div className="checkout-page">
        <div className="container checkout-page__confirmation">
          <div className="confirmation-card">
            <div className="confirmation-header">
              <div className="confirmation-icon-wrap">
                <CheckCircle size={44} color="#2e7d32" />
              </div>
              <h2 className="confirmation-title">Order Confirmed!</h2>
              <p className="confirmation-subtitle">
                Thank you, <strong>{fullName}</strong>! We have received your order and our bakers
                will begin preparing your fresh treats shortly.
              </p>
              <div className="confirmation-badge">
                <span>Order Reference:</span>
                <strong>#{placedOrder.id}</strong>
              </div>
            </div>

            <div className="confirmation-details-grid">
              <div className="confirmation-box">
                <h4>Delivery Details</h4>
                <div className="confirmation-row">
                  <span>Contact:</span>
                  <span>{mobile}</span>
                </div>
                <div className="confirmation-row">
                  <span>Destination:</span>
                  <span>
                    {houseNumber}, {streetArea}, {city}
                  </span>
                </div>
                <div className="confirmation-row">
                  <span>Status:</span>
                  <span className="badge badge--pending">Order Received</span>
                </div>
              </div>

              <div className="confirmation-box">
                <h4>Payment & Invoice</h4>
                <div className="confirmation-row">
                  <span>Payment Mode:</span>
                  <span>Cash on Delivery / UPI</span>
                </div>
                <div className="confirmation-row">
                  <span>Delivery Fee:</span>
                  <span>₹{placedOrder.delivery_charge}</span>
                </div>
                <div className="confirmation-row">
                  <span>Total Payable:</span>
                  <strong>₹{placedOrder.total}</strong>
                </div>
              </div>
            <div className="confirmation-map-box" style={{
              background: 'var(--cream)',
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '28px',
              border: '1px solid rgba(198, 123, 92, 0.2)'
            }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--navy)', marginBottom: '10px' }}>
                Dispatched from Al Maas Bakery
              </h4>
              <div style={{ borderRadius: '8px', overflow: 'hidden', lineHeight: 0 }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d62193.946447341725!2d77.5282725!3d13.0279242!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae173710d3430f%3A0x94fa4d9a4e4237e2!2sAvyan%20Bakehouse!5e0!3m2!1sen!2sin!4v1793880487926!5m2!1sen!2sin"
                  width="100%"
                  height="180"
                  style={{ border: 0 }}
                  loading="lazy"
                  title="Al Maas Bakery location map"
                />
              </div>
            </div>

            <div className="confirmation-actions">
              <a
                href={`https://wa.me/917022342282?text=${encodeURIComponent(
                  `Hi Al Maas Bakery! I just placed order #${placedOrder.id}. Total amount: ₹${placedOrder.total}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn--gold confirmation-btn"
              >
                <MessageCircle size={18} /> Chat with Bakery on WhatsApp
              </a>
              <Link href="/" className="btn btn--outline confirmation-btn">
                Return to Storefront
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 2. Empty Cart State
  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container checkout-page__empty-container">
          <div className="checkout-empty-card">
            <span className="checkout-empty-icon">🥐</span>
            <h2>Your Bag is Empty</h2>
            <p>You haven't added any fresh bakery goods to your cart yet.</p>
            <Link href="/menu" className="btn btn--primary">
              <ShoppingBag size={18} /> Browse Our Menu
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 3. Checkout Form
  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-page__header">
          <Link href="/menu" className="checkout-back-link">
            <ArrowLeft size={16} /> Back to Menu
          </Link>
          <h1 className="checkout-title">Checkout & Delivery</h1>
          <p className="checkout-subtitle">
            Provide your delivery details below to have fresh artisanal treats delivered to your door.
          </p>
        </div>

        <form onSubmit={handleSubmitOrder} className="checkout-grid">
          {/* Left Column: Form Details */}
          <div className="checkout-form">
            {/* Contact Info */}
            <div className="checkout-section">
              <div className="checkout-section__title">
                <User size={20} color="var(--gold)" />
                <h3>Customer Details</h3>
              </div>

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ayesha Khan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mobile Number *</label>
                  <div className="input-prefix-wrap">
                    <span className="input-prefix">+91</span>
                    <input
                      type="tel"
                      required
                      placeholder="98765 43210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>WhatsApp Number</label>
                  <div className="input-prefix-wrap">
                    <span className="input-prefix">+91</span>
                    <input
                      type="tel"
                      disabled={sameAsMobile}
                      placeholder={sameAsMobile ? mobile || 'Same as mobile' : '98765 43210'}
                      value={sameAsMobile ? mobile : whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                    />
                  </div>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={sameAsMobile}
                      onChange={(e) => setSameAsMobile(e.target.checked)}
                    />
                    <span>Same as contact number</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="checkout-section">
              <div className="checkout-section__title">
                <MapPin size={20} color="var(--gold)" />
                <h3>Delivery Address</h3>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Flat / House / Building *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apt 402, Golden Heights"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Street / Area / Landmark *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sultan Palya Main Road"
                    value={streetArea}
                    onChange={(e) => setStreetArea(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Postal PIN Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 560032"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Special Instructions for Baker / Rider</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Ring the bell twice, leave with security..."
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                />
              </div>

              {/* Bakery Dispatch Map Embed */}
              <div className="checkout-map-wrap" style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '8px', display: 'block' }}>
                  Bakery Dispatch Location (Al Maas Bakery)
                </label>
                <div style={{
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  border: '1.5px solid rgba(198, 123, 92, 0.3)',
                  boxShadow: '0 2px 10px rgba(60, 42, 33, 0.06)',
                  lineHeight: 0
                }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d62193.946447341725!2d77.5282725!3d13.0279242!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae173710d3430f%3A0x94fa4d9a4e4237e2!2sAvyan%20Bakehouse!5e0!3m2!1sen!2sin!4v1793880487926!5m2!1sen!2sin"
                    width="100%"
                    height="200"
                    style={{ border: 0 }}
                    loading="lazy"
                    title="Al Maas Bakery location map"
                  />
                </div>
              </div>
            </div>

            {/* Payment Mode */}
            <div className="checkout-section">
              <div className="checkout-section__title">
                <Truck size={20} color="var(--gold)" />
                <h3>Payment Method</h3>
              </div>

              <div className="payment-options">
                <label className="payment-option payment-option--selected">
                  <input type="radio" name="payment" defaultChecked readOnly />
                  <div className="payment-option__info">
                    <strong>Cash / UPI on Delivery</strong>
                    <p>Pay when your warm bakes arrive at your doorstep via cash or GooglePay/PhonePe.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary Card */}
          <aside className="checkout-summary-card">
            <div className="checkout-summary-header">
              <h3>Order Summary</h3>
              <span className="checkout-summary-badge">
                {items.reduce((s, i) => s + i.quantity, 0)} Items
              </span>
            </div>

            <div className="checkout-summary-items">
              {items.map((item) => (
                <div key={item.product.id} className="checkout-summary-item">
                  <img src={item.product.image} alt={item.product.name} />
                  <div className="checkout-summary-item-info">
                    <h4>{item.product.name}</h4>
                    <span className="checkout-summary-item-meta">
                      Qty: {item.quantity} × ₹{item.product.price}
                    </span>
                  </div>
                  <strong className="checkout-summary-item-price">
                    ₹{item.product.price * item.quantity}
                  </strong>
                </div>
              ))}
            </div>

            <div className="checkout-summary-breakdown">
              <div className="checkout-breakdown-row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="checkout-breakdown-row">
                <span>Delivery Charge</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="checkout-breakdown-divider" />
              <div className="checkout-breakdown-row checkout-breakdown-row--total">
                <span>Total Amount</span>
                <span className="checkout-final-amount">₹{finalTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn--primary checkout-submit-btn"
              style={{ marginTop: '20px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Placing Order...' : `Place Order (₹${finalTotal})`}
            </button>
          </aside>
        </form>
      </div>
    </div>
  )
}

