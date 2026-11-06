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
  discount_price?: number | null
  weight?: string
  image: string
  is_available: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface DeliveryTier {
  min_km: number
  max_km: number | null
  charge: number | null
}

export interface DeliverySettings {
  id: number
  shop_lat: number
  shop_lng: number
  shop_address: string
  is_delivery_enabled: boolean
  min_order_amount: number
  max_delivery_distance: number
  pricing_tiers: DeliveryTier[]
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export interface OrderItem {
  id?: number
  order_id?: string
  product_id: string
  product_name: string
  product_image: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Order {
  id: string
  customer_name: string
  mobile: string
  whatsapp?: string
  address_line1: string
  address_line2?: string
  street: string
  city: string
  pincode: string
  delivery_instructions?: string
  delivery_lat?: number
  delivery_lng?: number
  delivery_address?: string
  delivery_distance?: number
  delivery_charge: number
  subtotal: number
  total: number
  status: OrderStatus
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface ActivityLog {
  id: number
  admin_id: string
  action: string
  description: string
  entity_type?: string
  entity_id?: string
  old_value?: Record<string, unknown>
  new_value?: Record<string, unknown>
  created_at: string
}

