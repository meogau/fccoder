import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Player from '@/models/Player'
import { verifyToken } from '@/lib/auth'

async function authenticatedPUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    // Check if trying to update to captain when one already exists
    if (body.teamRole === 'captain') {
      const existingCaptain = await Player.findOne({ 
        teamRole: 'captain', 
        isActive: true,
        _id: { $ne: params.id } // Exclude current player
      })
      if (existingCaptain) {
        return NextResponse.json(
          { success: false, error: 'A captain already exists. Please choose vice-captain or member role.' },
          { status: 400 }
        )
      }
    }
    
    const player = await Player.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    )
    
    if (!player) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { success: true, data: player },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('PUT /api/players/protected/[id] error:', error)
    
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
      { success: false, error: 'Failed to update player' },
      { status: 500 }
    )
  }
}

async function authenticatedDELETE(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    const player = await Player.findByIdAndDelete(params.id)
    
    if (!player) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { success: true, message: 'Player deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('DELETE /api/players/protected/[id] error:', error)
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete player' },
      { status: 500 }
    )
  }
}

export { authenticatedPUT as PUT, authenticatedDELETE as DELETE }