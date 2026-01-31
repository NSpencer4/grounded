/**
 * Utilities for creating MSK events for testing
 */

import type { MSKEvent, MSKRecord } from 'aws-lambda'
import type { ConversationInitiatedEvent, MessageReceivedEvent } from '@grounded/schemas/events'

export type TestEvent = ConversationInitiatedEvent | MessageReceivedEvent

/**
 * Serialize an event with proper date handling for JSON
 */
function serializeEvent(event: TestEvent): string {
  return JSON.stringify(event, (key, value) => {
    if (value instanceof Date) {
      return value.toISOString()
    }
    return value
  })
}

/**
 * Create an MSK record from an event
 */
export function createMskRecord(
  event: TestEvent,
  options: {
    topic?: string
    partition?: number
    offset?: number
    timestamp?: number
  } = {},
): MSKRecord {
  const {
    topic = 'conversation-commands',
    partition = 0,
    offset = 0,
    timestamp = Date.now(),
  } = options

  const serialized = serializeEvent(event)
  const base64Value = Buffer.from(serialized).toString('base64')

  return {
    topic,
    partition,
    offset,
    timestamp,
    timestampType: 'CREATE_TIME',
    key: Buffer.from(event.conversation.id).toString('base64'),
    value: base64Value,
    headers: {},
  }
}

/**
 * Create an MSK event containing multiple records
 */
export function createMskEvent(
  events: TestEvent[],
  options: {
    topic?: string
    partition?: number
  } = {},
): MSKEvent {
  const { topic = 'conversation-commands', partition = 0 } = options

  const topicPartitionKey = `${topic}-${partition}`
  const records = events.map((event, index) =>
    createMskRecord(event, { topic, partition, offset: index }),
  )

  return {
    eventSource: 'aws:kafka',
    eventSourceArn: 'arn:aws:kafka:us-east-1:123456789012:cluster/test-cluster/test-uuid',
    bootstrapServers: 'localhost:9092',
    records: {
      [topicPartitionKey]: records,
    },
  }
}

/**
 * Create an MSK event from a single event
 */
export function createSingleEventMsk(
  event: TestEvent,
  options: {
    topic?: string
    partition?: number
  } = {},
): MSKEvent {
  return createMskEvent([event], options)
}

/**
 * Create an invalid MSK record (for error handling tests)
 */
export function createInvalidMskRecord(
  invalidValue: string,
  options: {
    topic?: string
    partition?: number
    offset?: number
  } = {},
): MSKRecord {
  const { topic = 'conversation-commands', partition = 0, offset = 0 } = options

  return {
    topic,
    partition,
    offset,
    timestamp: Date.now(),
    timestampType: 'CREATE_TIME',
    key: Buffer.from('invalid-key').toString('base64'),
    value: Buffer.from(invalidValue).toString('base64'),
    headers: {},
  }
}

/**
 * Create an MSK event with an invalid record
 */
export function createInvalidMskEvent(invalidValue: string = '{"invalid": "event"}'): MSKEvent {
  return {
    eventSource: 'aws:kafka',
    eventSourceArn: 'arn:aws:kafka:us-east-1:123456789012:cluster/test-cluster/test-uuid',
    bootstrapServers: 'localhost:9092',
    records: {
      'conversation-commands-0': [createInvalidMskRecord(invalidValue)],
    },
  }
}
