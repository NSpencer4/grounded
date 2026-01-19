import { Client } from 'pg'

// TODO: Multi connection handling
export const getPostgresConnection = (credentials) => {
  const client = new Client({
    host: credentials.host,
    port: 5432,
    user: credentials.username,
    password: credentials.password,
    database: credentials.database,
  })
}
