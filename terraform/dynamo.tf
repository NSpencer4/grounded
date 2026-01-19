resource "aws_dynamodb_table" "conversation_commands" {
  name         = var.grounded_conversation_commands_ddb_name
  hash_key = "PK"
  range_key = "SK"
  billing_mode = "PAY_PER_REQUEST"
  stream_enabled = false
  stream_view_type = "NEW_AND_OLD_IMAGES"

  lifecycle {
    prevent_destroy = false
  }

  point_in_time_recovery {
    enabled = false
  }

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

#   global_secondary_index {
#     name = "GSI1"
#     hash_key = "GSI1"
#     range_key = "SK"
#     projection_type = "ALL"
#     non_key_attributes = []
#   }

  # Additional optional configurations
  tags = {
    Name = var.grounded_conversation_commands_ddb_name
    Environment = var.environment
  }
}

resource "aws_dynamodb_table" "conversation_updates" {
  name         = "conversation-updates"
  hash_key = "PK"
  range_key = "SK"
  billing_mode = "PAY_PER_REQUEST"
  stream_enabled = false
  stream_view_type = "NEW_AND_OLD_IMAGES"

  lifecycle {
    prevent_destroy = false
  }

  point_in_time_recovery {
    enabled = false
  }

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  #   global_secondary_index {
  #     name = "GSI1"
  #     hash_key = "GSI1"
  #     range_key = "SK"
  #     projection_type = "ALL"
  #     non_key_attributes = []
  #   }

  # Additional optional configurations
  tags = {
    Name = var.grounded_conversation_updates_ddb_name
    Environment = var.environment
  }
}

