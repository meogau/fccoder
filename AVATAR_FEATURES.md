# 🖼️ Avatar Features - FC Coder

## 🎯 Tính Năng Avatar Mới Thêm

### 📸 **Upload Avatar cho Cầu Thủ**
- **Admin Form**: Upload ảnh đại diện khi thêm cầu thủ mới
- **File Validation**: Chỉ chấp nhận file ảnh (image/*), tối đa 5MB
- **Preview**: Xem trước ảnh trước khi submit
- **Auto Resize**: Ảnh được resize phù hợp với UI

### 🎨 **Hiển Thị Avatar**
- **Player Cards**: Avatar tròn với số áo overlay
- **Player Detail**: Avatar lớn trong trang profile
- **Admin List**: Mini avatar trong danh sách quản lý
- **Fallback**: Hiển thị số áo nếu không có avatar

## 🏗️ Cấu Trúc API Upload

### Upload Endpoint
```
POST /api/upload/avatar
Headers: Authorization: Bearer <JWT_TOKEN>
Body: FormData with 'avatar' file + 'playerName'
```

### Response
```javascript
{
  "success": true,
  "avatarUrl": "/avatars/PlayerName_timestamp.jpg",
  "message": "Avatar uploaded successfully"
}
```

## 🎯 UI Components

### **PlayerAvatar Component**
```javascript
<PlayerAvatar 
  src={player.avatar}
  alt={player.name}
  size="lg" // sm, md, lg, xl
  shirtNumber={player.shirtNumber}
/>
```

### **Avatar Preview trong Admin Form**
- Circular preview 128x128px
- Upload button với styling cyberpunk
- File info hiển thị (name, size)
- Real-time preview

## 📂 File Structure
```
public/
├── avatars/              # Uploaded avatar files
│   ├── PlayerName_timestamp.jpg
│   └── default-avatar.svg
src/
├── components/
│   └── PlayerAvatar.tsx  # Reusable avatar component
├── app/api/upload/avatar/
│   └── route.ts          # Upload API endpoint
```

## 🛡️ Security & Validation

### **Server-side Validation**
- JWT authentication required
- File type validation (image/*)
- File size limit (5MB)
- Sanitized filename generation

### **Client-side Validation**
- Image type checking
- Size limit warning
- Error handling with user feedback
- Preview generation with FileReader

## 🎨 Design Implementation

### **Avatar Styles**
- **Circular Design**: Rounded-full với border neon
- **Overlay Badge**: Số áo hiển thị ở góc phải dưới
- **Fallback UI**: Icon 👤 hoặc số áo khi không có ảnh
- **Hover Effects**: Scale và glow effects

### **Responsive Sizes**
- **sm**: 32x32px (badges, small lists)
- **md**: 48x48px (player cards)  
- **lg**: 96x96px (player detail mobile)
- **xl**: 128x128px (player detail desktop)

## 🚀 Usage Flow

### **1. Admin Thêm Cầu Thủ**
```bash
1. Navigate: /admin/players
2. Click "addPlayer()" button
3. Upload avatar: Click "uploadImage()" 
4. Select image file (jpg, png, gif...)
5. Preview appears instantly
6. Fill other info và submit
7. Avatar uploaded to /public/avatars/
8. Player record updated với avatar URL
```

### **2. Hiển Thị Avatar**
```bash
1. Player Cards: Avatar + số áo overlay
2. Player Detail: Large avatar + info  
3. Admin List: Mini avatar preview
4. Fallback: Số áo nếu không có ảnh
```

## 🎯 Technical Details

### **File Naming Convention**
```javascript
// Generated filename format
PlayerName_timestamp.extension
// Example: Nguyen_Van_A_1694612345678.jpg
```

### **Database Schema Update**
```javascript
// Player model thêm field
avatar: { 
  type: String,
  trim: true 
}
```

### **Error Handling**
- File too large → User-friendly message
- Invalid file type → Warning popup
- Upload failed → Retry mechanism
- Missing token → Authentication error

## 🎨 UI/UX Improvements

### **Visual Feedback**
- Loading states during upload
- Success/error notifications  
- Progressive image loading
- Smooth transitions và animations

### **Accessibility**
- Alt text cho tất cả images
- Keyboard navigation support
- Screen reader compatibility
- High contrast support

## 🔧 Development Notes

### **Next.js Static Files**
- Images stored trong `/public/avatars/`
- Served statically bởi Next.js
- No CDN setup needed for demo

### **Production Considerations**
- Consider cloud storage (AWS S3, Cloudinary)
- Image optimization và compression
- CDN distribution
- Backup strategy

---

**✅ Avatar System Complete**

- ✅ Upload functionality với validation
- ✅ Multi-size avatar display
- ✅ Fallback handling
- ✅ Cyberpunk design integration
- ✅ Responsive across all screens
- ✅ Security implementation

**Demo**: Upload avatar tại `/admin/players` và xem hiển thị trong `/players` và player detail pages! 🎯