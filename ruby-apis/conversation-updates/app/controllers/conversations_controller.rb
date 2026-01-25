# frozen_string_literal: true

# Read-only controller for querying conversation data
class ConversationsController < ApplicationController
  # GET /conversations/:id
  # Fetch a single conversation by ID
  def show
    conversation = ConversationQueryService.fetch_conversation(params[:id])

    if conversation
      render json: conversation, status: :ok
    else
      render json: { error: "Conversation not found" }, status: :not_found
    end
  end

  # GET /conversations?org_id=<org_id>&limit=20
  # List conversations for an organization
  def index
    if params[:org_id].present?
      list_by_organization
    elsif params[:user_id].present?
      list_by_user
    else
      render json: { error: "Either org_id or user_id is required" }, status: :bad_request
    end
  end

  private

  def list_by_organization
    limit = (params[:limit] || 20).to_i
    last_key = parse_last_evaluated_key(params[:last_evaluated_key])

    result = ConversationQueryService.list_org_conversations(
      org_id: params[:org_id],
      limit: limit,
      last_evaluated_key: last_key
    )

    render json: {
      conversations: result[:conversations],
      last_evaluated_key: encode_last_evaluated_key(result[:last_evaluated_key])
    }, status: :ok
  end

  def list_by_user
    limit = (params[:limit] || 20).to_i
    last_key = parse_last_evaluated_key(params[:last_evaluated_key])

    result = ConversationQueryService.list_user_conversations(
      user_id: params[:user_id],
      limit: limit,
      last_evaluated_key: last_key
    )

    render json: {
      conversations: result[:conversations],
      last_evaluated_key: encode_last_evaluated_key(result[:last_evaluated_key])
    }, status: :ok
  end

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
