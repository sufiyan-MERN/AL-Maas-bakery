import type { Product, Order, DeliverySettings, ActivityLog, OrderStatus, ActivityActionType } from '../data/types'
import { products as defaultProducts } from '../data/products'

// Default Bakery Location: Sultan Palya Main Road, Bengaluru
export const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  shopAddress: 'No.92, S B Elegance, Manorayana Palya, Sultan Palya Main Road, Bengaluru - 560032',
  shopLat: 13.0279242,
  shopLng: 77.5282725,
  isDeliveryEnabled: true,
  minOrderAmount: 0,
  maxDeliveryDistance: 15, // km
  tiers: [
    { id: 'tier-1', minKm: 0, maxKm: 2, price: 20 },
    { id: 'tier-2', minKm: 2, maxKm: 5, price: 40 },
    { id: 'tier-3', minKm: 5, maxKm: 8, price: 60 },
    { id: 'tier-4', minKm: 8, maxKm: 15, price: 100 },
  ],
}

// Storage keys for persistent local storage fallback
const STORAGE_KEYS = {
  PRODUCTS: 'almaas_products_v1',
  ORDERS: 'almaas_orders_v1',
  SETTINGS: 'almaas_delivery_settings_v1',
  ACTIVITY: 'almaas_activity_logs_v1',
  ADMIN_SESSION: 'almaas_admin_session_v1',
}

// Environment variables for Supabase (if configured)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const HAS_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

// Helper for Supabase REST API requests
async function supabaseFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  if (!HAS_SUPABASE) return null
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: 'return=representation',
        ...(options.headers || {}),
      },
    })
    if (!res.ok) {
      console.warn(`Supabase ${endpoint} failed (${res.status}):`, await res.text())
      return null
    }
    return (await res.json()) as T
  } catch (err) {
    console.warn(`Supabase network error on ${endpoint}:`, err)
    return null
  }
}

// ==========================================
// PRODUCTS SERVICE
// ==========================================
export const ProductService = {
  async getAll(): Promise<Product[]> {
    // Try Supabase first if available
    if (HAS_SUPABASE) {
      const data = await supabaseFetch<any[]>('products?select=*&order=category.asc,name.asc')
      if (data && data.length > 0) {
        return data.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          description: p.description,
          price: Number(p.price),
          discountPrice: p.discount_price ? Number(p.discount_price) : undefined,
          isAvailable: p.is_available ?? true,
          weight: p.weight,
          image: p.image,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        }))
      }
    }

    // LocalStorage fallback
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      } catch (e) {
        console.error('Error parsing stored products', e)
      }
    }

    // Initialize with default products
    const initialProducts: Product[] = defaultProducts.map((p) => ({
      ...p,
      isAvailable: true,
      createdAt: new Date().toISOString(),
    }))
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts))
    return initialProducts
  },

  async add(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const id = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    const now = new Date().toISOString()
    const newProduct: Product = {
      ...productData,
      id,
      isAvailable: productData.isAvailable ?? true,
      createdAt: now,
      updatedAt: now,
    }

    // Supabase
    if (HAS_SUPABASE) {
      await supabaseFetch('products', {
        method: 'POST',
        body: JSON.stringify({
          id: newProduct.id,
          name: newProduct.name,
          category: newProduct.category,
          description: newProduct.description,
          price: newProduct.price,
          discount_price: newProduct.discountPrice,
          is_available: newProduct.isAvailable,
          weight: newProduct.weight,
          image: newProduct.image,
          created_at: now,
          updated_at: now,
        }),
      })
    }

    // Always update local storage
    const all = await this.getAll()
    const updated = [newProduct, ...all]
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated))

    // Log Activity
    await ActivityService.log({
      action: 'product_added',
      description: `Added product "${newProduct.name}" (₹${newProduct.price}) in category ${newProduct.category}`,
      newValue: newProduct,
      relatedId: newProduct.id,
    })

    return newProduct
  },

  async update(id: string, updates: Partial<Product>): Promise<Product | null> {
    const all = await this.getAll()
    const index = all.findIndex((p) => p.id === id)
    if (index === -1) return null

    const oldProduct = all[index]
    const updatedProduct: Product = {
      ...oldProduct,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    all[index] = updatedProduct
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(all))

    // Supabase
    if (HAS_SUPABASE) {
      await supabaseFetch(`products?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: updatedProduct.name,
          category: updatedProduct.category,
          description: updatedProduct.description,
          price: updatedProduct.price,
          discount_price: updatedProduct.discountPrice ?? null,
          is_available: updatedProduct.isAvailable,
          weight: updatedProduct.weight,
          image: updatedProduct.image,
          updated_at: updatedProduct.updatedAt,
        }),
      })
    }

    // Detect specific changes for activity log
    const changes: string[] = []
    if (updates.price !== undefined && updates.price !== oldProduct.price) {
      changes.push(`price from ₹${oldProduct.price} to ₹${updates.price}`)
    }
    if (updates.isAvailable !== undefined && updates.isAvailable !== oldProduct.isAvailable) {
      changes.push(`availability to ${updates.isAvailable ? 'Available' : 'Out of Stock'}`)
    }
    if (updates.name && updates.name !== oldProduct.name) {
      changes.push(`name to "${updates.name}"`)
    }

    const action: ActivityActionType =
      updates.price !== undefined && updates.price !== oldProduct.price
        ? 'product_price_changed'
        : updates.isAvailable !== undefined && updates.isAvailable !== oldProduct.isAvailable
        ? 'product_availability_changed'
        : 'product_edited'

    await ActivityService.log({
      action,
      description: `Updated product "${updatedProduct.name}"${changes.length ? ` (${changes.join(', ')})` : ''}`,
      previousValue: oldProduct,
      newValue: updatedProduct,
      relatedId: id,
    })

    return updatedProduct
  },

  async toggleAvailability(id: string): Promise<Product | null> {
    const all = await this.getAll()
    const target = all.find((p) => p.id === id)
    if (!target) return null
    return this.update(id, { isAvailable: !target.isAvailable })
  },

  async delete(id: string): Promise<boolean> {
    const all = await this.getAll()
    const target = all.find((p) => p.id === id)
    if (!target) return false

    const filtered = all.filter((p) => p.id !== id)
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered))

    if (HAS_SUPABASE) {
      await supabaseFetch(`products?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
    }

    await ActivityService.log({
      action: 'product_deleted',
      description: `Deleted product "${target.name}" (${target.category})`,
      previousValue: target,
      relatedId: id,
    })

    return true
  },
}

// ==========================================
// ORDERS SERVICE
// ==========================================
export const OrderService = {
  async getAll(): Promise<Order[]> {
    if (HAS_SUPABASE) {
      const data = await supabaseFetch<any[]>('orders?select=*,order_items(*)&order=created_at.desc')
      if (data && Array.isArray(data)) {
        return data.map((o) => ({
          id: o.id,
          createdAt: o.created_at,
          updatedAt: o.updated_at,
          customer: {
            fullName: o.customer_name,
            mobile: o.customer_mobile,
            whatsapp: o.customer_whatsapp,
            houseNumber: o.house_number,
            streetArea: o.street_area,
            city: o.city,
            pinCode: o.pincode,
            formattedAddress: o.formatted_address,
            lat: o.delivery_lat ? Number(o.delivery_lat) : undefined,
            lng: o.delivery_lng ? Number(o.delivery_lng) : undefined,
            deliveryInstructions: o.delivery_instructions,
          },
          items: Array.isArray(o.order_items)
            ? o.order_items.map((i: any) => ({
                productId: i.product_id,
                name: i.product_name,
                price: Number(i.price),
                quantity: Number(i.quantity),
                image: i.image,
                subtotal: Number(i.subtotal),
              }))
            : [],
          subtotal: Number(o.subtotal),
          deliveryDistanceKm: Number(o.delivery_distance_km),
          deliveryCharge: Number(o.delivery_charge),
          finalTotal: Number(o.final_total),
          status: o.status as OrderStatus,
          cancellationReason: o.cancellation_reason,
        }))
      }
    }

    const stored = localStorage.getItem(STORAGE_KEYS.ORDERS)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        console.error('Error parsing stored orders', e)
      }
    }
    return []
  },

  async getById(id: string): Promise<Order | null> {
    const orders = await this.getAll()
    return orders.find((o) => o.id === id) || null
  },

  async create(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Order> {
    // Generate unique order ID: AMB-YYYYMMDD-XXXX
    const now = new Date()
    const ymd = now.toISOString().slice(0, 10).replace(/-/g, '')
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
    const id = `AMB-${ymd}-${rand}`
    const timestamp = now.toISOString()

    const newOrder: Order = {
      ...orderData,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
      status: 'pending',
    }

    // Supabase
    if (HAS_SUPABASE) {
      const orderPayload = {
        id: newOrder.id,
        created_at: newOrder.createdAt,
        updated_at: newOrder.updatedAt,
        customer_name: newOrder.customer.fullName,
        customer_mobile: newOrder.customer.mobile,
        customer_whatsapp: newOrder.customer.whatsapp,
        house_number: newOrder.customer.houseNumber,
        street_area: newOrder.customer.streetArea,
        city: newOrder.customer.city,
        pincode: newOrder.customer.pinCode,
        formatted_address: newOrder.customer.formattedAddress,
        delivery_lat: newOrder.customer.lat,
        delivery_lng: newOrder.customer.lng,
        delivery_instructions: newOrder.customer.deliveryInstructions,
        subtotal: newOrder.subtotal,
        delivery_distance_km: newOrder.deliveryDistanceKm,
        delivery_charge: newOrder.deliveryCharge,
        final_total: newOrder.finalTotal,
        status: newOrder.status,
      }
      await supabaseFetch('orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      })

      // Insert order items
      const itemsPayload = newOrder.items.map((item) => ({
        order_id: newOrder.id,
        product_id: item.productId,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        subtotal: item.subtotal,
      }))
      await supabaseFetch('order_items', {
        method: 'POST',
        body: JSON.stringify(itemsPayload),
      })
    }

    // Local storage
    const all = await this.getAll()
    const updated = [newOrder, ...all]
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated))

    return newOrder
  },

  async updateStatus(id: string, status: OrderStatus, cancellationReason?: string): Promise<Order | null> {
    const all = await this.getAll()
    const index = all.findIndex((o) => o.id === id)
    if (index === -1) return null

    const oldOrder = all[index]
    const updatedOrder: Order = {
      ...oldOrder,
      status,
      cancellationReason: cancellationReason || oldOrder.cancellationReason,
      updatedAt: new Date().toISOString(),
    }
    all[index] = updatedOrder
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(all))

    if (HAS_SUPABASE) {
      await supabaseFetch(`orders?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: updatedOrder.status,
          cancellation_reason: updatedOrder.cancellationReason ?? null,
          updated_at: updatedOrder.updatedAt,
        }),
      })
    }

    const action: ActivityActionType = status === 'cancelled' ? 'order_cancelled' : 'order_status_updated'
    await ActivityService.log({
      action,
      description:
        status === 'cancelled'
          ? `Cancelled order #${id} (Reason: ${cancellationReason || 'Not specified'})`
          : `Updated status of order #${id} from "${oldOrder.status}" to "${status}"`,
      previousValue: oldOrder.status,
      newValue: status,
      relatedId: id,
    })

    return updatedOrder
  },
}

// ==========================================
// DELIVERY SETTINGS SERVICE
// ==========================================
export const DeliverySettingsService = {
  async get(): Promise<DeliverySettings> {
    if (HAS_SUPABASE) {
      const data = await supabaseFetch<any[]>('delivery_settings?id=eq.1')
      if (data && data.length > 0) {
        const s = data[0]
        return {
          shopAddress: s.shop_address,
          shopLat: Number(s.shop_lat),
          shopLng: Number(s.shop_lng),
          isDeliveryEnabled: s.is_delivery_enabled ?? true,
          minOrderAmount: Number(s.min_order_amount ?? 0),
          maxDeliveryDistance: Number(s.max_delivery_distance ?? 15),
          tiers: Array.isArray(s.pricing_tiers) ? s.pricing_tiers : DEFAULT_DELIVERY_SETTINGS.tiers,
        }
      }
    }

    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        console.error('Error parsing stored delivery settings', e)
      }
    }
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_DELIVERY_SETTINGS))
    return DEFAULT_DELIVERY_SETTINGS
  },

  async update(settings: DeliverySettings): Promise<DeliverySettings> {
    const oldSettings = await this.get()
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))

    if (HAS_SUPABASE) {
      await supabaseFetch('delivery_settings?id=eq.1', {
        method: 'PATCH',
        body: JSON.stringify({
          shop_address: settings.shopAddress,
          shop_lat: settings.shopLat,
          shop_lng: settings.shopLng,
          is_delivery_enabled: settings.isDeliveryEnabled,
          min_order_amount: settings.minOrderAmount,
          max_delivery_distance: settings.maxDeliveryDistance,
          pricing_tiers: settings.tiers,
          updated_at: new Date().toISOString(),
        }),
      })
    }

    await ActivityService.log({
      action: 'delivery_pricing_updated',
      description: `Updated delivery settings and distance pricing tiers (Max dist: ${settings.maxDeliveryDistance} km, Delivery enabled: ${settings.isDeliveryEnabled})`,
      previousValue: oldSettings,
      newValue: settings,
      relatedId: 'delivery-settings',
    })

    return settings
  },
}

// ==========================================
// ACTIVITY LOG / AUDIT LOG SERVICE
// ==========================================
export const ActivityService = {
  async getAll(): Promise<ActivityLog[]> {
    if (HAS_SUPABASE) {
      const data = await supabaseFetch<any[]>('activity_logs?select=*&order=created_at.desc')
      if (data && Array.isArray(data)) {
        return data.map((l) => ({
          id: l.id,
          adminId: l.admin_id,
          action: l.action as ActivityActionType,
          description: l.description,
          previousValue: l.previous_value,
          newValue: l.new_value,
          timestamp: l.created_at,
          relatedId: l.related_id,
        }))
      }
    }

    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        console.error('Error parsing activity logs', e)
      }
    }
    return []
  },

  async log(entry: Omit<ActivityLog, 'id' | 'timestamp' | 'adminId'> & { adminId?: string }): Promise<ActivityLog> {
    const id = `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    const timestamp = new Date().toISOString()
    const newLog: ActivityLog = {
      id,
      adminId: entry.adminId || 'admin@al-maas.com',
      action: entry.action,
      description: entry.description,
      previousValue: entry.previousValue,
      newValue: entry.newValue,
      timestamp,
      relatedId: entry.relatedId,
    }

    // Supabase
    if (HAS_SUPABASE) {
      await supabaseFetch('activity_logs', {
        method: 'POST',
        body: JSON.stringify({
          id: newLog.id,
          admin_id: newLog.adminId,
          action: newLog.action,
          description: newLog.description,
          previous_value: newLog.previousValue ? JSON.stringify(newLog.previousValue) : null,
          new_value: newLog.newValue ? JSON.stringify(newLog.newValue) : null,
          related_id: newLog.relatedId ?? null,
          created_at: timestamp,
        }),
      })
    }

    // Local storage
    const all = await this.getAll()
    const updated = [newLog, ...all]
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(updated.slice(0, 500))) // keep last 500

    return newLog
  },
}

// ==========================================
// ADMIN AUTH SERVICE
// ==========================================
export const AuthService = {
  // Default fallback admin password (overridden by VITE_ADMIN_PASSWORD)
  getAdminPassword(): string {
    return import.meta.env.VITE_ADMIN_PASSWORD || 'AlMaas@Admin2026'
  },

  isAuthenticated(): boolean {
    const session = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION)
    if (!session) return false
    try {
      const parsed = JSON.parse(session)
      // Session expires after 24 hours
      if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
        this.logout()
        return false
      }
      return true
    } catch {
      return false
    }
  },

  async login(password: string): Promise<boolean> {
    const expected = this.getAdminPassword()
    if (password === expected) {
      const session = {
        adminId: 'admin@al-maas.com',
        timestamp: Date.now(),
        token: `adm_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      }
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(session))

      await ActivityService.log({
        action: 'admin_login',
        description: 'Admin logged into dashboard',
        adminId: session.adminId,
      })
      return true
    }
    return false
  },

  async logout(): Promise<void> {
    const session = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION)
    if (session) {
      await ActivityService.log({
        action: 'admin_logout',
        description: 'Admin logged out',
      })
    }
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION)
  },
}

