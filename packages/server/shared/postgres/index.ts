import { Client, ClientConfig } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'

export type PostgresConfig = Pick<ClientConfig, 'host' | 'user' | 'password' | 'database'>

// TODO: Multi connection handling
export const getPostgresConnection = async (config: PostgresConfig) => {
  const client = new Client({
    host: config.host,
    port: 5432,
    user: config.user,
    password: config.password,
    database: config.database,
  })

  await client.connect()

  return drizzle(client)
}
