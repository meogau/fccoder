import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { updatePlayer, deletePlayer, getAllPlayers, getPlayerById, getPlayerByShirtNumber } from '@/lib/db/playerModel'

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

    const body = await request.json()

    // Check if shirt number already exists (excluding current player)
    if (body.shirtNumber) {
      const existingPlayer = await getPlayerByShirtNumber(body.shirtNumber)
      if (existingPlayer && existingPlayer.id !== params.id) {
        return NextResponse.json(
          { success: false, error: 'Shirt number already exists' },
          { status: 400 }
        )
      }
    }

    // Check if trying to update to captain when one already exists
    if (body.teamRole === 'captain') {
      const allPlayers = await getAllPlayers({ isActive: true })
      const existingCaptain = allPlayers.find(p => p.teamRole === 'captain' && p.id !== params.id)
      if (existingCaptain) {
        return NextResponse.json(
          { success: false, error: 'A captain already exists. Please choose vice-captain or member role.' },
          { status: 400 }
        )
      }
    }

    const player = await updatePlayer(params.id, body)

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

    // Check if player exists
    const player = await getPlayerById(params.id)
    if (!player) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      )
    }

    await deletePlayer(params.id)

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
