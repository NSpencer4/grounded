import type { ConversationStream } from './durable-objects/conversation-stream'

declare global {
  interface Env {
    // Durable Object bindings
    CONVERSATION_STREAM: DurableObjectNamespace<ConversationStream>

    // Environment variables
    CONVERSATION_COMMANDS_API_URL: string
    CONVERSATION_UPDATES_API_URL: string
    ORGANIZATION_API_URL: string
  }
}

export {}
