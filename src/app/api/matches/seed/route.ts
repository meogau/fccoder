import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Match from '@/models/Match'

export async function POST() {
  try {
    await connectDB()
    
    // Clear existing matches
    await Match.deleteMany({})
    console.log('Cleared existing matches')
    
    // Create sample matches
    const sampleMatches = [
      {
        opponent: 'Tech United',
        date: new Date('2024-10-15T14:00:00Z'),
        venue: 'FC Coder Stadium',
        isHome: true,
        goalsFor: 2,
        goalsAgainst: 1,
        status: 'completed',
        competition: 'Developer League',
        playerStats: []
      },
      {
        opponent: 'Code Warriors',
        date: new Date('2024-10-22T16:30:00Z'),
        venue: 'Silicon Arena',
        isHome: false,
        goalsFor: 0,
        goalsAgainst: 0,
        status: 'scheduled',
        competition: 'Developer League',
        playerStats: []
      },
      {
        opponent: 'Bug Hunters FC',
        date: new Date('2024-09-30T13:00:00Z'),
        venue: 'FC Coder Stadium',
        isHome: true,
        goalsFor: 3,
        goalsAgainst: 2,
        status: 'completed',
        competition: 'Friendly',
        playerStats: []
      }
    ]
    
    const createdMatches = await Match.create(sampleMatches)
    console.log('Created matches:', createdMatches.length)
    
    return NextResponse.json({
      success: true,
      message: `Created ${createdMatches.length} sample matches`,
      data: createdMatches.map(m => ({ id: m._id, opponent: m.opponent }))
    })
  } catch (error) {
    console.error('Error seeding matches:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to seed matches' },
      { status: 500 }
    )
  }
}