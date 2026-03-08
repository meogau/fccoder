import { NextRequest, NextResponse } from 'next/server'
import { getMatchById, updateMatch, deleteMatch } from '@/lib/db/matchModel'
import { verifyToken } from '@/lib/auth'
import { sendMatchResultNotifications } from '@/lib/telegram'
import { incrementPlayerStats, decrementPlayerStats } from '@/lib/db/playerModel'

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

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Get old match data to revert stats
    const oldMatch = await getMatchById(params.id)
    if (!oldMatch) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      )
    }

    // Revert old stats if match was completed
    if (oldMatch.status === 'completed' && oldMatch.playerStats?.length > 0) {
      await Promise.all(
        oldMatch.playerStats.map(stat =>
          decrementPlayerStats(stat.playerId, {
            goals: stat.goals,
            assists: stat.assists,
            matchesPlayed: 1
          })
        )
      )
    }

    // Update the match
    const match = await updateMatch(params.id, body)

    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Failed to update match' },
        { status: 500 }
      )
    }

    // Apply new stats if match is completed
    if (body.status === 'completed' && body.playerStats?.length > 0) {
      await Promise.all(
        body.playerStats.map((stat: any) =>
          incrementPlayerStats(stat.playerId, {
            goals: stat.goals,
            assists: stat.assists,
            matchesPlayed: 1
          })
        )
      )

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

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get match before deletion to revert stats
    const match = await getMatchById(params.id)

    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      )
    }

    // Revert player stats if match was completed
    if (match.status === 'completed' && match.playerStats?.length > 0) {
      await Promise.all(
        match.playerStats.map(stat =>
          decrementPlayerStats(stat.playerId, {
            goals: stat.goals,
            assists: stat.assists,
            matchesPlayed: 1
          })
        )
      )
    }

    // Delete the match
    await deleteMatch(params.id)

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