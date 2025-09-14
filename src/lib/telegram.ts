// Telegram notification service for FC Coder

const TELEGRAM_BOT_TOKEN = '8322005416:AAEjBxVegZsJrFFEEh80R0KwM6_cJeurJ9k'

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

async function getChatIdFromPhoneNumber(phoneNumber: string): Promise<string | null> {
  // Clean phone number format
  const cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/[()-]/g, '')
  
  try {
    // In browser/client environment, we can't access filesystem
    // So we'll use a simple hardcoded mapping for now
    const PHONE_TO_CHAT_ID_MAP: Record<string, string> = {
      // Add your phone numbers and corresponding Telegram chat IDs here
      // Example: '+84123456789': '123456789'
      // Players need to message the bot first to get their chat ID
      
      // You can add mappings here manually:
      // '+84123456789': '123456789',
    }
    
    const chatId = PHONE_TO_CHAT_ID_MAP[cleanPhone]
    
    if (chatId) {
      console.log(`Found chat ID ${chatId} for phone number: ${phoneNumber}`)
      return chatId
    }
    
    console.log(`No chat ID found for phone number: ${phoneNumber}`)
    console.log('To add mapping, players need to:')
    console.log('1. Start a conversation with the bot')
    console.log('2. Send /start to get their chat ID')
    console.log('3. Admin adds the mapping manually in code')
    
    return null
  } catch (error) {
    console.error('Error getting chat ID:', error)
    return null
  }
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