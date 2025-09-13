import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Match from '@/models/Match'
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
    
    // Validate player stats if provided
    if (body.playerStats && body.playerStats.length > 0) {
      for (const stat of body.playerStats) {
        if (!stat.playerId) continue
        
        const player = await Player.findById(stat.playerId)
        if (!player) {
          return NextResponse.json(
            { success: false, error: `Player with ID ${stat.playerId} not found` },
            { status: 400 }
          )
        }
      }
    }
    
    const match = new Match(body)
    await match.save()
    
    // If match is completed, update player statistics
    if (body.status === 'completed' && body.playerStats && body.playerStats.length > 0) {
      for (const stat of body.playerStats) {
        if (!stat.playerId || (!stat.goals && !stat.assists && stat.minutesPlayed <= 0)) continue
        
        await Player.findByIdAndUpdate(
          stat.playerId,
          { 
            $inc: { 
              goals: stat.goals || 0,
              assists: stat.assists || 0,
              matchesPlayed: stat.minutesPlayed > 0 ? 1 : 0
            }
          }
        )
      }
    }
    
    await match.populate('playerStats.playerId', 'name shirtNumber position devRole')
    
    return NextResponse.json(
      { success: true, data: match },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('POST /api/matches/protected error:', error)
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { success: false, error: validationErrors.join(', ') },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create match' },
      { status: 500 }
    )
  }
}

export { authenticatedPOST as POST }