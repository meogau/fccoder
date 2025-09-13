'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user && pathname.startsWith('/admin')) {
      router.push('/login')
    }
  }, [user, loading, router, pathname])

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-dark text-cyber-light-gray flex items-center justify-center">
        <div className="code-block rounded-lg p-8">
          <div className="font-mono text-cyber-gray text-center">
            Authenticating<span className="animate-pulse">...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!user && pathname.startsWith('/admin')) {
    return (
      <div className="min-h-screen bg-cyber-dark text-cyber-light-gray flex items-center justify-center">
        <div className="code-block rounded-lg p-8 border-red-500/50">
          <div className="font-mono text-red-400 text-center">
            Access Denied: Authentication Required
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}