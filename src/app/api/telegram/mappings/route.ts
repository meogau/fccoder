import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

const MAPPINGS_FILE = path.join(process.cwd(), 'telegram-mappings.json')

// Get current mappings
export async function GET(request: NextRequest) {
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

    // Read mappings from file
    let mappings: Record<string, string> = {}
    try {
      if (fs.existsSync(MAPPINGS_FILE)) {
        const data = fs.readFileSync(MAPPINGS_FILE, 'utf8')
        mappings = JSON.parse(data)
      }
    } catch (error) {
      console.error('Error reading mappings file:', error)
    }

    return NextResponse.json({
      success: true,
      mappings
    })
  } catch (error) {
    console.error('GET /api/telegram/mappings error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get mappings' },
      { status: 500 }
    )
  }
}

// Update mappings
export async function POST(request: NextRequest) {
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

    const { phoneNumber, chatId } = await request.json()

    if (!phoneNumber || !chatId) {
      return NextResponse.json(
        { success: false, error: 'Phone number and chat ID are required' },
        { status: 400 }
      )
    }

    // Read existing mappings
    let mappings: Record<string, string> = {}
    try {
      if (fs.existsSync(MAPPINGS_FILE)) {
        const data = fs.readFileSync(MAPPINGS_FILE, 'utf8')
        mappings = JSON.parse(data)
      }
    } catch (error) {
      console.error('Error reading existing mappings:', error)
    }

    // Clean phone number format
    const cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/[()-]/g, '')
    
    // Update mappings
    mappings[cleanPhone] = chatId

    // Save to file
    try {
      fs.writeFileSync(MAPPINGS_FILE, JSON.stringify(mappings, null, 2))
    } catch (error) {
      console.error('Error saving mappings file:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to save mapping' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Mapping added: ${cleanPhone} -> ${chatId}`
    })
  } catch (error) {
    console.error('POST /api/telegram/mappings error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add mapping' },
      { status: 500 }
    )
  }
}