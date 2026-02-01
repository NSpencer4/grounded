/**
 * Schema Registry Client for Confluent Schema Registry
 *
 * This module provides:
 * - Schema registration and retrieval
 * - Confluent wire format encoding/decoding
 * - Schema ID caching for performance
 */

const SCHEMA_REGISTRY_URL = process.env.SCHEMA_REGISTRY_URL || 'http://localhost:8081'

// Cache for schema IDs by subject
const schemaIdCache = new Map<string, number>()

// Cache for schemas by ID
const schemaCache = new Map<number, string>()

interface SchemaRegistryResponse {
  id: number
  schema?: string
  schemaType?: string
  version?: number
}

interface SchemaInfo {
  schema: string
  schemaType: string
  references?: Array<{
    name: string
    subject: string
    version: number
  }>
}

/**
 * Register a Protobuf schema with the Schema Registry
 *
 * @param subject - The subject name (typically topic-value or topic-key)
 * @param schema - The .proto schema content as a string
 * @param references - Optional schema references for imports
 * @returns The schema ID
 */
export async function registerSchema(
  subject: string,
  schema: string,
  references?: SchemaInfo['references'],
): Promise<number> {
  const url = `${SCHEMA_REGISTRY_URL}/subjects/${encodeURIComponent(subject)}/versions`

  const body: {
    schemaType: string
    schema: string
    references?: SchemaInfo['references']
  } = {
    schemaType: 'PROTOBUF',
    schema,
  }

  if (references && references.length > 0) {
    body.references = references
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.schemaregistry.v1+json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(
      `Failed to register schema for subject "${subject}": ${response.status} ${error}`,
    )
  }

  const result: SchemaRegistryResponse = await response.json()

  // Cache the schema ID
  schemaIdCache.set(subject, result.id)
  schemaCache.set(result.id, schema)

  console.log(`[SchemaRegistry] Registered schema for "${subject}" with ID ${result.id}`)

  return result.id
}

/**
 * Get the latest schema ID for a subject
 *
 * @param subject - The subject name
 * @returns The schema ID or undefined if not found
 */
export async function getSchemaId(subject: string): Promise<number | undefined> {
  // Check cache first
  if (schemaIdCache.has(subject)) {
    return schemaIdCache.get(subject)
  }

  const url = `${SCHEMA_REGISTRY_URL}/subjects/${encodeURIComponent(subject)}/versions/latest`

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.schemaregistry.v1+json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return undefined
      }
      throw new Error(`Failed to get schema ID: ${response.status}`)
    }

    const result: SchemaRegistryResponse = await response.json()

    // Cache the result
    schemaIdCache.set(subject, result.id)

    return result.id
  } catch (error) {
    console.error(`[SchemaRegistry] Error getting schema ID for "${subject}":`, error)
    return undefined
  }
}

/**
 * Get a schema by its ID
 *
 * @param schemaId - The schema ID
 * @returns The schema string or undefined if not found
 */
export async function getSchemaById(schemaId: number): Promise<string | undefined> {
  // Check cache first
  if (schemaCache.has(schemaId)) {
    return schemaCache.get(schemaId)
  }

  const url = `${SCHEMA_REGISTRY_URL}/schemas/ids/${schemaId}`

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.schemaregistry.v1+json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return undefined
      }
      throw new Error(`Failed to get schema: ${response.status}`)
    }

    const result: SchemaRegistryResponse = await response.json()

    if (result.schema) {
      schemaCache.set(schemaId, result.schema)
      return result.schema
    }

    return undefined
  } catch (error) {
    console.error(`[SchemaRegistry] Error getting schema ${schemaId}:`, error)
    return undefined
  }
}

/**
 * Check compatibility of a schema with an existing subject
 *
 * @param subject - The subject name
 * @param schema - The .proto schema content
 * @returns True if compatible, false otherwise
 */
export async function checkCompatibility(subject: string, schema: string): Promise<boolean> {
  const url = `${SCHEMA_REGISTRY_URL}/compatibility/subjects/${encodeURIComponent(subject)}/versions/latest`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.schemaregistry.v1+json',
      },
      body: JSON.stringify({
        schemaType: 'PROTOBUF',
        schema,
      }),
    })

    if (!response.ok) {
      if (response.status === 404) {
        // No existing schema, so any schema is compatible
        return true
      }
      return false
    }

    const result = await response.json()
    return result.is_compatible === true
  } catch (error) {
    console.error(`[SchemaRegistry] Error checking compatibility for "${subject}":`, error)
    return false
  }
}

/**
 * Encode a protobuf message with Confluent wire format
 *
 * Confluent wire format:
 * - Byte 0: Magic byte (always 0)
 * - Bytes 1-4: Schema ID (big-endian 4-byte integer)
 * - Bytes 5-N: Protobuf message (with message index array for proto3)
 *
 * For protobuf, the format includes message indexes:
 * - Variable-length array of message indexes (for nested message types)
 * - The actual protobuf payload
 *
 * @param schemaId - The schema ID from the registry
 * @param payload - The serialized protobuf message bytes
 * @param messageIndexes - Array of message indexes (default [0] for root message)
 * @returns Buffer in Confluent wire format
 */
export function encodeWithSchemaId(
  schemaId: number,
  payload: Uint8Array,
  messageIndexes: number[] = [0],
): Buffer {
  // Calculate size: 1 (magic) + 4 (schema ID) + zigzag encoded indexes + payload
  const indexBuffer = encodeZigzagArray(messageIndexes)

  const buffer = Buffer.alloc(1 + 4 + indexBuffer.length + payload.length)

  // Magic byte
  buffer.writeUInt8(0, 0)

  // Schema ID (big-endian)
  buffer.writeUInt32BE(schemaId, 1)

  // Message indexes
  indexBuffer.copy(buffer, 5)

  // Protobuf payload
  Buffer.from(payload).copy(buffer, 5 + indexBuffer.length)

  return buffer
}

/**
 * Decode a Confluent wire format message
 *
 * @param buffer - The wire format buffer
 * @returns Object containing schema ID, message indexes, and protobuf payload
 */
export function decodeWireFormat(buffer: Buffer): {
  schemaId: number
  messageIndexes: number[]
  payload: Uint8Array
} {
  if (buffer.length < 5) {
    throw new Error('Buffer too short for Confluent wire format')
  }

  const magicByte = buffer.readUInt8(0)
  if (magicByte !== 0) {
    throw new Error(`Invalid magic byte: expected 0, got ${magicByte}`)
  }

  const schemaId = buffer.readUInt32BE(1)

  // Decode message indexes (zigzag encoded)
  const { indexes, bytesRead } = decodeZigzagArray(buffer.subarray(5))

  const payload = new Uint8Array(buffer.subarray(5 + bytesRead))

  return {
    schemaId,
    messageIndexes: indexes,
    payload,
  }
}

/**
 * Encode an array of integers using zigzag encoding
 * Used for protobuf message indexes in Confluent wire format
 */
function encodeZigzagArray(values: number[]): Buffer {
  const bytes: number[] = []

  // First, encode the array length
  encodeVarint(values.length, bytes)

  // Then encode each value with zigzag encoding
  for (const value of values) {
    const zigzag = (value << 1) ^ (value >> 31)
    encodeVarint(zigzag, bytes)
  }

  return Buffer.from(bytes)
}

/**
 * Decode a zigzag-encoded array of integers
 */
function decodeZigzagArray(buffer: Buffer): { indexes: number[]; bytesRead: number } {
  let offset = 0

  // Decode array length
  const { value: length, bytesRead: lengthBytes } = decodeVarint(buffer, offset)
  offset += lengthBytes

  const indexes: number[] = []

  for (let i = 0; i < length; i++) {
    const { value: zigzag, bytesRead: valueBytes } = decodeVarint(buffer, offset)
    offset += valueBytes

    // Decode zigzag
    const value = (zigzag >>> 1) ^ -(zigzag & 1)
    indexes.push(value)
  }

  return { indexes, bytesRead: offset }
}

/**
 * Encode a varint into a byte array
 */
function encodeVarint(value: number, bytes: number[]): void {
  while (value > 127) {
    bytes.push((value & 0x7f) | 0x80)
    value >>>= 7
  }
  bytes.push(value)
}

/**
 * Decode a varint from a buffer
 */
function decodeVarint(buffer: Buffer, offset: number): { value: number; bytesRead: number } {
  let value = 0
  let shift = 0
  let bytesRead = 0

  while (offset + bytesRead < buffer.length) {
    const byte = buffer[offset + bytesRead]
    bytesRead++

    value |= (byte & 0x7f) << shift

    if ((byte & 0x80) === 0) {
      break
    }

    shift += 7
  }

  return { value, bytesRead }
}

/**
 * List all subjects in the Schema Registry
 */
export async function listSubjects(): Promise<string[]> {
  const url = `${SCHEMA_REGISTRY_URL}/subjects`

  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.schemaregistry.v1+json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to list subjects: ${response.status}`)
  }

  return response.json()
}

/**
 * Delete a subject from the Schema Registry
 * Use with caution - this is destructive
 */
export async function deleteSubject(subject: string, permanent = false): Promise<number[]> {
  const url = permanent
    ? `${SCHEMA_REGISTRY_URL}/subjects/${encodeURIComponent(subject)}?permanent=true`
    : `${SCHEMA_REGISTRY_URL}/subjects/${encodeURIComponent(subject)}`

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Accept: 'application/vnd.schemaregistry.v1+json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to delete subject "${subject}": ${response.status}`)
  }

  // Clear cache
  schemaIdCache.delete(subject)

  return response.json()
}

/**
 * Clear the local schema cache
 * Useful when schemas are updated externally
 */
export function clearCache(): void {
  schemaIdCache.clear()
  schemaCache.clear()
  console.log('[SchemaRegistry] Cache cleared')
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats(): {
  subjectCount: number
  schemaCount: number
  subjects: string[]
} {
  return {
    subjectCount: schemaIdCache.size,
    schemaCount: schemaCache.size,
    subjects: Array.from(schemaIdCache.keys()),
  }
}

// Re-export types
export type { SchemaInfo, SchemaRegistryResponse }
