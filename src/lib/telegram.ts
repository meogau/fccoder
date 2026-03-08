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
    // Try to find user by phone number using Telegram API
    const chatId = await findUserByPhoneNumber(cleanPhone)
    
    if (chatId) {
      console.log(`Found chat ID ${chatId} for phone number: ${phoneNumber}`)
      return chatId
    }
    
    console.log(`No chat ID found for phone number: ${phoneNumber}`)
    return null
  } catch (error) {
    console.error('Error getting chat ID:', error)
    return null
  }
}

// Advanced method: Find user by phone number (requires special permissions)
async function findUserByPhoneNumber(phoneNumber: string): Promise<string | null> {
  try {
    // Method 1: Try using contacts.importContacts (requires phone number in contacts)
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`
    
    const response = await fetch(url)
    const result = await response.json()
    
    if (result.ok && result.result.length > 0) {
      // Search through recent updates for users with matching phone numbers
      // This only works if the user has contacted the bot before
      for (const update of result.result) {
        if (update.message?.contact?.phone_number === phoneNumber) {
          return update.message.chat.id.toString()
        }
        
        // Also check if user has shared their contact info
        if (update.message?.from?.phone_number === phoneNumber) {
          return update.message.chat.id.toString()
        }
      }
    }
    
    // Method 2: Try using username/phone lookup (limited functionality)
    // This would require the user to have a public username or have contacted bot before
    
    return null
  } catch (error) {
    console.error('Error finding user by phone number:', error)
    return null
  }
}

export async function sendMatchResultNotifications(playerStats: Array<{
  playerId: string
  goals: number
  assists: number
}>): Promise<void> {
  try {
    const { getPlayerById } = await import('@/lib/db/playerModel')

    for (const stat of playerStats) {
      if (stat.goals > 0 || stat.assists > 0) {
        const player = await getPlayerById(stat.playerId)

        if (player) {
          const message = `🎉 Xin chúc mừng hôm nay bạn đã ghi <b>${stat.goals}</b> bàn và có <b>${stat.assists}</b> kiến tạo, hãy tiếp tục phát huy ở trận đấu tới nhé! ⚽️`

          // Method 1: Try using direct telegramChatId (preferred)
          if (player.telegramChatId) {
            console.log(`Sending direct notification to ${player.name} via chat ID: ${player.telegramChatId}`)
            await sendTelegramMessageToChatId(player.telegramChatId, message)
          }
          // Method 2: Fall back to phone number mapping (legacy)
          else if (player.phoneNumber) {
            console.log(`Trying phone mapping for ${player.name}: ${player.phoneNumber}`)
            await sendTelegramMessage(player.phoneNumber, message)
          }
          else {
            console.log(`No Telegram contact method for ${player.name}. Player needs to join bot first.`)
          }
        }
      }
    }
  } catch (error) {
    console.error('Error sending match result notifications:', error)
  }
}

// Direct message to chat ID (more reliable)
export async function sendTelegramMessageToChatId(chatId: string, message: string): Promise<boolean> {
  try {
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