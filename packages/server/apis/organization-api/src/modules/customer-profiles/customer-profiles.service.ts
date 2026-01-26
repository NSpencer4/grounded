import { Injectable, NotFoundException } from '@nestjs/common'
import { and, eq } from 'drizzle-orm'
import { DatabaseService } from '../../database/database.service'
import { schema } from '../../database/database.service'
import {
  CreateCustomerProfileRequest,
  UpdateCustomerProfileRequest,
} from '../../schemas/requests'

@Injectable()
export class CustomerProfilesService {
  constructor(private readonly dbService: DatabaseService) {}

  async listCustomerProfiles(orgId: string, pagination: { limit: number; offset: number }) {
    const db = await this.dbService.getDb()
    const profiles = await db.query.customerProfiles.findMany({
      where: eq(schema.customerProfiles.organizationId, orgId),
      limit: pagination.limit,
      offset: pagination.offset,
      with: {
        user: true,
      },
    })
    return profiles
  }

  async getCustomerProfile(orgId: string, id: string) {
    const db = await this.dbService.getDb()
    const profile = await db.query.customerProfiles.findFirst({
      where: and(
        eq(schema.customerProfiles.id, id),
        eq(schema.customerProfiles.organizationId, orgId),
      ),
      with: {
        user: true,
      },
    })

    if (!profile) {
      throw new NotFoundException('Customer profile not found')
    }

    return profile
  }

  async createCustomerProfile(orgId: string, data: CreateCustomerProfileRequest) {
    const db = await this.dbService.getDb()
    const [profile] = await db
      .insert(schema.customerProfiles)
      .values({
        organizationId: orgId,
        userId: data.userId,
        tier: data.tier,
        standing: data.standing,
        lifetimeValue: data.lifetimeValue,
        lastBillingDate: data.lastBillingDate ? new Date(data.lastBillingDate) : undefined,
        nextBillingDate: data.nextBillingDate ? new Date(data.nextBillingDate) : undefined,
        billingCycle: data.billingCycle,
        billingAmount: data.billingAmount,
        tokenBalance: data.tokenBalance,
        tokenLimit: data.tokenLimit,
        activeSites: data.activeSites,
        sitesLimit: data.sitesLimit,
        context: data.context,
        preferences: data.preferences,
        metadata: data.metadata,
      })
      .returning()

    return profile
  }

  async updateCustomerProfile(orgId: string, id: string, data: UpdateCustomerProfileRequest) {
    const db = await this.dbService.getDb()
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    }

    if (data.lastBillingDate) {
      updateData.lastBillingDate = new Date(data.lastBillingDate)
    }
    if (data.nextBillingDate) {
      updateData.nextBillingDate = new Date(data.nextBillingDate)
    }

    const [profile] = await db
      .update(schema.customerProfiles)
      .set(updateData)
      .where(
        and(eq(schema.customerProfiles.id, id), eq(schema.customerProfiles.organizationId, orgId)),
      )
      .returning()

    if (!profile) {
      throw new NotFoundException('Customer profile not found')
    }

    return profile
  }

  async deleteCustomerProfile(orgId: string, id: string) {
    const db = await this.dbService.getDb()
    const [deleted] = await db
      .delete(schema.customerProfiles)
      .where(
        and(eq(schema.customerProfiles.id, id), eq(schema.customerProfiles.organizationId, orgId)),
      )
      .returning()

    if (!deleted) {
      throw new NotFoundException('Customer profile not found')
    }

    return deleted
  }
}
