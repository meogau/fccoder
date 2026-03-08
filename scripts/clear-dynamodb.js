const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb')

// Load env
require('dotenv').config({ path: '.env.local' })

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const docClient = DynamoDBDocumentClient.from(client)

const TABLES = {
  PLAYERS: process.env.DYNAMODB_PLAYERS_TABLE || 'FCCoder-Players',
  MATCHES: process.env.DYNAMODB_MATCHES_TABLE || 'FCCoder-Matches',
  TEAM: process.env.DYNAMODB_TEAM_TABLE || 'FCCoder-Team',
}

async function clearTable(tableName) {
  console.log(`\nClearing table: ${tableName}`)

  try {
    // Scan all items
    const scanResult = await docClient.send(
      new ScanCommand({
        TableName: tableName,
      })
    )

    const items = scanResult.Items || []
    console.log(`Found ${items.length} items to delete`)

    if (items.length === 0) {
      console.log('Table is already empty')
      return
    }

    // Delete all items
    let deleted = 0
    for (const item of items) {
      await docClient.send(
        new DeleteCommand({
          TableName: tableName,
          Key: { id: item.id },
        })
      )
      deleted++
      if (deleted % 10 === 0) {
        console.log(`Deleted ${deleted}/${items.length} items...`)
      }
    }

    console.log(`✅ Successfully deleted ${deleted} items from ${tableName}`)
  } catch (error) {
    console.error(`❌ Error clearing table ${tableName}:`, error)
    throw error
  }
}

async function clearAllTables() {
  console.log('🗑️  Starting DynamoDB cleanup...\n')

  try {
    await clearTable(TABLES.PLAYERS)
    await clearTable(TABLES.MATCHES)
    await clearTable(TABLES.TEAM)

    console.log('\n✅ All DynamoDB tables cleared successfully!')
  } catch (error) {
    console.error('\n❌ Failed to clear DynamoDB tables:', error)
    process.exit(1)
  }
}

clearAllTables()
