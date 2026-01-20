# frozen_string_literal: true

module JwtAuthenticatable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_request!
  end

  private

  def authenticate_request!
    token = extract_token_from_header
    if token.nil?
      render json: { error: "Authorization header missing" }, status: :unauthorized
      return
    end

    @current_user = decode_token(token)
  rescue JWT::ExpiredSignature
    render json: { error: "Token has expired" }, status: :unauthorized
  rescue JWT::DecodeError => e
    render json: { error: "Invalid token: #{e.message}" }, status: :unauthorized
  end

  def extract_token_from_header
    auth_header = request.headers["Authorization"]
    return nil unless auth_header&.start_with?("Bearer ")

    auth_header.split(" ").last
  end

  def decode_token(token)
    # Decode without verification first to inspect the token
    # In production, you would verify against the Supabase JWT secret
    jwt_secret = ENV.fetch("JWT_SECRET", nil)

    options = { algorithm: "HS256" }
    options[:verify] = jwt_secret.present?

    if jwt_secret.present?
      decoded = JWT.decode(token, jwt_secret, true, options)
    else
      # Development mode: decode without verification but log warning
      Rails.logger.warn("JWT verification disabled - JWT_SECRET not set")
      decoded = JWT.decode(token, nil, false)
    end

    decoded.first.with_indifferent_access
  end

  def current_user
    @current_user
  end

  def current_user_id
    @current_user&.dig(:sub)
  end
end
