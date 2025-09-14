import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Match from '@/models/Match'
import mongoose from 'mongoose'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('GET match details - Starting request for ID:', params.id)
    await connectDB()
    console.log('Database connected')
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      console.log('Invalid ObjectId:', params.id)
      return NextResponse.json(
        { success: false, error: 'Invalid match ID' },
        { status: 400 }
      )
    }
    
    // First check if any matches exist
    const totalMatches = await Match.countDocuments()
    console.log('Total matches in database:', totalMatches)
    
    console.log('Looking for match with ID:', params.id)
    const match = await Match.findById(params.id)
    console.log('Found match:', !!match, match ? `Title: ${match.opponent}` : 'No match found')
    
    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      data: match 
    })
  } catch (error) {
    console.error('GET /api/matches/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch match' },
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
        { success: false, error: 'Invalid match ID' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    
    const match = await Match.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    )
    
    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      data: match 
    })
  } catch (error: any) {
    console.error('PUT /api/matches/[id] error:', error)
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { success: false, error: validationErrors.join(', ') },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update match' },
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
        { success: false, error: 'Invalid match ID' },
        { status: 400 }
      )
    }
    
    const match = await Match.findByIdAndDelete(params.id)
    
    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Match deleted successfully' 
    })
  } catch (error) {
    console.error('DELETE /api/matches/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete match' },
      { status: 500 }
    )
  }
}