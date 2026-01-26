import { Injectable, NotFoundException } from '@nestjs/common'
import { and, eq } from 'drizzle-orm'
import { DatabaseService } from '../../database/database.service'
import { schema } from '../../database/database.service'
import { CreateUserRequest, UpdateUserRequest } from '../../schemas/requests'

@Injectable()
export class UsersService {
  constructor(private readonly dbService: DatabaseService) {}

  async listUsers(orgId: string, pagination: { limit: number; offset: number }) {
    const db = await this.dbService.getDb()
    const users = await db.query.users.findMany({
      where: eq(schema.users.organizationId, orgId),
      limit: pagination.limit,
      offset: pagination.offset,
    })
    return users
  }

  async getUser(orgId: string, id: string) {
    const db = await this.dbService.getDb()
    const user = await db.query.users.findFirst({
      where: and(eq(schema.users.id, id), eq(schema.users.organizationId, orgId)),
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  async createUser(orgId: string, data: CreateUserRequest) {
    const db = await this.dbService.getDb()
    const [user] = await db
      .insert(schema.users)
      .values({
        organizationId: orgId,
        name: data.name,
        email: data.email,
        role: data.role,
      })
      .returning()

    return user
  }

  async updateUser(orgId: string, id: string, data: UpdateUserRequest) {
    const db = await this.dbService.getDb()
    const [user] = await db
      .update(schema.users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(schema.users.id, id), eq(schema.users.organizationId, orgId)))
      .returning()

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  async deleteUser(orgId: string, id: string) {
    const db = await this.dbService.getDb()
    const [deleted] = await db
      .delete(schema.users)
      .where(and(eq(schema.users.id, id), eq(schema.users.organizationId, orgId)))
      .returning()

    if (!deleted) {
      throw new NotFoundException('User not found')
    }

    return deleted
  }
}
