import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
  QueryCommand,
  BatchWriteCommand
} from '@aws-sdk/lib-dynamodb'

// Initialize DynamoDB Client
const client = new DynamoDBClient({
  region: process.env.AWS_DYNAMODB_REGION || process.env.AWS_REGION || 'ap-southeast-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
})

// Create DynamoDB Document Client for easier operations
export const dynamoDB = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: true,
  },
})

// Table names (can be configured via environment variables)
export const TABLES = {
  PLAYERS: process.env.DYNAMODB_PLAYERS_TABLE || 'FCCoder-Players',
  TEAM: process.env.DYNAMODB_TEAM_TABLE || 'FCCoder-Team',
  MATCHES: process.env.DYNAMODB_MATCHES_TABLE || 'FCCoder-Matches',
}

// Helper function to generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

// Generic CRUD operations
export async function putItem(tableName: string, item: Record<string, any>) {
  const command = new PutCommand({
    TableName: tableName,
    Item: item,
  })
  return await dynamoDB.send(command)
}

export async function getItem(tableName: string, key: Record<string, any>) {
  const command = new GetCommand({
    TableName: tableName,
    Key: key,
  })
  const response = await dynamoDB.send(command)
  return response.Item
}

export async function updateItem(
  tableName: string,
  key: Record<string, any>,
  updates: Record<string, any>
) {
  // Build update expression
  const updateExpressions: string[] = []
  const expressionAttributeNames: Record<string, string> = {}
  const expressionAttributeValues: Record<string, any> = {}

  Object.keys(updates).forEach((field, index) => {
    const placeholder = `#field${index}`
    const valuePlaceholder = `:value${index}`
    updateExpressions.push(`${placeholder} = ${valuePlaceholder}`)
    expressionAttributeNames[placeholder] = field
    expressionAttributeValues[valuePlaceholder] = updates[field]
  })

  const command = new UpdateCommand({
    TableName: tableName,
    Key: key,
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  })

  const response = await dynamoDB.send(command)
  return response.Attributes
}

export async function deleteItem(tableName: string, key: Record<string, any>) {
  const command = new DeleteCommand({
    TableName: tableName,
    Key: key,
  })
  return await dynamoDB.send(command)
}

export async function scanTable(
  tableName: string,
  filterExpression?: string,
  expressionAttributeValues?: Record<string, any>,
  expressionAttributeNames?: Record<string, string>
) {
  const command = new ScanCommand({
    TableName: tableName,
    FilterExpression: filterExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: expressionAttributeNames,
  })

  const response = await dynamoDB.send(command)
  return response.Items || []
}

export async function queryTable(
  tableName: string,
  keyConditionExpression: string,
  expressionAttributeValues: Record<string, any>,
  indexName?: string,
  filterExpression?: string,
  scanIndexForward: boolean = true
) {
  const command = new QueryCommand({
    TableName: tableName,
    IndexName: indexName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    FilterExpression: filterExpression,
    ScanIndexForward: scanIndexForward,
  })

  const response = await dynamoDB.send(command)
  return response.Items || []
}

export async function batchWrite(tableName: string, items: Record<string, any>[]) {
  const batchSize = 25 // DynamoDB limit
  const batches = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    batches.push(batch)
  }

  for (const batch of batches) {
    const command = new BatchWriteCommand({
      RequestItems: {
        [tableName]: batch.map(item => ({
          PutRequest: {
            Item: item,
          },
        })),
      },
    })
    await dynamoDB.send(command)
  }
}
