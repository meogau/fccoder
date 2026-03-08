import { NextRequest, NextResponse } from 'next/server'
import { getMatchById } from '@/lib/db/matchModel'

export const revalidate = 60

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('GET match details - Starting request for ID:', params.id)

    const match = await getMatchById(params.id)
    console.log('Found match:', !!match, match ? `Title: ${match.opponent}` : 'No match found')

    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: match
    })
  } catch (error) {
    console.error('GET /api/matches/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch match' },
      { status: 500 }
    )
  }
}