# frozen_string_literal: true

module Api
  module V1
    class BaseController < ApplicationController
      include JwtAuthenticatable

      rescue_from StandardError do |e|
        Rails.logger.error("Unhandled error: #{e.message}\n#{e.backtrace.first(10).join("\n")}")
        render json: { error: "Internal server error" }, status: :internal_server_error
      end

      rescue_from ActionController::ParameterMissing do |e|
        render json: { error: e.message }, status: :bad_request
      end

      private

      def dynamo_table_name
        ENV.fetch("DYNAMODB_TABLE_NAME", "grounded-datastore")
      end
    end
  end
end
