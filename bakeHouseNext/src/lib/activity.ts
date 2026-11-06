import { createServerSupabaseClient } from './supabase'
import type { ActivityLog } from '@/types'

type LogActionParams = {
  action: string
  description: string
  entity_type?: string
  entity_id?: string
  old_value?: Record<string, unknown>
  new_value?: Record<string, unknown>
}

export async function logActivity(params: LogActionParams): Promise<void> {
  try {
    const supabase = createServerSupabaseClient()
    await supabase.from('activity_logs').insert({
      admin_id: 'admin',
      action: params.action,
      description: params.description,
      entity_type: params.entity_type ?? null,
      entity_id: params.entity_id ?? null,
      old_value: params.old_value ?? null,
      new_value: params.new_value ?? null,
    })
  } catch (err) {
    // Logging errors should not break the main operation
    console.error('[ActivityLog] Failed to log activity:', err)
  }
}

export type { ActivityLog }

