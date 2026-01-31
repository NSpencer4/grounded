# frozen_string_literal: true

class ConversationService
  Result = Struct.new(:success?, :conversation_id, :error, keyword_init: true)

  UUID_REGEX = /\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/i

  def initialize(current_user:, organization_id:, conversation_id: nil, message_content: nil)
    @current_user = current_user
    @organization_id = organization_id
    @provided_conversation_id = conversation_id
    @message_content = message_content
    @timestamp = Time.now.utc.iso8601
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

    persist_items(conversation_id, event, message)
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
      "user" => {
        "id" => current_user_id,
        "role" => UserRole::CUSTOMER,
        "name" => user_metadata[:full_name] || user_metadata[:name] || "Unknown User",
        "email" => current_user[:email]
      }
    }
  end

  def build_message(conversation_id, customer)
    return nil unless @message_content

    {
      "id" => SecureRandom.uuid,
      "content" => @message_content,
      "sender" => customer
    }
  end

  def persist_items(conversation_id, event, message)
    items = [
      event.to_item,
      build_state_item(conversation_id, event)
    ]
    items << build_message_item(conversation_id, message) if message

    DynamoClient.batch_write_items(
      table_name: dynamo_table_name,
      put_items: items
    )
  end

  def build_state_item(conversation_id, event)
    {
      "PK" => "conversation##{conversation_id}",
      "SK" => "STATE",
      "GSI1PK" => "organization#{@organization_id}",
      "GSI1SK" => @timestamp,
      "conversation" => event.to_message["conversation"],
      "metadata" => {
        "createdAt" => @timestamp,
        "updatedAt" => @timestamp
      }
    }
  end

  def build_message_item(conversation_id, message)
    message_id = message["id"]
    {
      "PK" => "conversation##{conversation_id}",
      "SK" => "message##{@timestamp}##{message_id}",
      "GSI1PK" => "user##{current_user_id}",
      "GSI1SK" => @timestamp,
      "message" => {
        "id" => message_id,
        "conversationId" => conversation_id,
        "sender" => message["sender"],
        "content" => message["content"],
        "createdAt" => @timestamp
      }
    }
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
    ENV.fetch("KAFKA_CONVERSATION_EVENTS_TOPIC", "conversation-commands")
  end
end
