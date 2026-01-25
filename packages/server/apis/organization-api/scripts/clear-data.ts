#!/usr/bin/env tsx
/**
 * Clear Data Script for Organization API Database
 *
 * This script removes all data from the PostgreSQL database while preserving
 * the schema structure. Useful for resetting to a clean state before re-seeding.
 *
 * Usage:
 *   npm run db:clear (if added to package.json)
 *   npx tsx scripts/clear-data.ts
 *
 * Environment Variables:
 *   DB_HOST - PostgreSQL host (default: localhost)
 *   DB_PORT - PostgreSQL port (default: 5432)
 *   DB_USER - PostgreSQL username (default: postgres)
 *   DB_PASSWORD - PostgreSQL password
 *   DB_NAME - Database name (default: grounded)
 *
 * ⚠️  WARNING: This will delete ALL data from the database!
 */

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { sql } from 'drizzle-orm'
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
// Clear Data
// ============================================================================

async function clearData() {
  console.log('🧹 Starting database cleanup...\n')
  console.log('⚠️  WARNING: This will delete ALL data from the database!\n')

  try {
    // Delete in order to respect foreign key constraints
    console.log('Deleting budget usage records...')
    await db.delete(schema.budgetUsageRecords)

    console.log('Deleting team performance records...')
    await db.delete(schema.teamPerformance)

    console.log('Deleting performance metrics...')
    await db.delete(schema.performanceMetrics)

    console.log('Deleting decision rules...')
    await db.delete(schema.decisionRules)

    console.log('Deleting agent configurations...')
    await db.delete(schema.agentConfigurations)

    console.log('Deleting budgets...')
    await db.delete(schema.budgets)

    console.log('Deleting refunds...')
    await db.delete(schema.refunds)

    console.log('Deleting escalations...')
    await db.delete(schema.escalations)

    console.log('Deleting tickets...')
    await db.delete(schema.tickets)

    console.log('Deleting customer profiles...')
    await db.delete(schema.customerProfiles)

    console.log('Deleting representatives...')
    await db.delete(schema.representatives)

    console.log('Deleting users...')
    await db.delete(schema.users)

    console.log('Deleting organizations...')
    await db.delete(schema.organizations)

    console.log('\n✅ All data cleared successfully!')
    console.log('\n💡 You can now run the seed script to populate with fresh data:')
    console.log('   npm run db:seed-comprehensive')
  } catch (error) {
    console.error('\n❌ Error clearing database:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// ============================================================================
// Execute
// ============================================================================

clearData()
  .then(() => {
    console.log('\n✅ Clear script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Clear script failed:', error)
    process.exit(1)
  })
