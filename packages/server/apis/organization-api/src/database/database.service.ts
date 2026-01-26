import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Client } from 'pg'
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from '../db/schema'

export type Database = NodePgDatabase<typeof schema>

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name)
  private client: Client | null = null
  private db: Database | null = null

  constructor(private configService: ConfigService) {}

  async getDb(): Promise<Database> {
    if (this.db && this.client) {
      try {
        await this.client.query('SELECT 1')
        return this.db
      } catch {
        this.logger.warn('Database connection lost, reconnecting...')
        await this.closeConnection()
      }
    }

    await this.connect()
    return this.db!
  }

  private async connect(): Promise<void> {
    this.client = new Client({
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5432),
      user: this.configService.get<string>('DB_USER', 'postgres'),
      password: this.configService.get<string>('DB_PASSWORD', ''),
      database: this.configService.get<string>('DB_NAME', 'grounded'),
      ssl: this.configService.get<string>('DB_SSL', 'true') === 'true'
        ? { rejectUnauthorized: false }
        : undefined,
    })

    await this.client.connect()
    this.db = drizzle(this.client, { schema })
    this.logger.log('Database connection established')
  }

  private async closeConnection(): Promise<void> {
    if (this.client) {
      await this.client.end()
      this.client = null
      this.db = null
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.closeConnection()
    this.logger.log('Database connection closed')
  }
}

export { schema }
