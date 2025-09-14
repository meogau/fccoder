// Telegram notification service for FC Coder

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'your-telegram-bot-token'

interface TelegramMessage {
  phoneNumber: string
  message: string
}

export async function sendTelegramMessage(phoneNumber: string, message: string): Promise<boolean> {
  try {
    // First, we need to get the chat ID from the phone number
    // This is a simplified approach - in reality, users need to start a conversation with the bot first
    const chatId = await getChatIdFromPhoneNumber(phoneNumber)
    
    if (!chatId) {
      console.log(`No chat ID found for phone number: ${phoneNumber}`)
      return false
    }

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
      console.log(`Message sent successfully to ${phoneNumber}`)
      return true
    } else {
      console.error(`Failed to send message to ${phoneNumber}:`, result)
      return false
    }
  } catch (error) {
    console.error(`Error sending Telegram message to ${phoneNumber}:`, error)
    return false
  }
}

// This function would need to be implemented based on your bot's user management
// For now, it's a placeholder that returns null
async function getChatIdFromPhoneNumber(phoneNumber: string): Promise<string | null> {
  // In a real implementation, you would:
  // 1. Store user chat IDs when they first interact with your bot
  // 2. Map phone numbers to chat IDs in your database
  // 3. Use Telegram's API to get user info if available
  
  // For demonstration purposes, returning null
  // You would query your database here to get the chat ID
  console.log(`Looking up chat ID for phone number: ${phoneNumber}`)
  return null
}

export async function sendMatchResultNotifications(playerStats: Array<{
  playerId: string
  goals: number
  assists: number
}>): Promise<void> {
  try {
    // Import Player model dynamically to avoid circular dependencies
    const { default: Player } = await import('@/models/Player')
    
    for (const stat of playerStats) {
      if (stat.goals > 0 || stat.assists > 0) {
        const player = await Player.findById(stat.playerId)
        
        if (player && player.phoneNumber) {
          const message = `🎉 Xin chúc mừng hôm nay bạn đã ghi <b>${stat.goals}</b> bàn và có <b>${stat.assists}</b> kiến tạo, hãy tiếp tục phát huy ở trận đấu tới nhé! ⚽️`
          
          await sendTelegramMessage(player.phoneNumber, message)
        }
      }
    }
  } catch (error) {
    console.error('Error sending match result notifications:', error)
  }
}