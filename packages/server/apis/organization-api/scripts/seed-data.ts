#!/usr/bin/env tsx
/**
 * Seed Script for Organization API Database
 *
 * This script populates the PostgreSQL database with comprehensive mock data
 * for testing and development purposes.
 *
 * Usage:
 *   npm run seed (if added to package.json)
 *   npx tsx scripts/seed-data.ts
 *
 * Environment Variables:
 *   DB_HOST - PostgreSQL host (default: localhost)
 *   DB_PORT - PostgreSQL port (default: 5432)
 *   DB_USER - PostgreSQL username (default: postgres)
 *   DB_PASSWORD - PostgreSQL password
 *   DB_NAME - Database name (default: grounded)
 */

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '../src/db/schema'

// ============================================================================
// Database Connection
// ============================================================================

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'grounded',
})

const db = drizzle(pool, { schema })

// ============================================================================
// Helper Functions
// ============================================================================

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// ============================================================================
// Seed Data
// ============================================================================

async function seed() {
  console.log('🌱 Starting database seed...\n')

  try {
    // ========================================================================
    // Organizations
    // ========================================================================
    console.log('📦 Creating organizations...')
    const organizations = await db
      .insert(schema.organizations)
      .values([
        {
          name: 'Acme Corporation',
          slug: 'acme-corp',
          plan: 'ENTERPRISE',
          status: 'ACTIVE',
          settings: {
            timezone: 'America/New_York',
            locale: 'en-US',
            features: ['ai-agents', 'analytics', 'escalations', 'budgets'],
            theme: 'dark',
          },
          metadata: {
            industry: 'Technology',
            size: 'Large (500+ employees)',
            country: 'United States',
          },
          trialEndsAt: addDays(new Date(), 30),
        },
        {
          name: 'TechStart Inc',
          slug: 'techstart-inc',
          plan: 'PROFESSIONAL',
          status: 'ACTIVE',
          settings: {
            timezone: 'America/Los_Angeles',
            locale: 'en-US',
            features: ['ai-agents', 'analytics'],
            theme: 'light',
          },
          metadata: {
            industry: 'SaaS',
            size: 'Small (10-50 employees)',
            country: 'United States',
          },
        },
      ])
      .returning()

    console.log(`✅ Created ${organizations.length} organizations\n`)

    const [acme, techstart] = organizations

    // ========================================================================
    // Users
    // ========================================================================
    console.log('👥 Creating users...')

    // Acme users
    const acmeUsers = await db
      .insert(schema.users)
      .values([
        // Customers
        {
          organizationId: acme.id,
          email: 'alice.johnson@customer.com',
          name: 'Alice Johnson',
          role: 'CUSTOMER',
        },
        {
          organizationId: acme.id,
          email: 'bob.smith@customer.com',
          name: 'Bob Smith',
          role: 'CUSTOMER',
        },
        {
          organizationId: acme.id,
          email: 'charlie.brown@customer.com',
          name: 'Charlie Brown',
          role: 'CUSTOMER',
        },
        {
          organizationId: acme.id,
          email: 'diana.prince@customer.com',
          name: 'Diana Prince',
          role: 'CUSTOMER',
        },
        {
          organizationId: acme.id,
          email: 'evan.williams@customer.com',
          name: 'Evan Williams',
          role: 'CUSTOMER',
        },
        // Representatives
        {
          organizationId: acme.id,
          email: 'jane.rep@acme.com',
          name: 'Jane Representative',
          role: 'REPRESENTATIVE',
        },
        {
          organizationId: acme.id,
          email: 'john.senior@acme.com',
          name: 'John Senior',
          role: 'REPRESENTATIVE',
        },
        {
          organizationId: acme.id,
          email: 'sarah.lead@acme.com',
          name: 'Sarah Lead',
          role: 'REPRESENTATIVE',
        },
        // Admin
        {
          organizationId: acme.id,
          email: 'admin@acme.com',
          name: 'Admin User',
          role: 'ADMIN',
        },
      ])
      .returning()

    // TechStart users
    const techstartUsers = await db
      .insert(schema.users)
      .values([
        {
          organizationId: techstart.id,
          email: 'frank.customer@techstart.com',
          name: 'Frank Customer',
          role: 'CUSTOMER',
        },
        {
          organizationId: techstart.id,
          email: 'grace.customer@techstart.com',
          name: 'Grace Customer',
          role: 'CUSTOMER',
        },
        {
          organizationId: techstart.id,
          email: 'support@techstart.com',
          name: 'Support Rep',
          role: 'REPRESENTATIVE',
        },
      ])
      .returning()

    const allUsers = [...acmeUsers, ...techstartUsers]
    console.log(`✅ Created ${allUsers.length} users\n`)

    // Separate customers and reps for Acme
    const acmeCustomers = acmeUsers.filter((u) => u.role === 'CUSTOMER')
    const acmeReps = acmeUsers.filter((u) => u.role === 'REPRESENTATIVE')

    // ========================================================================
    // Representatives
    // ========================================================================
    console.log('🎧 Creating representatives...')

    const representatives = await db
      .insert(schema.representatives)
      .values([
        {
          organizationId: acme.id,
          userId: acmeReps[0].id,
          role: 'JUNIOR_SUPPORT',
          status: 'ONLINE',
          activeChats: 3,
          maxChats: 10,
          rating: '4.50',
          lastActiveAt: new Date(),
        },
        {
          organizationId: acme.id,
          userId: acmeReps[1].id,
          role: 'SENIOR_SUPPORT',
          status: 'ONLINE',
          activeChats: 5,
          maxChats: 15,
          rating: '4.85',
          lastActiveAt: new Date(),
        },
        {
          organizationId: acme.id,
          userId: acmeReps[2].id,
          role: 'TEAM_LEAD',
          status: 'AWAY',
          activeChats: 2,
          maxChats: 12,
          rating: '4.92',
          lastActiveAt: addDays(new Date(), -1),
        },
        {
          organizationId: techstart.id,
          userId: techstartUsers[2].id,
          role: 'SENIOR_SUPPORT',
          status: 'ONLINE',
          activeChats: 2,
          maxChats: 10,
          rating: '4.75',
          lastActiveAt: new Date(),
        },
      ])
      .returning()

    console.log(`✅ Created ${representatives.length} representatives\n`)

    const [acmeRep1, acmeRep2, acmeRep3, techstartRep] = representatives

    // ========================================================================
    // Customer Profiles
    // ========================================================================
    console.log('💳 Creating customer profiles...')

    const customerProfiles = await db
      .insert(schema.customerProfiles)
      .values([
        {
          organizationId: acme.id,
          userId: acmeCustomers[0].id,
          tier: 'ENTERPRISE',
          standing: 'GOOD',
          lifetimeValue: '15420.50',
          lastBillingDate: addDays(new Date(), -15),
          nextBillingDate: addDays(new Date(), 15),
          billingCycle: 'MONTHLY',
          billingAmount: '499.00',
          tokenBalance: 850000,
          tokenLimit: 1000000,
          activeSites: 5,
          sitesLimit: 10,
          context: {
            companySize: '500+',
            useCase: 'Customer Support Automation',
            integrations: ['Salesforce', 'Zendesk', 'Slack'],
          },
          preferences: {
            emailNotifications: true,
            smsAlerts: false,
            theme: 'dark',
          },
          metadata: {
            signupSource: 'Enterprise Sales',
            accountManager: 'Sarah Johnson',
            renewalDate: '2026-12-31',
          },
        },
        {
          organizationId: acme.id,
          userId: acmeCustomers[1].id,
          tier: 'PRO',
          standing: 'GOOD',
          lifetimeValue: '4250.00',
          lastBillingDate: addDays(new Date(), -10),
          nextBillingDate: addDays(new Date(), 20),
          billingCycle: 'MONTHLY',
          billingAmount: '149.00',
          tokenBalance: 45000,
          tokenLimit: 50000,
          activeSites: 2,
          sitesLimit: 3,
          context: {
            companySize: '50-100',
            useCase: 'Support Chat',
          },
        },
        {
          organizationId: acme.id,
          userId: acmeCustomers[2].id,
          tier: 'STARTER',
          standing: 'WARNING',
          lifetimeValue: '780.00',
          lastBillingDate: addDays(new Date(), -40),
          nextBillingDate: addDays(new Date(), -10),
          billingCycle: 'MONTHLY',
          billingAmount: '49.00',
          tokenBalance: 500,
          tokenLimit: 10000,
          activeSites: 1,
          sitesLimit: 1,
        },
        {
          organizationId: acme.id,
          userId: acmeCustomers[3].id,
          tier: 'FREE',
          standing: 'GOOD',
          lifetimeValue: '0.00',
          tokenBalance: 900,
          tokenLimit: 1000,
          activeSites: 1,
          sitesLimit: 1,
        },
        {
          organizationId: acme.id,
          userId: acmeCustomers[4].id,
          tier: 'PRO',
          standing: 'GOOD',
          lifetimeValue: '3200.00',
          lastBillingDate: addDays(new Date(), -5),
          nextBillingDate: addDays(new Date(), 25),
          billingCycle: 'MONTHLY',
          billingAmount: '149.00',
          tokenBalance: 38000,
          tokenLimit: 50000,
          activeSites: 3,
          sitesLimit: 3,
        },
      ])
      .returning()

    console.log(`✅ Created ${customerProfiles.length} customer profiles\n`)

    // ========================================================================
    // Tickets
    // ========================================================================
    console.log('🎫 Creating tickets...')

    const now = new Date()
    const tickets = await db
      .insert(schema.tickets)
      .values([
        {
          organizationId: acme.id,
          ticketNumber: 'ACME-1001',
          conversationId: '01JK7Z8M9N2P3Q4R5S6T7V8W9X',
          customerId: acmeCustomers[0].id,
          assignedTo: acmeRep1.id,
          subject: 'API integration not working',
          description:
            'Customer is experiencing issues with the Salesforce API integration. Error messages indicate authentication failure.',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          category: 'TECHNICAL_ISSUE',
          tags: ['api', 'salesforce', 'integration'],
          aiHandled: false,
          sentiment: '0.35',
          estimatedResolutionTime: 120,
          customerSatisfactionScore: null,
          internalNotes: 'Need to check API credentials and permissions.',
        },
        {
          organizationId: acme.id,
          ticketNumber: 'ACME-1002',
          conversationId: '01JK7Z8M9N2P3Q4R5S6T7V8W8Y',
          customerId: acmeCustomers[1].id,
          assignedTo: acmeRep2.id,
          subject: 'Billing discrepancy on last invoice',
          description: 'Customer was charged $199 instead of $149 on their last invoice.',
          status: 'RESOLVED',
          priority: 'NORMAL',
          category: 'BILLING_PAYMENT',
          tags: ['billing', 'refund'],
          aiHandled: true,
          sentiment: '0.65',
          estimatedResolutionTime: 60,
          actualResolutionTime: 45,
          customerSatisfactionScore: '4.5',
          resolvedAt: addDays(now, -2),
          internalNotes: 'Refund processed for $50 difference.',
        },
        {
          organizationId: acme.id,
          ticketNumber: 'ACME-1003',
          conversationId: '01JK7Z8M9N2P3Q4R5S6T7V8W7Z',
          customerId: acmeCustomers[2].id,
          assignedTo: acmeRep1.id,
          subject: 'Account suspended - payment overdue',
          description: 'Customer account suspended due to payment failure. Need to update payment method.',
          status: 'WAITING',
          priority: 'HIGH',
          category: 'BILLING_PAYMENT',
          tags: ['payment', 'suspended'],
          aiHandled: false,
          sentiment: '0.25',
          estimatedResolutionTime: 30,
          internalNotes: 'Waiting for customer to update payment method.',
        },
        {
          organizationId: acme.id,
          ticketNumber: 'ACME-1004',
          conversationId: '01JK7Z8M9N2P3Q4R5S6T7V8W6A',
          customerId: acmeCustomers[3].id,
          assignedTo: null,
          subject: 'Feature request: Custom branding',
          description: 'Customer wants to add custom branding to the chat widget.',
          status: 'OPEN',
          priority: 'LOW',
          category: 'FEATURE_REQUEST',
          tags: ['feature-request', 'branding'],
          aiHandled: false,
          sentiment: '0.80',
          estimatedResolutionTime: 240,
        },
        {
          organizationId: acme.id,
          ticketNumber: 'ACME-1005',
          conversationId: '01JK7Z8M9N2P3Q4R5S6T7V8W5B',
          customerId: acmeCustomers[4].id,
          assignedTo: acmeRep3.id,
          subject: 'Chat widget not loading on mobile',
          description: 'The chat widget is not displaying correctly on mobile Safari browser.',
          status: 'IN_PROGRESS',
          priority: 'URGENT',
          category: 'BUG_REPORT',
          tags: ['bug', 'mobile', 'safari'],
          aiHandled: false,
          sentiment: '0.40',
          estimatedResolutionTime: 180,
          internalNotes: 'Escalated to engineering team. Working on fix.',
        },
        {
          organizationId: acme.id,
          ticketNumber: 'ACME-1006',
          conversationId: '01JK7Z8M9N2P3Q4R5S6T7V8W4C',
          customerId: acmeCustomers[0].id,
          assignedTo: acmeRep2.id,
          subject: 'Token usage exceeds quota',
          description: 'Customer is receiving token limit warnings and needs to upgrade plan.',
          status: 'RESOLVED',
          priority: 'NORMAL',
          category: 'ACCOUNT_MANAGEMENT',
          tags: ['tokens', 'upgrade'],
          aiHandled: true,
          sentiment: '0.70',
          estimatedResolutionTime: 30,
          actualResolutionTime: 25,
          customerSatisfactionScore: '5.0',
          resolvedAt: addDays(now, -1),
        },
      ])
      .returning()

    console.log(`✅ Created ${tickets.length} tickets\n`)

    // ========================================================================
    // Escalations
    // ========================================================================
    console.log('🚨 Creating escalations...')

    const escalations = await db
      .insert(schema.escalations)
      .values([
        {
          organizationId: acme.id,
          conversationId: '01JK7Z8M9N2P3Q4R5S6T7V8W9X',
          customerId: acmeCustomers[0].id,
          assignedTo: acmeRep3.id,
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          reason: 'TECHNICAL_ISSUE',
          issueDescription:
            'Complex API integration issue requiring senior engineer review. Customer is Enterprise tier with critical deadline.',
          waitTime: 15,
          notes: 'Assigned to team lead. Engineering team involved.',
          aiSummary:
            'Enterprise customer experiencing API authentication failures with Salesforce integration. Urgent resolution needed.',
          assignedAt: addDays(now, 0),
        },
        {
          organizationId: acme.id,
          conversationId: '01JK7Z8M9N2P3Q4R5S6T7V8W5B',
          customerId: acmeCustomers[4].id,
          assignedTo: acmeRep3.id,
          priority: 'URGENT',
          status: 'ASSIGNED',
          reason: 'AI_UNABLE_TO_RESOLVE',
          issueDescription:
            'Mobile Safari rendering bug. AI could not determine root cause. Requires manual debugging.',
          waitTime: 5,
          aiSummary:
            'Chat widget rendering issue on iOS Safari. Likely CSS or JavaScript compatibility problem.',
          assignedAt: addDays(now, 0),
        },
        {
          organizationId: acme.id,
          conversationId: '01JK7Z8M9N2P3Q4R5S6T7V8W3D',
          customerId: acmeCustomers[1].id,
          assignedTo: acmeRep2.id,
          priority: 'NORMAL',
          status: 'RESOLVED',
          reason: 'BILLING_DISPUTE',
          issueDescription: 'Customer disputed invoice amount. Required manager approval for refund.',
          waitTime: 30,
          notes: 'Refund approved and processed. Customer satisfied.',
          aiSummary: 'Billing discrepancy resolved with $50 refund.',
          assignedAt: addDays(now, -3),
          resolvedAt: addDays(now, -2),
        },
      ])
      .returning()

    console.log(`✅ Created ${escalations.length} escalations\n`)

    // ========================================================================
    // Refunds
    // ========================================================================
    console.log('💰 Creating refunds...')

    const refunds = await db
      .insert(schema.refunds)
      .values([
        {
          organizationId: acme.id,
          orderId: 'ORD-2024-0123',
          customerId: acmeCustomers[1].id,
          amount: '50.00',
          reason: 'BILLING_ERROR',
          status: 'COMPLETED',
          notes: 'Billing discrepancy - customer charged incorrect amount',
          approvedBy: acmeRep2.id,
          processedAt: addDays(now, -2),
        },
        {
          organizationId: acme.id,
          orderId: 'ORD-2024-0098',
          customerId: acmeCustomers[2].id,
          amount: '49.00',
          reason: 'SERVICE_DOWNTIME',
          status: 'PENDING',
          notes: 'Service was unavailable for 4 hours last week',
        },
        {
          organizationId: acme.id,
          orderId: 'ORD-2023-0956',
          customerId: acmeCustomers[0].id,
          amount: '150.00',
          reason: 'CUSTOMER_REQUEST',
          status: 'APPROVED',
          notes: 'VIP customer goodwill refund due to recent issues',
          approvedBy: acmeRep3.id,
        },
        {
          organizationId: acme.id,
          orderId: 'ORD-2024-0087',
          customerId: acmeCustomers[4].id,
          amount: '75.00',
          reason: 'AI_BUG',
          status: 'PENDING',
          notes: 'AI gave incorrect information leading to customer frustration',
        },
      ])
      .returning()

    console.log(`✅ Created ${refunds.length} refunds\n`)

    // ========================================================================
    // Budgets
    // ========================================================================
    console.log('📊 Creating budgets...')

    const budgets = await db
      .insert(schema.budgets)
      .values([
        {
          organizationId: acme.id,
          type: 'REFUND',
          period: 'MONTHLY',
          limit: '5000.00',
          spent: '324.00',
          remaining: '4676.00',
          alertThresholds: [50, 75, 90],
          autoAlertsEnabled: true,
          refundLimitPerUser: '500.00',
          periodStart: new Date(now.getFullYear(), now.getMonth(), 1),
          periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        },
        {
          organizationId: acme.id,
          type: 'COMPENSATION',
          period: 'QUARTERLY',
          limit: '10000.00',
          spent: '1250.00',
          remaining: '8750.00',
          alertThresholds: [60, 80, 95],
          autoAlertsEnabled: true,
          periodStart: new Date(now.getFullYear(), 0, 1),
          periodEnd: new Date(now.getFullYear(), 3, 0),
        },
        {
          organizationId: acme.id,
          type: 'DISCOUNT',
          period: 'YEARLY',
          limit: '25000.00',
          spent: '8420.00',
          remaining: '16580.00',
          alertThresholds: [70, 85, 95],
          autoAlertsEnabled: true,
          periodStart: new Date(now.getFullYear(), 0, 1),
          periodEnd: new Date(now.getFullYear(), 11, 31),
        },
        {
          organizationId: techstart.id,
          type: 'REFUND',
          period: 'MONTHLY',
          limit: '1000.00',
          spent: '0.00',
          remaining: '1000.00',
          alertThresholds: [75, 90],
          autoAlertsEnabled: true,
          refundLimitPerUser: '100.00',
          periodStart: new Date(now.getFullYear(), now.getMonth(), 1),
          periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        },
      ])
      .returning()

    console.log(`✅ Created ${budgets.length} budgets\n`)

    // ========================================================================
    // Agent Configurations
    // ========================================================================
    console.log('🤖 Creating agent configurations...')

    const agentConfigurations = await db
      .insert(schema.agentConfigurations)
      .values([
        {
          organizationId: acme.id,
          name: 'Response Recommendation Agent',
          type: 'RESPONSE_RECOMMENDATION',
          description:
            'Analyzes conversation context and generates recommended responses for customer service representatives.',
          enabled: true,
          status: 'ACTIVE',
          assertions: 1247,
          accuracy: '94.50',
          avgLatency: 850,
          dataSources: ['customer_profile', 'conversation_history', 'knowledge_base'],
          thresholds: {
            minConfidence: 0.8,
            maxResponseLength: 500,
            sentimentThreshold: 0.3,
          },
          metadata: {
            model: 'claude-sonnet-4.5',
            temperature: 0.7,
            lastTrained: '2026-01-15',
          },
          lastRunAt: addDays(now, 0),
        },
        {
          organizationId: acme.id,
          name: 'Customer Spend Analyzer',
          type: 'CUSTOMER_SPEND',
          description:
            'Analyzes customer spending patterns and provides insights for retention and upsell opportunities.',
          enabled: true,
          status: 'ACTIVE',
          assertions: 892,
          accuracy: '91.20',
          avgLatency: 620,
          dataSources: ['billing_history', 'usage_metrics', 'customer_profile'],
          thresholds: {
            highValueThreshold: 5000,
            churnRiskScore: 0.7,
          },
          metadata: {
            lookbackPeriod: '90d',
            updateFrequency: 'daily',
          },
          lastRunAt: addDays(now, 0),
        },
        {
          organizationId: acme.id,
          name: 'Sentiment Analysis',
          type: 'SENTIMENT_ANALYSIS',
          description: 'Real-time sentiment analysis of customer conversations to detect frustration or satisfaction.',
          enabled: true,
          status: 'ACTIVE',
          assertions: 3421,
          accuracy: '88.75',
          avgLatency: 320,
          dataSources: ['conversation_messages'],
          thresholds: {
            negativeThreshold: 0.3,
            positiveThreshold: 0.7,
          },
          lastRunAt: addDays(now, 0),
        },
        {
          organizationId: acme.id,
          name: 'Escalation Predictor',
          type: 'ESCALATION_PREDICTOR',
          description: 'Predicts likelihood of escalation based on conversation patterns and customer history.',
          enabled: true,
          status: 'ACTIVE',
          assertions: 645,
          accuracy: '86.30',
          avgLatency: 540,
          dataSources: ['conversation_history', 'customer_profile', 'escalation_history'],
          thresholds: {
            escalationRiskThreshold: 0.75,
          },
          lastRunAt: addDays(now, 0),
        },
        {
          organizationId: techstart.id,
          name: 'Basic Response Agent',
          type: 'RESPONSE_RECOMMENDATION',
          description: 'Basic AI agent for suggesting responses to common customer questions.',
          enabled: true,
          status: 'ACTIVE',
          assertions: 234,
          accuracy: '82.50',
          avgLatency: 920,
          dataSources: ['knowledge_base'],
          thresholds: {
            minConfidence: 0.7,
          },
          lastRunAt: addDays(now, -1),
        },
      ])
      .returning()

    console.log(`✅ Created ${agentConfigurations.length} agent configurations\n`)

    // ========================================================================
    // Decision Rules
    // ========================================================================
    console.log('📋 Creating decision rules...')

    const decisionRules = await db
      .insert(schema.decisionRules)
      .values([
        {
          organizationId: acme.id,
          name: 'Auto-resolve simple billing questions',
          description: 'Automatically resolve straightforward billing inquiries without human intervention.',
          enabled: true,
          priority: 10,
          conditions: {
            all: [
              { field: 'ticket.category', operator: 'equals', value: 'BILLING_PAYMENT' },
              { field: 'ticket.sentiment', operator: 'greater_than', value: 0.5 },
              { field: 'customer.tier', operator: 'in', value: ['FREE', 'STARTER'] },
            ],
          },
          action: 'AUTO_RESOLVE',
          actionParams: {
            responseTemplate: 'billing_faq_response',
            closeTicket: true,
            sendFollowup: true,
          },
          lastTriggeredAt: addDays(now, -1),
        },
        {
          organizationId: acme.id,
          name: 'Escalate VIP customers',
          description: 'Immediately escalate any issue from Enterprise tier customers.',
          enabled: true,
          priority: 100,
          conditions: {
            all: [{ field: 'customer.tier', operator: 'equals', value: 'ENTERPRISE' }],
          },
          action: 'ROUTE_TO_SENIOR',
          actionParams: {
            routeTo: 'TEAM_LEAD',
            priority: 'HIGH',
            notifySlack: true,
          },
          lastTriggeredAt: addDays(now, 0),
        },
        {
          organizationId: acme.id,
          name: 'Auto-approve small refunds',
          description: 'Automatically approve refund requests under $50 for good standing customers.',
          enabled: true,
          priority: 50,
          conditions: {
            all: [
              { field: 'refund.amount', operator: 'less_than', value: 50 },
              { field: 'customer.standing', operator: 'equals', value: 'GOOD' },
              { field: 'customer.lifetimeValue', operator: 'greater_than', value: 500 },
            ],
          },
          action: 'AUTO_APPROVE_REFUND',
          actionParams: {
            requireSecondApproval: false,
            notifyCustomer: true,
          },
          lastTriggeredAt: addDays(now, -2),
        },
        {
          organizationId: acme.id,
          name: 'Request more info for vague issues',
          description: 'Ask for clarification when ticket description is too short or vague.',
          enabled: true,
          priority: 20,
          conditions: {
            all: [
              { field: 'ticket.description.length', operator: 'less_than', value: 50 },
              { field: 'ticket.status', operator: 'equals', value: 'OPEN' },
            ],
          },
          action: 'REQUEST_MORE_INFO',
          actionParams: {
            template: 'clarification_request',
            questions: ['What steps have you tried?', 'What error message do you see?'],
          },
        },
        {
          organizationId: acme.id,
          name: 'Escalate negative sentiment',
          description: 'Escalate tickets with very negative sentiment to human representative.',
          enabled: true,
          priority: 80,
          conditions: {
            all: [
              { field: 'ticket.sentiment', operator: 'less_than', value: 0.3 },
              { field: 'ticket.aiHandled', operator: 'equals', value: true },
            ],
          },
          action: 'ESCALATE_TO_HUMAN',
          actionParams: {
            reason: 'NEGATIVE_SENTIMENT',
            urgency: 'HIGH',
          },
          lastTriggeredAt: addDays(now, 0),
        },
      ])
      .returning()

    console.log(`✅ Created ${decisionRules.length} decision rules\n`)

    // ========================================================================
    // Performance Metrics
    // ========================================================================
    console.log('📈 Creating performance metrics...')

    const performanceMetrics = await db
      .insert(schema.performanceMetrics)
      .values([
        // Daily metrics for Acme
        {
          organizationId: acme.id,
          period: 'DAY',
          periodStart: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          periodEnd: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
          totalChats: 156,
          activeChats: 23,
          avgResponseTime: 45,
          firstContactResolution: '78.50',
          customerSatisfaction: '4.35',
          escalationRate: '8.30',
          aiResolutionRate: '62.80',
          ticketsResolved: 42,
        },
        {
          organizationId: acme.id,
          period: 'DAY',
          periodStart: addDays(new Date(now.getFullYear(), now.getMonth(), now.getDate()), -1),
          periodEnd: addDays(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59), -1),
          totalChats: 189,
          activeChats: 0,
          avgResponseTime: 52,
          firstContactResolution: '75.20',
          customerSatisfaction: '4.28',
          escalationRate: '9.50',
          aiResolutionRate: '58.70',
          ticketsResolved: 51,
        },
        // Weekly metrics for Acme
        {
          organizationId: acme.id,
          period: 'WEEK',
          periodStart: addDays(new Date(now.getFullYear(), now.getMonth(), now.getDate()), -7),
          periodEnd: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          totalChats: 1247,
          activeChats: 23,
          avgResponseTime: 48,
          firstContactResolution: '76.80',
          customerSatisfaction: '4.31',
          escalationRate: '8.90',
          aiResolutionRate: '60.20',
          ticketsResolved: 312,
        },
        // Monthly metrics for Acme
        {
          organizationId: acme.id,
          period: 'MONTH',
          periodStart: new Date(now.getFullYear(), now.getMonth(), 1),
          periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0),
          totalChats: 4892,
          activeChats: 23,
          avgResponseTime: 51,
          firstContactResolution: '74.50',
          customerSatisfaction: '4.25',
          escalationRate: '9.80',
          aiResolutionRate: '57.30',
          ticketsResolved: 1234,
        },
        // Daily metrics for TechStart
        {
          organizationId: techstart.id,
          period: 'DAY',
          periodStart: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          periodEnd: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
          totalChats: 42,
          activeChats: 5,
          avgResponseTime: 65,
          firstContactResolution: '68.50',
          customerSatisfaction: '4.10',
          escalationRate: '12.20',
          aiResolutionRate: '45.80',
          ticketsResolved: 12,
        },
      ])
      .returning()

    console.log(`✅ Created ${performanceMetrics.length} performance metrics\n`)

    // ========================================================================
    // Team Performance
    // ========================================================================
    console.log('👥 Creating team performance records...')

    const teamPerformance = await db
      .insert(schema.teamPerformance)
      .values([
        // Week performance for Acme reps
        {
          organizationId: acme.id,
          representativeId: acmeRep1.id,
          period: 'WEEK',
          periodStart: addDays(new Date(now.getFullYear(), now.getMonth(), now.getDate()), -7),
          periodEnd: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          ticketsHandled: 87,
          avgResponseTime: 42,
          resolutionRate: '82.75',
          customerSatisfaction: '4.50',
          trend: 'UP',
        },
        {
          organizationId: acme.id,
          representativeId: acmeRep2.id,
          period: 'WEEK',
          periodStart: addDays(new Date(now.getFullYear(), now.getMonth(), now.getDate()), -7),
          periodEnd: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          ticketsHandled: 124,
          avgResponseTime: 38,
          resolutionRate: '88.70',
          customerSatisfaction: '4.85',
          trend: 'STABLE',
        },
        {
          organizationId: acme.id,
          representativeId: acmeRep3.id,
          period: 'WEEK',
          periodStart: addDays(new Date(now.getFullYear(), now.getMonth(), now.getDate()), -7),
          periodEnd: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          ticketsHandled: 101,
          avgResponseTime: 35,
          resolutionRate: '91.08',
          customerSatisfaction: '4.92',
          trend: 'UP',
        },
        // Month performance for Acme reps
        {
          organizationId: acme.id,
          representativeId: acmeRep1.id,
          period: 'MONTH',
          periodStart: new Date(now.getFullYear(), now.getMonth(), 1),
          periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0),
          ticketsHandled: 342,
          avgResponseTime: 45,
          resolutionRate: '79.50',
          customerSatisfaction: '4.45',
          trend: 'STABLE',
        },
        {
          organizationId: acme.id,
          representativeId: acmeRep2.id,
          period: 'MONTH',
          periodStart: new Date(now.getFullYear(), now.getMonth(), 1),
          periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0),
          ticketsHandled: 487,
          avgResponseTime: 41,
          resolutionRate: '85.20',
          customerSatisfaction: '4.80',
          trend: 'UP',
        },
        {
          organizationId: acme.id,
          representativeId: acmeRep3.id,
          period: 'MONTH',
          periodStart: new Date(now.getFullYear(), now.getMonth(), 1),
          periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0),
          ticketsHandled: 405,
          avgResponseTime: 38,
          resolutionRate: '89.60',
          customerSatisfaction: '4.88',
          trend: 'UP',
        },
        // TechStart rep
        {
          organizationId: techstart.id,
          representativeId: techstartRep.id,
          period: 'WEEK',
          periodStart: addDays(new Date(now.getFullYear(), now.getMonth(), now.getDate()), -7),
          periodEnd: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          ticketsHandled: 52,
          avgResponseTime: 58,
          resolutionRate: '73.08',
          customerSatisfaction: '4.20',
          trend: 'STABLE',
        },
      ])
      .returning()

    console.log(`✅ Created ${teamPerformance.length} team performance records\n`)

    // ========================================================================
    // Summary
    // ========================================================================
    console.log('✨ Database seeding completed successfully!\n')
    console.log('📊 Summary:')
    console.log(`   Organizations: ${organizations.length}`)
    console.log(`   Users: ${allUsers.length}`)
    console.log(`   Representatives: ${representatives.length}`)
    console.log(`   Customer Profiles: ${customerProfiles.length}`)
    console.log(`   Tickets: ${tickets.length}`)
    console.log(`   Escalations: ${escalations.length}`)
    console.log(`   Refunds: ${refunds.length}`)
    console.log(`   Budgets: ${budgets.length}`)
    console.log(`   Agent Configurations: ${agentConfigurations.length}`)
    console.log(`   Decision Rules: ${decisionRules.length}`)
    console.log(`   Performance Metrics: ${performanceMetrics.length}`)
    console.log(`   Team Performance: ${teamPerformance.length}`)
    console.log('\n🎉 You can now test the API with realistic data!')
    console.log('\n💡 Test organization credentials:')
    console.log('   - Acme Corporation (slug: acme-corp)')
    console.log('   - TechStart Inc (slug: techstart-inc)')
  } catch (error) {
    console.error('\n❌ Error seeding database:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// ============================================================================
// Execute
// ============================================================================

seed()
  .then(() => {
    console.log('\n✅ Seed script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Seed script failed:', error)
    process.exit(1)
  })
