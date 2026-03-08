import { NextRequest, NextResponse } from 'next/server'
import { getTeamInfo } from '@/lib/db/teamModel'

export const revalidate = 60

export async function GET() {
  try {
    const team = await getTeamInfo()

    return NextResponse.json(
      { success: true, data: team },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/team error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team information' },
      { status: 500 }
    )
  }
}