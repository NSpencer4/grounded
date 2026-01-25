# Database Seeding Scripts - Summary

Complete guide to the database seeding utilities for Organization API.

## What Was Created

### 📁 New Files

1. **`scripts/seed-data.ts`** (372 lines)
   - Comprehensive database seeding script
   - Creates 60+ interconnected records across 12 tables
   - Realistic data with proper foreign key relationships
   - Detailed console output and error handling

2. **`scripts/clear-data.ts`** (90 lines)
   - Database cleanup script
   - Deletes all data while preserving schema
   - Respects foreign key constraints
   - Safe deletion order

3. **`scripts/README.md`** (250+ lines)
   - Complete scripts documentation
   - Usage instructions for all scripts
   - Troubleshooting guide
   - Integration examples

4. **`scripts/QUICKSTART.md`** (280+ lines)
   - Step-by-step setup guide
   - First-time user walkthrough
   - Testing instructions
   - Common operations

5. **`scripts/TEST-SCENARIOS.md`** (520+ lines)
   - Comprehensive test scenarios
   - GraphQL query examples
   - REST API examples
   - UI integration patterns
   - Data relationship testing

### 🔧 Updated Files

1. **`package.json`**
   - Added `db:seed-comprehensive` script
   - Added `db:clear` script
   - Added `db:reset` script (clear + seed)

2. **`README.md`**
   - Added database management section
   - Added scripts reference table
   - Updated quick start guide
   - Added seeding documentation

## NPM Scripts Added

| Script | Command | Description |
|--------|---------|-------------|
| `db:seed-comprehensive` | `tsx scripts/seed-data.ts` | Seed 60+ realistic records |
| `db:clear` | `tsx scripts/clear-data.ts` | Clear all data |
| `db:reset` | `db:clear && db:seed-comprehensive` | Complete reset |

## Mock Data Created

### Organizations (2)
- **Acme Corporation** (slug: `acme-corp`)
  - Plan: Enterprise
  - Status: Active
  - Features: ai-agents, analytics, escalations, budgets
  - Industry: Technology, 500+ employees

- **TechStart Inc** (slug: `techstart-inc`)
  - Plan: Professional
  - Status: Active
  - Features: ai-agents, analytics
  - Industry: SaaS, 10-50 employees

### Users (12)
- 7 Customers (various tiers and spending levels)
- 4 Representatives (different roles and statuses)
- 1 Admin

### Representatives (4)
- Jane Representative - Junior Support, Online (4.50 rating, 3 active chats)
- John Senior - Senior Support, Online (4.85 rating, 5 active chats)
- Sarah Lead - Team Lead, Away (4.92 rating, 2 active chats)
- TechStart Support - Senior Support, Online (4.75 rating, 2 active chats)

### Customer Profiles (5)
- **Enterprise Tier (1)**: $15,420 LTV, 850K tokens, 5 active sites
- **Pro Tier (2)**: $4,250 and $3,200 LTV, 45K-38K tokens
- **Starter Tier (1)**: $780 LTV, 500 tokens, payment warning
- **Free Tier (1)**: $0 LTV, 900 tokens

### Tickets (6)
- **ACME-1001**: API integration not working (HIGH, IN_PROGRESS)
- **ACME-1002**: Billing discrepancy (NORMAL, RESOLVED)
- **ACME-1003**: Account suspended - payment overdue (HIGH, WAITING)
- **ACME-1004**: Feature request - Custom branding (LOW, OPEN)
- **ACME-1005**: Chat widget not loading on mobile (URGENT, IN_PROGRESS)
- **ACME-1006**: Token usage exceeds quota (NORMAL, RESOLVED)

### Escalations (3)
- API integration issue (HIGH, IN_PROGRESS) - Technical issue
- Mobile Safari bug (URGENT, ASSIGNED) - AI unable to resolve
- Billing dispute (NORMAL, RESOLVED) - Billing dispute, refund processed

### Refunds (4)
- $50.00 - Billing error (COMPLETED)
- $49.00 - Service downtime (PENDING)
- $150.00 - Customer goodwill (APPROVED)
- $75.00 - AI bug (PENDING)

### Budgets (4)
- Monthly Refund Budget: $5,000 ($324 spent, 6.5% used)
- Quarterly Compensation: $10,000 ($1,250 spent, 12.5% used)
- Yearly Discount: $25,000 ($8,420 spent, 33.7% used)
- TechStart Monthly Refund: $1,000 ($0 spent, 0% used)

### Agent Configurations (5)
- **Response Recommendation Agent**: 1,247 assertions, 94.5% accuracy, 850ms latency
- **Customer Spend Analyzer**: 892 assertions, 91.2% accuracy, 620ms latency
- **Sentiment Analysis**: 3,421 assertions, 88.75% accuracy, 320ms latency
- **Escalation Predictor**: 645 assertions, 86.3% accuracy, 540ms latency
- **Basic Response Agent** (TechStart): 234 assertions, 82.5% accuracy, 920ms latency

### Decision Rules (5)
1. **Auto-resolve simple billing questions** (priority: 10)
   - Auto-resolve low-complexity billing inquiries

2. **Escalate VIP customers** (priority: 100)
   - Immediate escalation for Enterprise tier

3. **Auto-approve small refunds** (priority: 50)
   - Approve refunds under $50 for good standing

4. **Request more info for vague issues** (priority: 20)
   - Ask clarification for short descriptions

5. **Escalate negative sentiment** (priority: 80)
   - Human escalation for negative sentiment

### Performance Metrics (5)
- **Today's metrics**: 156 chats, 78.5% FCR, 4.35 CSAT, 8.3% escalation
- **Yesterday's metrics**: 189 chats, 75.2% FCR, 4.28 CSAT
- **Weekly metrics**: 1,247 chats, 76.8% FCR, 4.31 CSAT
- **Monthly metrics**: 4,892 chats, 74.5% FCR, 4.25 CSAT
- **TechStart daily**: 42 chats, 68.5% FCR, 4.10 CSAT

### Team Performance (7)
Individual rep metrics for week and month periods showing:
- Tickets handled
- Average response time
- Resolution rate
- Customer satisfaction
- Performance trend (UP, DOWN, STABLE)

## Usage Examples

### Complete Setup from Scratch

```bash
# 1. Start PostgreSQL
docker-compose up postgres -d

# 2. Navigate to API directory
cd packages/server/apis/organization-api

# 3. Run migrations
npm run db:migrate

# 4. Seed database
npm run db:seed-comprehensive

# 5. Start API
npm run dev
```

### Reset Database

```bash
# One command to clear and re-seed
npm run db:reset
```

### Visual Data Inspection

```bash
# Open Drizzle Studio
npm run db:studio

# Opens https://local.drizzle.studio
```

### Test with Postman

```bash
# Import collection
postman/collections/organization-api.json

# Import environment
postman/environments/local.postman_environment.json

# Select "Local" environment
# Start making requests!
```

### Test with GraphQL Gateway

```bash
# Start Organization API
cd packages/server/apis/organization-api
npm run dev

# In another terminal, start GraphQL Gateway
cd packages/server/apis/gateway-api
npm run dev

# Query via GraphQL at http://localhost:8787/graphql
```

## Data Relationships Map

```
Organizations
    ├── Users (12)
    │   ├── Representatives (4) [one-to-one with Users]
    │   └── Customer Profiles (5) [one-to-one with Users]
    ├── Tickets (6)
    │   ├── → Customer (User)
    │   └── → Assigned Rep (Representative, nullable)
    ├── Escalations (3)
    │   ├── → Customer (User)
    │   └── → Assigned Rep (Representative, nullable)
    ├── Refunds (4)
    │   ├── → Customer (User)
    │   └── → Approved By (Representative, nullable)
    ├── Budgets (4)
    ├── Agent Configurations (5)
    ├── Decision Rules (5)
    ├── Performance Metrics (5)
    └── Team Performance (7)
        └── → Representative
```

## Key Features

✅ **Comprehensive Coverage** - All 12 tables populated  
✅ **Realistic Relationships** - Proper foreign keys and references  
✅ **Variety** - Different statuses, tiers, priorities for testing  
✅ **Two Organizations** - Test multi-tenancy and data isolation  
✅ **Historical Data** - Performance metrics over time  
✅ **Edge Cases** - Includes warning states, pending items, etc.  
✅ **Type Safe** - Uses Drizzle ORM type inference  
✅ **Idempotent** - Can run multiple times (use `db:reset`)  

## Production Considerations

**⚠️ These scripts are for DEVELOPMENT ONLY**

Do not run in production:
- Mock data is for testing purposes
- Passwords and secrets are not secure
- Data is randomly generated
- No data privacy compliance

For production data:
- Use proper data migration tools
- Import from secure backups
- Follow data privacy regulations
- Use environment-specific secrets

## Support

For issues or questions:
- Check `scripts/README.md` for detailed documentation
- See `scripts/QUICKSTART.md` for setup instructions
- Review `scripts/TEST-SCENARIOS.md` for testing examples
- Inspect `scripts/seed-data.ts` source code
- Use Drizzle Studio for visual inspection

## Quick Reference

```bash
# Setup
npm run db:migrate              # Apply schema
npm run db:seed-comprehensive   # Add mock data
npm run dev                     # Start API

# Reset
npm run db:reset                # Clear + seed

# Inspect
npm run db:studio               # Visual browser

# Test
npm run test:endpoints          # Endpoint tests
```

## Files Overview

| File | Lines | Purpose |
|------|-------|---------|
| `seed-data.ts` | 372 | Main seeding script |
| `clear-data.ts` | 90 | Data cleanup script |
| `README.md` | 250+ | Script documentation |
| `QUICKSTART.md` | 280+ | Setup walkthrough |
| `TEST-SCENARIOS.md` | 520+ | Testing guide |
| `SUMMARY.md` | This file | Overview |

**Total:** 1,500+ lines of documentation and tooling

## Success Criteria

After running the seed script, you should be able to:

1. ✅ Query all 12 resource types via REST API
2. ✅ Query all resources via GraphQL Gateway
3. ✅ Test CRUD operations on all entities
4. ✅ Verify foreign key relationships
5. ✅ Test pagination with realistic data volumes
6. ✅ Test filters (status, date ranges)
7. ✅ View data in Drizzle Studio
8. ✅ Import and use Postman collection
9. ✅ Build UI components with real data
10. ✅ Test multi-tenant data isolation

## Next Steps

1. Run the seed script: `npm run db:seed-comprehensive`
2. Start the API: `npm run dev`
3. Test with Postman: Import `organization-api.json`
4. Integrate with UI: Use GraphQL Gateway
5. Build features: Use the realistic mock data

Happy coding! 🚀
