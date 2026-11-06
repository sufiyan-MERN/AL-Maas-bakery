import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { logActivity } from '@/lib/activity'

import { products as defaultProducts } from '@/data/products'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('category')
      .order('name')

    if (error || !data || data.length === 0) {
      return NextResponse.json(defaultProducts)
    }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(defaultProducts)
  }
}

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()
  const body = await request.json()

  const { name, category, description, price, discount_price, weight, image, is_available } = body
  if (!name || !category || !price) {
    return NextResponse.json({ error: 'name, category, and price are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('products')
    .insert({ name, category, description, price, discount_price, weight, image, is_available: is_available ?? true })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logActivity({
    action: 'PRODUCT_CREATED',
    description: `Added new product: ${name}`,
    entity_type: 'product',
    entity_id: data.id,
    new_value: data,
  })

  return NextResponse.json(data, { status: 201 })
}

