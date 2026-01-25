# Supabase Auth Configuration
# 
# Note: The Supabase Terraform provider has limited support.
# SMTP and some auth settings must be configured manually in the Supabase Dashboard.

provider "supabase" {
  access_token = var.supabase_access_token
}

# Store Supabase credentials in AWS Secrets Manager for Lambda access
resource "aws_secretsmanager_secret" "supabase_credentials" {
  name                    = "${var.environment}/grounded/supabase-credentials"
  description             = "Supabase credentials for authentication"
  recovery_window_in_days = 7

  tags = {
    Name        = "${var.environment}-grounded-supabase-credentials"
    Environment = var.environment
    Service     = "auth"
  }
}

resource "aws_secretsmanager_secret_version" "supabase_credentials" {
  secret_id = aws_secretsmanager_secret.supabase_credentials.id
  secret_string = jsonencode({
    supabase_url           = var.supabase_url
    supabase_anon_key      = var.supabase_anon_key
    supabase_service_key   = var.supabase_service_role_key
    supabase_jwt_secret    = var.supabase_jwt_secret
    supabase_project_ref   = var.supabase_project_ref
    # SES SMTP credentials for reference
    smtp_host              = "email-smtp.${var.aws_region}.amazonaws.com"
    smtp_port              = 587
    smtp_username          = aws_iam_access_key.smtp.id
    smtp_password          = aws_iam_access_key.smtp.ses_smtp_password_v4
  })
  
  depends_on = [aws_iam_access_key.smtp]
}

# IAM Policy for Lambda functions to access Supabase credentials
resource "aws_iam_policy" "supabase_secrets_access" {
  name        = "${var.environment}-grounded-supabase-secrets-access"
  description = "Allow Lambda functions to access Supabase credentials"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          aws_secretsmanager_secret.supabase_credentials.arn,
          aws_secretsmanager_secret.smtp_credentials.arn
        ]
      }
    ]
  })
}

# Outputs
output "supabase_project_ref" {
  description = "Supabase project reference"
  value       = var.supabase_project_ref
}

output "supabase_url" {
  description = "Supabase URL"
  value       = var.supabase_url
}

output "supabase_anon_key" {
  description = "Supabase anonymous key"
  value       = var.supabase_anon_key
  sensitive   = true
}

output "supabase_credentials_secret_arn" {
  description = "ARN of Secrets Manager secret containing Supabase credentials"
  value       = aws_secretsmanager_secret.supabase_credentials.arn
}

output "supabase_secrets_policy_arn" {
  description = "ARN of IAM policy for accessing Supabase secrets"
  value       = aws_iam_policy.supabase_secrets_access.arn
}
