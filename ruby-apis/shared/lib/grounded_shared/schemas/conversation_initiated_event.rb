# frozen_string_literal: true

require_relative "base_event"

module Schemas
  class ConversationInitiatedEvent < BaseEvent
    attr_reader :conversation_id, :customer_id, :conversation_status

    def initialize(
      conversation_id:,
      customer_id:,
      action_by:,
      conversation_status: ConversationStatus::ACTIVE,
      outbox_status: OutboxStatus::PENDING
    )
      super(
        pk: "conversation##{conversation_id}",
        sk: "event##{EventTypes::CONVERSATION_INITIATED}",
        event_type: EventTypes::CONVERSATION_INITIATED,
        action: "create",
        action_by: action_by,
        outbox_status: outbox_status
      )

      @conversation_id = conversation_id
      @customer_id = customer_id
      @conversation_status = conversation_status
    end

    protected

    def entity_attributes
      {
        "customer" => {
          "user" => {
            "id" => customer_id
          }
        },
        "conversation" => {
          "id" => conversation_id,
          "status" => conversation_status
        }
      }
    end
  end
end
