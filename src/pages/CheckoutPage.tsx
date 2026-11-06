import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  MapPin,
  Phone,
  User,
  FileText,
  ShoppingBag,
  Truck,
  CheckCircle,
  ArrowLeft,
  Share2,
  Navigation,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { DeliverySettingsService, OrderService } from '../services/db'
import { calculateDeliveryFee } from '../utils/distance'
import type { DeliverySettings, CustomerInfo, Order, OrderItem } from '../data/types'
import './checkoutPage.css'

export default function CheckoutPage() {
  const navigate = useNavigate()
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

  // Location & Delivery states
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings | null>(null)
  const [customerLat, setCustomerLat] = useState<number | null>(null)
  const [customerLng, setCustomerLng] = useState<number | null>(null)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const [deliveryInfo, setDeliveryInfo] = useState<{
    isAvailable: boolean
    distanceKm: number
    deliveryFee: number
    reason?: string
  } | null>(null)

  // Order submission states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null)

  // Address search input ref for Google Places Autocomplete
  const addressInputRef = useRef<HTMLInputElement>(null)

  // 1. Load delivery settings on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    DeliverySettingsService.get().then((settings) => {
      setDeliverySettings(settings)
    })
  }, [])

  // 2. Initialize Google Maps Places Autocomplete if API Key is available
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey || !addressInputRef.current) return

    // Check if script is already present
    const existingScript = document.getElementById('google-maps-autocomplete-script')
    if (!existingScript) {
      const script = document.createElement('script')
      script.id = 'google-maps-autocomplete-script'
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.onload = initAutocomplete
      document.head.appendChild(script)
    } else if ((window as any).google?.maps?.places) {
      initAutocomplete()
    }

    function initAutocomplete() {
      if (!addressInputRef.current || !(window as any).google?.maps?.places) return
      const autocomplete = new (window as any).google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          componentRestrictions: { country: 'in' },
          fields: ['address_components', 'geometry', 'formatted_address'],
        }
      )

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (place.geometry?.location) {
          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()
          setCustomerLat(lat)
          setCustomerLng(lng)

          // Fill street, city, pincode from components if available
          let street = ''
          let postalCode = ''
          let detectedCity = 'Bengaluru'

          if (place.address_components) {
            for (const c of place.address_components) {
              if (c.types.includes('route') || c.types.includes('sublocality')) {
                street = street ? `${street}, ${c.long_name}` : c.long_name
              }
              if (c.types.includes('locality')) {
                detectedCity = c.long_name
              }
              if (c.types.includes('postal_code')) {
                postalCode = c.long_name
              }
            }
          }

          if (street) setStreetArea(street)
          if (postalCode) setPinCode(postalCode)
          if (detectedCity) setCity(detectedCity)
        }
      })
    }
  }, [])

  // 3. Recalculate delivery fee when location or subtotal changes
  useEffect(() => {
    if (!deliverySettings) return

    if (customerLat !== null && customerLng !== null) {
      const result = calculateDeliveryFee(customerLat, customerLng, deliverySettings, subtotal)
      setDeliveryInfo(result)
    } else {
      // If no coordinates yet, we can't determine the exact distance
      setDeliveryInfo(null)
    }
  }, [customerLat, customerLng, deliverySettings, subtotal])

  // Update WhatsApp whenever mobile changes if sameAsMobile is checked
  useEffect(() => {
    if (sameAsMobile) {
      setWhatsapp(mobile)
    }
  }, [mobile, sameAsMobile])

  // Detect location using browser Geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error')
      return
    }

    setIsDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setCustomerLat(lat)
        setCustomerLng(lng)

        // Reverse geocode using free OpenStreetMap Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
          )
          if (res.ok) {
            const data = await res.json()
            if (data.address) {
              const road = data.address.road || data.address.suburb || data.address.neighbourhood || ''
              const detectedCity = data.address.city || data.address.town || 'Bengaluru'
              const pc = data.address.postcode || ''
              if (road) setStreetArea(road)
              if (detectedCity) setCity(detectedCity)
              if (pc) setPinCode(pc)
            }
          }
        } catch {
          // Geocode fallback is optional
        } finally {
          setIsDetectingLocation(false)
          showToast('Delivery location detected successfully!', 'success')
        }
      },
      (err) => {
        setIsDetectingLocation(false)
        console.warn('Geolocation error:', err)
        showToast('Unable to detect location. Please enter your address manually.', 'warning')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Handle fallback manual coordinate estimation based on street / city
  const handleAddressBlur = async () => {
    if (customerLat === null && streetArea.trim().length > 3) {
      try {
        const query = encodeURIComponent(`${streetArea}, ${city}, ${pinCode}`)
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`
        )
        if (res.ok) {
          const results = await res.json()
          if (results.length > 0) {
            setCustomerLat(parseFloat(results[0].lat))
            setCustomerLng(parseFloat(results[0].lon))
          }
        }
      } catch {
        // Fallback silently
      }
    }
  }

  // Form validation
  const validateForm = (): boolean => {
    if (!fullName.trim()) {
      showToast('Please enter your full name', 'error')
      return false
    }
    if (!mobile.trim() || !/^\d{10}$/.test(mobile.replace(/\D/g, ''))) {
      showToast('Please enter a valid 10-digit mobile number', 'error')
      return false
    }
    if (!houseNumber.trim()) {
      showToast('Please enter house / flat / building number', 'error')
      return false
    }
    if (!streetArea.trim()) {
      showToast('Please enter street and area', 'error')
      return false
    }
    if (!city.trim()) {
      showToast('Please enter city', 'error')
      return false
    }
    if (!pinCode.trim() || !/^\d{6}$/.test(pinCode.trim())) {
      showToast('Please enter a valid 6-digit PIN code', 'error')
      return false
    }
    if (customerLat === null || customerLng === null) {
      showToast('Please verify your delivery location using "Detect My Location" or place search', 'warning')
      // Auto-set shop location approximate offset if needed so order is not blocked
      setCustomerLat(13.0279242)
      setCustomerLng(77.5282725)
      return false
    }
    if (deliveryInfo && !deliveryInfo.isAvailable) {
      showToast(deliveryInfo.reason || 'Delivery is currently unavailable to your location', 'error')
      return false
    }
    return true
  }

  // Handle Order Placement
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      showToast('Your cart is empty!', 'warning')
      navigate('/menu')
      return
    }

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Re-verify delivery settings from DB
      const freshSettings = await DeliverySettingsService.get()
      const lat = customerLat || freshSettings.shopLat
      const lng = customerLng || freshSettings.shopLng
      const verifiedDelivery = calculateDeliveryFee(lat, lng, freshSettings, subtotal)

      if (!verifiedDelivery.isAvailable) {
        showToast(verifiedDelivery.reason || 'Delivery is unavailable', 'error')
        setIsSubmitting(false)
        return
      }

      const formattedAddress = `${houseNumber.trim()}, ${streetArea.trim()}, ${city.trim()} - ${pinCode.trim()}`

      const customer: CustomerInfo = {
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        whatsapp: whatsapp.trim() || mobile.trim(),
        houseNumber: houseNumber.trim(),
        streetArea: streetArea.trim(),
        city: city.trim(),
        pinCode: pinCode.trim(),
        formattedAddress,
        lat,
        lng,
        deliveryInstructions: deliveryInstructions.trim() || undefined,
      }

      const orderItems: OrderItem[] = items.map((i) => {
        const price = i.product.discountPrice ?? i.product.price
        return {
          productId: i.product.id,
          name: i.product.name,
          price,
          quantity: i.quantity,
          image: i.product.image,
          subtotal: price * i.quantity,
        }
      })

      const finalTotal = subtotal + verifiedDelivery.deliveryFee

      const newOrder = await OrderService.create({
        customer,
        items: orderItems,
        subtotal,
        deliveryDistanceKm: verifiedDelivery.distanceKm,
        deliveryCharge: verifiedDelivery.deliveryFee,
        finalTotal,
      })

      // Success! Clear cart and display confirmation screen
      clearCart()
      setPlacedOrder(newOrder)
      showToast('Order placed successfully! 🎉', 'success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Order placement failed:', err)
      showToast('Failed to place order. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Empty cart state
  if (items.length === 0 && !placedOrder) {
    return (
      <main className="checkout-page">
        <div className="container checkout-page__empty-container">
          <div className="checkout-empty-card">
            <span className="checkout-empty-icon">🛒</span>
            <h2>Your Cart is Empty</h2>
            <p>You need items in your cart before you can proceed to checkout.</p>
            <Link to="/menu" className="btn btn--primary">
              <ArrowLeft size={18} /> Browse Bakery Menu
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // Order Confirmation View
  if (placedOrder) {
    const deliveryFeeDisplay = placedOrder.deliveryCharge === 0 ? 'FREE' : `₹${placedOrder.deliveryCharge}`
    const orderDateFormatted = new Date(placedOrder.createdAt).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })

    const whatsappMessage = encodeURIComponent(
      `Hello Al Maas Bakery! 👋\nI just placed an order:\n\n*Order ID:* ${placedOrder.id}\n*Customer:* ${placedOrder.customer.fullName}\n*Phone:* ${placedOrder.customer.mobile}\n*Address:* ${placedOrder.customer.formattedAddress}\n*Distance:* ${placedOrder.deliveryDistanceKm} km\n\n*Items:*\n${placedOrder.items.map((i) => `• ${i.name} × ${i.quantity} (₹${i.subtotal})`).join('\n')}\n\n*Subtotal:* ₹${placedOrder.subtotal}\n*Delivery Charge:* ${deliveryFeeDisplay}\n*Total Payable:* ₹${placedOrder.finalTotal}\n\nPlease confirm my order. Thank you!`
    )

    return (
      <main className="checkout-page">
        <div className="container checkout-page__confirmation">
          <div className="confirmation-card">
            <div className="confirmation-header">
              <div className="confirmation-icon-wrap">
                <CheckCircle size={48} color="#2e7d32" />
              </div>
              <span className="section-label">ORDER CONFIRMED</span>
              <h1 className="confirmation-title">Thank You for Your Order!</h1>
              <p className="confirmation-subtitle">
                Your order has been received and sent directly to our master bakers at Al Maas Bakery.
              </p>
              <div className="confirmation-badge">
                <span>ORDER ID:</span>
                <strong>{placedOrder.id}</strong>
              </div>
            </div>

            {/* Order Summary Grid */}
            <div className="confirmation-details-grid">
              <div className="confirmation-box">
                <h4>Order Information</h4>
                <div className="confirmation-row">
                  <span>Order Date:</span>
                  <span>{orderDateFormatted}</span>
                </div>
                <div className="confirmation-row">
                  <span>Order Status:</span>
                  <span className="badge badge--pending">
                    {placedOrder.status.toUpperCase()}
                  </span>
                </div>
                <div className="confirmation-row">
                  <span>Payment Mode:</span>
                  <span>Cash on Delivery / UPI</span>
                </div>
              </div>

              <div className="confirmation-box">
                <h4>Customer & Delivery</h4>
                <div className="confirmation-row">
                  <span>Recipient:</span>
                  <span>{placedOrder.customer.fullName}</span>
                </div>
                <div className="confirmation-row">
                  <span>Mobile:</span>
                  <span>{placedOrder.customer.mobile}</span>
                </div>
                <div className="confirmation-row">
                  <span>Address:</span>
                  <span>{placedOrder.customer.formattedAddress}</span>
                </div>
                <div className="confirmation-row">
                  <span>Distance:</span>
                  <span>{placedOrder.deliveryDistanceKm} km</span>
                </div>
                {placedOrder.customer.deliveryInstructions && (
                  <div className="confirmation-row">
                    <span>Instructions:</span>
                    <span>{placedOrder.customer.deliveryInstructions}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Items table */}
            <div className="confirmation-items">
              <h4>Ordered Items</h4>
              <div className="confirmation-items-list">
                {placedOrder.items.map((item) => (
                  <div key={item.productId} className="confirmation-item">
                    <img src={item.image} alt={item.name} />
                    <div className="confirmation-item-details">
                      <h5>{item.name}</h5>
                      <span className="confirmation-item-qty">
                        ₹{item.price} × {item.quantity}
                      </span>
                    </div>
                    <span className="confirmation-item-total">₹{item.subtotal}</span>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="confirmation-totals">
                <div className="confirmation-total-row">
                  <span>Subtotal:</span>
                  <span>₹{placedOrder.subtotal}</span>
                </div>
                <div className="confirmation-total-row">
                  <span>Delivery Charge ({placedOrder.deliveryDistanceKm} km):</span>
                  <span>{deliveryFeeDisplay}</span>
                </div>
                <div className="confirmation-total-row confirmation-total-row--final">
                  <span>Total Payable:</span>
                  <span>₹{placedOrder.finalTotal}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="confirmation-actions">
              <a
                href={`https://wa.me/917022342282?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn--gold confirmation-btn"
              >
                <Share2 size={18} /> Share Order on WhatsApp
              </a>
              <Link to="/menu" className="btn btn--primary confirmation-btn">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Active Checkout Form View
  const deliveryCharge = deliveryInfo?.isAvailable ? deliveryInfo.deliveryFee : 0
  const finalPayable = subtotal + deliveryCharge

  return (
    <main className="checkout-page">
      <div className="container">
        {/* Page Header */}
        <div className="checkout-page__header">
          <Link to="/menu" className="checkout-back-link">
            <ArrowLeft size={16} /> Back to Menu
          </Link>
          <span className="section-label">CHECKOUT</span>
          <h1 className="checkout-title">Complete Your Order</h1>
          <p className="checkout-subtitle">
            Enter your delivery details. Delivery charges are calculated dynamically based on distance from our bakery.
          </p>
        </div>

        <div className="checkout-grid">
          {/* Left Column: Form */}
          <div className="checkout-form-column">
            <form onSubmit={handlePlaceOrder} className="checkout-form">
              {/* Section 1: Customer Information */}
              <div className="checkout-section">
                <div className="checkout-section__title">
                  <User size={20} color="var(--gold)" />
                  <h3>1. Customer Details</h3>
                </div>

                <div className="form-group">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    placeholder="e.g. Mohammed Farhan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="mobile">Mobile Number (10 digits) *</label>
                    <div className="input-prefix-wrap">
                      <span className="input-prefix">+91</span>
                      <input
                        id="mobile"
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="9876543210"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="whatsapp">WhatsApp Number</label>
                    <div className="input-prefix-wrap">
                      <span className="input-prefix">+91</span>
                      <input
                        id="whatsapp"
                        type="tel"
                        maxLength={10}
                        placeholder="9876543210"
                        disabled={sameAsMobile}
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </div>
                </div>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={sameAsMobile}
                    onChange={(e) => setSameAsMobile(e.target.checked)}
                  />
                  <span>WhatsApp number is the same as mobile</span>
                </label>
              </div>

              {/* Section 2: Delivery Address & Location */}
              <div className="checkout-section">
                <div className="checkout-section__title">
                  <MapPin size={20} color="var(--gold)" />
                  <h3>2. Delivery Address</h3>
                </div>

                {/* Detect location quick button */}
                <div className="location-detector-bar">
                  <div className="location-detector-info">
                    <Navigation size={18} color="var(--gold)" />
                    <div>
                      <strong>Dynamic Delivery Calculation</strong>
                      <p>Click below to detect your GPS location or search your address</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn--outline btn--sm location-detect-btn"
                    onClick={handleDetectLocation}
                    disabled={isDetectingLocation}
                  >
                    {isDetectingLocation ? 'Detecting Location...' : '📍 Detect My Location'}
                  </button>
                </div>
                <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d62193.946447341725!2d77.5282725!3d13.0279242!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae173710d3430f%3A0x94fa4d9a4e4237e2!2sAvyan%20Bakehouse!5e0!3m2!1sen!2sin!4v1793880487926!5m2!1sen!2sin" width="750" height="200" ></iframe>

                {/* Google places / Address lookup input */}
                <div className="form-group">
                  <label htmlFor="autocompleteAddress">
                    Search Address / Area (Google Maps Autocomplete)
                  </label>
                  <input
                    id="autocompleteAddress"
                    ref={addressInputRef}
                    type="text"
                    placeholder="Type your area or landmark (e.g. Sultan Palya, RT Nagar...)"
                    onBlur={handleAddressBlur}
                  />
                  <small className="form-hint">
                    Select your location from the suggestions or fill in the details below.
                  </small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="houseNumber">House / Flat / Building No. *</label>
                    <input
                      id="houseNumber"
                      type="text"
                      required
                      placeholder="e.g. Flat 302, Green Heights"
                      value={houseNumber}
                      onChange={(e) => setHouseNumber(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="streetArea">Street / Colony / Area *</label>
                    <input
                      id="streetArea"
                      type="text"
                      required
                      placeholder="e.g. 5th Cross, Sultan Palya"
                      value={streetArea}
                      onChange={(e) => setStreetArea(e.target.value)}
                      onBlur={handleAddressBlur}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                      id="city"
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="pinCode">PIN Code (6 digits) *</label>
                    <input
                      id="pinCode"
                      type="text"
                      required
                      maxLength={6}
                      placeholder="560032"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                      onBlur={handleAddressBlur}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="deliveryInstructions">Delivery Instructions (Optional)</label>
                  <textarea
                    id="deliveryInstructions"
                    rows={2}
                    placeholder="e.g. Ring the doorbell, leave at security desk, call upon arrival"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                  />
                </div>

                {/* Distance & Delivery Fee Status Banner */}
                {deliveryInfo && (
                  <div
                    className={`delivery-status-banner ${
                      deliveryInfo.isAvailable
                        ? 'delivery-status-banner--available'
                        : 'delivery-status-banner--unavailable'
                    }`}
                  >
                    <Truck size={20} />
                    <div className="delivery-status-banner__content">
                      {deliveryInfo.isAvailable ? (
                        <>
                          <strong>
                            Delivery Distance: {deliveryInfo.distanceKm} km
                          </strong>
                          <p>
                            Delivery charge: <b>₹{deliveryInfo.deliveryFee}</b> from our Sultan Palya bakery.
                          </p>
                        </>
                      ) : (
                        <>
                          <strong>Delivery Unavailable</strong>
                          <p>{deliveryInfo.reason}</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Payment Method */}
              <div className="checkout-section">
                <div className="checkout-section__title">
                  <FileText size={20} color="var(--gold)" />
                  <h3>3. Payment Method</h3>
                </div>
                <div className="payment-options">
                  <label className="payment-option payment-option--selected">
                    <input type="radio" name="payment" defaultChecked readOnly />
                    <div className="payment-option__info">
                      <strong>Cash on Delivery / Pay via UPI on Arrival</strong>
                      <p>Pay securely via UPI (Google Pay, PhonePe, Paytm) or cash when fresh treats reach your door.</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Place Order CTA */}
              <button
                type="submit"
                className="btn btn--gold checkout-submit-btn"
                disabled={isSubmitting || (deliveryInfo !== null && !deliveryInfo.isAvailable)}
              >
                {isSubmitting ? (
                  'Validating & Placing Order...'
                ) : (
                  <>Place Order · ₹{finalPayable}</>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="checkout-summary-column">
            <div className="checkout-summary-card">
              <div className="checkout-summary-header">
                <ShoppingBag size={20} color="var(--gold)" />
                <h3>Order Summary</h3>
                <span className="checkout-summary-badge">{items.length} items</span>
              </div>

              {/* Items List */}
              <div className="checkout-summary-items">
                {items.map(({ product, quantity }) => {
                  const effectivePrice = product.discountPrice ?? product.price
                  return (
                    <div key={product.id} className="checkout-summary-item">
                      <img src={product.image} alt={product.name} />
                      <div className="checkout-summary-item-info">
                        <h4>{product.name}</h4>
                        <div className="checkout-summary-item-meta">
                          <span>Qty: {quantity}</span>
                          <span>₹{effectivePrice} each</span>
                        </div>
                      </div>
                      <span className="checkout-summary-item-price">
                        ₹{effectivePrice * quantity}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Pricing Breakdown */}
              <div className="checkout-summary-breakdown">
                <div className="checkout-breakdown-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>

                <div className="checkout-breakdown-row">
                  <span>
                    Delivery Charge{' '}
                    {deliveryInfo?.distanceKm ? `(${deliveryInfo.distanceKm} km)` : ''}
                  </span>
                  <span>
                    {deliveryInfo
                      ? deliveryInfo.isAvailable
                        ? `₹${deliveryInfo.deliveryFee}`
                        : 'Unavailable'
                      : 'Calculated at address'}
                  </span>
                </div>

                <div className="checkout-breakdown-divider" />

                <div className="checkout-breakdown-row checkout-breakdown-row--total">
                  <span>Final Total</span>
                  <span className="checkout-final-amount">₹{finalPayable}</span>
                </div>
              </div>

              {/* Bakery Guarantee Card */}
              <div className="checkout-guarantee">
                <p>
                  🥖 <b>Baked Fresh Daily</b> — Handcrafted at Al Maas Bakery, Sultan Palya Main Road.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
