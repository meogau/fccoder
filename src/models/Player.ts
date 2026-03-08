// Player TypeScript interface (for type checking only)
// Data is now stored in DynamoDB, not MongoDB

export interface IPlayer {
  id: string
  name: string
  shirtNumber: number
  position: string
  birthYear: number
  nationality: string
  bio?: string
  devRole: string
  teamRole: 'captain' | 'vice-captain' | 'member'
  avatar?: string
  joinDate: Date | string
  isActive: boolean
  phoneNumber?: string
  telegramChatId?: string
  goals: number
  assists: number
  matchesPlayed: number
}
