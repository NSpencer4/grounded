# frozen_string_literal: true

# Service for querying conversation data from DynamoDB (read-only)
class ConversationQueryService
  class << self
    def fetch_conversation(conversation_id)
      table_name = dynamo_table_name

      # Fetch conversation state
      state = DynamoClient.get_item(
        table_name: table_name,
        key: {
          "PK" => "conversation##{conversation_id}",
          "SK" => "STATE"
        }
      )

      return nil unless state

      # Transform DynamoDB item to response format
      transform_conversation_state(state)
    end

    def list_org_conversations(org_id:, limit: 20, last_evaluated_key: nil)
      table_name = dynamo_table_name

      params = {
        table_name: table_name,
        index_name: "GSI1",
        key_condition_expression: "GSI1PK = :org_id",
        expression_attribute_values: {
          ":org_id" => "organization#{org_id}"
        },
        limit: limit,
        scan_index_forward: false # Newest first
      }

      params[:exclusive_start_key] = last_evaluated_key if last_evaluated_key

      response = DynamoClient.query(**params)

      {
        conversations: response.items.map { |item| transform_conversation_state(item) },
        last_evaluated_key: response.last_evaluated_key
      }
    end

    def list_user_conversations(user_id:, limit: 20, last_evaluated_key: nil)
      table_name = dynamo_table_name

      params = {
        table_name: table_name,
        index_name: "GSI1",
        key_condition_expression: "GSI1PK = :user_id",
        expression_attribute_values: {
          ":user_id" => "user##{user_id}"
        },
        limit: limit,
        scan_index_forward: false # Newest first
      }

      params[:exclusive_start_key] = last_evaluated_key if last_evaluated_key

      response = DynamoClient.query(**params)

      {
        conversations: response.items.map { |item| transform_conversation_state(item) },
        last_evaluated_key: response.last_evaluated_key
      }
    end

    def fetch_conversation_messages(conversation_id:, limit: 50, last_evaluated_key: nil)
      table_name = dynamo_table_name

      params = {
        table_name: table_name,
        key_condition_expression: "PK = :pk AND begins_with(SK, :prefix)",
        expression_attribute_values: {
          ":pk" => "conversation##{conversation_id}",
          ":prefix" => "message#"
        },
        limit: limit,
        scan_index_forward: true # Oldest first (chronological order)
      }

      params[:exclusive_start_key] = last_evaluated_key if last_evaluated_key

      response = DynamoClient.query(**params)

      {
        messages: response.items.map { |item| transform_message(item) },
        last_evaluated_key: response.last_evaluated_key
      }
    end

    private

    def dynamo_table_name
      ENV.fetch("DYNAMO_TABLE_NAME", "grounded-datastore")
    end

    def transform_conversation_state(item)
      return nil unless item

      {
        id: extract_id_from_pk(item["PK"]),
        org_id: item["OrgId"],
        user_id: item["UserId"],
        status: item["Status"],
        current_step: item["CurrentStep"],
        created_at: item["CreatedAt"],
        updated_at: item["UpdatedAt"],
        metadata: item["Metadata"] || {}
      }
    end

    def transform_message(item)
      return nil unless item

      {
        id: extract_message_id(item["SK"]),
        conversation_id: extract_id_from_pk(item["PK"]),
        role: item["Role"],
        content: item["Content"],
        timestamp: item["Timestamp"],
        metadata: item["Metadata"] || {}
      }
    end

    def extract_id_from_pk(pk)
      pk&.split("#")&.last
    end

    def extract_message_id(sk)
      # SK format: message#<timestamp>#<id>
      parts = sk&.split("#")
      parts&.last if parts&.length == 3
    end
  end
end
