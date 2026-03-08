import {
  TABLES,
  generateId,
  putItem,
  getItem,
  updateItem,
  deleteItem,
  scanTable,
} from '../dynamodb'

export interface PlayerStat {
  playerId: string
  goals: number
  assists: number
  yellowCards: number
  redCards: number
  isStarter: boolean
}

export interface Match {
  id: string
  opponent: string
  date: string // ISO string
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
  createdAt: string
  updatedAt: string
}

export async function createMatch(matchData: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>): Promise<Match> {
  const now = new Date().toISOString()
  const match: Match = {
    ...matchData,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }

  await putItem(TABLES.MATCHES, match)
  return match
}

export async function getMatchById(id: string): Promise<Match | null> {
  const item = await getItem(TABLES.MATCHES, { id })
  return item as Match | null
}

export async function getAllMatches(filters?: {
  status?: string
  limit?: number
  page?: number
}): Promise<{ data: Match[]; total: number }> {
  let filterExpression: string | undefined
  let expressionAttributeValues: Record<string, any> | undefined
  let expressionAttributeNames: Record<string, string> | undefined

  if (filters?.status) {
    filterExpression = '#status = :status'
    expressionAttributeValues = { ':status': filters.status }
    expressionAttributeNames = { '#status': 'status' }
  }

  const items = await scanTable(
    TABLES.MATCHES,
    filterExpression,
    expressionAttributeValues,
    expressionAttributeNames
  )

  // Sort by date descending
  const sorted = (items as Match[]).sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const total = sorted.length

  // Apply pagination if specified
  if (filters?.limit && filters?.page) {
    const offset = (filters.page - 1) * filters.limit
    return {
      data: sorted.slice(offset, offset + filters.limit),
      total
    }
  }

  // Apply limit only if specified (without pagination)
  if (filters?.limit) {
    return {
      data: sorted.slice(0, filters.limit),
      total
    }
  }

  return {
    data: sorted,
    total
  }
}

export async function updateMatch(id: string, updates: Partial<Omit<Match, 'id' | 'createdAt'>>): Promise<Match | null> {
  const updateData = {
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  const updated = await updateItem(TABLES.MATCHES, { id }, updateData)
  return updated as Match | null
}

export async function deleteMatch(id: string): Promise<void> {
  await deleteItem(TABLES.MATCHES, { id })
}

export async function getUpcomingMatches(limit: number = 10): Promise<Match[]> {
  const items = await scanTable(
    TABLES.MATCHES,
    '#status = :status',
    { ':status': 'scheduled' },
    { '#status': 'status' }
  )

  // Sort by date ascending (soonest first)
  const sorted = (items as Match[]).sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  return sorted.slice(0, limit)
}

/**
 * Get all matches where a specific player participated
 */
export async function getMatchesByPlayerId(playerId: string): Promise<Match[]> {
  // Get all completed matches
  const items = await scanTable(TABLES.MATCHES)

  // Filter matches where player participated
  const playerMatches = (items as Match[]).filter(match =>
    match.playerStats &&
    match.playerStats.some(stat => stat.playerId === playerId)
  )

  // Sort by date descending (most recent first)
  return playerMatches.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}
