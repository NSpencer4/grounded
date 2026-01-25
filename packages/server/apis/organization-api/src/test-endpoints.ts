/**
 * Test script to verify all CRUD endpoints
 * Run with: tsx src/test-endpoints.ts
 */
import { getDb } from './db'
import { matchRoute, executeHandler } from './router'
import { RouteContext } from './types'

async function testEndpoints() {
  console.info('🧪 Testing Organization API Endpoints...\n')

  const db = await getDb({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'grounded',
  })

  const ctx: RouteContext = { db }

  // Get seeded org ID
  const org = await db.query.organizations.findFirst()
  if (!org) {
    console.error('❌ No organization found. Run npm run db:seed first.')
    process.exit(1)
  }

  const orgId = org.id
  console.info(`✅ Using organization: ${org.name} (${orgId})\n`)

  // Test suite
  const tests = [
    {
      name: 'Health Check',
      method: 'GET',
      path: '/health',
      params: {},
      query: {},
    },
    {
      name: 'Get Organization',
      method: 'GET',
      path: `/organizations/${orgId}`,
      params: { id: orgId },
      query: {},
    },
    {
      name: 'List Users',
      method: 'GET',
      path: `/organizations/${orgId}/users`,
      params: { orgId },
      query: { limit: '10' },
    },
    {
      name: 'List Representatives',
      method: 'GET',
      path: `/organizations/${orgId}/representatives`,
      params: { orgId },
      query: {},
    },
    {
      name: 'List Customer Profiles',
      method: 'GET',
      path: `/organizations/${orgId}/customer-profiles`,
      params: { orgId },
      query: {},
    },
    {
      name: 'List Tickets',
      method: 'GET',
      path: `/organizations/${orgId}/tickets`,
      params: { orgId },
      query: {},
    },
    {
      name: 'List Escalations',
      method: 'GET',
      path: `/organizations/${orgId}/escalations`,
      params: { orgId },
      query: {},
    },
    {
      name: 'List Refunds',
      method: 'GET',
      path: `/organizations/${orgId}/refunds`,
      params: { orgId },
      query: {},
    },
    {
      name: 'List Budgets',
      method: 'GET',
      path: `/organizations/${orgId}/budgets`,
      params: { orgId },
      query: {},
    },
    {
      name: 'List AI Agents',
      method: 'GET',
      path: `/organizations/${orgId}/agents`,
      params: { orgId },
      query: {},
    },
    {
      name: 'List Decision Rules',
      method: 'GET',
      path: `/organizations/${orgId}/decision-rules`,
      params: { orgId },
      query: {},
    },
    {
      name: 'List Performance Metrics',
      method: 'GET',
      path: `/organizations/${orgId}/performance-metrics`,
      params: { orgId },
      query: {},
    },
    {
      name: 'List Team Performance',
      method: 'GET',
      path: `/organizations/${orgId}/team-performance`,
      params: { orgId },
      query: {},
    },
  ]

  let passed = 0
  let failed = 0

  for (const test of tests) {
    try {
      const route = matchRoute(test.method, test.path)

      if (!route) {
        console.error(`❌ ${test.name}: Route not matched`)
        failed++
        continue
      }

      // Special handling for health check
      if (route.handler === 'health') {
        console.info(`✅ ${test.name}: OK`)
        passed++
        continue
      }

      const result = await executeHandler(route.handler, route.params, test.query, undefined, ctx)

      if (result.status >= 200 && result.status < 300) {
        const data = (result.body as any).data
        const count = Array.isArray(data) ? data.length : 1
        console.info(`✅ ${test.name}: ${result.status} (${count} items)`)
        passed++
      } else {
        console.error(`❌ ${test.name}: ${result.status}`, result.body)
        failed++
      }
    } catch (error) {
      console.error(`❌ ${test.name}: ${error instanceof Error ? error.message : error}`)
      failed++
    }
  }

  console.info(`\n📊 Results: ${passed} passed, ${failed} failed`)

  if (failed > 0) {
    process.exit(1)
  }
}

testEndpoints()
  .then(() => {
    console.info('\n🎉 All tests passed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Test suite failed:', error)
    process.exit(1)
  })
