# frozen_string_literal: true

require_relative "base_event"

module Schemas
  class MessageReceivedEvent < BaseEvent
    attr_reader :conversation, :message

    def initialize(
      conversation:,
      message:,
      action_by:,
      correlation_id: nil
    )
      conversation_id = conversation[:id] || conversation["id"]
      timestamp = Time.now.utc.iso8601

      super(
        pk: "conversation##{conversation_id}",
        sk: "commandEvent##{EventTypes::MESSAGE_RECEIVED}",
        gsi1_pk: "outboxStatus##{OutboxStatus::PENDING}",
        event_type: EventTypes::MESSAGE_RECEIVED,
        action: ActionTypes::CREATE,
        action_by: action_by,
        correlation_id: correlation_id,
        outbox_status: OutboxStatus::PENDING
      )

      @conversation = conversation
      @message = message
      @timestamp = timestamp
    end

    protected

    def entity_attributes
      {
        "conversation" => build_conversation,
        "message" => build_message
      }
    end

    private

    def build_conversation
      {
        "id" => conversation[:id] || conversation["id"],
        "createdAt" => conversation[:createdAt] || conversation["createdAt"],
        "updatedAt" => conversation[:updatedAt] || conversation["updatedAt"],
        "state" => conversation[:state] || conversation["state"],
        "customer" => conversation[:customer] || conversation["customer"]
      }.tap do |conv|
        assignee = conversation[:assignee] || conversation["assignee"]
        conv["assignee"] = assignee if assignee
      end
    end

    def build_message
      message_id = message[:id] || message["id"]
      conversation_id = conversation[:id] || conversation["id"]
      sender = message[:sender] || message["sender"]
      details = message[:details] || message["details"]

      {
        "id" => message_id,
        "conversation" => {
          "id" => conversation_id
        },
        "createdAt" => @timestamp,
        "updatedAt" => @timestamp,
        "sender" => sender,
        "details" => details
      }
    end
  end
end
