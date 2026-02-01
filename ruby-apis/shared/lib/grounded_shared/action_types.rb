# frozen_string_literal: true

module ActionTypes
  CREATE = "CREATE"
  UPDATE = "UPDATE"
  DELETE = "DELETE"

  ACTION_TYPES = [
    CREATE,
    UPDATE,
    DELETE
  ].freeze

  def self.valid?(event_type)
    ACTION_TYPES.include?(event_type)
  end
end
