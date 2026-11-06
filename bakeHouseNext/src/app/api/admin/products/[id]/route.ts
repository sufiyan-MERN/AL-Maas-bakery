import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { logActivity } from '@/lib/activity'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
  if (error || !data) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServerSupabaseClient()
  const body = await request.json()

  // Get old value for audit
  const { data: oldData } = await supabase.from('products').select('*').eq('id', id).single()

  const { name, category, description, price, discount_price, weight, image, is_available } = body
  const { data, error } = await supabase
    .from('products')
    .update({ name, category, description, price, discount_price, weight, image, is_available, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) return NextResponse.json({ error: error?.message || 'Product not found' }, { status: 404 })

  // Build specific description for audit
  const changes: string[] = []
  if (oldData) {
    if (oldData.price !== price) changes.push(`price: ₹${oldData.price} → ₹${price}`)
    if (oldData.is_available !== is_available) changes.push(`availability: ${oldData.is_available} → ${is_available}`)
    if (oldData.name !== name) changes.push(`name: ${oldData.name} → ${name}`)
  }

  await logActivity({
    action: 'PRODUCT_UPDATED',
    description: `Updated product: ${data.name}${changes.length ? ` (${changes.join(', ')})` : ''}`,
    entity_type: 'product',
    entity_id: id,
    old_value: oldData,
    new_value: data,
  })

  return NextResponse.json(data)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServerSupabaseClient()
  const body = await request.json()

  const { data: oldData } = await supabase.from('products').select('*').eq('id', id).single()

  const { data, error } = await supabase
    .from('products')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) return NextResponse.json({ error: error?.message || 'Product not found' }, { status: 404 })

  if (body.is_available !== undefined && oldData?.is_available !== body.is_available) {
    await logActivity({
      action: 'PRODUCT_AVAILABILITY_CHANGED',
      description: `Product "${data.name}" marked as ${body.is_available ? 'available' : 'out of stock'}`,
      entity_type: 'product',
      entity_id: id,
      old_value: { is_available: oldData?.is_available },
      new_value: { is_available: body.is_available },
    })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServerSupabaseClient()

  const { data: product } = await supabase.from('products').select('name').eq('id', id).single()
  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logActivity({
    action: 'PRODUCT_DELETED',
    description: `Deleted product: ${product?.name || id}`,
    entity_type: 'product',
    entity_id: id,
    old_value: product || undefined,
  })

  return NextResponse.json({ success: true })
}

