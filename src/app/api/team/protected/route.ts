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
    console.log('PUT /api/team/protected - Body received:', body)
    
    let team = await Team.findOne({ isActive: true })
    console.log('PUT /api/team/protected - Existing team:', team)
    
    if (!team) {
      // Create new team if none exists
      console.log('Creating new team...')
      team = new Team(body)
    } else {
      // Update existing team
      console.log('Updating existing team...')
      Object.assign(team, body)
    }
    
    console.log('Team before save:', team)
    await team.save()
    console.log('Team after save:', team)
    
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