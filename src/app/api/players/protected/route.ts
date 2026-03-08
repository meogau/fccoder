import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { createPlayer, getAllPlayers, getPlayerByShirtNumber } from '@/lib/db/playerModel'

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

    // Check if shirt number already exists
    const existingPlayer = await getPlayerByShirtNumber(body.shirtNumber)
    if (existingPlayer) {
      return NextResponse.json(
        { success: false, error: 'Shirt number already exists' },
        { status: 400 }
      )
    }

    // Check if trying to create a captain when one already exists
    if (body.teamRole === 'captain') {
      const allPlayers = await getAllPlayers({ isActive: true })
      const existingCaptain = allPlayers.find(p => p.teamRole === 'captain')
      if (existingCaptain) {
        return NextResponse.json(
          { success: false, error: 'A captain already exists. Please choose vice-captain or member role.' },
          { status: 400 }
        )
      }
    }

    // Create player with initial stats
    const player = await createPlayer({
      name: body.name,
      shirtNumber: body.shirtNumber,
      position: body.position,
      birthYear: body.birthYear,
      nationality: body.nationality || '',
      bio: body.bio || '',
      devRole: body.devRole,
      teamRole: body.teamRole || 'member',
      avatar: body.avatar || '',
      joinDate: body.joinDate || new Date().toISOString(),
      isActive: body.isActive ?? true,
      phoneNumber: body.phoneNumber || '',
      telegramChatId: body.telegramChatId || '',
      goals: 0,
      assists: 0,
      matchesPlayed: 0
    })

    return NextResponse.json(
      { success: true, data: player },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('POST /api/players/protected error:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to create player' },
      { status: 500 }
    )
  }
}

export { authenticatedPOST as POST }
