# frozen_string_literal: true

class ConversationCommandsEventHandler
  SUPPORTED_EVENT_TYPES = [
    EventTypes::CONVERSATION_INITIATED,
    EventTypes::MESSAGE_RECEIVED
  ].freeze

  def initialize(event_data)
    @event_data = event_data
  end

  def call
    return unless supported_event?

    persist_event
    log_success
  rescue StandardError => e
    log_error(e)
    raise
  end

  private

  attr_reader :event_data

  def supported_event?
    event_type = event_data.dig("event", "type")
    SUPPORTED_EVENT_TYPES.include?(event_type)
  end

  def event_type
    event_data.dig("event", "type")
  end

  def event_id
    event_data.dig("event", "id")
  end

  def conversation_id
    event_data.dig("conversation", "id")
  end

  def timestamp
    # Use the event's createdAt timestamp for consistent ordering
    event_data.dig("metadata", "createdAt") || Time.now.utc.iso8601
  end

  def persist_event
    DynamoClient.put_item(
      table_name: dynamo_table_name,
      item: build_item
    )
  end

  def build_item
    # SK format: updateEvent#<timestamp>#<event_type>#<event_id>
    # This ensures events are sortable by time within a conversation
    sortable_sk = "updateEvent##{timestamp}##{event_type}"

    {
      "PK" => "conversation##{conversation_id}",
      "SK" => sortable_sk,
    }.merge(event_data)
  end

  def dynamo_table_name
    ENV.fetch("DYNAMODB_TABLE_NAME", "grounded-datastore")
  end

  def log_success
    puts "[ConversationCommandsEventHandler] Persisted #{event_type} event #{event_id} for conversation #{conversation_id}"
  end

  def log_error(error)
    warn "[ConversationCommandsEventHandler] Error processing event: #{error.message}"
    warn error.backtrace.first(5).join("\n")
  end
end
