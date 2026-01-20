# frozen_string_literal: true

module ConversationStatus
  WAITING = "WAITING"
  ACTIVE = "ACTIVE"
  CLOSED = "CLOSED"

  ALL = [PENDING, COMPLETED, CLOSED].freeze

  def self.valid?(status)
    ALL.include?(status)
  end
end
