'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AdminUser } from '@/lib/auth'

interface AuthContextType {
  user: AdminUser | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  loading: true
})

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in by verifying token with server
    const checkAuth = async () => {
      console.log('[AuthContext] Checking for existing token...')
      const token = localStorage.getItem('fc-coder-token')
      console.log('[AuthContext] Token found:', !!token)

      if (token) {
        console.log('[AuthContext] Verifying token with server...')
        try {
          const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          })

          const data = await response.json()
          console.log('[AuthContext] Server verification result:', data)

          if (data.success && data.user) {
            setUser(data.user)
            console.log('[AuthContext] User set:', data.user)
          } else {
            console.log('[AuthContext] Invalid token, removing...')
            localStorage.removeItem('fc-coder-token')
          }
        } catch (error) {
          console.error('[AuthContext] Token verification error:', error)
          localStorage.removeItem('fc-coder-token')
        }
      }

      setLoading(false)
      console.log('[AuthContext] Loading complete')
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('fc-coder-token', data.token)
        setUser(data.user)
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('fc-coder-token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}