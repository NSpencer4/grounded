# frozen_string_literal: true

require "securerandom"

module Schemas
  class BaseEvent
    SCHEMA_VERSION = "1"

    attr_reader :pk, :sk, :gsi1, :event, :metadata, :outbox, :action_context

    def initialize(pk:, sk:, event_type:, action:, action_by:, correlation_id: nil, outbox_status: OutboxStatus::PENDING)
      timestamp = Time.now.utc.iso8601

      @pk = pk
      @sk = sk
      @gsi1 = outbox_status
      @event = {
        "id" => SecureRandom.uuid,
        "type" => event_type,
        "schemaVersion" => SCHEMA_VERSION
      }
      @metadata = {
        "createdAt" => timestamp,
        "updatedAt" => timestamp,
        "correlationId" => correlation_id || SecureRandom.uuid
      }
      @outbox = {
        "status" => outbox_status
      }
      @action_context = {
        "action" => action,
        "actionBy" => action_by
      }
    end

    def to_item
      {
        "PK" => pk,
        "SK" => sk,
        "GSI1" => gsi1,
        "event" => event,
        "metadata" => metadata,
        "outbox" => outbox,
        "actionContext" => action_context
      }.merge(entity_attributes)
    end

    protected

    def entity_attributes
      raise NotImplementedError, "Subclasses must implement #entity_attributes"
    end
  end
end
