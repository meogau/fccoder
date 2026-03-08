// Team TypeScript interface (for type checking only)
// Data is now stored in DynamoDB, not MongoDB

export interface ITeam {
  id: string
  name: string
  coverPhoto?: string
  biography: string
  foundedYear: number
  location: string
  isActive: boolean
}
