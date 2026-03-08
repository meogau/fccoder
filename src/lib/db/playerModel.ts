import {
  dynamoDB,
  TABLES,
  generateId,
  putItem,
  getItem,
  updateItem,
  deleteItem,
  scanTable,
} from '../dynamodb'

export interface Player {
  id: string
  name: string
  shirtNumber: number
  position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward'
  birthYear: number
  nationality: string
  bio?: string
  devRole: string
  teamRole: 'captain' | 'vice-captain' | 'member'
  avatar?: string
  joinDate: string // ISO string
  isActive: boolean
  phoneNumber?: string
  telegramChatId?: string
  goals: number
  assists: number
  matchesPlayed: number
  createdAt: string
  updatedAt: string
}

export async function createPlayer(playerData: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>): Promise<Player> {
  const now = new Date().toISOString()
  const player: Player = {
    ...playerData,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }

  await putItem(TABLES.PLAYERS, player)
  return player
}

export async function getPlayerById(id: string): Promise<Player | null> {
  const item = await getItem(TABLES.PLAYERS, { id })
  return item as Player | null
}

export async function getAllPlayers(filters?: {
  isActive?: boolean
  position?: string
}): Promise<Player[]> {
  let filterExpression: string | undefined
  let expressionAttributeValues: Record<string, any> | undefined
  let expressionAttributeNames: Record<string, string> | undefined

  if (filters) {
    const conditions: string[] = []
    expressionAttributeValues = {}
    expressionAttributeNames = {}

    if (filters.isActive !== undefined) {
      conditions.push('#isActive = :isActive')
      expressionAttributeValues[':isActive'] = filters.isActive
      expressionAttributeNames['#isActive'] = 'isActive'
    }

    if (filters.position) {
      conditions.push('#position = :position')
      expressionAttributeValues[':position'] = filters.position
      expressionAttributeNames['#position'] = 'position'
    }

    if (conditions.length > 0) {
      filterExpression = conditions.join(' AND ')
    }
  }

  const items = await scanTable(
    TABLES.PLAYERS,
    filterExpression,
    expressionAttributeValues,
    expressionAttributeNames
  )
  return items as Player[]
}

export async function updatePlayer(id: string, updates: Partial<Omit<Player, 'id' | 'createdAt'>>): Promise<Player | null> {
  const updateData = {
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  const updated = await updateItem(TABLES.PLAYERS, { id }, updateData)
  return updated as Player | null
}

export async function deletePlayer(id: string): Promise<void> {
  await deleteItem(TABLES.PLAYERS, { id })
}

export async function getPlayerByShirtNumber(shirtNumber: number): Promise<Player | null> {
  const items = await scanTable(
    TABLES.PLAYERS,
    '#shirtNumber = :shirtNumber',
    { ':shirtNumber': shirtNumber },
    { '#shirtNumber': 'shirtNumber' }
  )
  return items.length > 0 ? (items[0] as Player) : null
}

/**
 * Increment player stats (goals, assists, matches)
 */
export async function incrementPlayerStats(
  playerId: string,
  stats: { goals?: number; assists?: number; matchesPlayed?: number }
): Promise<void> {
  const player = await getPlayerById(playerId)
  if (!player) return

  await updatePlayer(playerId, {
    goals: player.goals + (stats.goals || 0),
    assists: player.assists + (stats.assists || 0),
    matchesPlayed: player.matchesPlayed + (stats.matchesPlayed || 0)
  })
}

/**
 * Decrement player stats (when deleting a match)
 */
export async function decrementPlayerStats(
  playerId: string,
  stats: { goals?: number; assists?: number; matchesPlayed?: number }
): Promise<void> {
  const player = await getPlayerById(playerId)
  if (!player) return

  await updatePlayer(playerId, {
    goals: Math.max(0, player.goals - (stats.goals || 0)),
    assists: Math.max(0, player.assists - (stats.assists || 0)),
    matchesPlayed: Math.max(0, player.matchesPlayed - (stats.matchesPlayed || 0))
  })
}
