# frozen_string_literal: true

require "net/http"
require "json"
require "uri"

module GroundedShared
  # Client for Confluent Schema Registry
  #
  # Provides:
  # - Schema registration and retrieval
  # - Confluent wire format encoding/decoding
  # - Schema ID caching for performance
  #
  # @example Register a schema
  #   schema_id = SchemaRegistry.register_schema(
  #     subject: "conversation-commands-value",
  #     schema: File.read("conversation_initiated.proto")
  #   )
  #
  # @example Encode a message
  #   payload = MyProtoMessage.encode(message)
  #   encoded = SchemaRegistry.encode_with_schema_id(schema_id: 1, payload: payload)
  #
  class SchemaRegistry
    MAGIC_BYTE = 0

    class << self
      # Cache for schema IDs by subject
      def schema_id_cache
        @schema_id_cache ||= {}
      end

      # Cache for schemas by ID
      def schema_cache
        @schema_cache ||= {}
      end

      # Register a Protobuf schema with the Schema Registry
      #
      # @param subject [String] The subject name (typically topic-value or topic-key)
      # @param schema [String] The .proto schema content as a string
      # @param references [Array<Hash>] Optional schema references for imports
      # @return [Integer] The schema ID
      def register_schema(subject:, schema:, references: nil)
        uri = URI("#{registry_url}/subjects/#{URI.encode_www_form_component(subject)}/versions")

        body = {
          schemaType: "PROTOBUF",
          schema: schema
        }
        body[:references] = references if references&.any?

        request = Net::HTTP::Post.new(uri)
        request["Content-Type"] = "application/vnd.schemaregistry.v1+json"
        request.body = JSON.generate(body)

        response = http_request(uri, request)

        unless response.is_a?(Net::HTTPSuccess)
          raise "Failed to register schema for subject '#{subject}': #{response.code} #{response.body}"
        end

        result = JSON.parse(response.body)
        schema_id = result["id"]

        # Cache the schema ID
        schema_id_cache[subject] = schema_id
        schema_cache[schema_id] = schema

        puts "[SchemaRegistry] Registered schema for '#{subject}' with ID #{schema_id}"

        schema_id
      end

      # Get the latest schema ID for a subject
      #
      # @param subject [String] The subject name
      # @return [Integer, nil] The schema ID or nil if not found
      def get_schema_id(subject:)
        # Check cache first
        return schema_id_cache[subject] if schema_id_cache.key?(subject)

        uri = URI("#{registry_url}/subjects/#{URI.encode_www_form_component(subject)}/versions/latest")

        request = Net::HTTP::Get.new(uri)
        request["Accept"] = "application/vnd.schemaregistry.v1+json"

        response = http_request(uri, request)

        return nil if response.is_a?(Net::HTTPNotFound)

        unless response.is_a?(Net::HTTPSuccess)
          raise "Failed to get schema ID: #{response.code}"
        end

        result = JSON.parse(response.body)
        schema_id = result["id"]

        # Cache the result
        schema_id_cache[subject] = schema_id

        schema_id
      rescue StandardError => e
        puts "[SchemaRegistry] Error getting schema ID for '#{subject}': #{e.message}"
        nil
      end

      # Get a schema by its ID
      #
      # @param schema_id [Integer] The schema ID
      # @return [String, nil] The schema string or nil if not found
      def get_schema_by_id(schema_id:)
        # Check cache first
        return schema_cache[schema_id] if schema_cache.key?(schema_id)

        uri = URI("#{registry_url}/schemas/ids/#{schema_id}")

        request = Net::HTTP::Get.new(uri)
        request["Accept"] = "application/vnd.schemaregistry.v1+json"

        response = http_request(uri, request)

        return nil if response.is_a?(Net::HTTPNotFound)

        unless response.is_a?(Net::HTTPSuccess)
          raise "Failed to get schema: #{response.code}"
        end

        result = JSON.parse(response.body)
        schema = result["schema"]

        # Cache the result
        schema_cache[schema_id] = schema if schema

        schema
      rescue StandardError => e
        puts "[SchemaRegistry] Error getting schema #{schema_id}: #{e.message}"
        nil
      end

      # Encode a protobuf message with Confluent wire format
      #
      # Confluent wire format:
      # - Byte 0: Magic byte (always 0)
      # - Bytes 1-4: Schema ID (big-endian 4-byte integer)
      # - Bytes 5-N: Message indexes (zigzag encoded) + Protobuf payload
      #
      # @param schema_id [Integer] The schema ID from the registry
      # @param payload [String] The serialized protobuf message bytes
      # @param message_indexes [Array<Integer>] Array of message indexes (default [0] for root message)
      # @return [String] Binary string in Confluent wire format
      def encode_with_schema_id(schema_id:, payload:, message_indexes: [0])
        # Encode message indexes using zigzag encoding
        index_bytes = encode_zigzag_array(message_indexes)

        # Build the wire format buffer
        # Magic byte (1) + Schema ID (4) + Index bytes + Payload
        buffer = [MAGIC_BYTE].pack("C") +
                 [schema_id].pack("N") +
                 index_bytes +
                 payload

        buffer.force_encoding(Encoding::BINARY)
      end

      # Decode a Confluent wire format message
      #
      # @param buffer [String] The wire format buffer
      # @return [Hash] Object containing :schema_id, :message_indexes, and :payload
      def decode_wire_format(buffer)
        buffer = buffer.dup.force_encoding(Encoding::BINARY)

        raise "Buffer too short for Confluent wire format" if buffer.bytesize < 5

        magic_byte = buffer[0].unpack1("C")
        raise "Invalid magic byte: expected 0, got #{magic_byte}" unless magic_byte == MAGIC_BYTE

        schema_id = buffer[1, 4].unpack1("N")

        # Decode message indexes (zigzag encoded)
        indexes, bytes_read = decode_zigzag_array(buffer[5..])

        payload = buffer[(5 + bytes_read)..]

        {
          schema_id: schema_id,
          message_indexes: indexes,
          payload: payload
        }
      end

      # Check compatibility of a schema with an existing subject
      #
      # @param subject [String] The subject name
      # @param schema [String] The .proto schema content
      # @return [Boolean] True if compatible, false otherwise
      def check_compatibility(subject:, schema:)
        uri = URI("#{registry_url}/compatibility/subjects/#{URI.encode_www_form_component(subject)}/versions/latest")

        request = Net::HTTP::Post.new(uri)
        request["Content-Type"] = "application/vnd.schemaregistry.v1+json"
        request.body = JSON.generate({
          schemaType: "PROTOBUF",
          schema: schema
        })

        response = http_request(uri, request)

        # No existing schema means any schema is compatible
        return true if response.is_a?(Net::HTTPNotFound)
        return false unless response.is_a?(Net::HTTPSuccess)

        result = JSON.parse(response.body)
        result["is_compatible"] == true
      rescue StandardError => e
        puts "[SchemaRegistry] Error checking compatibility for '#{subject}': #{e.message}"
        false
      end

      # List all subjects in the Schema Registry
      #
      # @return [Array<String>] List of subject names
      def list_subjects
        uri = URI("#{registry_url}/subjects")

        request = Net::HTTP::Get.new(uri)
        request["Accept"] = "application/vnd.schemaregistry.v1+json"

        response = http_request(uri, request)

        unless response.is_a?(Net::HTTPSuccess)
          raise "Failed to list subjects: #{response.code}"
        end

        JSON.parse(response.body)
      end

      # Clear the local schema cache
      def clear_cache
        schema_id_cache.clear
        schema_cache.clear
        puts "[SchemaRegistry] Cache cleared"
      end

      # Get cache statistics for monitoring
      #
      # @return [Hash] Cache statistics
      def cache_stats
        {
          subject_count: schema_id_cache.size,
          schema_count: schema_cache.size,
          subjects: schema_id_cache.keys
        }
      end

      private

      def registry_url
        ENV.fetch("SCHEMA_REGISTRY_URL", "http://localhost:8081")
      end

      def http_request(uri, request)
        http = Net::HTTP.new(uri.host, uri.port)
        http.use_ssl = uri.scheme == "https"
        http.open_timeout = 10
        http.read_timeout = 30
        http.request(request)
      end

      # Encode an array of integers using zigzag encoding
      def encode_zigzag_array(values)
        bytes = []

        # First, encode the array length
        encode_varint(values.length, bytes)

        # Then encode each value with zigzag encoding
        values.each do |value|
          zigzag = (value << 1) ^ (value >> 31)
          encode_varint(zigzag, bytes)
        end

        bytes.pack("C*")
      end

      # Decode a zigzag-encoded array of integers
      def decode_zigzag_array(buffer)
        offset = 0

        # Decode array length
        length, length_bytes = decode_varint(buffer, offset)
        offset += length_bytes

        indexes = []

        length.times do
          zigzag, value_bytes = decode_varint(buffer, offset)
          offset += value_bytes

          # Decode zigzag
          value = (zigzag >> 1) ^ -(zigzag & 1)
          indexes << value
        end

        [indexes, offset]
      end

      # Encode a varint into a byte array
      def encode_varint(value, bytes)
        while value > 127
          bytes << ((value & 0x7f) | 0x80)
          value >>= 7
        end
        bytes << value
      end

      # Decode a varint from a buffer
      def decode_varint(buffer, offset)
        value = 0
        shift = 0
        bytes_read = 0

        while offset + bytes_read < buffer.bytesize
          byte = buffer[offset + bytes_read].unpack1("C")
          bytes_read += 1

          value |= (byte & 0x7f) << shift

          break if (byte & 0x80).zero?

          shift += 7
        end

        [value, bytes_read]
      end
    end
  end
end
