import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { calculateDistance, getDeliveryCharge } from '@/lib/delivery'
import type { OrderItem } from '@/types'

// Generate unique order ID
function generateOrderId(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0,10).replace(/-/g,'')
  const random = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `ORD-${dateStr}-${random}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      customer_name,
      mobile,
      whatsapp,
      address_line1,
      address_line2,
      street,
      city,
      pincode,
      delivery_instructions,
      delivery_lat,
      delivery_lng,
      delivery_address,
      items, // Array of { product_id, quantity }
    } = body

    // Validate required fields
    if (!customer_name || !mobile || !address_line1 || !street || !city || !pincode || !items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Fetch actual product prices from DB (never trust frontend prices)
    const productIds = items.map((i: { product_id: string }) => i.product_id)
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, price, image, is_available')
      .in('id', productIds)

    if (productError || !products?.length) {
      return NextResponse.json({ error: 'Failed to fetch product data' }, { status: 500 })
    }

    // Verify all products are available
    const unavailable = products.filter(p => !p.is_available)
    if (unavailable.length > 0) {
      return NextResponse.json({
        error: `These items are currently unavailable: ${unavailable.map(p => p.name).join(', ')}`
      }, { status: 400 })
    }

    // Build order items with server-side prices
    const orderItems: OrderItem[] = items.map((item: { product_id: string; quantity: number }) => {
      const product = products.find(p => p.id === item.product_id)
      if (!product) throw new Error(`Product ${item.product_id} not found`)
      return {
        product_id: item.product_id,
        product_name: product.name,
        product_image: product.image || '',
        quantity: item.quantity,
        unit_price: product.price,
        subtotal: product.price * item.quantity,
      }
    })

    const subtotal = orderItems.reduce((acc, i) => acc + i.subtotal, 0)

    // Calculate delivery charge server-side
    let deliveryCharge = 0
    let distanceKm: number | null = null

    if (delivery_lat && delivery_lng) {
      // Fetch delivery settings from DB
      const { data: settings } = await supabase
        .from('delivery_settings')
        .select('*')
        .eq('id', 1)
        .single()

      if (settings) {
        distanceKm = calculateDistance(
          settings.shop_lat,
          settings.shop_lng,
          delivery_lat,
          delivery_lng,
        )

        if (distanceKm > settings.max_delivery_distance) {
          return NextResponse.json({
            error: `Delivery is not available to your location (${distanceKm.toFixed(1)} km). Maximum delivery distance is ${settings.max_delivery_distance} km.`
          }, { status: 400 })
        }

        const charge = getDeliveryCharge(distanceKm, settings.pricing_tiers)
        if (charge === null) {
          return NextResponse.json({
            error: 'Delivery is not available to your location.'
          }, { status: 400 })
        }
        deliveryCharge = charge

        // Minimum order check
        if (settings.min_order_amount > 0 && subtotal < settings.min_order_amount) {
          return NextResponse.json({
            error: `Minimum order amount is ₹${settings.min_order_amount}. Your subtotal is ₹${subtotal}.`
          }, { status: 400 })
        }
      }
    }

    const total = subtotal + deliveryCharge
    const orderId = generateOrderId()

    // Insert order
    const { error: orderError } = await supabase.from('orders').insert({
      id: orderId,
      customer_name,
      mobile,
      whatsapp: whatsapp || null,
      address_line1,
      address_line2: address_line2 || null,
      street,
      city,
      pincode,
      delivery_instructions: delivery_instructions || null,
      delivery_lat: delivery_lat || null,
      delivery_lng: delivery_lng || null,
      delivery_address: delivery_address || null,
      delivery_distance: distanceKm,
      delivery_charge: deliveryCharge,
      subtotal,
      total,
      status: 'pending',
    })

    if (orderError) {
      console.error('[API/orders POST] order insert error:', orderError)
      return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
    }

    // Insert order items
    const itemsToInsert = orderItems.map(item => ({ ...item, order_id: orderId }))
    const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert)

    if (itemsError) {
      console.error('[API/orders POST] items insert error:', itemsError)
      // Order was created, don't fail completely
    }

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        subtotal,
        delivery_charge: deliveryCharge,
        delivery_distance: distanceKm,
        total,
        status: 'pending',
        created_at: new Date().toISOString(),
      }
    }, { status: 201 })

  } catch (err) {
    console.error('[API/orders POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`*, items:order_items(*)`)
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

