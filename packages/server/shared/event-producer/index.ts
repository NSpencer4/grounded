import { CompressionTypes, Kafka as KafkaClient, KafkaConfig, logLevel, Producer } from 'kafkajs'
import type { Message, MessageType } from '@bufbuild/protobuf'
import {
  encodeWithSchemaId,
  getSchemaId,
  registerSchema,
} from '@grounded/server-shared/schema-registry'

interface ProducerState {
  producer: Producer
  lastUsed: number
  isConnected: boolean
  connectionPromise: Promise<void> | null
}

interface ProducerConfig extends KafkaConfig {
  connectionTimeout?: number
  requestTimeout?: number
  retry?: {
    retries?: number
    initialRetryTime?: number
    maxRetryTime?: number
  }
}

interface MessagePayload {
  key: string
  value: string
  headers?: Record<string, string>
}

// Connection pool for warm Lambda starts
const producerPool = new Map<string, ProducerState>()

// Default configuration optimized for Lambda
const DEFAULT_CONFIG = {
  connectionTimeout: 10000, // 10s for cold starts
  requestTimeout: 30000, // 30s for requests
  retry: {
    retries: 3,
    initialRetryTime: 100,
    maxRetryTime: 5000,
  },
}

// Health check interval (5 minutes)
const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000

// Idle timeout before closing connection (10 minutes)
const IDLE_TIMEOUT = 10 * 60 * 1000

function createKafkaClient(config: ProducerConfig, clientId: string): KafkaClient {
  return new KafkaClient({
    ...config,
    clientId,
    connectionTimeout: config.connectionTimeout ?? DEFAULT_CONFIG.connectionTimeout,
    requestTimeout: config.requestTimeout ?? DEFAULT_CONFIG.requestTimeout,
    retry: {
      ...DEFAULT_CONFIG.retry,
      ...config.retry,
    },
    logLevel: logLevel.WARN,
  })
}

async function ensureConnected(state: ProducerState, clientId: string): Promise<void> {
  // If already connecting, wait for that connection
  if (state.connectionPromise) {
    await state.connectionPromise
    return
  }

  // If connected and recently used, assume healthy
  if (state.isConnected && Date.now() - state.lastUsed < HEALTH_CHECK_INTERVAL) {
    return
  }

  // Reconnect if needed
  if (!state.isConnected) {
    state.connectionPromise = (async () => {
      try {
        console.log(`[EventProducer] Reconnecting producer for client "${clientId}"...`)
        await state.producer.connect()
        state.isConnected = true
        console.log(`[EventProducer] Producer for client "${clientId}" reconnected.`)
      } catch (error) {
        state.isConnected = false
        throw error
      } finally {
        state.connectionPromise = null
      }
    })()

    await state.connectionPromise
  }
}

async function getOrCreateProducer(
  config: ProducerConfig,
  clientId: string,
): Promise<ProducerState> {
  let state = producerPool.get(clientId)

  if (!state) {
    console.log(`[EventProducer] Creating new producer for client "${clientId}"...`)
    const kafka = createKafkaClient(config, clientId)

    const producer = kafka.producer({
      allowAutoTopicCreation: false,
      transactionTimeout: 30000,
    })

    // Set up event handlers for connection state tracking
    producer.on('producer.connect', () => {
      const s = producerPool.get(clientId)
      if (s) {
        s.isConnected = true
        console.log(`[EventProducer] Producer "${clientId}" connected.`)
      }
    })

    producer.on('producer.disconnect', () => {
      const s = producerPool.get(clientId)
      if (s) {
        s.isConnected = false
        console.log(`[EventProducer] Producer "${clientId}" disconnected.`)
      }
    })

    state = {
      producer,
      lastUsed: Date.now(),
      isConnected: false,
      connectionPromise: null,
    }

    // Initial connection
    state.connectionPromise = (async () => {
      try {
        await producer.connect()
        state!.isConnected = true
        console.log(
          `[EventProducer] Producer for client "${clientId}" initial connection successful.`,
        )
      } catch (error) {
        console.error(`[EventProducer] Failed to connect producer "${clientId}":`, error)
        throw error
      } finally {
        state!.connectionPromise = null
      }
    })()

    producerPool.set(clientId, state)
    await state.connectionPromise
  }

  return state
}

/**
 * Produce a single message to a Kafka topic
 * Maintains connection pool for Lambda warm starts
 */
export async function produceMessage(
  clientId: string,
  config: ProducerConfig,
  topicName: string,
  key: string,
  value: string,
  headers?: Record<string, string>,
): Promise<void> {
  const state = await getOrCreateProducer(config, clientId)

  await ensureConnected(state, clientId)
  state.lastUsed = Date.now()

  try {
    await state.producer.send({
      topic: topicName,
      compression: CompressionTypes.GZIP,
      messages: [
        {
          key,
          value,
          headers,
        },
      ],
    })

    console.log(
      `[EventProducer] Message produced to "${topicName}" with key "${key}" by "${clientId}"`,
    )
  } catch (error) {
    console.error(`[EventProducer] Failed to produce message by "${clientId}":`, error)

    // Mark as disconnected to trigger reconnect on next attempt
    state.isConnected = false

    throw error
  }
}

/**
 * Produce multiple messages in a single batch for better throughput
 * Use this when sending multiple messages to reduce round trips
 */
export async function produceMessages(
  clientId: string,
  config: ProducerConfig,
  topicName: string,
  messages: MessagePayload[],
): Promise<void> {
  if (messages.length === 0) {
    return
  }

  const state = await getOrCreateProducer(config, clientId)

  await ensureConnected(state, clientId)
  state.lastUsed = Date.now()

  try {
    await state.producer.send({
      topic: topicName,
      compression: CompressionTypes.GZIP,
      messages: messages.map((msg) => ({
        key: msg.key,
        value: msg.value,
        headers: msg.headers,
      })),
    })

    console.log(
      `[EventProducer] Batch of ${messages.length} messages produced to "${topicName}" by "${clientId}"`,
    )
  } catch (error) {
    console.error(`[EventProducer] Failed to produce batch by "${clientId}":`, error)
    state.isConnected = false
    throw error
  }
}

/**
 * Produce messages to multiple topics in a single transaction
 */
export async function produceToMultipleTopics(
  clientId: string,
  config: ProducerConfig,
  topicMessages: Array<{ topic: string; messages: MessagePayload[] }>,
): Promise<void> {
  const state = await getOrCreateProducer(config, clientId)

  await ensureConnected(state, clientId)
  state.lastUsed = Date.now()

  try {
    await state.producer.sendBatch({
      compression: CompressionTypes.GZIP,
      topicMessages: topicMessages.map((tm) => ({
        topic: tm.topic,
        messages: tm.messages.map((msg) => ({
          key: msg.key,
          value: msg.value,
          headers: msg.headers,
        })),
      })),
    })

    const totalMessages = topicMessages.reduce((sum, tm) => sum + tm.messages.length, 0)
    console.log(
      `[EventProducer] Batch of ${totalMessages} messages produced to ${topicMessages.length} topics by "${clientId}"`,
    )
  } catch (error) {
    console.error(`[EventProducer] Failed to produce multi-topic batch by "${clientId}":`, error)
    state.isConnected = false
    throw error
  }
}

/**
 * Get connection pool statistics for monitoring
 */
export function getPoolStats(): {
  activeConnections: number
  connections: Array<{ clientId: string; isConnected: boolean; lastUsed: Date; idleMs: number }>
} {
  const now = Date.now()
  const connections = Array.from(producerPool.entries()).map(([clientId, state]) => ({
    clientId,
    isConnected: state.isConnected,
    lastUsed: new Date(state.lastUsed),
    idleMs: now - state.lastUsed,
  }))

  return {
    activeConnections: connections.filter((c) => c.isConnected).length,
    connections,
  }
}

/**
 * Clean up idle connections to free resources
 * Call this periodically or before Lambda freeze
 */
export async function cleanupIdleConnections(): Promise<void> {
  const now = Date.now()

  for (const [clientId, state] of producerPool.entries()) {
    if (now - state.lastUsed > IDLE_TIMEOUT) {
      console.log(`[EventProducer] Cleaning up idle producer "${clientId}"...`)
      try {
        await state.producer.disconnect()
      } catch (error) {
        console.error(`[EventProducer] Error disconnecting idle producer "${clientId}":`, error)
      }
      producerPool.delete(clientId)
    }
  }
}

/**
 * Graceful shutdown - disconnect all producers
 * Call this on SIGTERM or Lambda extension shutdown
 */
export async function shutdownProducers(): Promise<void> {
  console.log(`[EventProducer] Shutting down ${producerPool.size} producer(s)...`)

  const shutdownPromises = Array.from(producerPool.entries()).map(async ([clientId, state]) => {
    try {
      console.log(`[EventProducer] Disconnecting producer "${clientId}"...`)
      await state.producer.disconnect()
      console.log(`[EventProducer] Producer "${clientId}" disconnected.`)
    } catch (error) {
      console.error(`[EventProducer] Error disconnecting producer "${clientId}":`, error)
    }
  })

  await Promise.all(shutdownPromises)
  producerPool.clear()

  console.log('[EventProducer] All producers shut down.')
}

/**
 * Check if a specific producer is healthy
 */
export function isProducerHealthy(clientId: string): boolean {
  const state = producerPool.get(clientId)
  if (!state) {
    return false
  }

  return state.isConnected && Date.now() - state.lastUsed < IDLE_TIMEOUT
}

// ============================================================================
// Protobuf Support
// ============================================================================

// Cache for proto schema content by message type name
const protoSchemaCache = new Map<string, string>()

/**
 * Register a proto schema for a message type
 * Call this at application startup to pre-register schemas
 */
export function registerProtoSchema(messageTypeName: string, protoContent: string): void {
  protoSchemaCache.set(messageTypeName, protoContent)
}

/**
 * Produce a protobuf message to a Kafka topic
 *
 * This function:
 * 1. Serializes the message using @bufbuild/protobuf
 * 2. Looks up or registers the schema with Schema Registry
 * 3. Wraps the payload in Confluent wire format
 * 4. Sends via the existing producer infrastructure
 *
 * @param clientId - Kafka client ID for connection pooling
 * @param config - Kafka configuration
 * @param topicName - Destination Kafka topic
 * @param key - Message key for partitioning
 * @param message - The protobuf message instance
 * @param messageType - The protobuf message type (for serialization)
 */
export async function produceProtobufMessage<T extends Message>(
  clientId: string,
  config: ProducerConfig,
  topicName: string,
  key: string,
  message: T,
  messageType: MessageType<T>,
): Promise<void> {
  // 1. Serialize to protobuf bytes
  const bytes = message.toBinary()

  // 2. Get or register schema
  const subject = `${topicName}-value`
  let schemaId = await getSchemaId(subject)

  if (!schemaId) {
    // Get the proto schema from cache
    const protoSchema = protoSchemaCache.get(messageType.typeName)
    if (!protoSchema) {
      throw new Error(
        `Proto schema not found for type "${messageType.typeName}". ` +
          `Call registerProtoSchema() first or ensure schema is pre-registered.`,
      )
    }

    schemaId = await registerSchema(subject, protoSchema)
  }

  // 3. Encode with Confluent wire format
  const encoded = encodeWithSchemaId(schemaId, bytes)

  // 4. Send via existing producer with content-type header
  await produceMessage(clientId, config, topicName, key, encoded.toString('base64'), {
    'content-type': 'application/x-protobuf',
  })

  console.log(
    `[EventProducer] Protobuf message produced to "${topicName}" with key "${key}" (schema ID: ${schemaId})`,
  )
}

/**
 * Produce multiple protobuf messages in a batch
 */
export async function produceProtobufMessages<T extends Message>(
  clientId: string,
  config: ProducerConfig,
  topicName: string,
  messages: Array<{ key: string; message: T }>,
  messageType: MessageType<T>,
): Promise<void> {
  if (messages.length === 0) {
    return
  }

  // Get or register schema (once for the batch)
  const subject = `${topicName}-value`
  let schemaId = await getSchemaId(subject)

  if (!schemaId) {
    const protoSchema = protoSchemaCache.get(messageType.typeName)
    if (!protoSchema) {
      throw new Error(
        `Proto schema not found for type "${messageType.typeName}". ` +
          `Call registerProtoSchema() first.`,
      )
    }
    schemaId = await registerSchema(subject, protoSchema)
  }

  // Encode all messages
  const encodedMessages: MessagePayload[] = messages.map(({ key, message }) => {
    const bytes = message.toBinary()
    const encoded = encodeWithSchemaId(schemaId!, bytes)
    return {
      key,
      value: encoded.toString('base64'),
      headers: {
        'content-type': 'application/x-protobuf',
      },
    }
  })

  // Send via existing batch producer
  await produceMessages(clientId, config, topicName, encodedMessages)

  console.log(
    `[EventProducer] Batch of ${messages.length} protobuf messages produced to "${topicName}" (schema ID: ${schemaId})`,
  )
}

// Re-export types for consumers
export type { ProducerConfig, MessagePayload }
