import { NextRequest, NextResponse } from 'next/server'

// Telegram webhook endpoint to receive messages from users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log incoming webhook data for debugging
    console.log('Telegram webhook received:', JSON.stringify(body, null, 2))
    
    // Extract message data
    if (body.message) {
      const chatId = body.message.chat.id
      const username = body.message.from.username
      const firstName = body.message.from.first_name
      const lastName = body.message.from.last_name
      const messageText = body.message.text
      
      console.log(`New message from ${firstName} ${lastName} (@${username}):`)
      console.log(`Chat ID: ${chatId}`)
      console.log(`Message: ${messageText}`)
      
      // If user sends /start, try to auto-link or respond with instructions
      if (messageText === '/start' || messageText?.startsWith('/start ')) {
        const startParam = messageText.split(' ')[1] // Get parameter after /start
        
        if (startParam?.startsWith('player_')) {
          // Auto-link player
          const playerId = startParam.replace('player_', '')
          const linked = await linkPlayerToChatId(playerId, chatId.toString())
          
          if (linked) {
            await sendTelegramMessage(chatId.toString(), `🎉 Chào mừng ${firstName} đến với FC Coder!

✅ Tài khoản đã được liên kết thành công!
🔔 Bạn sẽ nhận thông báo tự động khi ghi bàn hoặc kiến tạo
⚽️ Chúc bạn thi đấu tốt!`)
          } else {
            await sendTelegramMessage(chatId.toString(), `❌ Không thể liên kết tài khoản. Vui lòng liên hệ admin.
            
Your Chat ID: ${chatId}`)
          }
        } else {
          // Try to find player by name or show generic welcome
          const playerFound = await findPlayerByName(firstName, lastName, chatId.toString())
          
          if (!playerFound) {
            await sendTelegramMessage(chatId.toString(), `👋 Chào mừng ${firstName}!

Để nhận thông báo trận đấu FC Coder, vui lòng liên hệ admin với thông tin:
📱 Chat ID: ${chatId}
👤 Tên: ${firstName} ${lastName}

Admin sẽ liên kết tài khoản cho bạn! ⚽️`)
          }
        }
      }
      
      // Auto-respond to any message
      if (messageText && messageText !== '/start') {
        await sendTelegramMessage(chatId.toString(), `Cảm ơn tin nhắn của bạn! 
        
Your Chat ID: ${chatId}
        
Bot này dùng để gửi thông báo kết quả trận đấu FC Coder. Bạn sẽ nhận được tin nhắn khi có bàn thắng hoặc kiến tạo! ⚽️`)
      }
    }
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function sendTelegramMessage(chatId: string, message: string): Promise<boolean> {
  try {
    const TELEGRAM_BOT_TOKEN = '8322005416:AAEjBxVegZsJrFFEEh80R0KwM6_cJeurJ9k'
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    })

    const result = await response.json()
    
    if (result.ok) {
      console.log(`Message sent successfully to chat ID ${chatId}`)
      return true
    } else {
      console.error(`Failed to send message to chat ID ${chatId}:`, result)
      return false
    }
  } catch (error) {
    console.error(`Error sending Telegram message to chat ID ${chatId}:`, error)
    return false
  }
}

// Helper: Link player to chat ID
async function linkPlayerToChatId(playerId: string, chatId: string): Promise<boolean> {
  try {
    const { default: Player } = await import('@/models/Player')
    const { default: connectDB } = await import('@/lib/mongodb')
    
    await connectDB()
    
    const player = await Player.findByIdAndUpdate(playerId, {
      telegramChatId: chatId
    })
    
    if (player) {
      console.log(`Linked player ${player.name} (${playerId}) to chat ID ${chatId}`)
      return true
    }
    
    return false
  } catch (error) {
    console.error('Error linking player to chat ID:', error)
    return false
  }
}

// Helper: Find player by name and auto-link
async function findPlayerByName(firstName: string, lastName: string, chatId: string): Promise<boolean> {
  try {
    const { default: Player } = await import('@/models/Player')
    const { default: connectDB } = await import('@/lib/mongodb')
    
    await connectDB()
    
    const fullName = `${firstName} ${lastName}`.trim()
    
    // Try exact match first
    let player = await Player.findOne({ 
      name: { $regex: new RegExp(fullName, 'i') },
      telegramChatId: { $exists: false }
    })
    
    // Try first name only
    if (!player) {
      player = await Player.findOne({ 
        name: { $regex: new RegExp(firstName, 'i') },
        telegramChatId: { $exists: false }
      })
    }
    
    if (player) {
      await Player.findByIdAndUpdate(player._id, {
        telegramChatId: chatId
      })
      
      await sendTelegramMessage(chatId, `🎉 Tuyệt vời! Đã tự động liên kết với tài khoản của ${player.name}!

✅ Bạn sẽ nhận thông báo khi ghi bàn hoặc kiến tạo
⚽️ Chúc bạn thi đấu tốt!`)
      
      console.log(`Auto-linked ${fullName} to player ${player.name} (${player._id})`)
      return true
    }
    
    return false
  } catch (error) {
    console.error('Error finding player by name:', error)
    return false
  }
}