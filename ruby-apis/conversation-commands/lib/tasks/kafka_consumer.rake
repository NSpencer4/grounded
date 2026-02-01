# frozen_string_literal: true

namespace :kafka do
  desc "Start the Kafka consumer for conversation update events"
  task consume: :environment do
    group_id = ENV.fetch("KAFKA_CONSUMER_GROUP_ID", "conversation-commands")
    topics = ENV.fetch("KAFKA_TOPICS", "conversation-updates").split(",").map(&:strip)

    puts "Starting Kafka consumer..."
    puts "  Group ID: #{group_id}"
    puts "  Topics: #{topics.join(', ')}"
    puts "  Brokers: #{ENV.fetch('KAFKA_BROKERS', 'localhost:9092')}"
    puts ""

    KafkaConsumer.consume_with_retry(
      group_id: group_id,
      topics: topics
    ) do |message|
      puts "[Consumer] Received message: key=#{message[:key]}, topic=#{message[:topic]}"

      ConversationUpdatesEventHandler.new(message[:value]).call
    end
  end
end
