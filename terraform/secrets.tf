data "aws_secretsmanager_secret" "supabase_key" {
  name = "grounded/supabase-key"
}