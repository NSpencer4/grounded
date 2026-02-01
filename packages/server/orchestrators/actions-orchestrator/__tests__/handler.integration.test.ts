import { conversationInitiatedWithMessage } from '@grounded/schemas/test-data/events'
import { handler } from '../src'
import { createMskEvent } from './utils'
import { Context } from 'aws-lambda'

describe('Handler Integration Tests', () => {
  const mskContext: Context = {
    callbackWaitsForEmptyEventLoop: false,
    awsRequestId: 'test-request-id',
    functionName: 'test-function-name',
    functionVersion: 'test-function-version',
    invokedFunctionArn: 'test-invoked-function-arn',
    memoryLimitInMB: 'test-memory-limit',
    logGroupName: 'test-log-group-name',
    logStreamName: 'test-log-stream-name',
  } as Context

  describe('ConversationInitiatedEvent processing', () => {
    it('should process a conversation initiated event that has an initial message', async () => {
      const mskEvent = createMskEvent([conversationInitiatedWithMessage], {
        topic: 'conversation-commands',
      })

      await handler(mskEvent, mskContext)
    })
  })
})
