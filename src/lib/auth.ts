import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

const JWT_SECRET = new TextEncoder().encode('fc-coder-super-secret-jwt-key-2024')
const ADMIN_EMAIL = 'admin@fccoder.com'
const ADMIN_PASSWORD_HASH = '$2b$10$RDAIxM8rymUfcbqTt5WU2urNRC4/TIplsS7vEJFs.CukI.mRkOpAy'

export interface AdminUser {
  id: string
  email: string
  role: 'admin'
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

export async function generateToken(user: AdminUser): Promise<string> {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)

  return token
}

export async function verifyToken(token: string): Promise<AdminUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as AdminUser
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export function authenticateAdmin(email: string, password: string): AdminUser | null {
  if (email === ADMIN_EMAIL && verifyPassword(password, ADMIN_PASSWORD_HASH)) {
    return {
      id: 'admin',
      email: ADMIN_EMAIL,
      role: 'admin'
    }
  }
  return null
}

export function getDefaultAdmin() {
  return {
    email: ADMIN_EMAIL,
    passwordHash: ADMIN_PASSWORD_HASH
  }
}