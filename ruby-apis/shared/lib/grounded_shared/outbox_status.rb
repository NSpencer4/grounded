# frozen_string_literal: true

module OutboxStatus
  PENDING = "PENDING"
  COMPLETED = "COMPLETED"

  ALL = [PENDING, COMPLETED].freeze

  def self.valid?(status)
    ALL.include?(status)
  end
end
