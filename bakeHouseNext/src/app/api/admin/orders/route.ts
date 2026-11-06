import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const dateFrom = searchParams.get('date_from')
  const dateTo = searchParams.get('date_to')
  const offset = (page - 1) * limit

  const supabase = createServerSupabaseClient()
  let query = supabase
    .from('orders')
    .select(`*, items:order_items(*)`, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)
  if (search) query = query.or(`customer_name.ilike.%${search}%,id.ilike.%${search}%`)
  if (dateFrom) query = query.gte('created_at', dateFrom)
  if (dateTo) query = query.lte('created_at', dateTo + 'T23:59:59')

  try {
    const { data, error, count } = await query
    if (error) {
      console.warn('[API/admin/orders GET]', error.message)
      return NextResponse.json({ orders: [], total: 0, page, limit })
    }
    return NextResponse.json({ orders: data || [], total: count || 0, page, limit })
  } catch (err) {
    console.warn('[API/admin/orders GET catch]', err)
    return NextResponse.json({ orders: [], total: 0, page, limit })
  }
}

