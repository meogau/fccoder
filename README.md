# FC Coder - Official Website

> Where Code Meets Football ⚽💻

A full-stack web application for FC Coder, a unique football team composed entirely of programmers. Built with a "Code & Cyberpunk" theme featuring dark aesthetics, terminal-style interfaces, and developer-inspired UI elements.

## 🚀 Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS with custom cyberpunk theme
- **Database**: MongoDB with Mongoose ODM
- **Animations**: Framer Motion
- **Language**: TypeScript

## 🎨 Design Philosophy: Code & Cyberpunk

### Color Palette
- **Primary Dark**: `#0a192f` (Cyber Dark) & `#111111` (Cyber Darker)
- **Neon Accents**: 
  - Green: `#64ffda` (Primary)
  - Blue: `#00BFFF` (Secondary)
  - Pink: `#FF00FF` (Accent)
  - Orange: `#FFA500` (Highlight)

### Typography
- **UI/Headings**: Inter (Clean, modern sans-serif)
- **Code/Data**: Fira Code (Monospaced for terminal feel)

### Visual Elements
- Terminal-style interfaces with typing animations
- Code block aesthetics for content cards
- Git commit-style match history
- README.md layout for player profiles
- Neon border effects and glitch animations

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/                 # API routes
│   │   ├── players/         # Player CRUD operations
│   │   └── matches/         # Match CRUD operations
│   ├── admin/               # Admin management panel
│   ├── players/             # Player pages
│   ├── matches/             # Match history
│   └── page.tsx             # Homepage
├── components/              # Reusable UI components
├── lib/                     # Utilities (MongoDB connection)
└── models/                  # Mongoose schemas
```

## 🗃️ Database Models

### Player Schema
```javascript
{
  name: String,
  shirtNumber: Number,
  position: String,
  age: Number,
  nationality: String,
  bio: String,
  devRole: String,           // 🔑 Key feature: Developer role
  goals: Number,
  assists: Number,
  matchesPlayed: Number,
  isActive: Boolean,
  joinedDate: Date
}
```

### Match Schema
```javascript
{
  opponent: String,
  date: Date,
  venue: String,
  isHome: Boolean,
  goalsFor: Number,
  goalsAgainst: Number,
  status: String,
  playerStats: [{
    playerId: ObjectId,
    minutesPlayed: Number,
    goals: Number,
    assists: Number,
    // ... more stats
  }]
}
```

## 🎯 Key Features

### 🏠 Homepage
- Terminal-style hero section with typing animations
- Real-time next match display
- Team statistics in JSON format
- Cyberpunk grid background

### 👥 Squad Management
- Code-block style player cards
- Developer role integration (Frontend, Backend, DevOps, etc.)
- Advanced filtering by position and dev role
- Hover effects revealing player stats as code variables

### 📊 Player Profiles
- README.md inspired layout
- Component-style naming: `<PlayerName />`
- JSON formatted statistics
- Technical stack information

### 🏆 Match History
- Git commit log interface
- Color-coded results (WIN/LOSS/DRAW)
- Commit-style messages for match results
- Pagination and filtering

### ⚙️ Admin Panel
- Team management dashboard
- Player creation and management
- Match scheduling
- System statistics

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (running on localhost:27017)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fc-coder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your MongoDB URI
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on localhost:27017
   mongod
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Pages & Routes

- `/` - Homepage with terminal interface
- `/players` - Squad listing with filters
- `/players/[id]` - Individual player profiles
- `/matches` - Match history (git log style)
- `/admin` - Management dashboard
- `/admin/players` - Player management
- `/admin/matches` - Match management

## 🎨 Custom Components

- **TerminalCommand**: Animated typing terminal interface
- **GlitchText**: Cyberpunk text effects
- **PlayerCard**: Code-block styled player cards
- **MatchCommit**: Git commit-style match entries
- **Navbar**: Terminal-inspired navigation

## 🌟 Unique Features

1. **Developer Integration**: Each player has a `devRole` (Frontend Engineer, DevOps, etc.)
2. **Terminal Aesthetics**: Command-line interfaces throughout
3. **Code-Style Content**: JSON data display, variable-style stats
4. **Git-Inspired History**: Match results as commit messages
5. **Cyberpunk Design**: Neon colors, glitch effects, dark theme

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Adding New Players

Use the admin panel at `/admin/players` or make a POST request to `/api/players`:

```javascript
POST /api/players
{
  "name": "John Coder",
  "shirtNumber": 10,
  "position": "Midfielder",
  "age": 25,
  "nationality": "Vietnam",
  "devRole": "Full-stack Developer",
  "bio": "Passionate developer and football enthusiast"
}
```

## 🎭 Theme Customization

The cyberpunk theme is fully customizable in `tailwind.config.ts`:

- Modify color palette
- Add new animations
- Extend typography
- Create new utility classes

## 📦 API Endpoints

### Players
- `GET /api/players` - List all players
- `GET /api/players/[id]` - Get player by ID
- `POST /api/players` - Create new player
- `PUT /api/players/[id]` - Update player
- `DELETE /api/players/[id]` - Delete player

### Matches
- `GET /api/matches` - List all matches
- `GET /api/matches/[id]` - Get match by ID
- `POST /api/matches` - Create new match
- `PUT /api/matches/[id]` - Update match
- `DELETE /api/matches/[id]` - Delete match

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Credits

Built with ❤️ by the FC Coder team - Where developers score both goals and commits!

---

**Live Demo**: The application is now running on [http://localhost:3001](http://localhost:3001)

**Tech Stack**: Next.js + TypeScript + MongoDB + Tailwind CSS + Framer Motion