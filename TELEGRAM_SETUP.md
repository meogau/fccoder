# 🤖 Telegram Bot Setup Guide

## Bot Information
- **Bot Token**: `8322005416:AAEjBxVegZsJrFFEEh80R0KwM6_cJeurJ9k`
- **Bot Username**: Contact @BotFather on Telegram to get the username
- **Webhook URL**: `https://fccoder-cii3l6g4m-meogaus-projects.vercel.app/api/telegram/webhook`

## 🚀 How to Setup Notifications

### Step 1: Players Message the Bot
1. Players need to find your bot on Telegram (ask @BotFather for bot username)
2. Start a conversation with the bot
3. Send `/start` command
4. Bot will respond with their **Chat ID**

### Step 2: Admin Maps Phone Numbers to Chat IDs
1. Get the Chat ID from players (from Step 1)
2. In the code, edit `src/lib/telegram.ts`
3. Add mapping in the `PHONE_TO_CHAT_ID_MAP` object:

```typescript
const PHONE_TO_CHAT_ID_MAP: Record<string, string> = {
  '+84123456789': '123456789',  // Example mapping
  '+84987654321': '987654321',  // Add more as needed
}
```

### Step 3: Test Notifications
1. Update a match result with goals/assists
2. Players should receive congratulatory messages!

## 📱 Message Format
When players score goals or assists, they receive:

> 🎉 Xin chúc mừng hôm nay bạn đã ghi **2** bàn và có **1** kiến tạo, hãy tiếp tục phát huy ở trận đấu tới nhé! ⚽️

## 🔧 Bot Webhook Setup (Done)
The webhook is already configured at:
`https://fccoder-cii3l6g4m-meogaus-projects.vercel.app/api/telegram/webhook`

To update webhook URL if needed:
```bash
curl -X POST "https://api.telegram.org/bot8322005416:AAEjBxVegZsJrFFEEh80R0KwM6_cJeurJ9k/setWebhook" \
     -d "url=https://your-domain.com/api/telegram/webhook"
```

## 🧪 Testing
1. Message the bot and send `/start`
2. Note your Chat ID 
3. Add your phone number mapping in code
4. Deploy changes
5. Update a match result with your player stats
6. You should receive a notification!

## 📝 Notes
- Players only get notifications for games where they have goals > 0 OR assists > 0
- Phone numbers are only visible to admins
- Notifications are sent asynchronously (won't block match updates)
- All Telegram interactions are logged in server console

## 🚀 Ready to Use!
The bot is now live and ready to send notifications when match results are updated! 🎉