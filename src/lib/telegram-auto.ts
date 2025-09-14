// Alternative approach: Auto-invite players to bot
const TELEGRAM_BOT_TOKEN = '8322005416:AAEjBxVegZsJrFFEEh80R0KwM6_cJeurJ9k'

// Method 1: Create invite links that auto-start conversation
export async function createPlayerInviteLink(playerName: string, playerId: string): Promise<string> {
  try {
    // Create deep link that will auto-start conversation with player context
    const startParam = `player_${playerId}`
    const inviteLink = `https://t.me/YourBotUsername?start=${startParam}`
    
    return inviteLink
  } catch (error) {
    console.error('Error creating invite link:', error)
    return ''
  }
}

// Method 2: Send invite via SMS/other channels
export async function sendInviteToPlayer(phoneNumber: string, playerName: string): Promise<boolean> {
  try {
    const message = `
🏆 Chào ${playerName}! 

Bạn đã được thêm vào đội FC Coder. Để nhận thông báo kết quả trận đấu tự động qua Telegram, vui lòng:

👆 Nhấn link này: https://t.me/YourBotUsername?start=welcome
💬 Bot sẽ tự động gửi thông báo khi bạn ghi bàn hoặc kiến tạo!

⚽️ Chúc bạn thi đấu tốt!
`
    
    // This could be sent via:
    // - SMS service (Twilio, etc.)
    // - Email 
    // - WhatsApp
    // - Push notification
    
    console.log(`Invite message for ${playerName} (${phoneNumber}):`)
    console.log(message)
    
    return true
  } catch (error) {
    console.error('Error sending invite:', error)
    return false
  }
}

// Method 3: Auto-detect when user joins via invite link
export async function handlePlayerJoinedBot(chatId: string, startParam?: string): Promise<void> {
  try {
    if (startParam?.startsWith('player_')) {
      const playerId = startParam.replace('player_', '')
      
      // Auto-link this chat ID to the player
      await linkPlayerToChatId(playerId, chatId)
      
      // Send welcome message
      await sendTelegramMessage(chatId, `
🎉 Chào mừng bạn đến với FC Coder Bot!

✅ Tài khoản đã được liên kết thành công
🔔 Bạn sẽ nhận thông báo khi ghi bàn/kiến tạo
⚽️ Chúc bạn thi đấu tốt!
      `)
    } else {
      // Generic welcome for other users
      await sendTelegramMessage(chatId, `
👋 Chào mừng đến với FC Coder Bot!

Để liên kết tài khoản, vui lòng liên hệ admin với Chat ID của bạn: ${chatId}
      `)
    }
  } catch (error) {
    console.error('Error handling player joined bot:', error)
  }
}

// Helper: Link player to chat ID in database
async function linkPlayerToChatId(playerId: string, chatId: string): Promise<void> {
  try {
    // Import Player model dynamically
    const { default: Player } = await import('@/models/Player')
    
    // Update player with chat ID
    await Player.findByIdAndUpdate(playerId, {
      telegramChatId: chatId
    })
    
    console.log(`Linked player ${playerId} to chat ID ${chatId}`)
  } catch (error) {
    console.error('Error linking player to chat ID:', error)
  }
}

async function sendTelegramMessage(chatId: string, message: string): Promise<boolean> {
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
    return result.ok
  } catch (error) {
    console.error('Error sending message:', error)
    return false
  }
}