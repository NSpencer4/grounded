/**
 * Event test data exports
 *
 * This module provides sample event data for e2e and integration tests.
 * Each event type has:
 * - Pre-built sample events for common scenarios
 * - Factory functions for creating custom events
 * - Scenario collections for different test cases
 */

// Shared fixtures
export * from './fixtures'

// Event test data
export * from './conversation-initiated'
export * from './message-received'
export * from './conversation-evaluation'
export * from './agent-result'

// Re-export scenario collections for convenient access
export { conversationInitiatedScenarios } from './conversation-initiated'
export { messageReceivedScenarios } from './message-received'
export { conversationEvaluationScenarios } from './conversation-evaluation'
export { agentResultScenarios } from './agent-result'
