import 'dotenv/config'
import { Client } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema'

const {
  organizations,
  users,
  representatives,
  customerProfiles,
  tickets,
  escalations,
  refunds,
  budgets,
  agentConfigurations,
  decisionRules,
  performanceMetrics,
  teamPerformance,
} = schema

async function seed() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'grounded',
    ssl: false,
  })

  await client.connect()
  const db = drizzle(client, { schema })

  console.log('🌱 Seeding database...')

  // Create organization
  const [organization] = await db
    .insert(organizations)
    .values({
      name: 'Acme Corp',
      slug: 'acme-corp',
      plan: 'PROFESSIONAL',
      status: 'ACTIVE',
      settings: {
        autoEscalationEnabled: true,
        aiResolutionEnabled: true,
        refundAutoApprovalEnabled: true,
        maxRefundPerUser: 500,
        businessHours: {
          timezone: 'America/New_York',
          days: [1, 2, 3, 4, 5],
          startTime: '09:00',
          endTime: '17:00',
        },
      },
    })
    .returning()

  console.log('✅ Created organization:', organization.name)

  // Create admin user
  await db.insert(users).values({
    organizationId: organization.id,
    email: 'admin@acme.com',
    name: 'Admin User',
    role: 'ADMIN',
  })

  // Create representatives
  const [rep1User] = await db
    .insert(users)
    .values({
      organizationId: organization.id,
      email: 'alex.rivera@acme.com',
      name: 'Alex Rivera',
      role: 'REPRESENTATIVE',
    })
    .returning()

  const [rep2User] = await db
    .insert(users)
    .values({
      organizationId: organization.id,
      email: 'jordan.smith@acme.com',
      name: 'Jordan Smith',
      role: 'REPRESENTATIVE',
    })
    .returning()

  const [rep3User] = await db
    .insert(users)
    .values({
      organizationId: organization.id,
      email: 'sarah.chen@acme.com',
      name: 'Sarah Chen',
      role: 'REPRESENTATIVE',
    })
    .returning()

  const [rep1] = await db
    .insert(representatives)
    .values({
      organizationId: organization.id,
      userId: rep1User.id,
      role: 'SENIOR_SUPPORT',
      status: 'ONLINE',
      activeChats: 7,
      maxChats: 10,
      rating: '4.9',
    })
    .returning()

  const [rep2] = await db
    .insert(representatives)
    .values({
      organizationId: organization.id,
      userId: rep2User.id,
      role: 'TEAM_LEAD',
      status: 'ONLINE',
      activeChats: 10,
      maxChats: 10,
      rating: '4.8',
    })
    .returning()

  const [rep3] = await db
    .insert(representatives)
    .values({
      organizationId: organization.id,
      userId: rep3User.id,
      role: 'SENIOR_SUPPORT',
      status: 'AWAY',
      activeChats: 4,
      maxChats: 10,
      rating: '4.7',
    })
    .returning()

  console.log('✅ Created representatives')

  // Create customer users
  const customerUsers = await db
    .insert(users)
    .values([
      {
        organizationId: organization.id,
        email: 'john.doe@example.com',
        name: 'John Doe',
        role: 'CUSTOMER',
      },
      {
        organizationId: organization.id,
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        role: 'CUSTOMER',
      },
      {
        organizationId: organization.id,
        email: 'robert.johnson@example.com',
        name: 'Robert Johnson',
        role: 'CUSTOMER',
      },
    ])
    .returning()

  // Create customer profiles
  await db.insert(customerProfiles).values(
    customerUsers.map((user, idx) => ({
      organizationId: organization.id,
      userId: user.id,
      tier: (idx === 0 ? 'ENTERPRISE' : idx === 1 ? 'PRO' : 'FREE') as
        | 'ENTERPRISE'
        | 'PRO'
        | 'FREE',
      standing: 'GOOD' as const,
      lifetimeValue: idx === 0 ? '5000.00' : idx === 1 ? '1200.00' : '0.00',
      lastBillingDate: new Date('2026-01-01'),
      nextBillingDate: new Date('2026-02-01'),
      billingCycle: 'MONTHLY' as const,
      billingAmount: idx === 0 ? '299.00' : idx === 1 ? '99.00' : '0.00',
      tokenBalance: idx === 0 ? 8400 : idx === 1 ? 3200 : 1000,
      tokenLimit: idx === 0 ? 10000 : idx === 1 ? 5000 : 1000,
      activeSites: idx === 0 ? 3 : idx === 1 ? 1 : 0,
      sitesLimit: idx === 0 ? 10 : idx === 1 ? 5 : 1,
      context: {
        browser: 'Chrome 122',
        os: 'macOS 14.3',
        location: 'New York, USA',
      },
    })),
  )

  console.log('✅ Created customer profiles')

  // Create tickets
  await db.insert(tickets).values([
    {
      organizationId: organization.id,
      ticketNumber: 'TICKET-1001',
      customerId: customerUsers[0].id,
      assignedTo: rep1.id,
      subject: 'SSO integration failure with Okta',
      description: 'Unable to configure Okta SSO for our team',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      category: 'TECHNICAL_ISSUE',
      aiHandled: false,
      sentiment: '0.20',
      estimatedResolutionTime: 7200,
    },
    {
      organizationId: organization.id,
      ticketNumber: 'TICKET-1002',
      customerId: customerUsers[1].id,
      assignedTo: rep2.id,
      subject: 'Billing discrepancy for Pro plan renewal',
      description: 'Charged twice for monthly subscription',
      status: 'OPEN',
      priority: 'HIGH',
      category: 'BILLING_PAYMENT',
      aiHandled: false,
      sentiment: '-0.40',
    },
    {
      organizationId: organization.id,
      ticketNumber: 'TICKET-1003',
      customerId: customerUsers[2].id,
      subject: 'How to export project to HTML?',
      description: 'Need help exporting my project',
      status: 'RESOLVED',
      priority: 'NORMAL',
      category: 'ACCOUNT_MANAGEMENT',
      aiHandled: true,
      sentiment: '0.60',
      actualResolutionTime: 180,
      customerSatisfactionScore: '4.5',
      resolvedAt: new Date(),
    },
  ])

  console.log('✅ Created tickets')

  // Create escalations
  await db.insert(escalations).values([
    {
      organizationId: organization.id,
      conversationId: crypto.randomUUID(),
      customerId: customerUsers[0].id,
      assignedTo: rep1.id,
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      reason: 'TECHNICAL_ISSUE',
      issueDescription: 'SSO integration failure with Okta',
      waitTime: 720,
      aiSummary:
        'Customer is experiencing SSO configuration issues with Okta. Urgency: High (project launch in 2 hours). Recommendation: Verify backend settings and check propagation status.',
    },
    {
      organizationId: organization.id,
      conversationId: crypto.randomUUID(),
      customerId: customerUsers[1].id,
      priority: 'HIGH',
      status: 'PENDING',
      reason: 'BILLING_DISPUTE',
      issueDescription: 'Billing mismatch on domain mapping renewal',
      waitTime: 1440,
      aiSummary:
        'Customer was charged twice for their monthly subscription. Requires refund approval.',
    },
  ])

  console.log('✅ Created escalations')

  // Create refunds
  await db.insert(refunds).values([
    {
      organizationId: organization.id,
      orderId: '48292',
      customerId: customerUsers[0].id,
      amount: '50.00',
      reason: 'AI_BUG',
      status: 'APPROVED',
      approvedBy: rep1.id,
      processedAt: new Date(),
    },
    {
      organizationId: organization.id,
      orderId: '11093',
      customerId: customerUsers[1].id,
      amount: '120.00',
      reason: 'SERVICE_DOWNTIME',
      status: 'PENDING',
    },
    {
      organizationId: organization.id,
      orderId: '29901',
      customerId: customerUsers[2].id,
      amount: '25.00',
      reason: 'UX_ISSUE',
      status: 'COMPLETED',
      approvedBy: rep2.id,
      processedAt: new Date(),
    },
  ])

  console.log('✅ Created refunds')

  // Create budget
  await db.insert(budgets).values({
    organizationId: organization.id,
    type: 'REFUND',
    period: 'MONTHLY',
    limit: '10000.00',
    spent: '4200.00',
    remaining: '5800.00',
    alertThresholds: [
      { percentage: 80, enabled: true },
      { percentage: 90, enabled: true },
    ],
    autoAlertsEnabled: true,
    refundLimitPerUser: '500.00',
    periodStart: new Date('2026-01-01'),
    periodEnd: new Date('2026-01-31'),
  })

  console.log('✅ Created budget')

  // Create agent configurations
  await db.insert(agentConfigurations).values([
    {
      organizationId: organization.id,
      name: 'Response Recommendation Agent',
      type: 'RESPONSE_RECOMMENDATION',
      description:
        'Generates contextual response suggestions based on customer intent and conversation history.',
      enabled: true,
      status: 'ACTIVE',
      assertions: 142,
      accuracy: '94.20',
      avgLatency: 1200,
      dataSources: ['Conversation History', 'Customer Profile', 'Knowledge Base'],
      thresholds: {
        confidence: 0.85,
        maxTokens: 500,
        temperature: 0.7,
      },
    },
    {
      organizationId: organization.id,
      name: 'Customer Spend Agent',
      type: 'CUSTOMER_SPEND',
      description:
        'Analyzes customer spending patterns, billing history, and account value for informed decisions.',
      enabled: true,
      status: 'ACTIVE',
      assertions: 89,
      accuracy: '97.80',
      avgLatency: 800,
      dataSources: ['Billing History', 'Subscription Data', 'Transaction Records'],
      thresholds: {
        confidence: 0.9,
        highValueThreshold: 1000,
        refundLimit: 500,
      },
    },
    {
      organizationId: organization.id,
      name: 'Sentiment Analysis Agent',
      type: 'SENTIMENT_ANALYSIS',
      description:
        'Detects customer emotion and urgency levels to prioritize and route conversations appropriately.',
      enabled: true,
      status: 'ACTIVE',
      assertions: 256,
      accuracy: '91.50',
      avgLatency: 500,
      dataSources: ['Message Content', 'Conversation Tone', 'Historical Sentiment'],
      thresholds: {
        confidence: 0.8,
        escalationThreshold: 0.3,
        urgencyWeight: 1.5,
      },
    },
  ])

  console.log('✅ Created agent configurations')

  // Create decision rules
  await db.insert(decisionRules).values([
    {
      organizationId: organization.id,
      name: 'Auto-resolve Simple Queries',
      description: 'Automatically resolve queries when confidence > 95% and sentiment is positive',
      enabled: true,
      priority: 1,
      conditions: [
        { field: 'confidence', operator: 'gt', value: 0.95 },
        { field: 'sentiment', operator: 'gt', value: 0.6 },
        { field: 'complexity', operator: 'lt', value: 0.3 },
      ],
      action: 'AUTO_RESOLVE',
    },
    {
      organizationId: organization.id,
      name: 'High-Value Customer Priority',
      description: 'Route high-value customers to senior agents with full context',
      enabled: true,
      priority: 2,
      conditions: [
        { field: 'customer_value', operator: 'gt', value: 1000 },
        { field: 'account_age', operator: 'gt', value: 365 },
      ],
      action: 'ROUTE_TO_SENIOR',
    },
    {
      organizationId: organization.id,
      name: 'Refund Auto-Approval',
      description: 'Auto-approve refunds under threshold for customers in good standing',
      enabled: true,
      priority: 3,
      conditions: [
        { field: 'refund_amount', operator: 'lt', value: 50 },
        { field: 'previous_refunds', operator: 'lt', value: 2 },
        { field: 'account_standing', operator: 'eq', value: 'good' },
      ],
      action: 'AUTO_APPROVE_REFUND',
    },
    {
      organizationId: organization.id,
      name: 'Escalation Override',
      description: 'Force escalation when negative sentiment persists across multiple messages',
      enabled: true,
      priority: 4,
      conditions: [
        { field: 'sentiment', operator: 'lt', value: 0.3 },
        { field: 'message_count', operator: 'gt', value: 3 },
        { field: 'resolution_status', operator: 'eq', value: 'unresolved' },
      ],
      action: 'ESCALATE_TO_HUMAN',
    },
  ])

  console.log('✅ Created decision rules')

  // Create performance metrics
  await db.insert(performanceMetrics).values({
    organizationId: organization.id,
    period: 'DAY',
    periodStart: new Date('2026-01-24T00:00:00Z'),
    periodEnd: new Date('2026-01-24T23:59:59Z'),
    totalChats: 5240,
    activeChats: 142,
    avgResponseTime: 84,
    firstContactResolution: '78.00',
    customerSatisfaction: '4.60',
    escalationRate: '8.20',
    aiResolutionRate: '64.00',
    ticketsResolved: 1247,
  })

  console.log('✅ Created performance metrics')

  // Create team performance
  await db.insert(teamPerformance).values([
    {
      organizationId: organization.id,
      representativeId: rep1.id,
      period: 'WEEK',
      periodStart: new Date('2026-01-18T00:00:00Z'),
      periodEnd: new Date('2026-01-24T23:59:59Z'),
      ticketsHandled: 187,
      avgResponseTime: 48,
      resolutionRate: '94.00',
      customerSatisfaction: '4.90',
      trend: 'UP',
    },
    {
      organizationId: organization.id,
      representativeId: rep2.id,
      period: 'WEEK',
      periodStart: new Date('2026-01-18T00:00:00Z'),
      periodEnd: new Date('2026-01-24T23:59:59Z'),
      ticketsHandled: 165,
      avgResponseTime: 66,
      resolutionRate: '91.00',
      customerSatisfaction: '4.80',
      trend: 'UP',
    },
    {
      organizationId: organization.id,
      representativeId: rep3.id,
      period: 'WEEK',
      periodStart: new Date('2026-01-18T00:00:00Z'),
      periodEnd: new Date('2026-01-24T23:59:59Z'),
      ticketsHandled: 152,
      avgResponseTime: 78,
      resolutionRate: '88.00',
      customerSatisfaction: '4.70',
      trend: 'STABLE',
    },
  ])

  console.log('✅ Created team performance records')

  await client.end()
  console.log('🎉 Seeding complete!')
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error)
  process.exit(1)
})
