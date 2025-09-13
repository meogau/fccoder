import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Player from '@/models/Player'
import mongoose from 'mongoose'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid player ID' },
        { status: 400 }
      )
    }
    
    const player = await Player.findById(params.id)
    
    if (!player) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      data: player 
    })
  } catch (error) {
    console.error('GET /api/players/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch player' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid player ID' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    
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
    
    return NextResponse.json({ 
      success: true, 
      data: player 
    })
  } catch (error: any) {
    console.error('PUT /api/players/[id] error:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid player ID' },
        { status: 400 }
      )
    }
    
    const player = await Player.findByIdAndDelete(params.id)
    
    if (!player) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Player deleted successfully' 
    })
  } catch (error) {
    console.error('DELETE /api/players/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete player' },
      { status: 500 }
    )
  }
}