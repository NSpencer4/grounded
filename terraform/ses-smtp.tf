# AWS SES SMTP Server Configuration

# SES Domain Identity
resource "aws_ses_domain_identity" "main" {
  domain = var.ses_domain
}

# SES Domain DKIM Tokens
resource "aws_ses_domain_dkim" "main" {
  domain = aws_ses_domain_identity.main.domain
}

# SES Email Identity (for testing before domain verification)
resource "aws_ses_email_identity" "test_email" {
  count = var.ses_test_email != "" ? 1 : 0
  email = var.ses_test_email
}

# SES Configuration Set for tracking
resource "aws_ses_configuration_set" "main" {
  name = "${var.environment}-grounded-ses-config"

  delivery_options {
    tls_policy = "Require"
  }

  reputation_metrics_enabled = true
  sending_enabled           = true
}

# SNS Topic for bounce/complaint notifications
resource "aws_sns_topic" "ses_notifications" {
  name = "${var.environment}-grounded-ses-notifications"
}

# SES Event Destination for bounces
resource "aws_ses_event_destination" "bounce" {
  name                   = "bounce-destination"
  configuration_set_name = aws_ses_configuration_set.main.name
  enabled                = true
  matching_types         = ["bounce", "complaint"]

  sns_destination {
    topic_arn = aws_sns_topic.ses_notifications.arn
  }
}

# IAM User for SMTP credentials
resource "aws_iam_user" "smtp" {
  name = "${var.environment}-grounded-smtp-user"
  path = "/system/"

  tags = {
    Name        = "${var.environment}-grounded-smtp-user"
    Environment = var.environment
    Service     = "smtp"
  }
}

# IAM Access Key for SMTP user
resource "aws_iam_access_key" "smtp" {
  user = aws_iam_user.smtp.name
}

# IAM Policy for SES sending
resource "aws_iam_user_policy" "smtp_send" {
  name = "${var.environment}-grounded-smtp-send-policy"
  user = aws_iam_user.smtp.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      }
    ]
  })
}

# Route53 Zone (if domain is managed in Route53)
data "aws_route53_zone" "main" {
  count        = var.ses_domain_route53_zone_id != "" ? 1 : 0
  zone_id      = var.ses_domain_route53_zone_id
  private_zone = false
}

# Route53 Records for SES Domain Verification
resource "aws_route53_record" "ses_verification" {
  count   = var.ses_domain_route53_zone_id != "" ? 1 : 0
  zone_id = data.aws_route53_zone.main[0].zone_id
  name    = "_amazonses.${var.ses_domain}"
  type    = "TXT"
  ttl     = 600
  records = [aws_ses_domain_identity.main.verification_token]
}

# Route53 Records for DKIM
resource "aws_route53_record" "ses_dkim" {
  count   = var.ses_domain_route53_zone_id != "" ? 3 : 0
  zone_id = data.aws_route53_zone.main[0].zone_id
  name    = "${aws_ses_domain_dkim.main.dkim_tokens[count.index]}._domainkey.${var.ses_domain}"
  type    = "CNAME"
  ttl     = 600
  records = ["${aws_ses_domain_dkim.main.dkim_tokens[count.index]}.dkim.amazonses.com"]
}

# Route53 Record for SPF
resource "aws_route53_record" "ses_spf" {
  count   = var.ses_domain_route53_zone_id != "" ? 1 : 0
  zone_id = data.aws_route53_zone.main[0].zone_id
  name    = var.ses_domain
  type    = "TXT"
  ttl     = 600
  records = ["v=spf1 include:amazonses.com ~all"]
}

# Route53 Record for DMARC
resource "aws_route53_record" "ses_dmarc" {
  count   = var.ses_domain_route53_zone_id != "" ? 1 : 0
  zone_id = data.aws_route53_zone.main[0].zone_id
  name    = "_dmarc.${var.ses_domain}"
  type    = "TXT"
  ttl     = 600
  records = ["v=DMARC1; p=quarantine; rua=mailto:${var.ses_dmarc_email}"]
}

# Secrets Manager for SMTP credentials
resource "aws_secretsmanager_secret" "smtp_credentials" {
  name                    = "${var.environment}/grounded/smtp-credentials"
  description             = "SMTP credentials for SES"
  recovery_window_in_days = 7

  tags = {
    Name        = "${var.environment}-grounded-smtp-credentials"
    Environment = var.environment
    Service     = "smtp"
  }
}

resource "aws_secretsmanager_secret_version" "smtp_credentials" {
  secret_id = aws_secretsmanager_secret.smtp_credentials.id
  secret_string = jsonencode({
    username          = aws_iam_access_key.smtp.id
    password          = aws_iam_access_key.smtp.ses_smtp_password_v4
    smtp_host         = "email-smtp.${var.aws_region}.amazonaws.com"
    smtp_port         = 587
    smtp_port_tls     = 465
    from_email        = var.ses_from_email
    configuration_set = aws_ses_configuration_set.main.name
  })
}

# Outputs
output "ses_smtp_host" {
  description = "SMTP host endpoint"
  value       = "email-smtp.${var.aws_region}.amazonaws.com"
}

output "ses_smtp_port" {
  description = "SMTP port (STARTTLS)"
  value       = 587
}

output "ses_smtp_port_tls" {
  description = "SMTP port (TLS)"
  value       = 465
}

output "ses_smtp_username" {
  description = "SMTP username (IAM access key ID)"
  value       = aws_iam_access_key.smtp.id
  sensitive   = true
}

output "ses_smtp_password" {
  description = "SMTP password"
  value       = aws_iam_access_key.smtp.ses_smtp_password_v4
  sensitive   = true
}

output "ses_domain_verification_token" {
  description = "Domain verification token for DNS TXT record"
  value       = aws_ses_domain_identity.main.verification_token
}

output "ses_dkim_tokens" {
  description = "DKIM tokens for DNS CNAME records"
  value       = aws_ses_domain_dkim.main.dkim_tokens
}

output "ses_configuration_set" {
  description = "SES configuration set name"
  value       = aws_ses_configuration_set.main.name
}

output "ses_smtp_secret_arn" {
  description = "ARN of Secrets Manager secret containing SMTP credentials"
  value       = aws_secretsmanager_secret.smtp_credentials.arn
}
