import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'fc-coder-secret-key-2024'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fccoder.com'
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync('admin123', 10)

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