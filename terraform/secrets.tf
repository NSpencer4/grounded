data "aws_secretsmanager_secret" "supabase_key" {
  name = "grounded/supabase-key"
}

data "aws_secretsmanager_secret" "conversation_evaluation_db_password" {
  name = "grounded/conversation-evaluations-db-password"
}

data "aws_secretsmanager_secret_version" "conversation_evaluation_db_password_version" {
  secret_id = data.aws_secretsmanager_secret.conversation_evaluation_db_password.id
  version_stage = "AWSCURRENT"
}

data "aws_secretsmanager_secret" "anthropic_api_key" {
  name = "grounded/anthropic-api-key"
}