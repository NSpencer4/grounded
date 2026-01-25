# frozen_string_literal: true

# Read-only controller for querying conversation messages
class MessagesController < ApplicationController
  # GET /conversations/:conversation_id/messages
  # Fetch messages for a conversation
  def index
    conversation_id = params[:conversation_id]
    limit = (params[:limit] || 50).to_i
    last_key = parse_last_evaluated_key(params[:last_evaluated_key])

    result = ConversationQueryService.fetch_conversation_messages(
      conversation_id: conversation_id,
      limit: limit,
      last_evaluated_key: last_key
    )

    render json: {
      messages: result[:messages],
      last_evaluated_key: encode_last_evaluated_key(result[:last_evaluated_key])
    }, status: :ok
  end

  private

  def parse_last_evaluated_key(encoded_key)
    return nil if encoded_key.blank?

    JSON.parse(Base64.decode64(encoded_key))
  rescue StandardError
    nil
  end

  def encode_last_evaluated_key(last_key)
    return nil if last_key.nil?

    Base64.encode64(last_key.to_json).strip
  end
end
