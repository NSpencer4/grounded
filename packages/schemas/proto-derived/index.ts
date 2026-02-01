/**
 * Proto-Derived Zod Schemas
 *
 * These Zod schemas are derived from and type-checked against proto-generated
 * TypeScript types. If the proto definitions change, TypeScript will emit
 * compile-time errors here, ensuring schemas stay in sync.
 *
 * Type Safety Pattern:
 * Each schema infers a type that's explicitly checked for compatibility with
 * the proto type. The `_checkType` variables are never used at runtime but
 * will cause compile errors if types drift.
 */

// TODO: move these under the associated schema files
import { z } from 'zod'
import type {
  EventDetails as ProtoEventDetails,
  EventMetadata as ProtoEventMetadata,
  Message as ProtoMessage,
  MessageDetails as ProtoMessageDetails,
  MessageSender as ProtoMessageSender,
  User as ProtoUser,
  UserSummary as ProtoUserSummary,
} from '../generated/ts/index.js'
import {
  Action,
  AssertionType,
  ConversationStatus,
  DecisionType,
  EvaluationType,
  EventType,
  UpdateType,
  UserRole,
} from '../generated/ts/index.js'

// ============================================================================
// Type compatibility helper
// ============================================================================

/**
 * Compile-time check that ZodType extends ProtoType.
 * If ZodType is not assignable to ProtoType, this will cause a compile error.
 */
type AssertExtends<ZodType extends ProtoType, ProtoType> = ZodType

// ============================================================================
// Enum Schemas (derived from proto enums)
// ============================================================================

export const UserRoleSchema = z.nativeEnum(UserRole)
export type UserRoleType = z.infer<typeof UserRoleSchema>

export const ConversationStatusSchema = z.nativeEnum(ConversationStatus)
export type ConversationStatusType = z.infer<typeof ConversationStatusSchema>

export const EventTypeSchema = z.nativeEnum(EventType)
export type EventTypeType = z.infer<typeof EventTypeSchema>

export const EvaluationTypeSchema = z.nativeEnum(EvaluationType)
export type EvaluationTypeType = z.infer<typeof EvaluationTypeSchema>

export const AssertionTypeSchema = z.nativeEnum(AssertionType)
export type AssertionTypeType = z.infer<typeof AssertionTypeSchema>

export const DecisionTypeSchema = z.nativeEnum(DecisionType)
export type DecisionTypeType = z.infer<typeof DecisionTypeSchema>

export const UpdateTypeSchema = z.nativeEnum(UpdateType)
export type UpdateTypeType = z.infer<typeof UpdateTypeSchema>

export const ActionSchema = z.nativeEnum(Action)
export type ActionType = z.infer<typeof ActionSchema>

// ============================================================================
// Model Schemas (derived from proto messages)
// ============================================================================

export const UserSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  role: UserRoleSchema,
})
export type UserSummary = z.infer<typeof UserSummarySchema>
// Type check: UserSummary must be compatible with ProtoUserSummary
type _CheckUserSummary = AssertExtends<UserSummary, ProtoUserSummary>

export const UserSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  email: z.string(),
  role: UserRoleSchema,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})
export type User = z.infer<typeof UserSchema>
type _CheckUser = AssertExtends<User, ProtoUser>

export const MessageDetailsSchema = z.object({
  content: z.string(),
})
export type MessageDetails = z.infer<typeof MessageDetailsSchema>
type _CheckMessageDetails = AssertExtends<MessageDetails, ProtoMessageDetails>

export const MessageSenderSchema = z.object({
  user: UserSummarySchema.optional(),
})
export type MessageSender = z.infer<typeof MessageSenderSchema>
type _CheckMessageSender = AssertExtends<MessageSender, ProtoMessageSender>

export const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  sender: MessageSenderSchema.optional(),
  details: MessageDetailsSchema.optional(),
})
export type Message = z.infer<typeof MessageSchema>
type _CheckMessage = AssertExtends<Message, ProtoMessage>

// ============================================================================
// Metadata Schemas (derived from proto metadata types)
// ============================================================================

export const EventDetailsSchema = z.object({
  id: z.string(),
  type: EventTypeSchema,
  schemaVersion: z.string(),
})
export type EventDetails = z.infer<typeof EventDetailsSchema>
type _CheckEventDetails = AssertExtends<EventDetails, ProtoEventDetails>

export const EventMetadataSchema = z.object({
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  correlationId: z.string(),
})
export type EventMetadata = z.infer<typeof EventMetadataSchema>
type _CheckEventMetadata = AssertExtends<EventMetadata, ProtoEventMetadata>
