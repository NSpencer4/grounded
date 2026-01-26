import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { DatabaseService } from '../../database/database.service'
import { schema } from '../../database/database.service'
import { CreateOrganizationRequest, UpdateOrganizationRequest } from '../../schemas/requests'

@Injectable()
export class OrganizationsService {
  constructor(private readonly dbService: DatabaseService) {}

  async getOrganization(id: string) {
    const db = await this.dbService.getDb()
    const org = await db.query.organizations.findFirst({
      where: eq(schema.organizations.id, id),
    })

    if (!org) {
      throw new NotFoundException('Organization not found')
    }

    return org
  }

  async createOrganization(data: CreateOrganizationRequest) {
    const db = await this.dbService.getDb()
    const [org] = await db
      .insert(schema.organizations)
      .values({
        name: data.name,
        slug: data.slug,
        plan: data.plan,
        status: data.status,
        settings: data.settings || {},
        metadata: data.metadata,
      })
      .returning()

    return org
  }

  async updateOrganization(id: string, data: UpdateOrganizationRequest) {
    const db = await this.dbService.getDb()

    const hasUpdates = Object.keys(data).length > 0
    if (!hasUpdates) {
      throw new BadRequestException('No fields to update')
    }

    const [org] = await db
      .update(schema.organizations)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schema.organizations.id, id))
      .returning()

    if (!org) {
      throw new NotFoundException('Organization not found')
    }

    return org
  }

  async deleteOrganization(id: string) {
    const db = await this.dbService.getDb()
    const [deleted] = await db
      .delete(schema.organizations)
      .where(eq(schema.organizations.id, id))
      .returning()

    if (!deleted) {
      throw new NotFoundException('Organization not found')
    }

    return deleted
  }
}
