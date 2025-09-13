import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Match from '@/models/Match'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const sort = searchParams.get('sort') || 'date'
    const order = searchParams.get('order') || 'desc'
    
    let query: any = {}
    if (status) query.status = status
    
    const sortObj: any = {}
    sortObj[sort] = order === 'desc' ? -1 : 1
    
    const skip = (page - 1) * limit
    
    const matches = await Match.find(query)
      .populate('playerStats.playerId', 'name shirtNumber position')
      .sort(sortObj)
      .limit(limit)
      .skip(skip)
    
    const total = await Match.countDocuments(query)
    
    return NextResponse.json({ 
      success: true, 
      data: matches,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
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

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const match = new Match(body)
    await match.save()
    
    await match.populate('playerStats.playerId', 'name shirtNumber position')
    
    return NextResponse.json(
      { success: true, data: match },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('POST /api/matches error:', error)
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { success: false, error: validationErrors.join(', ') },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create match' },
      { status: 500 }
    )
  }
}