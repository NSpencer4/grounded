import { z } from 'zod'

export const DecisionRuleConditionSchema = z.object({
  field: z.string(),
  operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'contains']),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.unknown())]),
})

export const DecisionRuleActionSchema = z.enum([
  'AUTO_RESOLVE',
  'ESCALATE_TO_HUMAN',
  'REQUEST_MORE_INFO',
  'ROUTE_TO_SENIOR',
  'AUTO_APPROVE_REFUND',
  'DENY_REFUND',
  'CUSTOM',
])

export const DecisionRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  enabled: z.boolean(),
  priority: z.number().int().positive(),
  conditions: z.array(DecisionRuleConditionSchema),
  action: DecisionRuleActionSchema,
  actionParams: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastTriggeredAt: z.date().optional(),
})

export type DecisionRule = z.infer<typeof DecisionRuleSchema>
export type DecisionRuleCondition = z.infer<typeof DecisionRuleConditionSchema>
export type DecisionRuleAction = z.infer<typeof DecisionRuleActionSchema>
