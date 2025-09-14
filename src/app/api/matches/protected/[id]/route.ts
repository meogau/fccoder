import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Match from '@/models/Match'
import Player from '@/models/Player'
import { verifyToken } from '@/lib/auth'
import { sendMatchResultNotifications } from '@/lib/telegram'

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
    
    // Handle player stats updates
    const existingMatch = await Match.findById(params.id).populate('playerStats.playerId')
    if (existingMatch && body.status === 'completed') {
      // If changing from non-completed to completed, add stats
      if (existingMatch.status !== 'completed') {
        for (const stat of body.playerStats) {
          if (stat.playerId) {
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
      // If already completed, handle stat differences
      else {
        // First, revert old stats
        for (const oldStat of existingMatch.playerStats) {
          if (oldStat.playerId) {
            await Player.findByIdAndUpdate(
              oldStat.playerId._id,
              {
                $inc: {
                  goals: -(oldStat.goals || 0),
                  assists: -(oldStat.assists || 0)
                }
              }
            )
          }
        }
        
        // Then apply new stats
        for (const newStat of body.playerStats) {
          if (newStat.playerId) {
            await Player.findByIdAndUpdate(
              newStat.playerId,
              {
                $inc: {
                  goals: newStat.goals || 0,
                  assists: newStat.assists || 0
                }
              }
            )
          }
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
    
    // Send Telegram notifications if match is completed
    if (body.status === 'completed' && body.playerStats?.length > 0) {
      // Send notifications asynchronously (don't wait for completion)
      sendMatchResultNotifications(body.playerStats).catch(error => {
        console.error('Failed to send notifications:', error)
      })
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