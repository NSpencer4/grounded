# frozen_string_literal: true

require_relative "base_event"

module Schemas
  class ConversationInitiatedEvent < BaseEvent
    attr_reader :conversation_id, :customer, :conversation_status, :message

    def initialize(
      conversation_id:,
      customer:,
      action_by:,
      message:,
      conversation_status: ConversationStatus::ACTIVE,
      correlation_id: nil,
      outbox_status: OutboxStatus::PENDING
    )
      timestamp = Time.now.utc.iso8601

      super(
        pk: "conversation##{conversation_id}",
        sk: "commandEvent##{EventTypes::CONVERSATION_INITIATED}",
        gsi1_pk: "outboxStatus##{OutboxStatus::PENDING}",
        event_type: EventTypes::CONVERSATION_INITIATED,
        action: ActionTypes::CREATE,
        action_by: action_by,
        correlation_id: correlation_id,
        outbox_status: outbox_status
      )

      @conversation_id = conversation_id
      @customer = customer
      @conversation_status = conversation_status
      @message = message
      @timestamp = timestamp
    end

    protected

    def entity_attributes
      attrs = {
        "conversation" => build_conversation,
        "conversation" => build_message
      }
      attrs
    end

    private

    def build_conversation
      conv = {
        "id" => conversation_id,
        "createdAt" => @timestamp,
        "updatedAt" => @timestamp,
        "state" => {
          "status" => conversation_status
        },
        "customer" => customer
      }
      conv
    end

    def build_message
      {
        "id" => message["id"],
        "conversation" => {
          "id" => conversation_id
        },
        "createdAt" => @timestamp,
        "updatedAt" => @timestamp,
        "sender" => message["sender"],
        "details" => {
          "content" => message["content"]
        }
      }
    end
  end
end
