import { Injectable, NotFoundException } from '@nestjs/common'
import { and, eq } from 'drizzle-orm'
import { DatabaseService } from '../../database/database.service'
import { schema } from '../../database/database.service'
import {
  CreateRepresentativeRequest,
  UpdateRepresentativeRequest,
} from '../../schemas/requests'

@Injectable()
export class RepresentativesService {
  constructor(private readonly dbService: DatabaseService) {}

  async listRepresentatives(orgId: string, pagination: { limit: number; offset: number }) {
    const db = await this.dbService.getDb()
    const reps = await db.query.representatives.findMany({
      where: eq(schema.representatives.organizationId, orgId),
      limit: pagination.limit,
      offset: pagination.offset,
      with: {
        user: true,
      },
    })
    return reps
  }

  async getRepresentative(orgId: string, id: string) {
    const db = await this.dbService.getDb()
    const rep = await db.query.representatives.findFirst({
      where: and(eq(schema.representatives.id, id), eq(schema.representatives.organizationId, orgId)),
      with: {
        user: true,
        teamPerformance: {
          limit: 5,
        },
      },
    })

    if (!rep) {
      throw new NotFoundException('Representative not found')
    }

    return rep
  }

  async createRepresentative(orgId: string, data: CreateRepresentativeRequest) {
    const db = await this.dbService.getDb()
    const [rep] = await db
      .insert(schema.representatives)
      .values({
        organizationId: orgId,
        userId: data.userId,
        role: data.role,
        status: data.status,
        activeChats: data.activeChats,
        maxChats: data.maxChats,
        rating: data.rating,
      })
      .returning()

    return rep
  }

  async updateRepresentative(orgId: string, id: string, data: UpdateRepresentativeRequest) {
    const db = await this.dbService.getDb()
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    }

    if (data.status === 'ONLINE' || data.status === 'AWAY') {
      updateData.lastActiveAt = new Date()
    }

    const [rep] = await db
      .update(schema.representatives)
      .set(updateData)
      .where(and(eq(schema.representatives.id, id), eq(schema.representatives.organizationId, orgId)))
      .returning()

    if (!rep) {
      throw new NotFoundException('Representative not found')
    }

    return rep
  }

  async deleteRepresentative(orgId: string, id: string) {
    const db = await this.dbService.getDb()
    const [deleted] = await db
      .delete(schema.representatives)
      .where(and(eq(schema.representatives.id, id), eq(schema.representatives.organizationId, orgId)))
      .returning()

    if (!deleted) {
      throw new NotFoundException('Representative not found')
    }

    return deleted
  }
}
