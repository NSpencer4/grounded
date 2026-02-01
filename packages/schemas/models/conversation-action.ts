import { z } from 'zod'

export const ConversationActionSchema = z.object({})

export type ConversationAction = z.infer<typeof ConversationActionSchema>
