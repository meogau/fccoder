import { NextRequest, NextResponse } from 'next/server'
import { getPlayerById } from '@/lib/db/playerModel'

// Enable caching for 60 seconds
export const revalidate = 60

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get player
    const player = await getPlayerById(params.id)

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
