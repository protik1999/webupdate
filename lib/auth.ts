import { cookies } from 'next/headers'

const JWT_SECRET = 'your-secret-key-change-in-production'
const SESSION_COOKIE_NAME = 'session'

interface SessionUser {
  id: string
  email: string
  role: string
  name: string
}

// Simple JWT implementation for demo (in production, use a proper library)
export async function createToken(user: SessionUser): Promise<string> {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  }

  // Simple base64 encoding (NOT production-safe, use jsonwebtoken in real app)
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

export async function verifyToken(token: string): Promise<any> {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString())
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

export async function setSession(user: SessionUser) {
  const token = await createToken(user)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  })
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null

  const payload = await verifyToken(token)
  return payload
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

// Password hashing (simple implementation - use bcrypt in production)
export async function hashPassword(password: string): Promise<string> {
  // For demo, just use base64 encoding. In production, use bcrypt!
  return Buffer.from(password).toString('base64')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = Buffer.from(password).toString('base64')
  return computed === hash
}
