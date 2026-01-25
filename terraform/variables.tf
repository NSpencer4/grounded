variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "vpc_name" {
  type = string
  default = "grounded-main-vpc"
}

variable "subnet_ids" {
  type = list(string)
}

variable "actions_orchestrator_fn_name" {
  type = string
  default = "grounded-actions-orchestrator"
}

variable "ddb_name" {
  type = string
  default = "grounded-datastore"
}

variable "responder_fn_name" {
  type    = string
  default = "grounded-responder"
}

variable "customer_spend_agent_fn_name" {
  type    = string
  default = "grounded-customer-spend-agent"
}

variable "response_recommendation_agent_fn_name" {
  type    = string
  default = "grounded-response-recommendation-agent"
}

variable "company_data_api_fn_name" {
  type    = string
  default = "grounded-company-data-api"
}

# SES SMTP Configuration
variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "ses_domain" {
  type        = string
  description = "Domain name for SES (e.g., example.com)"
}

variable "ses_from_email" {
  type        = string
  description = "Default from email address (e.g., noreply@example.com)"
}

variable "ses_test_email" {
  type        = string
  description = "Test email address for SES sandbox mode (optional)"
  default     = ""
}

variable "ses_domain_route53_zone_id" {
  type        = string
  description = "Route53 zone ID for automatic DNS record creation (optional)"
  default     = ""
}

variable "ses_dmarc_email" {
  type        = string
  description = "Email address for DMARC reports"
  default     = "dmarc@example.com"
}

# Supabase Configuration
variable "supabase_access_token" {
  type        = string
  description = "Supabase Management API access token"
  sensitive   = true
}

variable "supabase_project_ref" {
  type        = string
  description = "Supabase project reference ID"
}

variable "supabase_url" {
  type        = string
  description = "Supabase project URL"
}

variable "supabase_anon_key" {
  type        = string
  description = "Supabase anonymous key"
  sensitive   = true
}

variable "supabase_service_role_key" {
  type        = string
  description = "Supabase service role key"
  sensitive   = true
}

variable "supabase_jwt_secret" {
  type        = string
  description = "JWT secret for Supabase"
  sensitive   = true
}

variable "supabase_site_url" {
  type        = string
  description = "Site URL for auth redirects"
}

variable "supabase_redirect_urls" {
  type        = list(string)
  description = "Allowed redirect URLs for auth"
  default     = []
}

variable "supabase_email_autoconfirm" {
  type        = bool
  description = "Auto-confirm email signups (disable for production)"
  default     = false
}

variable "supabase_email_sender_name" {
  type        = string
  description = "Email sender name"
  default     = "Grounded"
}

variable "supabase_oauth_google_enabled" {
  type        = bool
  description = "Enable Google OAuth"
  default     = false
}

variable "supabase_oauth_google_client_id" {
  type        = string
  description = "Google OAuth client ID"
  default     = ""
}

variable "supabase_oauth_google_secret" {
  type        = string
  description = "Google OAuth client secret"
  sensitive   = true
  default     = ""
}

variable "supabase_db_host" {
  type        = string
  description = "Supabase database host"
}

variable "supabase_db_port" {
  type        = number
  description = "Supabase database port"
  default     = 5432
}

variable "supabase_db_name" {
  type        = string
  description = "Supabase database name"
  default     = "postgres"
}

variable "supabase_db_user" {
  type        = string
  description = "Supabase database user"
  default     = "postgres"
}

variable "supabase_db_password" {
  type        = string
  description = "Supabase database password"
  sensitive   = true
}

