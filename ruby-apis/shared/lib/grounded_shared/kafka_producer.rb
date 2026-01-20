# frozen_string_literal: true

require "kafka"
require "json"

class KafkaProducer
  class << self
    # Get or create a producer for a specific client ID
    # @param client_id [String] Unique identifier for this producer
    # @return [Kafka::Producer] The producer instance
    def producer(client_id:)
      producers[client_id] ||= create_producer(client_id)
    end

    # Produce a message to a Kafka topic
    # @param client_id [String] The client ID for the producer
    # @param topic [String] The Kafka topic name
    # @param key [String] The message key (used for partitioning)
    # @param value [Hash, String] The message value (will be JSON encoded if Hash)
    # @param headers [Hash] Optional message headers
    def produce(client_id:, topic:, key:, value:, headers: {})
      producer_instance = producer(client_id: client_id)
      encoded_value = value.is_a?(Hash) ? JSON.generate(value) : value

      producer_instance.produce(
        encoded_value,
        topic: topic,
        key: key,
        headers: headers
      )
      producer_instance.deliver_messages

      log_info("Message produced to topic '#{topic}' with key '#{key}' by client '#{client_id}'")
    rescue Kafka::Error => e
      log_error("Failed to produce message by client '#{client_id}': #{e.message}")
      raise
    end

    # Produce a message asynchronously (buffered, call deliver_messages later)
    # @param client_id [String] The client ID for the producer
    # @param topic [String] The Kafka topic name
    # @param key [String] The message key
    # @param value [Hash, String] The message value
    # @param headers [Hash] Optional message headers
    def produce_async(client_id:, topic:, key:, value:, headers: {})
      producer_instance = producer(client_id: client_id)
      encoded_value = value.is_a?(Hash) ? JSON.generate(value) : value

      producer_instance.produce(
        encoded_value,
        topic: topic,
        key: key,
        headers: headers
      )
    rescue Kafka::Error => e
      log_error("Failed to buffer message by client '#{client_id}': #{e.message}")
      raise
    end

    # Deliver all buffered messages for a specific client
    # @param client_id [String] The client ID for the producer
    def deliver_messages(client_id:)
      return unless producers.key?(client_id)

      producers[client_id].deliver_messages
      log_info("Delivered buffered messages for client '#{client_id}'")
    rescue Kafka::Error => e
      log_error("Failed to deliver messages for client '#{client_id}': #{e.message}")
      raise
    end

    # Shutdown a specific producer
    # @param client_id [String] The client ID to shutdown
    def shutdown(client_id:)
      return unless producers.key?(client_id)

      log_info("Disconnecting Kafka producer for client '#{client_id}'...")
      producers[client_id].shutdown
      producers.delete(client_id)
      log_info("Kafka producer for client '#{client_id}' disconnected.")
    rescue Kafka::Error => e
      log_error("Error during Kafka producer disconnect for client '#{client_id}': #{e.message}")
    end

    # Shutdown all producers (for graceful application shutdown)
    def shutdown_all
      producers.each_key do |client_id|
        shutdown(client_id: client_id)
      end
      @kafka_client = nil
    end

    # Reset all connections (useful for testing)
    def reset!
      shutdown_all
      @producers = nil
    end

    private

    def kafka_client
      @kafka_client ||= Kafka.new(
        seed_brokers: broker_list,
        client_id: "grounded-shared",
        logger: logger,
        **ssl_options
      )
    end

    def create_producer(client_id)
      log_info("Creating Kafka producer for client '#{client_id}'...")

      kafka_client.producer(
        max_retries: max_retries,
        retry_backoff: retry_backoff,
        required_acks: required_acks,
        ack_timeout: ack_timeout,
        compression_codec: compression_codec
      )
    end

    def producers
      @producers ||= {}
    end

    # Configuration from environment variables

    def broker_list
      ENV.fetch("KAFKA_BROKERS", "localhost:9092").split(",")
    end

    def max_retries
      ENV.fetch("KAFKA_MAX_RETRIES", "3").to_i
    end

    def retry_backoff
      ENV.fetch("KAFKA_RETRY_BACKOFF", "1").to_i
    end

    def required_acks
      # :all for strongest durability, 1 for leader only, 0 for fire-and-forget
      acks = ENV.fetch("KAFKA_REQUIRED_ACKS", "all")
      acks == "all" ? :all : acks.to_i
    end

    def ack_timeout
      ENV.fetch("KAFKA_ACK_TIMEOUT", "5").to_i
    end

    def compression_codec
      codec = ENV.fetch("KAFKA_COMPRESSION", "none")
      codec == "none" ? nil : codec.to_sym
    end

    def ssl_options
      return {} unless ENV["KAFKA_SSL_ENABLED"] == "true"

      {
        ssl_ca_cert: ENV["KAFKA_SSL_CA_CERT"],
        ssl_client_cert: ENV["KAFKA_SSL_CLIENT_CERT"],
        ssl_client_cert_key: ENV["KAFKA_SSL_CLIENT_CERT_KEY"]
      }.compact
    end

    def logger
      return @logger if defined?(@logger)

      @logger = if ENV["KAFKA_LOGGER_ENABLED"] == "true"
                  Logger.new($stdout).tap do |l|
                    l.level = Logger.const_get(ENV.fetch("LOG_LEVEL", "INFO").upcase)
                  end
                end
    end

    def log_info(message)
      logger&.info(message) || puts(message)
    end

    def log_error(message)
      logger&.error(message) || warn(message)
    end
  end
end
