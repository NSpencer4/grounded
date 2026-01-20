# frozen_string_literal: true

module Api
  module V1
    class MessagesController < BaseController
      def create
        result = MessageService.new(
          current_user: current_user,
          conversation_id: params[:conversation_id],
          content: message_params[:content]
        ).call

        if result.success?
          render json: {
            message: {
              id: result.message_id,
              conversationId: result.conversation_id
            }
          }, status: :created
        else
          status = result.error_type == :not_found ? :not_found : :bad_request
          render json: { error: result.error }, status: status
        end
      end

      private

      def message_params
        params.require(:message).permit(:content)
      end
    end
  end
end
