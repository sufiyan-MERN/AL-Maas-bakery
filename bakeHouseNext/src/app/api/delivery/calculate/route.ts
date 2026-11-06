import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { calculateDistance, getDeliveryCharge } from '@/lib/delivery'

export async function POST(request: Request) {
  try {
    const { lat, lng } = await request.json()

    if (!lat || !lng || typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ error: 'Valid lat and lng are required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data: settings, error } = await supabase
      .from('delivery_settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (error || !settings) {
      return NextResponse.json({ error: 'Delivery settings not configured' }, { status: 500 })
    }

    if (!settings.is_delivery_enabled) {
      return NextResponse.json({ available: false, reason: 'Delivery is currently disabled' })
    }

    const distanceKm = calculateDistance(settings.shop_lat, settings.shop_lng, lat, lng)

    if (distanceKm > settings.max_delivery_distance) {
      return NextResponse.json({
        available: false,
        distance: distanceKm,
        reason: `We currently deliver up to ${settings.max_delivery_distance} km. Your location is ${distanceKm.toFixed(1)} km away.`,
      })
    }

    const charge = getDeliveryCharge(distanceKm, settings.pricing_tiers)

    if (charge === null) {
      return NextResponse.json({
        available: false,
        distance: distanceKm,
        reason: 'Delivery is not available to your location.',
      })
    }

    return NextResponse.json({
      available: true,
      distance: distanceKm,
      charge,
      min_order_amount: settings.min_order_amount,
    })
  } catch (err) {
    console.error('[API/delivery/calculate]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

