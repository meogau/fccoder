import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Player from '@/models/Player'
import { verifyToken } from '@/lib/auth'

async function authenticatedPOST(request: NextRequest) {
  try {
    // Check authentication
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

    await connectDB()
    
    const body = await request.json()
    
    // Check if trying to create a captain when one already exists
    if (body.teamRole === 'captain') {
      const existingCaptain = await Player.findOne({ teamRole: 'captain', isActive: true })
      if (existingCaptain) {
        return NextResponse.json(
          { success: false, error: 'A captain already exists. Please choose vice-captain or member role.' },
          { status: 400 }
        )
      }
    }
    
    const player = new Player(body)
    await player.save()
    
    return NextResponse.json(
      { success: true, data: player },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('POST /api/players/protected error:', error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Shirt number already exists' },
        { status: 400 }
      )
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { success: false, error: validationErrors.join(', ') },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create player' },
      { status: 500 }
    )
  }
}

export { authenticatedPOST as POST }