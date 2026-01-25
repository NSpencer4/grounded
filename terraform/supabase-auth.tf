# Supabase Auth Configuration with SES SMTP Integration

provider "supabase" {
  access_token = var.supabase_access_token
}

# Supabase Project Settings
resource "supabase_settings" "auth" {
  project_ref = var.supabase_project_ref

  api = jsonencode({
    db_schema            = "public"
    db_extra_search_path = "public,extensions"
    max_rows             = 1000
  })

  auth = jsonencode({
    site_url = var.supabase_site_url
    
    # URI allow list for redirects
    uri_allow_list = var.supabase_redirect_urls
    
    # JWT settings
    jwt_exp = 3600
    
    # Security settings
    security_update_password_require_reauthentication = true
    security_refresh_token_reuse_interval             = 10
    
    # Email auth settings
    enable_signup                = true
    enable_email_signup          = true
    enable_email_autoconfirm     = var.supabase_email_autoconfirm
    mailer_autoconfirm           = var.supabase_email_autoconfirm
    enable_email_confirmations   = !var.supabase_email_autoconfirm
    
    # Password requirements
    password_min_length = 8
    password_required_characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    
    # Email templates
    mailer_templates_invite_content = templatefile("${path.module}/supabase-email-templates/invite.html", {
      site_url = var.supabase_site_url
    })
    mailer_templates_confirmation_content = templatefile("${path.module}/supabase-email-templates/confirmation.html", {
      site_url = var.supabase_site_url
    })
    mailer_templates_magic_link_content = templatefile("${path.module}/supabase-email-templates/magic-link.html", {
      site_url = var.supabase_site_url
    })
    mailer_templates_email_change_content = templatefile("${path.module}/supabase-email-templates/email-change.html", {
      site_url = var.supabase_site_url
    })
    mailer_templates_recovery_content = templatefile("${path.module}/supabase-email-templates/recovery.html", {
      site_url = var.supabase_site_url
    })
    
    # OAuth providers (can be extended)
    external_google_enabled  = var.supabase_oauth_google_enabled
    external_google_client_id = var.supabase_oauth_google_client_id
    external_google_secret    = var.supabase_oauth_google_secret
    
    # Rate limiting
    rate_limit_email_sent    = 3600  # 1 hour
    rate_limit_sms_sent      = 3600
    rate_limit_verify_sent   = 3600
    
    # Session settings
    sessions_timebox        = 86400  # 24 hours
    sessions_inactivity_timeout = 3600  # 1 hour
  })

  # SMTP Configuration using SES
  smtp = jsonencode({
    enabled  = true
    host     = "email-smtp.${var.aws_region}.amazonaws.com"
    port     = 587
    user     = aws_iam_access_key.smtp.id
    pass     = aws_iam_access_key.smtp.ses_smtp_password_v4
    admin_email = var.ses_from_email
    sender_name = var.supabase_email_sender_name
  })
  
  depends_on = [
    aws_ses_domain_identity.main,
    aws_iam_access_key.smtp
  ]
}

# Database Secrets (for connection pooling if needed)
resource "supabase_secret" "database_url" {
  project_ref = var.supabase_project_ref
  name        = "DATABASE_URL"
  value       = "postgresql://${var.supabase_db_user}:${var.supabase_db_password}@${var.supabase_db_host}:5432/${var.supabase_db_name}"
}

resource "supabase_secret" "jwt_secret" {
  project_ref = var.supabase_project_ref
  name        = "JWT_SECRET"
  value       = var.supabase_jwt_secret
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
  })
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

output "supabase_smtp_configured" {
  description = "Confirmation that SES SMTP is configured for Supabase"
  value       = "SMTP configured: ${aws_iam_access_key.smtp.id}@email-smtp.${var.aws_region}.amazonaws.com"
}

output "supabase_credentials_secret_arn" {
  description = "ARN of Secrets Manager secret containing Supabase credentials"
  value       = aws_secretsmanager_secret.supabase_credentials.arn
}

output "supabase_secrets_policy_arn" {
  description = "ARN of IAM policy for accessing Supabase secrets"
  value       = aws_iam_policy.supabase_secrets_access.arn
}
