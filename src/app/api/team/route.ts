import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Team from '@/models/Team'

export async function GET() {
  try {
    await connectDB()
    
    let team = await Team.findOne({ isActive: true })
    
    // If no team exists, create a default one
    if (!team) {
      team = new Team({
        name: 'FC Coder',
        biography: 'A team of passionate developers who love both coding and football. We combine our technical skills with our love for the beautiful game, bringing innovation to every match.',
        foundedYear: 2024,
        location: 'Vietnam'
      })
      await team.save()
    }
    
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