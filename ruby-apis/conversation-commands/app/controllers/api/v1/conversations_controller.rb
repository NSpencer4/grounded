# frozen_string_literal: true

module Api
  module V1
    class ConversationsController < BaseController
      def create
        result = ConversationService.new(
          current_user: current_user,
          organization_id: organization_id,
          conversation_id: conversation_params.dig(:conversation, :id),
          message_content: conversation_params.dig(:message, :content)
        ).call

        if result.success?
          render json: { conversation: { id: result.conversation_id } }, status: :created
        else
          render json: { error: result.error }, status: :bad_request
        end
      end

      private

      def organization_id
        params[:organization_id] || current_user&.dig(:app_metadata, :organization_id)
      end

      def conversation_params
        params.permit(
          :organization_id,
          conversation: [:id],
          message: [:content]
        )
      end
    end
  end
end
