# 🚀 FC Coder - Deployment Guide

## Vercel Deployment Instructions

### 1. Prerequisites
- GitHub account
- MongoDB Atlas account (for production database)
- Vercel account

### 2. Setup MongoDB Atlas

1. **Create MongoDB Atlas Account**: https://www.mongodb.com/cloud/atlas
2. **Create New Cluster**:
   - Choose free tier (M0)
   - Select region closest to users
   - Name: `fc-coder-cluster`

3. **Create Database User**:
   - Username: `fc-coder-admin`
   - Password: Generate strong password
   - Roles: Read and write to any database

4. **Network Access**:
   - Add IP: `0.0.0.0/0` (Allow access from anywhere)
   - Or specific IPs for security

5. **Get Connection String**:
   ```
   mongodb+srv://fc-coder-admin:<password>@fc-coder-cluster.xxxxx.mongodb.net/fccoder?retryWrites=true&w=majority
   ```

### 3. Deploy to Vercel

#### Option A: GitHub Integration (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - FC Coder"
   git branch -M main
   git remote add origin https://github.com/yourusername/fc-coder.git
   git push -u origin main
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to https://vercel.com
   - Click "New Project"
   - Import from GitHub: Select your repository
   - Configure project:
     - Framework: Next.js
     - Root Directory: `./`
     - Build Command: `npm run build`
     - Output Directory: `.next`

#### Option B: Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login and Deploy**:
   ```bash
   vercel login
   vercel --prod
   ```

### 4. Environment Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

```env
MONGODB_URI=mongodb+srv://fc-coder-admin:<password>@fc-coder-cluster.xxxxx.mongodb.net/fccoder

JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters-long

ADMIN_EMAIL=admin@fccoder.com

ADMIN_PASSWORD_HASH=$2a$10$qzXYJvyY6Gkd5jmNn2zAIeY8s7K7Zz9vA1Q2W3E4R5T6Y7U8I9O0P1
```

#### Generate Secure Values:

**JWT Secret**:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Password Hash** (for password "admin123"):
```bash
node -e "console.log(require('bcryptjs').hashSync('admin123', 10))"
```

### 5. Domain Configuration (Optional)

1. **Custom Domain**:
   - Vercel Dashboard → Project → Settings → Domains
   - Add your domain: `fccoder.com`
   - Configure DNS records as instructed

2. **SSL Certificate**:
   - Automatic with Vercel
   - No additional configuration needed

## 🎯 Post-Deployment

### 1. Test Deployment
- Visit your Vercel URL (e.g., `https://fc-coder.vercel.app`)
- Test login: `admin@fccoder.com` / `admin123`
- Create sample players and matches
- Test avatar upload (uses base64 in production)

### 2. Database Setup
- Login to admin panel
- Add initial players with roles
- Create sample matches
- Test all CRUD operations

### 3. Production Considerations

#### Avatar Storage
Current implementation uses base64 for production. For better performance:

**Option 1: Cloudinary**
```bash
npm install cloudinary
```

**Option 2: AWS S3 + CloudFront**
```bash
npm install @aws-sdk/client-s3
```

**Option 3: Vercel Blob Storage**
```bash
npm install @vercel/blob
```

#### Performance Optimization
- Enable Next.js Image Optimization
- Configure CDN for static assets
- Database indexing optimization
- API response caching

#### Security Enhancements
- Rate limiting for APIs
- Input sanitization
- CORS configuration
- Security headers

## 📊 Environment-Specific Features

### Development
- Local MongoDB
- File-based avatar storage
- Hot reloading
- Debug logging

### Production
- MongoDB Atlas
- Base64 avatar encoding
- Optimized builds
- Error tracking

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   npm run build
   # Check for TypeScript errors
   ```

2. **Database Connection**:
   - Verify MongoDB Atlas connection string
   - Check network access settings
   - Confirm database user permissions

3. **Environment Variables**:
   - Ensure all required vars are set
   - Check variable names match exactly
   - Verify base64 encoding for secrets

4. **Avatar Upload Issues**:
   - Production uses base64 storage
   - File size limits still apply
   - MIME type validation active

### Debug Commands

```bash
# Local build test
npm run build
npm start

# Check environment
node -e "console.log(process.env)"

# MongoDB connection test
node -e "require('./src/lib/mongodb.ts')"
```

## 🚀 Success Metrics

After successful deployment, you should have:
- ✅ Live website at Vercel URL
- ✅ Admin authentication working
- ✅ Player management functional
- ✅ Match scheduling active
- ✅ Avatar upload working
- ✅ Database operations stable
- ✅ Mobile responsive design
- ✅ Cyberpunk theme consistent

**Demo URL**: https://your-project-name.vercel.app
**Admin Login**: admin@fccoder.com / admin123

---

*🎯 Ready for production deployment! The FC Coder website will be live with full functionality including player management, match scheduling, and cyberpunk aesthetics.*