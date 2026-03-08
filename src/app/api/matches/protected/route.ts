import { NextRequest, NextResponse } from 'next/server'
import { createMatch } from '@/lib/db/matchModel'
import { getPlayerById, updatePlayer } from '@/lib/db/playerModel'
import { verifyToken } from '@/lib/auth'
import { sendMatchResultNotifications } from '@/lib/telegram'

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

    const body = await request.json()

    // Validate player stats if provided
    if (body.playerStats && body.playerStats.length > 0) {
      for (const stat of body.playerStats) {
        if (!stat.playerId) continue

        const player = await getPlayerById(stat.playerId)
        if (!player) {
          return NextResponse.json(
            { success: false, error: `Player with ID ${stat.playerId} not found` },
            { status: 400 }
          )
        }
      }
    }

    const match = await createMatch(body)

    // If match is completed, update player statistics
    if (body.status === 'completed' && body.playerStats && body.playerStats.length > 0) {
      for (const stat of body.playerStats) {
        if (!stat.playerId) continue

        const player = await getPlayerById(stat.playerId)
        if (player) {
          await updatePlayer(stat.playerId, {
            goals: player.goals + (stat.goals || 0),
            assists: player.assists + (stat.assists || 0),
            matchesPlayed: player.matchesPlayed + 1
          })
        }
      }
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
      { status: 201 }
    )
  } catch (error: any) {
    console.error('POST /api/matches/protected error:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to create match' },
      { status: 500 }
    )
  }
}

export { authenticatedPOST as POST }