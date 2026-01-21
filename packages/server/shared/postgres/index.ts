import { Client } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'

// TODO: Multi connection handling
export const getPostgresConnection = async (credentials) => {
  const client = new Client({
    host: credentials.host,
    port: 5432,
    user: credentials.username,
    password: credentials.password,
    database: credentials.database,
  })

  await client.connect()

  return drizzle(client)
}
