import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createAdminToken, TOKEN_COOKIE } from '@/lib/auth'
import { logActivity } from '@/lib/activity'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    const expectedUsername = process.env.ADMIN_USERNAME || 'admin'
    const passwordHash = process.env.ADMIN_PASSWORD_HASH
    const defaultPassword = process.env.ADMIN_PASSWORD || 'AlMaas@Admin2026'

    if (username !== expectedUsername) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    let isValid = false
    if (passwordHash) {
      isValid = await bcrypt.compare(password, passwordHash)
    } else {
      isValid = password === defaultPassword
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = await createAdminToken()

    // Log admin login
    await logActivity({
      action: 'ADMIN_LOGIN',
      description: `Admin logged in`,
    })

    const response = NextResponse.json({ success: true })
    response.cookies.set(TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return response
  } catch (err) {
    console.error('[API/admin/login]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

