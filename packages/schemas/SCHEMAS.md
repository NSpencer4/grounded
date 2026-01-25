# Grounded Schemas

This package contains all Zod schemas for the Grounded application, providing runtime validation and TypeScript type inference for data models used across the UI and backend services.

## Schema Categories

### Core Models

#### User (`models/user.ts`)
- **UserSchema**: Core user data with role-based access
- Roles: CUSTOMER, REPRESENTATIVE, ADMIN

#### Organization (`models/organization.ts`)
- **OrganizationSchema**: Organization/company data with plans and settings
- Plans: FREE, STARTER, PROFESSIONAL, ENTERPRISE
- Settings: Auto-escalation, AI resolution, refund policies, business hours

#### Conversation (`models/conversation.ts`)
- **ConversationSchema**: Chat conversations with status and participants
- Statuses: WAITING, ACTIVE, CLOSED
- Includes customer, assignee, and timestamp tracking

#### Message (`models/message.ts`)
- **MessageSchema**: Individual chat messages within conversations
- Links to conversation, sender user, and content

### Support & Ticketing

#### Ticket (`models/ticket.ts`)
- **TicketSchema**: Support ticket management
- Statuses: OPEN, IN_PROGRESS, WAITING, RESOLVED, CLOSED
- Priorities: LOW, NORMAL, HIGH, URGENT
- Categories: TECHNICAL_ISSUE, BILLING_PAYMENT, ACCOUNT_MANAGEMENT, FEATURE_REQUEST, BUG_REPORT, OTHER
- Includes AI handling flags, sentiment scores, resolution times, and satisfaction ratings

#### Escalation (`models/escalation.ts`)
- **EscalationSchema**: Escalated conversations requiring human intervention
- Priorities: LOW, NORMAL, HIGH, URGENT, CRITICAL
- Statuses: PENDING, ASSIGNED, IN_PROGRESS, RESOLVED
- Reasons: AI_UNABLE_TO_RESOLVE, CUSTOMER_REQUEST, NEGATIVE_SENTIMENT, TECHNICAL_ISSUE, etc.
- Tracks wait times, AI summaries, and assignment data

#### Representative (`models/representative.ts`)
- **RepresentativeSchema**: Support team members
- Roles: JUNIOR_SUPPORT, SENIOR_SUPPORT, TEAM_LEAD, ADMIN
- Statuses: ONLINE, AWAY, OFFLINE
- Includes workload tracking (active chats vs. max capacity) and performance ratings

### Customer Data

#### Customer Profile (`models/customer-profile.ts`)
- **CustomerProfileSchema**: Extended customer account information
- Account tiers: FREE, STARTER, PRO, ENTERPRISE
- Account standing: GOOD, WARNING, SUSPENDED, CLOSED
- **BillingInfoSchema**: Billing cycle, dates, and amounts
- **UsageStatsSchema**: Token balance/limits, site usage
- **CustomerContextSchema**: Browser, OS, location, device metadata

### Financial

#### Refund (`models/refund.ts`)
- **RefundSchema**: Customer refund requests and processing
- Reasons: AI_BUG, SERVICE_DOWNTIME, UX_ISSUE, BILLING_ERROR, CUSTOMER_REQUEST, OTHER
- Statuses: PENDING, APPROVED, REJECTED, COMPLETED
- Tracks order ID, amount, approver, and processing timestamps

#### Budget (`models/budget.ts`)
- **BudgetSchema**: Organizational budget tracking and limits
- Types: REFUND, COMPENSATION, DISCOUNT, CREDIT
- Periods: DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY
- **BudgetAlertThresholdSchema**: Configurable alert thresholds
- **BudgetUsageRecordSchema**: Individual budget usage entries

### AI & Automation

#### Agent Configuration (`models/agent-configuration.ts`)
- **AgentConfigurationSchema**: AI agent settings and performance tracking
- Types: RESPONSE_RECOMMENDATION, CUSTOMER_SPEND, SENTIMENT_ANALYSIS, ESCALATION_PREDICTOR, CUSTOM
- Statuses: ACTIVE, PAUSED, DISABLED
- Tracks assertions, accuracy, latency, data sources, and thresholds

#### Decision Rule (`models/decision-rule.ts`)
- **DecisionRuleSchema**: Automated decision rules for orchestration
- **DecisionRuleConditionSchema**: Rule conditions with operators (eq, ne, gt, gte, lt, lte, in, nin, contains)
- Actions: AUTO_RESOLVE, ESCALATE_TO_HUMAN, REQUEST_MORE_INFO, ROUTE_TO_SENIOR, AUTO_APPROVE_REFUND, DENY_REFUND, CUSTOM
- Priority-based rule evaluation

### Analytics

#### Performance Metrics (`models/performance-metrics.ts`)
- **KPIMetricSchema**: Key performance indicator data
- **TeamPerformanceSchema**: Individual representative performance tracking
- **PerformanceMetricsSchema**: Organizational performance aggregates
- **TicketCategoryStatsSchema**: Ticket distribution by category
- Periods: HOUR, DAY, WEEK, MONTH, QUARTER, YEAR
- Metrics: Total chats, response times, resolution rates, satisfaction scores, escalation rates

## Usage

```typescript
import {
  UserSchema,
  ConversationSchema,
  MessageSchema,
  TicketSchema,
  RefundSchema,
  AgentConfigurationSchema,
  PerformanceMetricsSchema,
  // ... etc
} from '@grounded/schemas'

// Validate data
const user = UserSchema.parse(userData)

// Type inference
type User = z.infer<typeof UserSchema>

// Partial validation
const partialTicket = TicketSchema.partial().parse(ticketData)
```

## Schema Design Principles

1. **Zod-first**: All schemas are defined using Zod for runtime validation and TypeScript type inference
2. **Consistent naming**: Schemas end with `Schema`, types match the base name
3. **Enum types**: Status, role, and category enums are defined as separate schemas
4. **Nested objects**: Complex nested structures use separate schemas for reusability
5. **Timestamps**: All entities include `createdAt`, `updatedAt` where applicable
6. **UUID identifiers**: All primary keys use UUID strings
7. **Optional fields**: Optional fields are marked with `.optional()`
8. **Validation**: Appropriate Zod validators (min, max, email, uuid, etc.) are used

## Future Enhancements

- Add validation error messages for better UX
- Create GraphQL schema generation from Zod schemas
- Add database schema generation (Prisma, Drizzle)
- Schema versioning for backward compatibility
- Add common utility schemas (pagination, sorting, filtering)
