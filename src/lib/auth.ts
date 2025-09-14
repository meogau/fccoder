import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = 'fc-coder-super-secret-jwt-key-2024'
const ADMIN_EMAIL = 'admin@fccoder.com'
const ADMIN_PASSWORD_HASH = '$2b$10$iw2CavgKJQ626n4tQv3jG.ztUYyVsqS.jxzVsA3OL5JDNjF5ZVj8i'

export interface AdminUser {
  id: string
  email: string
  role: 'admin'
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

export function generateToken(user: AdminUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyToken(token: string): AdminUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminUser
  } catch (error) {
    return null
  }
}

export function authenticateAdmin(email: string, password: string): AdminUser | null {
  console.log('=== AUTH DEBUG ===')
  console.log('Input email:', email)
  console.log('Expected email:', ADMIN_EMAIL)
  console.log('Email match:', email === ADMIN_EMAIL)
  console.log('Password hash being used:', ADMIN_PASSWORD_HASH)
  console.log('Password verification result:', verifyPassword(password, ADMIN_PASSWORD_HASH))
  console.log('==================')
  
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