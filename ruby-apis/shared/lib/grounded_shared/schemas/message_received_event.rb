# frozen_string_literal: true

require_relative "base_event"

module Schemas
  class MessageReceivedEvent < BaseEvent
    attr_reader :conversation_id, :message_id, :message_content,
                :sender_id, :sender_name, :sender_role

    def initialize(
      conversation_id:,
      message_id:,
      message_content:,
      sender_id:,
      sender_name:,
      sender_role:,
      action_by:,
      correlation_id: nil,
      outbox_status: OutboxStatus::PENDING
    )
      super(
        pk: "conversation##{conversation_id}",
        sk: "event##{EventTypes::MESSAGE_RECEIVED}##{message_id}",
        event_type: EventTypes::MESSAGE_RECEIVED,
        action: "message",
        action_by: action_by,
        correlation_id: correlation_id,
        outbox_status: outbox_status
      )

      @conversation_id = conversation_id
      @message_id = message_id
      @message_content = message_content
      @sender_id = sender_id
      @sender_name = sender_name
      @sender_role = sender_role
    end

    protected

    def entity_attributes
      {
        "conversation" => {
          "id" => conversation_id
        },
        "message" => {
          "id" => message_id,
          "sender" => {
            "user" => {
              "id" => sender_id,
              "name" => sender_name,
              "role" => sender_role
            }
          },
          "details" => {
            "content" => message_content
          }
        }
      }
    end
  end
end
