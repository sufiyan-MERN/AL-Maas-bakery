export type Category =
  | 'artisan-breads'
  | 'bun'
  | 'puff'
  | 'viennoiserie'
  | 'spreads'
  | 'muffin'
  | 'tea-cake'
  | 'cookie'
  | 'cupcake'
  | 'macaron'
  | 'soaked-cake'
  | 'pastry'
  | 'brownie'
  | 'fermented-drink'
  | 'cheese-cake'
  | 'celebration-cakes'

export interface Product {
  id: string
  name: string
  category: Category
  description: string
  price: number
  discountPrice?: number
  isAvailable?: boolean
  weight?: string
  image: string
  createdAt?: string
  updatedAt?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface DeliveryTier {
  id: string
  minKm: number
  maxKm: number | null // null means above this distance
  price: number | null // null means delivery unavailable
}

export interface DeliverySettings {
  shopAddress: string
  shopLat: number
  shopLng: number
  isDeliveryEnabled: boolean
  minOrderAmount: number
  maxDeliveryDistance: number // in km
  tiers: DeliveryTier[]
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export interface CustomerInfo {
  fullName: string
  mobile: string
  whatsapp?: string
  houseNumber: string
  streetArea: string
  city: string
  pinCode: string
  formattedAddress: string
  lat?: number
  lng?: number
  deliveryInstructions?: string
}

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  subtotal: number
}

export interface Order {
  id: string
  createdAt: string
  updatedAt: string
  customer: CustomerInfo
  items: OrderItem[]
  subtotal: number
  deliveryDistanceKm: number
  deliveryCharge: number
  finalTotal: number
  status: OrderStatus
  cancellationReason?: string
}

export type ActivityActionType =
  | 'admin_login'
  | 'admin_logout'
  | 'product_added'
  | 'product_edited'
  | 'product_deleted'
  | 'product_price_changed'
  | 'product_availability_changed'
  | 'order_status_updated'
  | 'order_cancelled'
  | 'delivery_pricing_updated'
  | 'delivery_settings_changed'

export interface ActivityLog {
  id: string
  adminId: string
  action: ActivityActionType
  description: string
  previousValue?: string | number | boolean | Record<string, unknown> | null
  newValue?: string | number | boolean | Record<string, unknown> | null
  timestamp: string
  relatedId?: string // productId or orderId
}

