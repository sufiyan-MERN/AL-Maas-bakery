import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { products as defaultProducts } from '@/data/products'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const available = searchParams.get('available')

  const supabase = createServerSupabaseClient()
  let query = supabase.from('products').select('*').order('category').order('name')

  if (category) query = query.eq('category', category)
  if (available === 'true') query = query.eq('is_available', true)

  try {
    const { data, error } = await query

    if (error || !data || data.length === 0) {
      let filtered = [...defaultProducts]
      if (category) filtered = filtered.filter((p) => p.category === category)
      return NextResponse.json(filtered)
    }

    return NextResponse.json(data)
  } catch {
    let filtered = [...defaultProducts]
    if (category) filtered = filtered.filter((p) => p.category === category)
    return NextResponse.json(filtered)
  }
}

