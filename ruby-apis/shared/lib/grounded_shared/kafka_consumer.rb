# frozen_string_literal: true

require "kafka"
require "json"

class KafkaConsumer
  class << self
    # Start consuming messages from the specified topic
    # @param group_id [String] Consumer group ID
    # @param topics [Array<String>] Topics to subscribe to
    # @param handler [Proc] Block to handle each message
    def consume(group_id:, topics:, &handler)
      consumer = create_consumer(group_id)

      topics.each { |topic| consumer.subscribe(topic) }

      log_info("Starting consumer '#{group_id}' for topics: #{topics.join(', ')}")

      consumer.each_message(automatically_mark_as_processed: false) do |message|
        process_message(consumer, message, &handler)
      end
    rescue Kafka::Error => e
      log_error("Kafka consumer error: #{e.message}")
      raise
    ensure
      consumer&.stop
    end

    # Start consuming with automatic reconnection
    # @param group_id [String] Consumer group ID
    # @param topics [Array<String>] Topics to subscribe to
    # @param handler [Proc] Block to handle each message
    def consume_with_retry(group_id:, topics:, max_retries: nil, &handler)
      retries = 0

      loop do
        begin
          consume(group_id: group_id, topics: topics, &handler)
        rescue Kafka::Error => e
          retries += 1
          if max_retries && retries > max_retries
            log_error("Max retries (#{max_retries}) exceeded. Shutting down.")
            raise
          end

          wait_time = [2**retries, 60].min # Exponential backoff, max 60 seconds
          log_error("Consumer error: #{e.message}. Retrying in #{wait_time}s (attempt #{retries})...")
          sleep(wait_time)
        end
      end
    end

    # Reset consumer (useful for testing)
    def reset!
      @kafka_client = nil
    end

    private

    def kafka_client
      @kafka_client ||= Kafka.new(
        seed_brokers: broker_list,
        client_id: "grounded-consumer",
        logger: logger
      )
    end

    def create_consumer(group_id)
      kafka_client.consumer(
        group_id: group_id,
        offset_commit_interval: offset_commit_interval,
        offset_commit_threshold: offset_commit_threshold,
        session_timeout: session_timeout,
        heartbeat_interval: heartbeat_interval
      )
    end

    def process_message(consumer, message, &handler)
      parsed_value = parse_message(message.value)

      log_info("Received message from topic '#{message.topic}' partition #{message.partition} offset #{message.offset}")

      handler.call(
        topic: message.topic,
        partition: message.partition,
        offset: message.offset,
        key: message.key,
        value: parsed_value,
        headers: message.headers
      )

      consumer.mark_message_as_processed(message)
    rescue StandardError => e
      log_error("Error processing message: #{e.message}\n#{e.backtrace.first(5).join("\n")}")
      # Don't mark as processed - message will be redelivered
      raise
    end

    def parse_message(value)
      return nil if value.nil?

      JSON.parse(value)
    rescue JSON::ParserError
      value # Return raw value if not valid JSON
    end

    # Configuration from environment variables

    def broker_list
      ENV.fetch("KAFKA_BROKERS", "localhost:9092").split(",")
    end

    def offset_commit_interval
      ENV.fetch("KAFKA_OFFSET_COMMIT_INTERVAL", "5").to_i
    end

    def offset_commit_threshold
      ENV.fetch("KAFKA_OFFSET_COMMIT_THRESHOLD", "100").to_i
    end

    def session_timeout
      ENV.fetch("KAFKA_SESSION_TIMEOUT", "30").to_i
    end

    def heartbeat_interval
      ENV.fetch("KAFKA_HEARTBEAT_INTERVAL", "10").to_i
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
      logger&.info(message) || puts("[KafkaConsumer] #{message}")
    end

    def log_error(message)
      logger&.error(message) || warn("[KafkaConsumer] #{message}")
    end
  end
end
