import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-in-production')
const TOKEN_COOKIE = 'admin_token'
const TOKEN_EXPIRY = '24h'

export async function createAdminToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET)
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

export async function getAdminTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(TOKEN_COOKIE)?.value ?? null
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const token = await getAdminTokenFromCookies()
  if (!token) return false
  return verifyAdminToken(token)
}

export async function getAdminTokenFromRequest(req: NextRequest): Promise<string | null> {
  return req.cookies.get(TOKEN_COOKIE)?.value ?? null
}

export async function verifyRequestAdmin(req: NextRequest): Promise<boolean> {
  const token = await getAdminTokenFromRequest(req)
  if (!token) return false
  return verifyAdminToken(token)
}

export { TOKEN_COOKIE }

