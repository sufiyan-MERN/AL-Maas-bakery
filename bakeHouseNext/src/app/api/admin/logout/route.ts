import { NextResponse } from 'next/server'
import { TOKEN_COOKIE } from '@/lib/auth'
import { logActivity } from '@/lib/activity'

export async function POST() {
  await logActivity({ action: 'ADMIN_LOGOUT', description: 'Admin logged out' })

  const response = NextResponse.json({ success: true })
  response.cookies.set(TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })
  return response
}

