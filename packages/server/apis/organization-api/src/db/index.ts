import { Client } from 'pg'
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from './schema'

export type Database = NodePgDatabase<typeof schema>

interface DbCredentials {
  host: string
  port?: number
  username: string
  password: string
  database: string
}

let dbInstance: Database | null = null
let clientInstance: Client | null = null

/**
 * Get or create a database connection
 * Reuses connection for Lambda warm starts
 */
export async function getDb(credentials: DbCredentials): Promise<Database> {
  if (dbInstance && clientInstance) {
    // Check if connection is still alive
    try {
      await clientInstance.query('SELECT 1')
      return dbInstance
    } catch {
      // Connection lost, recreate
      dbInstance = null
      clientInstance = null
    }
  }

  clientInstance = new Client({
    host: credentials.host,
    port: credentials.port ?? 5432,
    user: credentials.username,
    password: credentials.password,
    database: credentials.database,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  await clientInstance.connect()

  dbInstance = drizzle(clientInstance, { schema })

  return dbInstance
}

/**
 * Close the database connection
 */
export async function closeDb(): Promise<void> {
  if (clientInstance) {
    await clientInstance.end()
    clientInstance = null
    dbInstance = null
  }
}

export { schema }
