import { z } from 'zod'

export const ConversationDecisionSchema = z.object({})

export type ConversationDecision = z.infer<typeof ConversationDecisionSchema>
