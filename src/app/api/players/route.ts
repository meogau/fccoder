import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Player from '@/models/Player'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const searchParams = request.nextUrl.searchParams
    const position = searchParams.get('position')
    const devRole = searchParams.get('devRole')
    const isActive = searchParams.get('isActive')
    
    let query: any = {}
    
    if (position) query.position = position
    if (devRole) query.devRole = devRole
    if (isActive !== null) query.isActive = isActive === 'true'
    
    const players = await Player.find(query).sort({ shirtNumber: 1 })
    
    return NextResponse.json({ 
      success: true, 
      data: players 
    })
  } catch (error) {
    console.error('GET /api/players error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch players' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const player = new Player(body)
    await player.save()
    
    return NextResponse.json(
      { success: true, data: player },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('POST /api/players error:', error)
    
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