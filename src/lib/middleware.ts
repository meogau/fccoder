import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function withAuth(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      )
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Add user to request
    ;(request as any).user = user
    return handler(request)
  }
}