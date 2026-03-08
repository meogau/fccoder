import { NextRequest, NextResponse } from 'next/server'
import { getAllMatches } from '@/lib/db/matchModel'

export const revalidate = 60
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const page = parseInt(searchParams.get('page') || '1')

    const result = await getAllMatches({ status, limit, page })

    const totalPages = limit ? Math.ceil(result.total / limit) : 1

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        page,
        limit: limit || result.total,
        total: result.total,
        pages: totalPages
      }
    })
  } catch (error) {
    console.error('GET /api/matches error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch matches' },
      { status: 500 }
    )
  }
}