import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Team from '@/models/Team'
import { verifyToken } from '@/lib/auth'

async function authenticatedPUT(request: NextRequest) {
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

    await connectDB()
    
    const body = await request.json()
    
    let team = await Team.findOne({ isActive: true })
    
    if (!team) {
      // Create new team if none exists
      team = new Team(body)
    } else {
      // Update existing team
      Object.assign(team, body)
    }
    
    await team.save()
    
    return NextResponse.json(
      { success: true, data: team },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('PUT /api/team/protected error:', error)
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { success: false, error: validationErrors.join(', ') },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update team information' },
      { status: 500 }
    )
  }
}

export { authenticatedPUT as PUT }