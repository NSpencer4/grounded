# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name = "grounded_shared"
  spec.version = "0.1.0"
  spec.authors = ["Grounded Team"]
  spec.summary = "Shared utilities for Grounded Ruby APIs"

  spec.files = Dir["lib/**/*"]
  spec.require_paths = ["lib"]

  spec.add_dependency "aws-sdk-dynamodb", "~> 1.0"
  spec.add_dependency "ruby-kafka", "~> 1.5"
end
