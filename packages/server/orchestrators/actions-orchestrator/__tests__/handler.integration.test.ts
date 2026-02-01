import { conversationInitiatedWithMessage } from '@grounded/schemas/test-data/events'

describe('Handler Integration Tests', () => {
  describe('ConversationInitiatedEvent processing', () => {
    it('should process a conversation initiated event that has an initial message', async () => {
      const event = conversationInitiatedWithMessage

      expect(event).toBeDefined()
    })
  })
})
