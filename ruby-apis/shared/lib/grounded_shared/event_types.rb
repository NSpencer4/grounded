# frozen_string_literal: true

module EventTypes
  # Conversation events
  CONVERSATION_INITIATED = "CONVERSATION_INITIATED"

  # Message events
  MESSAGE_RECEIVED = "MESSAGE_RECEIVED"

  CONVERSATION_EVENTS = [
    CONVERSATION_INITIATED,
    MESSAGE_RECEIVED
  ].freeze

  def self.valid?(event_type)
    CONVERSATION_EVENTS.include?(event_type)
  end
end
