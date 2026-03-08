const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb')

// Load env
require('dotenv').config({ path: '.env.local' })

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const TABLES = {
  PLAYERS: process.env.DYNAMODB_PLAYERS_TABLE || 'FCCoder-Players',
  TEAM: process.env.DYNAMODB_TEAM_TABLE || 'FCCoder-Team',
  MATCHES: process.env.DYNAMODB_MATCHES_TABLE || 'FCCoder-Matches',
}

async function createTable(tableName) {
  try {
    const command = new CreateTableCommand({
      TableName: tableName,
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' }
      ],
      BillingMode: 'PAY_PER_REQUEST' // On-demand pricing
    })

    await client.send(command)
    console.log(`✅ Created table: ${tableName}`)
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log(`⚠️  Table already exists: ${tableName}`)
    } else {
      throw error
    }
  }
}

async function createAllTables() {
  try {
    console.log('🚀 Creating DynamoDB tables...')

    // List existing tables
    const listCommand = new ListTablesCommand({})
    const { TableNames } = await client.send(listCommand)
    console.log(`📋 Existing tables: ${TableNames?.join(', ') || 'none'}`)

    // Create tables
    await createTable(TABLES.PLAYERS)
    await createTable(TABLES.TEAM)
    await createTable(TABLES.MATCHES)

    console.log('🎉 All tables created successfully!')

  } catch (error) {
    console.error('❌ Error creating tables:', error)
    process.exit(1)
  }
}

createAllTables()
