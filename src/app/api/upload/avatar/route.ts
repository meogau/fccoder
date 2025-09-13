import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { verifyToken } from '@/lib/auth'

// Check if we're in production/Vercel environment
const isProduction = process.env.NODE_ENV === 'production' && process.env.VERCEL

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

    const formData = await request.formData()
    const file = formData.get('avatar') as File
    const playerName = formData.get('playerName') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Only image files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name)
    const timestamp = Date.now()
    const sanitizedPlayerName = playerName?.replace(/[^a-zA-Z0-9]/g, '_') || 'player'
    const filename = `${sanitizedPlayerName}_${timestamp}${fileExtension}`

    let avatarUrl = ''

    if (isProduction) {
      // In production, convert to base64 data URL as fallback
      // In real production, you'd use Cloudinary, AWS S3, etc.
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      avatarUrl = `data:${file.type};base64,${base64}`
    } else {
      // Local development: save to public/avatars
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const publicPath = path.join(process.cwd(), 'public', 'avatars', filename)
      await writeFile(publicPath, buffer)
      avatarUrl = `/avatars/${filename}`
    }

    return NextResponse.json({
      success: true,
      avatarUrl,
      message: 'Avatar uploaded successfully'
    })

  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload avatar' },
      { status: 500 }
    )
  }
}