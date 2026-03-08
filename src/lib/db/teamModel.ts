import {
  TABLES,
  generateId,
  putItem,
  getItem,
  updateItem,
  scanTable,
} from '../dynamodb'

export interface Team {
  id: string
  name: string
  coverPhoto?: string
  biography: string
  foundedYear: number
  location: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export async function createTeam(teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<Team> {
  const now = new Date().toISOString()
  const team: Team = {
    ...teamData,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }

  await putItem(TABLES.TEAM, team)
  return team
}

export async function getTeamById(id: string): Promise<Team | null> {
  const item = await getItem(TABLES.TEAM, { id })
  return item as Team | null
}

export async function getTeamInfo(): Promise<Team | null> {
  // Get the first active team (assuming single team setup)
  const items = await scanTable(
    TABLES.TEAM,
    '#isActive = :isActive',
    { ':isActive': true },
    { '#isActive': 'isActive' }
  )
  return items.length > 0 ? (items[0] as Team) : null
}

export async function updateTeam(id: string, updates: Partial<Omit<Team, 'id' | 'createdAt'>>): Promise<Team | null> {
  const updateData = {
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  const updated = await updateItem(TABLES.TEAM, { id }, updateData)
  return updated as Team | null
}

export async function getAllTeams(): Promise<Team[]> {
  const items = await scanTable(TABLES.TEAM)
  return items as Team[]
}
