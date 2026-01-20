# frozen_string_literal: true

class ConversationService
  Result = Struct.new(:success?, :conversation_id, :error, keyword_init: true)

  UUID_REGEX = /\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/i

  def initialize(current_user:, conversation_id: nil, message_content: nil)
    @current_user = current_user
    @provided_conversation_id = conversation_id
    @message_content = message_content
  end

  def call
    return validation_error("conversation.id must be a valid UUID") if invalid_conversation_id?

    conversation_id = @provided_conversation_id || SecureRandom.uuid
    customer = build_customer
    message = build_message(conversation_id, customer)

    event = Schemas::ConversationInitiatedEvent.new(
      conversation_id: conversation_id,
      customer: customer,
      action_by: current_user_id,
      message: message
    )

    persist_event(event)
    publish_event(conversation_id, event)

    Result.new(success?: true, conversation_id: conversation_id)
  rescue Aws::DynamoDB::Errors::ConditionalCheckFailedException
    Result.new(success?: false, error: "Conversation already exists")
  rescue StandardError => e
    Rails.logger.error("CreateConversationService error: #{e.message}\n#{e.backtrace.first(5).join("\n")}")
    Result.new(success?: false, error: "Failed to create conversation")
  end

  private

  attr_reader :current_user

  def invalid_conversation_id?
    @provided_conversation_id && !UUID_REGEX.match?(@provided_conversation_id)
  end

  def validation_error(message)
    Result.new(success?: false, error: message)
  end

  def current_user_id
    current_user[:sub] || current_user[:user_id] || current_user[:id]
  end

  def build_customer
    user_metadata = current_user[:user_metadata] || {}

    {
      user: {
        id: current_user_id,
        role: UserRole::CUSTOMER,
        name: user_metadata[:full_name] || user_metadata[:name] || "Unknown User",
        email: current_user[:email]
      }
    }
  end

  def build_message(conversation_id, customer)
    return nil unless @message_content

    {
      id: SecureRandom.uuid,
      content: @message_content,
      sender: customer
    }
  end

  def persist_event(event)
    DynamoClient.put_item(
      table_name: dynamo_table_name,
      item: event.to_item,
      condition_expression: "attribute_not_exists(PK)"
    )
  end

  def publish_event(conversation_id, event)
    KafkaProducer.produce(
      client_id: "conversation-commands",
      topic: kafka_topic_name,
      key: conversation_id,
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
