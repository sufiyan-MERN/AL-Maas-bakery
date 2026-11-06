import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { logActivity } from '@/lib/activity'

const VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`*, items:order_items(*)`)
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { status } = await request.json()

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()
  const { data: oldOrder } = await supabase.from('orders').select('status, customer_name').eq('id', id).single()

  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) return NextResponse.json({ error: error?.message || 'Order not found' }, { status: 404 })

  await logActivity({
    action: status === 'cancelled' ? 'ORDER_CANCELLED' : 'ORDER_STATUS_UPDATED',
    description: `Order ${id} status changed from "${oldOrder?.status}" to "${status}" (Customer: ${oldOrder?.customer_name})`,
    entity_type: 'order',
    entity_id: id,
    old_value: { status: oldOrder?.status },
    new_value: { status },
  })

  return NextResponse.json(data)
}

