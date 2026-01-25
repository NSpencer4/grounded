/**
 * GraphQL Types for Grounded Gateway API
 * These types match the GraphQL schema and provide type safety
 */

// ==================== ENUMS ====================

export enum ConversationStatus {
  ACTIVE = 'ACTIVE',
  WAITING = 'WAITING',
  CLOSED = 'CLOSED',
  ESCALATED = 'ESCALATED',
}

export enum MessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM',
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  REPRESENTATIVE = 'REPRESENTATIVE',
  ADMIN = 'ADMIN',
  SYSTEM = 'SYSTEM',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum RepresentativeStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  OFFLINE = 'OFFLINE',
}

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING = 'WAITING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum EscalationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
}

export enum RefundStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PROCESSED = 'PROCESSED',
  REJECTED = 'REJECTED',
}

export enum BudgetType {
  REFUND = 'REFUND',
  COMPENSATION = 'COMPENSATION',
  DISCOUNT = 'DISCOUNT',
}

export enum BudgetPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export enum BudgetStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXCEEDED = 'EXCEEDED',
}

export enum AgentType {
  CUSTOMER_SPEND_ANALYZER = 'CUSTOMER_SPEND_ANALYZER',
  RESPONSE_RECOMMENDER = 'RESPONSE_RECOMMENDER',
  SENTIMENT_ANALYZER = 'SENTIMENT_ANALYZER',
  TICKET_CLASSIFIER = 'TICKET_CLASSIFIER',
}

export enum AgentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TRAINING = 'TRAINING',
  ERROR = 'ERROR',
}

export enum DecisionRuleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
}

// ==================== CORE TYPES ====================

export interface Health {
  status: string
  timestamp: string
}

export interface Message {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  timestamp: string
}

export interface Conversation {
  id: string
  orgId: string
  userId: string
  status: ConversationStatus
  messages?: Message[]
  createdAt: string
  updatedAt: string
}

export interface ConversationEdge {
  node: Conversation
  cursor: string
}

export interface PageInfo {
  hasNextPage: boolean
  endCursor: string | null
}

export interface ConversationsConnection {
  edges: ConversationEdge[]
  pageInfo: PageInfo
}

export interface Organization {
  id: string
  name: string
  slug: string
  settings: OrganizationSettings
  createdAt: string
  updatedAt: string
}

export interface OrganizationSettings {
  timezone: string
  locale: string
  features: string[]
}

export interface UserMetadata {
  phone?: string
  department?: string
  title?: string
  [key: string]: string | undefined
}

export interface User {
  id: string
  orgId: string
  email: string
  name: string
  role: UserRole
  status: UserStatus
  metadata?: UserMetadata
  createdAt: string
  updatedAt: string
}

export interface Schedule {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export interface Availability {
  isAvailable: boolean
  schedule?: Schedule[]
}

export interface RepresentativeMetrics {
  totalConversations: number
  averageResponseTime: number
  resolutionRate: number
  customerSatisfaction: number
}

export interface Representative {
  id: string
  orgId: string
  userId: string
  name: string
  email: string
  department?: string
  status: RepresentativeStatus
  availability?: Availability
  metrics?: RepresentativeMetrics
  createdAt: string
  updatedAt: string
}

export interface Address {
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

export interface CustomerMetadata {
  accountNumber?: string
  segment?: string
  tags?: string[]
  [key: string]: string | string[] | undefined
}

export interface Customer {
  id: string
  orgId: string
  userId?: string
  name: string
  email: string
  phone?: string
  address?: Address
  status: CustomerStatus
  metadata?: CustomerMetadata
  createdAt: string
  updatedAt: string
}

export interface Ticket {
  id: string
  orgId: string
  customerId: string
  conversationId?: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category?: string
  assignedTo?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

export interface Escalation {
  id: string
  orgId: string
  ticketId: string
  conversationId?: string
  reason: string
  status: EscalationStatus
  escalatedFrom?: string
  escalatedTo: string
  notes?: string
  createdAt: string
  resolvedAt?: string
}

export interface Refund {
  id: string
  orgId: string
  customerId: string
  orderId: string
  amount: number
  currency: string
  reason: string
  status: RefundStatus
  method?: string
  notes?: string
  processedBy?: string
  createdAt: string
  processedAt?: string
}

export interface Budget {
  id: string
  orgId: string
  name: string
  type: BudgetType
  amount: number
  currency: string
  period: BudgetPeriod
  spent: number
  remaining: number
  startDate: string
  endDate: string
  status: BudgetStatus
  createdAt: string
  updatedAt: string
}

export interface AgentConfig {
  model: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  tools?: string[]
  [key: string]: string | number | string[] | undefined
}

export interface AgentMetrics {
  totalInvocations: number
  successRate: number
  averageLatency: number
  lastInvoked?: string
}

export interface Agent {
  id: string
  orgId: string
  name: string
  type: AgentType
  description: string
  status: AgentStatus
  config: AgentConfig
  metrics?: AgentMetrics
  createdAt: string
  updatedAt: string
}

export interface RuleCondition {
  field: string
  operator: string
  value: string
}

export interface RuleAction {
  type: string
  params: Record<string, unknown>
}

export interface DecisionRule {
  id: string
  orgId: string
  name: string
  description: string
  conditions: RuleCondition[]
  actions: RuleAction[]
  priority: number
  status: DecisionRuleStatus
  createdAt: string
  updatedAt: string
}

export interface Period {
  start: string
  end: string
}

export interface ConversationMetrics {
  total: number
  active: number
  resolved: number
  escalated: number
  averageDuration: number
}

export interface RepresentativeMetricsAggregate {
  total: number
  active: number
  averageResponseTime: number
  averageResolutionRate: number
}

export interface CustomerMetrics {
  total: number
  new: number
  returning: number
  satisfactionScore: number
}

export interface AIMetrics {
  totalInvocations: number
  successRate: number
  averageLatency: number
  costSavings: number
}

export interface PerformanceMetrics {
  orgId: string
  period: Period
  conversations: ConversationMetrics
  representatives: RepresentativeMetricsAggregate
  customers: CustomerMetrics
  ai: AIMetrics
  timestamp: string
}

// ==================== INPUT TYPES ====================

export interface UserMetadataInput {
  phone?: string
  department?: string
  title?: string
}

export interface AddressInput {
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

export interface CustomerMetadataInput {
  accountNumber?: string
  segment?: string
  tags?: string[]
}

export interface ScheduleInput {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export interface AvailabilityInput {
  isAvailable: boolean
  schedule?: ScheduleInput[]
}

export interface AgentConfigInput {
  model: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  tools?: string[]
}

export interface RuleConditionInput {
  field: string
  operator: string
  value: string
}

export interface RuleActionInput {
  type: string
  params: Record<string, unknown>
}
