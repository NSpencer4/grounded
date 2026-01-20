# frozen_string_literal: true

require_relative "base_event"

module Schemas
  class MessageReceivedEvent < BaseEvent
    attr_reader :conversation_id, :customer_id, :message_id, :message_content

    def initialize(
      conversation_id:,
      customer_id:,
      message_id:,
      message_content:,
      action_by:,
      outbox_status: OutboxStatus::PENDING
    )
      super(
        pk: "conversation##{conversation_id}",
        sk: "event##{EventTypes::MESSAGE_RECEIVED}##{message_id}",
        event_type: EventTypes::MESSAGE_RECEIVED,
        action: "message",
        action_by: action_by,
        outbox_status: outbox_status
      )

      @conversation_id = conversation_id
      @customer_id = customer_id
      @message_id = message_id
      @message_content = message_content
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
          "id" => conversation_id
        },
        "message" => {
          "id" => message_id,
          "content" => message_content
        }
      }
    end
  end
end
