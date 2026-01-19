# frozen_string_literal: true

require "aws-sdk-dynamodb"

class DynamoClient
  class << self
    def client
      @client ||= Aws::DynamoDB::Client.new(client_options)
    end

    def reset_client!
      @client = nil
    end

    # Get a single item by key
    # @param table_name [String] The DynamoDB table name
    # @param key [Hash] The partition key (e.g., { "PK" => "value" } or { "PK" => "pk", "SK" => "sk" })
    # @return [Hash, nil] The item attributes or nil if not found
    def get_item(table_name:, key:)
      response = client.get_item(
        table_name: table_name,
        key: key
      )
      response.item
    end

    # Put (create or replace) an item
    # @param table_name [String] The DynamoDB table name
    # @param item [Hash] The item to put
    # @return [Aws::DynamoDB::Types::PutItemOutput]
    def put_item(table_name:, item:)
      client.put_item(
        table_name: table_name,
        item: item
      )
    end

    # Update an item with an update expression
    # @param table_name [String] The DynamoDB table name
    # @param key [Hash] The partition key
    # @param update_expression [String] The update expression (e.g., "SET #name = :name")
    # @param expression_attribute_names [Hash] Attribute name placeholders
    # @param expression_attribute_values [Hash] Attribute value placeholders
    # @param condition_expression [String, nil] Optional condition expression
    # @return [Aws::DynamoDB::Types::UpdateItemOutput]
    def update_item(table_name:, key:, update_expression:, expression_attribute_names: {}, expression_attribute_values: {}, condition_expression: nil)
      params = {
        table_name: table_name,
        key: key,
        update_expression: update_expression,
        expression_attribute_names: expression_attribute_names,
        expression_attribute_values: expression_attribute_values,
        return_values: "ALL_NEW"
      }
      params[:condition_expression] = condition_expression if condition_expression

      client.update_item(params)
    end

    # Delete an item
    # @param table_name [String] The DynamoDB table name
    # @param key [Hash] The partition key
    # @return [Aws::DynamoDB::Types::DeleteItemOutput]
    def delete_item(table_name:, key:)
      client.delete_item(
        table_name: table_name,
        key: key
      )
    end

    # Query items by partition key (and optionally sort key)
    # @param table_name [String] The DynamoDB table name
    # @param key_condition_expression [String] Key condition (e.g., "PK = :pk AND begins_with(SK, :sk_prefix)")
    # @param expression_attribute_values [Hash] Attribute value placeholders
    # @param expression_attribute_names [Hash] Attribute name placeholders
    # @param filter_expression [String, nil] Optional filter expression
    # @param limit [Integer, nil] Maximum number of items to return
    # @param scan_index_forward [Boolean] Sort order (true = ascending, false = descending)
    # @param exclusive_start_key [Hash, nil] Pagination key
    # @param index_name [String, nil] GSI or LSI name
    # @return [Aws::DynamoDB::Types::QueryOutput]
    def query(table_name:, key_condition_expression:, expression_attribute_values:, expression_attribute_names: {}, filter_expression: nil, limit: nil, scan_index_forward: true, exclusive_start_key: nil, index_name: nil)
      params = {
        table_name: table_name,
        key_condition_expression: key_condition_expression,
        expression_attribute_values: expression_attribute_values,
        scan_index_forward: scan_index_forward
      }
      params[:expression_attribute_names] = expression_attribute_names unless expression_attribute_names.empty?
      params[:filter_expression] = filter_expression if filter_expression
      params[:limit] = limit if limit
      params[:exclusive_start_key] = exclusive_start_key if exclusive_start_key
      params[:index_name] = index_name if index_name

      client.query(params)
    end

    # Scan entire table (use sparingly - prefer query when possible)
    # @param table_name [String] The DynamoDB table name
    # @param filter_expression [String, nil] Optional filter expression
    # @param expression_attribute_values [Hash] Attribute value placeholders
    # @param expression_attribute_names [Hash] Attribute name placeholders
    # @param limit [Integer, nil] Maximum number of items to return
    # @param exclusive_start_key [Hash, nil] Pagination key
    # @return [Aws::DynamoDB::Types::ScanOutput]
    def scan(table_name:, filter_expression: nil, expression_attribute_values: {}, expression_attribute_names: {}, limit: nil, exclusive_start_key: nil)
      params = { table_name: table_name }
      params[:filter_expression] = filter_expression if filter_expression
      params[:expression_attribute_values] = expression_attribute_values unless expression_attribute_values.empty?
      params[:expression_attribute_names] = expression_attribute_names unless expression_attribute_names.empty?
      params[:limit] = limit if limit
      params[:exclusive_start_key] = exclusive_start_key if exclusive_start_key

      client.scan(params)
    end

    # Batch get multiple items
    # @param table_name [String] The DynamoDB table name
    # @param keys [Array<Hash>] Array of partition keys
    # @return [Array<Hash>] Array of items
    def batch_get_items(table_name:, keys:)
      return [] if keys.empty?

      response = client.batch_get_item(
        request_items: {
          table_name => { keys: keys }
        }
      )
      response.responses[table_name] || []
    end

    # Batch write (put or delete) multiple items
    # @param table_name [String] The DynamoDB table name
    # @param put_items [Array<Hash>] Items to put
    # @param delete_keys [Array<Hash>] Keys to delete
    # @return [Aws::DynamoDB::Types::BatchWriteItemOutput]
    def batch_write_items(table_name:, put_items: [], delete_keys: [])
      requests = []
      requests += put_items.map { |item| { put_request: { item: item } } }
      requests += delete_keys.map { |key| { delete_request: { key: key } } }

      return if requests.empty?

      client.batch_write_item(
        request_items: {
          table_name => requests
        }
      )
    end

    private

    def client_options
      options = { region: ENV.fetch("AWS_REGION", "us-east-1") }

      # Support local DynamoDB for development/testing
      if ENV["DYNAMODB_ENDPOINT"]
        options[:endpoint] = ENV["DYNAMODB_ENDPOINT"]
        options[:credentials] = Aws::Credentials.new("local", "local")
      end

      options
    end
  end
end
