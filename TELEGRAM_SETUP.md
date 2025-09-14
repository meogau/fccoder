# 🤖 Telegram Bot Setup Guide - AUTOMATIC VERSION

## Bot Information
- **Bot Token**: `8322005416:AAEjBxVegZsJrFFEEh80R0KwM6_cJeurJ9k`
- **Bot Username**: Contact @BotFather on Telegram to get the username
- **Webhook URL**: `https://fccoder-ollsntm5r-meogaus-projects.vercel.app/api/telegram/webhook`

## 🎉 NEW: FULLY AUTOMATIC SETUP!

### ✅ **No More Manual Mapping!** 
Players can now join and get linked automatically!

### Step 1: Player Messages Bot (That's It!)
1. Player finds your bot on Telegram
2. Sends `/start` command
3. 🤖 **Bot automatically detects them by name**
4. ✅ **Account linked instantly!**
5. 🎉 **Ready to receive notifications!**

### Step 2: Nothing! (It's Automatic)
The bot will:
- ✅ Match player name from Telegram with database
- ✅ Save their Chat ID automatically  
- ✅ Send confirmation message
- ✅ Ready for notifications!

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

## 🧠 How the Auto-Detection Works
1. **Name Matching**: Bot compares Telegram first name + last name with player names in database
2. **Fuzzy Search**: Tries exact match first, then first name only
3. **Auto-Link**: Saves Telegram Chat ID to player profile
4. **Instant Ready**: Player immediately ready for notifications!

## 🎯 What Players See
```
👋 Chào mừng Nguyen Van A!

🎉 Tuyệt vời! Đã tự động liên kết với tài khoản của Nguyen Van A!

✅ Bạn sẽ nhận thông báo khi ghi bàn hoặc kiến tạo
⚽️ Chúc bạn thi đấu tốt!
```

## 🚀 Ready to Use - ZERO CONFIGURATION!
Players just need to message the bot - everything else is automatic! 🎉

**Live at**: https://fccoder-ollsntm5r-meogaus-projects.vercel.app