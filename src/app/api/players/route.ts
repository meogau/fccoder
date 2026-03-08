import { NextRequest, NextResponse } from 'next/server'
import { getAllPlayers } from '@/lib/db/playerModel'

// Enable caching for 60 seconds
export const revalidate = 60

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const position = searchParams.get('position')
    const isActiveParam = searchParams.get('isActive')

    // Build filters
    const filters: any = {}
    if (position) filters.position = position
    if (isActiveParam !== null) filters.isActive = isActiveParam === 'true'

    // Get players
    const players = await getAllPlayers(Object.keys(filters).length > 0 ? filters : undefined)

    // Sort by shirt number (ascending)
    const sortedPlayers = players.sort((a, b) => a.shirtNumber - b.shirtNumber)

    return NextResponse.json({
      success: true,
      data: sortedPlayers
    })
  } catch (error) {
    console.error('GET /api/players error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch players' },
      { status: 500 }
    )
  }
}
