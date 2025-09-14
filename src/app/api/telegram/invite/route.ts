import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Player from '@/models/Player'

// Generate invite link for a player
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

    const { playerId } = await request.json()

    if (!playerId) {
      return NextResponse.json(
        { success: false, error: 'Player ID is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Get player info
    const player = await Player.findById(playerId)
    if (!player) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      )
    }

    // Create invite link
    const inviteLink = `https://t.me/YOUR_BOT_USERNAME?start=player_${playerId}`
    
    // Create shareable message
    const inviteMessage = `
🏆 Chào ${player.name}!

Bạn đã được thêm vào đội FC Coder! Để nhận thông báo kết quả trận đấu tự động:

👆 Nhấn link này: ${inviteLink}
🤖 Bot sẽ tự động liên kết tài khoản của bạn
🔔 Nhận thông báo khi ghi bàn hoặc kiến tạo!

⚽️ Chúc bạn thi đấu tốt!
    `.trim()

    return NextResponse.json({
      success: true,
      inviteLink,
      inviteMessage,
      playerName: player.name
    })
  } catch (error) {
    console.error('POST /api/telegram/invite error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate invite' },
      { status: 500 }
    )
  }
}

// Get all players without telegram links
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

    await connectDB()

    // Get players without telegram chat ID
    const playersWithoutTelegram = await Player.find({
      isActive: true,
      $or: [
        { telegramChatId: { $exists: false } },
        { telegramChatId: null },
        { telegramChatId: '' }
      ]
    }).select('name shirtNumber position')

    // Get players with telegram
    const playersWithTelegram = await Player.find({
      isActive: true,
      telegramChatId: { $exists: true, $ne: null, $ne: '' }
    }).select('name shirtNumber position telegramChatId')

    return NextResponse.json({
      success: true,
      playersWithoutTelegram,
      playersWithTelegram,
      summary: {
        total: playersWithoutTelegram.length + playersWithTelegram.length,
        withTelegram: playersWithTelegram.length,
        needInvite: playersWithoutTelegram.length
      }
    })
  } catch (error) {
    console.error('GET /api/telegram/invite error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get player status' },
      { status: 500 }
    )
  }
}