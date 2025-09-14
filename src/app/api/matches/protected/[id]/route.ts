import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Match from '@/models/Match'
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
    
    // If match was changed from non-completed to completed, update player stats
    const existingMatch = await Match.findById(params.id)
    if (existingMatch && existingMatch.status !== 'completed' && body.status === 'completed') {
      // Update player statistics
      for (const stat of body.playerStats) {
        if (stat.playerId && stat.minutesPlayed > 0) {
          await Player.findByIdAndUpdate(
            stat.playerId,
            {
              $inc: {
                matchesPlayed: 1,
                goals: stat.goals || 0,
                assists: stat.assists || 0
              }
            }
          )
        }
      }
    }
    
    const match = await Match.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    ).populate('playerStats.playerId', 'name shirtNumber')
    
    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { success: true, data: match },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('PUT /api/matches/protected/[id] error:', error)
    
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
    
    const match = await Match.findByIdAndDelete(params.id)
    
    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { success: true, message: 'Match deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('DELETE /api/matches/protected/[id] error:', error)
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete match' },
      { status: 500 }
    )
  }
}

export { authenticatedPUT as PUT, authenticatedDELETE as DELETE }