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
    
    console.log(`=== MATCH UPDATE DEBUG ===`)
    console.log(`Match ID: ${params.id}`)
    console.log(`Existing status: ${existingMatch?.status}`)
    console.log(`New status: ${body.status}`)
    console.log(`Player stats count: ${body.playerStats?.length || 0}`)
    
    // Handle player stats updates based on status changes
    if (existingMatch) {
      const wasCompleted = existingMatch.status === 'completed'
      const isCompleted = body.status === 'completed'
      
      if (!wasCompleted && isCompleted) {
        // NEW COMPLETION: Add stats for first time
        console.log('🆕 NEW MATCH COMPLETION - Adding stats')
        for (const stat of body.playerStats) {
          if (stat.playerId) {
            console.log(`Adding stats for player ${stat.playerId}: ${stat.goals} goals, ${stat.assists} assists`)
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
      } else if (wasCompleted && !isCompleted) {
        // CHANGED TO NON-COMPLETED: Remove all previous stats
        console.log('❌ MATCH STATUS CHANGED TO NON-COMPLETED - Reverting all stats')
        for (const oldStat of existingMatch.playerStats) {
          if (oldStat.playerId) {
            const playerId = oldStat.playerId._id || oldStat.playerId
            console.log(`Reverting all stats for player ${playerId}: -1 match, -${oldStat.goals} goals, -${oldStat.assists} assists`)
            await Player.findByIdAndUpdate(
              playerId,
              {
                $inc: {
                  matchesPlayed: -1,
                  goals: -(oldStat.goals || 0),
                  assists: -(oldStat.assists || 0)
                }
              }
            )
          }
        }
      } else if (wasCompleted && isCompleted) {
        // UPDATING COMPLETED MATCH: Calculate differences
        console.log('📝 UPDATING COMPLETED MATCH - Calculating stat differences')
        
        // Create maps for easy lookup
        const oldStatsMap = new Map()
        existingMatch.playerStats.forEach((stat: any) => {
          if (stat.playerId) {
            const playerId = (stat.playerId._id || stat.playerId).toString()
            oldStatsMap.set(playerId, {
              goals: stat.goals || 0,
              assists: stat.assists || 0
            })
          }
        })
        
        const newStatsMap = new Map()
        body.playerStats.forEach((stat: any) => {
          if (stat.playerId) {
            newStatsMap.set(stat.playerId.toString(), {
              goals: stat.goals || 0,
              assists: stat.assists || 0
            })
          }
        })
        
        // Get all unique player IDs
        const allPlayerIds = Array.from(new Set([...Array.from(oldStatsMap.keys()), ...Array.from(newStatsMap.keys())]))
        
        // Apply differences for each player
        for (let i = 0; i < allPlayerIds.length; i++) {
          const playerId = allPlayerIds[i]
          const oldStats = oldStatsMap.get(playerId) || { goals: 0, assists: 0 }
          const newStats = newStatsMap.get(playerId) || { goals: 0, assists: 0 }
          
          const goalsDiff = newStats.goals - oldStats.goals
          const assistsDiff = newStats.assists - oldStats.assists
          
          if (goalsDiff !== 0 || assistsDiff !== 0) {
            console.log(`Updating stats for player ${playerId}: goals ${goalsDiff >= 0 ? '+' : ''}${goalsDiff}, assists ${assistsDiff >= 0 ? '+' : ''}${assistsDiff}`)
            await Player.findByIdAndUpdate(
              playerId,
              {
                $inc: {
                  goals: goalsDiff,
                  assists: assistsDiff
                }
              }
            )
          }
        }
      } else {
        console.log(`📊 NO STATS UPDATE NEEDED: was ${existingMatch.status} -> now ${body.status}`)
      }
    } else {
      console.log(`❌ NO EXISTING MATCH FOUND`)
    }
    console.log(`=== END DEBUG ===`)
    
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
    
    // Get match before deletion to revert player stats
    const match = await Match.findById(params.id).populate('playerStats.playerId')
    
    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      )
    }
    
    console.log(`=== MATCH DELETION DEBUG ===`)
    console.log(`Deleting match ID: ${params.id}`)
    console.log(`Match status: ${match.status}`)
    console.log(`Player stats count: ${match.playerStats.length}`)
    
    // If match was completed, revert player statistics
    if (match.status === 'completed' && match.playerStats.length > 0) {
      console.log('🔄 REVERTING PLAYER STATS ON DELETE')
      for (const stat of match.playerStats) {
        if (stat.playerId) {
          const playerId = stat.playerId._id || stat.playerId
          console.log(`Reverting stats for player ${playerId}: -1 match, -${stat.goals} goals, -${stat.assists} assists`)
          await Player.findByIdAndUpdate(
            playerId,
            {
              $inc: {
                matchesPlayed: -1,
                goals: -(stat.goals || 0),
                assists: -(stat.assists || 0)
              }
            }
          )
        }
      }
    }
    
    // Now delete the match
    await Match.findByIdAndDelete(params.id)
    console.log(`✅ Match deleted successfully`)
    console.log(`=== END DELETE DEBUG ===`)
    
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