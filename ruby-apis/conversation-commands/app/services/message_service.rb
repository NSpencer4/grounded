# frozen_string_literal: true

class MessageService
  Result = Struct.new(:success?, :message_id, :conversation_id, :error, :error_type, keyword_init: true)

  UUID_REGEX = /\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/i

  def initialize(current_user:, conversation_id:, content:)
    @current_user = current_user
    @conversation_id = conversation_id
    @content = content
  end

  def call
    return validation_error("conversation_id is required") if @conversation_id.nil? || @conversation_id.empty?
    return validation_error("conversation_id must be a valid UUID") unless valid_uuid?(@conversation_id)
    return validation_error("message content is required") if @content.nil? || @content.empty?

    conversation = fetch_conversation
    return not_found_error("Conversation not found") unless conversation

    message = build_message(conversation)

    event = Schemas::MessageReceivedEvent.new(
      conversation: conversation,
      message: message,
      action_by: current_user_id
    )

    persist_event(event)
    publish_event(event)

    Result.new(success?: true, message_id: message[:id], conversation_id: @conversation_id)
  rescue StandardError => e
    Rails.logger.error("MessageService error: #{e.message}\n#{e.backtrace.first(5).join("\n")}")
    Result.new(success?: false, error: "Failed to create message")
  end

  private

  attr_reader :current_user

  def valid_uuid?(string)
    UUID_REGEX.match?(string)
  end

  def validation_error(message)
    Result.new(success?: false, error: message, error_type: :validation)
  end

  def not_found_error(message)
    Result.new(success?: false, error: message, error_type: :not_found)
  end

  def current_user_id
    current_user[:sub] || current_user[:user_id] || current_user[:id]
  end

  def fetch_conversation
    result = DynamoClient.query(
      table_name: dynamo_table_name,
      key_condition_expression: "PK = :pk AND begins_with(SK, :sk_prefix)",
      expression_attribute_values: {
        ":pk" => "conversation##{@conversation_id}",
        ":sk_prefix" => "event##{EventTypes::CONVERSATION_INITIATED}"
      },
      limit: 1
    )

    return nil if result.items.empty?

    item = result.items.first
    item["conversation"]
  end

  def build_sender
    user_metadata = current_user[:user_metadata] || {}

    {
      "user" => {
        "id" => current_user_id,
        "role" => user_metadata[:role] || UserRole::CUSTOMER,
        "name" => user_metadata[:full_name] || user_metadata[:name] || "Unknown User"
      }
    }
  end

  def build_message(conversation)
    {
      id: SecureRandom.uuid,
      sender: build_sender,
      details: {
        "content" => @content
      }
    }
  end

  def persist_event(event)
    DynamoClient.put_item(
      table_name: dynamo_table_name,
      item: event.to_item
    )
  end

  def publish_event(event)
    KafkaProducer.produce(
      client_id: "conversation-commands",
      topic: kafka_topic_name,
      key: @conversation_id,
      value: event.to_message
    )
  end

  def dynamo_table_name
    ENV.fetch("DYNAMODB_TABLE_NAME", "grounded-datastore")
  end

  def kafka_topic_name
    ENV.fetch("KAFKA_CONVERSATION_EVENTS_TOPIC", "conversation-events")
  end
end
