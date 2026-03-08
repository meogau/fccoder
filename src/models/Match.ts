// Match TypeScript interface (for type checking only)
// Data is now stored in DynamoDB, not MongoDB

export interface PlayerStat {
  playerId: string
  goals: number
  assists: number
  yellowCards: number
  redCards: number
  isStarter: boolean
}

export interface IMatch {
  id: string
  opponent: string
  date: Date | string
  venue: string
  isHome: boolean
  goalsFor: number
  goalsAgainst: number
  status: 'scheduled' | 'live' | 'completed' | 'cancelled'
  competition: string
  attendance?: number
  weatherConditions?: string
  matchReport?: string
  videoUrl?: string
  playerStats: PlayerStat[]
}
