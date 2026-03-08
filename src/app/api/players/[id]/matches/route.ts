import { NextRequest, NextResponse } from 'next/server'
import { getMatchesByPlayerId } from '@/lib/db/matchModel'

// Enable caching for 60 seconds
export const revalidate = 60

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matches = await getMatchesByPlayerId(params.id)

    return NextResponse.json({
      success: true,
      data: matches
    })
  } catch (error) {
    console.error('GET /api/players/[id]/matches error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch player matches' },
      { status: 500 }
    )
  }
}
