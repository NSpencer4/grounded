/**
 * Proto ↔ Zod Type Safety Bridge
 *
 * This module provides utilities to ensure Zod schemas stay in sync with
 * proto-generated TypeScript types. If a schema drifts from its proto
 * definition, TypeScript will emit a compile-time error.
 *
 * Usage:
 * ```ts
 * import { UserRole } from './generated/ts/index.js';
 * import { z } from 'zod';
 * import { assertSchemaMatchesProto } from './proto-zod-bridge.js';
 *
 * const UserRoleSchema = z.nativeEnum(UserRole);
 * assertSchemaMatchesProto<UserRole, typeof UserRoleSchema>();
 * ```
 */

import { z } from 'zod'

/**
 * Type-level assertion that a Zod schema's inferred type matches a proto type.
 * This function has no runtime cost - it only provides compile-time checking.
 *
 * @example
 * // This compiles - types match
 * assertSchemaMatchesProto<ProtoMessage, typeof MessageSchema>();
 *
 * // This fails to compile - types don't match
 * assertSchemaMatchesProto<ProtoMessage, typeof WrongSchema>();
 */
export function assertSchemaMatchesProto<ProtoType, Schema extends z.ZodType<ProtoType>>(): void {
  // No-op at runtime - purely for type checking
}

/**
 * Type utility to check if Zod schema output extends proto type.
 * Use this for more complex type relationships where exact match isn't needed.
 */
export type SchemaExtendsProto<ProtoType, Schema extends z.ZodTypeAny> =
  z.infer<Schema> extends ProtoType ? true : false

/**
 * Type utility to check bidirectional compatibility.
 * Both types must be assignable to each other.
 */
export type SchemaMatchesProto<ProtoType, Schema extends z.ZodTypeAny> =
  z.infer<Schema> extends ProtoType ? (ProtoType extends z.infer<Schema> ? true : false) : false

// Re-export proto types for convenience
export * from './generated/ts/index.js'
