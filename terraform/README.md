# Grounded Infrastructure (Terraform)

Infrastructure-as-Code for the Grounded platform using Terraform.

## Overview

This directory contains Terraform configuration for AWS resources, Cloudflare Workers deployment, and Supabase auth infrastructure.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Cloudflare)                   │
│  - Remix + React UI                                         │
│  - GraphQL Gateway API                                      │
│  - Durable Objects (SSE streaming)                          │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend (AWS)                           │
├─────────────────────────────────────────────────────────────┤
│  APIs:                                                      │
│  - Ruby on Rails (Conversation Commands & Updates)          │
│  - Node.js Lambda (Organization & Company Data)             │
│                                                             │
│  Event Processing:                                          │
│  - Kafka (MSK or EC2)                                       │
│  - Lambda Orchestrators & Agents                            │
│                                                             │
│  Data Storage:                                              │
│  - DynamoDB (conversations, state machine)                  │
│  - PostgreSQL RDS (company/customer data)                   │
│                                                             │
│  Authentication:                                            │
│  - Supabase (auth only)                                     │
│  - AWS SES (email delivery)                                 │
│                                                             │
│  Secrets:                                                   │
│  - AWS Secrets Manager                                      │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- AWS CLI configured (`aws configure`)
- Terraform installed (`brew install terraform`)
- Active Supabase project (optional, for auth)
- Domain name (optional, for SES email)

### Basic Setup

```bash
# Initialize Terraform
terraform init

# Create your tfvars file
cp ses-smtp.tfvars.example production.tfvars
# Edit production.tfvars with your values

# Plan and apply
terraform plan -var-file="production.tfvars"
terraform apply -var-file="production.tfvars"
```

### Auth + Email Setup

For complete Supabase auth and SES SMTP setup:

📘 **[QUICK-START-AUTH-SMTP.md](./QUICK-START-AUTH-SMTP.md)** - Complete step-by-step guide

## Configuration Files

### Core Infrastructure

| File | Purpose |
|------|---------|
| `providers.tf` | AWS, Cloudflare & Supabase provider configuration |
| `variables.tf` | All input variables |
| `production.tfvars` | Production environment values (gitignored) |
| `networking.tf` | VPC, subnets, security groups |
| `dynamo.tf` | DynamoDB table (single table design) |
| `postgres.tf` | PostgreSQL RDS for company data |

### Cloudflare Workers

| File | Purpose |
|------|---------|
| `cloudflare-customer-ui.tf` | Customer UI Workers deployment & custom domain |

### Compute

| File | Purpose |
|------|---------|
| `lambda-actions-orchestrator.tf` | Actions orchestrator Lambda |
| `lambda-responder.tf` | Responder Lambda |
| `lambda-evaluators.tf` | Agent Lambdas (spend, recommendation) |
| `lambda-company-data-api.tf` | Company data API Lambda |
| `app-runner-*.tf` | Ruby on Rails App Runner services |

### Messaging

| File | Purpose |
|------|---------|
| `ec2-kafka-cluster.tf` | EC2-based Kafka cluster |
| `msk-cluster.tf` | AWS MSK (Managed Kafka) - alternative |
| `lambda-event-source-mappings.tf` | Kafka → Lambda integrations |

### Authentication & Email

| File | Purpose |
|------|---------|
| `ses-smtp.tf` | AWS SES SMTP server configuration |
| `supabase-auth.tf` | Supabase auth + SES integration |
| `lambda-supabase-integration.tf` | Attach Supabase access to Lambdas |
| `supabase-email-templates/` | Custom branded email templates |

### Secrets

| File | Purpose |
|------|---------|
| `secrets.tf` | AWS Secrets Manager data sources |

## Documentation

### Setup Guides

- 📘 **[CLOUDFLARE-DEPLOYMENT-GUIDE.md](./CLOUDFLARE-DEPLOYMENT-GUIDE.md)** - Complete Cloudflare Workers deployment guide
- 📘 **[SUPABASE-AUTH-SETUP.md](./SUPABASE-AUTH-SETUP.md)** - Detailed Supabase configuration
- 📘 **[SES-SMTP-SETUP.md](./SES-SMTP-SETUP.md)** - Detailed SES SMTP setup (DELETED - reference inline docs)

### Integration Guides

- 📘 **[../packages/server/shared/supabase/README.md](../packages/server/shared/supabase/README.md)** - Using Supabase in Lambda

## Common Operations

### Deploy All Infrastructure

```bash
terraform apply -var-file="production.tfvars"
```

### Deploy Cloudflare Customer UI

For complete Cloudflare deployment instructions, see:
📘 **[CLOUDFLARE-DEPLOYMENT-GUIDE.md](./CLOUDFLARE-DEPLOYMENT-GUIDE.md)**

Quick reference:

```bash
# 1. Deploy worker via Wrangler
cd ../packages/ui/customer-ui
yarn run deploy:production

# 2. Configure custom domain via Terraform
cd ../../terraform
terraform apply -target=cloudflare_record.customer_ui -var-file="production.tfvars"
terraform apply -target=cloudflare_worker_domain.customer_ui -var-file="production.tfvars"
```

### Deploy Specific Resources

```bash
# Just SES
terraform apply -target=aws_ses_domain_identity.main -var-file="production.tfvars"

# Just Supabase
terraform apply -target=supabase_settings.auth -var-file="production.tfvars"

# Just Lambda
terraform apply -target=aws_lambda_function.actions_orchestrator -var-file="production.tfvars"
```

### View Outputs

```bash
# All outputs
terraform output

# Specific output
terraform output ses_smtp_username
terraform output supabase_url
terraform output supabase_credentials_secret_arn
```

### Update Lambda Code

```bash
# Build Lambda
cd ../packages/server/orchestrators/actions-orchestrator
yarn run build

# Package and deploy
cd ../../../../terraform
terraform taint aws_lambda_function.actions_orchestrator
terraform apply -var-file="production.tfvars"
```

### Rotate Secrets

```bash
# Rotate SES credentials
terraform taint aws_iam_access_key.smtp
terraform apply -var-file="production.tfvars"

# Supabase will automatically get new credentials
```

### Destroy Resources

```bash
# Destroy everything
terraform destroy -var-file="production.tfvars"

# Destroy specific resources
terraform destroy -target=aws_ses_domain_identity.main -var-file="production.tfvars"
```

## Environment Variables

### Required Variables

Create a `production.tfvars` file with these values:

```hcl
# Basic
environment = "production"
vpc_id      = "vpc-xxx"
subnet_ids  = ["subnet-xxx", "subnet-yyy"]

# SES (if using email)
ses_domain     = "yourdomain.com"
ses_from_email = "noreply@yourdomain.com"

# Supabase (if using auth)
supabase_access_token     = "sbp_xxx"
supabase_project_ref      = "xxx"
supabase_url              = "https://xxx.supabase.co"
supabase_anon_key         = "eyJxxx"
supabase_service_role_key = "eyJxxx"
supabase_jwt_secret       = "xxx"
supabase_db_host          = "db.xxx.supabase.co"
supabase_db_password      = "xxx"
supabase_site_url         = "https://grounded.chasespencer.dev"

# Cloudflare (for Workers deployment)
cloudflare_api_token     = "your-cloudflare-api-token"
cloudflare_account_id    = "your-cloudflare-account-id"
cloudflare_zone_id       = "your-cloudflare-zone-id"
customer_ui_domain       = "grounded.chasespencer.dev"
graphql_endpoint         = "https://your-graphql-worker.workers.dev/graphql"
```

See `tfvars.example` for complete list.

### Sensitive Variables

Never commit these to git:
- `aws_access_key` / `aws_secret_key`
- `cloudflare_api_token`
- `supabase_access_token`
- `supabase_anon_key`
- `supabase_service_role_key`
- `supabase_jwt_secret`
- `supabase_db_password`

Use `.gitignore` to exclude:
- `*.tfvars` (except `*.tfvars.example`)
- `*.tfstate`
- `.terraform/`

## Outputs

| Output | Description |
|--------|-------------|
| `customer_ui_url` | Customer UI URL (Cloudflare) |
| `ses_smtp_host` | SMTP server hostname |
| `ses_smtp_username` | SMTP username (sensitive) |
| `ses_smtp_password` | SMTP password (sensitive) |
| `supabase_url` | Supabase project URL |
| `supabase_credentials_secret_arn` | ARN for Lambda access |
| `supabase_secrets_policy_arn` | IAM policy ARN |

## Cost Estimates

### Minimal Setup (Development)

| Service | Cost/Month |
|---------|-----------|
| DynamoDB (on-demand) | $0-5 |
| EC2 Kafka (t3.small) | $15 |
| Lambda (1M requests) | $0-2 |
| RDS Postgres (t3.micro) | $15 |
| SES (10K emails) | $0 (free tier) |
| Secrets Manager | $1 |
| Supabase (Free) | $0 |
| Cloudflare Workers (Free tier) | $0 |
| **Total** | **~$31-38/month** |

### Production Setup

| Service | Cost/Month |
|---------|-----------|
| DynamoDB (provisioned) | $20-50 |
| MSK (kafka.m5.large x3) | $500 |
| Lambda (10M requests) | $10-20 |
| RDS Postgres (t3.large) | $100 |
| SES (100K emails) | $10 |
| App Runner (2 services) | $50 |
| Secrets Manager | $2 |
| Supabase (Pro) | $25 |
| Cloudflare Workers (Paid) | $5 |
| **Total** | **~$722-782/month** |

## Security Best Practices

### 1. Use Separate Environments

```bash
# Development
terraform workspace new development
terraform apply -var-file="development.tfvars"

# Production
terraform workspace new production
terraform apply -var-file="production.tfvars"
```

### 2. Enable State Locking

Use S3 backend with DynamoDB locking:

```hcl
terraform {
  backend "s3" {
    bucket         = "grounded-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}
```

### 3. Rotate Credentials Regularly

```bash
# Every 90 days
terraform taint aws_iam_access_key.smtp
terraform apply -var-file="production.tfvars"
```

### 4. Use IAM Policies

All Lambdas follow least-privilege:
- Only necessary Secrets Manager access
- Only necessary DynamoDB tables
- Only necessary Kafka topics

### 5. Enable CloudWatch Logs

All Lambdas automatically log to CloudWatch with retention:

```bash
# View logs
aws logs tail /aws/lambda/grounded-actions-orchestrator --follow
```

## Monitoring

### CloudWatch Dashboards

```bash
# Lambda metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=grounded-actions-orchestrator

# SES metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/SES \
  --metric-name Delivery
```

### Alarms

Set up CloudWatch alarms for:
- Lambda errors
- SES bounces (>5%)
- DynamoDB throttling
- RDS CPU (>80%)

## Troubleshooting

### Terraform State Issues

```bash
# Refresh state
terraform refresh -var-file="production.tfvars"

# Force unlock (if locked)
terraform force-unlock <lock-id>

# Import existing resource
terraform import aws_lambda_function.actions_orchestrator grounded-actions-orchestrator
```

### Provider Issues

```bash
# Re-initialize
rm -rf .terraform .terraform.lock.hcl
terraform init

# Update providers
terraform init -upgrade
```

### DNS Propagation (SES)

```bash
# Check DNS records
dig TXT _amazonses.yourdomain.com
dig CNAME <token>._domainkey.yourdomain.com

# Check SES verification
aws ses get-identity-verification-attributes --identities yourdomain.com
```

## Contributing

When adding new infrastructure:

1. Create a new `.tf` file for the resource type
2. Add variables to `variables.tf`
3. Update `ses-smtp.tfvars.example` with defaults
4. Document in this README
5. Add outputs if needed

## Additional Resources

- [AWS Terraform Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Cloudflare Terraform Provider](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs)
- [Supabase Terraform Provider](https://registry.terraform.io/providers/supabase/supabase/latest/docs)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)

## Support

- **Terraform Issues**: [GitHub Issues](https://github.com/hashicorp/terraform/issues)
- **AWS Support**: [AWS Console](https://console.aws.amazon.com/support)
- **Supabase Support**: [Discord](https://discord.supabase.com/)
