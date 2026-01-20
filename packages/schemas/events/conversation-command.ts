import { ConversationInitiatedEvent } from './conversation-initiated'
import { MessageReceivedEvent } from './message-received'

export type ConversationCommandEvent = ConversationInitiatedEvent | MessageReceivedEvent
