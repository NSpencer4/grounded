# frozen_string_literal: true

module UserRole
  CUSTOMER = "CUSTOMER"
  REPRESENTATIVE = "REPRESENTATIVE"
  ADMIN = "ADMIN"

  ALL = [CUSTOMER, REPRESENTATIVE, ADMIN].freeze

  def self.valid?(role)
    ALL.include?(role)
  end
end
