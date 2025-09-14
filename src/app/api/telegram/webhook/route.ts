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
      
      // If user sends /start, respond with their chat ID
      if (messageText === '/start') {
        await sendTelegramMessage(chatId.toString(), `Chào mừng ${firstName}! 
        
Your Chat ID là: ${chatId}
        
Để nhận thông báo kết quả trận đấu, hãy cung cấp Chat ID này cho admin để liên kết với số điện thoại của bạn.`)
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