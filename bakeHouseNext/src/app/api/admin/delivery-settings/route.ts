import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { logActivity } from '@/lib/activity'

const DEFAULT_SETTINGS = {
  id: 1,
  shop_address: 'No.92, S B Elegance, Manorayana Palya, Sultan Palya Main Road, Bengaluru - 560032',
  shop_lat: 13.0279242,
  shop_lng: 77.5282725,
  is_delivery_enabled: true,
  min_order_amount: 0,
  max_delivery_distance: 15,
  pricing_tiers: [
    { min_km: 0, max_km: 2, charge: 20 },
    { min_km: 2, max_km: 5, charge: 40 },
    { min_km: 5, max_km: 8, charge: 60 },
    { min_km: 8, max_km: 15, charge: 100 },
  ],
}

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('delivery_settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (error || !data) return NextResponse.json(DEFAULT_SETTINGS)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(DEFAULT_SETTINGS)
  }
}

export async function PUT(request: Request) {
  const supabase = createServerSupabaseClient()
  const body = await request.json()

  const { data: oldData } = await supabase.from('delivery_settings').select('*').eq('id', 1).single()

  const {
    shop_lat, shop_lng, shop_address,
    is_delivery_enabled, min_order_amount,
    max_delivery_distance, pricing_tiers,
  } = body

  const { data, error } = await supabase
    .from('delivery_settings')
    .upsert({
      id: 1,
      shop_lat, shop_lng, shop_address,
      is_delivery_enabled, min_order_amount,
      max_delivery_distance, pricing_tiers,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logActivity({
    action: 'DELIVERY_SETTINGS_UPDATED',
    description: 'Delivery settings updated',
    entity_type: 'delivery_settings',
    entity_id: '1',
    old_value: oldData,
    new_value: data,
  })

  return NextResponse.json(data)
}

