# Quick Start: Supabase Auth + AWS SES SMTP

Complete setup guide for configuring Supabase authentication with AWS SES SMTP email delivery.

## Overview

This setup provides:
- 🔐 **Supabase Auth** - Email/password, magic links, OAuth
- 📧 **AWS SES SMTP** - Reliable email delivery for auth emails
- 🔒 **AWS Secrets Manager** - Secure credential storage
- ⚡ **Lambda Integration** - Easy Supabase access from Lambda functions

## Prerequisites Checklist

- [ ] Active AWS account with admin access
- [ ] Active Supabase project (or create at [supabase.com](https://supabase.com))
- [ ] Domain name you control (e.g., `yourdomain.com`)
- [ ] Terraform installed (`brew install terraform` or [terraform.io](https://terraform.io))
- [ ] AWS CLI configured (`aws configure`)

## Step-by-Step Setup

### 1. Gather Supabase Credentials

Log in to your Supabase dashboard and collect these values:

**From Settings → API:**
- ✅ `SUPABASE_URL`: `https://xxx.supabase.co`
- ✅ `SUPABASE_ANON_KEY`: `eyJxxx...` (public key)
- ✅ `SUPABASE_SERVICE_ROLE_KEY`: `eyJxxx...` (private key)
- ✅ `JWT_SECRET`: Your JWT signing secret

**From Settings → Database:**
- ✅ `Database Host`: `db.xxx.supabase.co`
- ✅ `Database Password`: Your postgres password

**Project Reference:**
- ✅ `PROJECT_REF`: Extract from URL (e.g., `nhjjelcexbfumdqtueqt` from `https://nhjjelcexbfumdqtueqt.supabase.co`)

**Management API Token:**
- Go to Settings → API → Generate new token
- ✅ `ACCESS_TOKEN`: `sbp_xxx...`

### 2. Configure Terraform Variables

```bash
cd terraform
cp ses-smtp.tfvars.example production.tfvars
```

Edit `production.tfvars`:

```hcl
# ===================
# Environment
# ===================
environment = "production"

# ===================
# AWS SES Configuration
# ===================
aws_region = "us-east-1"
ses_domain = "yourdomain.com"
ses_from_email = "noreply@yourdomain.com"
ses_email_sender_name = "Grounded"

# Optional: For sandbox testing
ses_test_email = "your-email@gmail.com"

# Optional: If using Route53 for DNS
# ses_domain_route53_zone_id = "Z1234567890ABC"

# ===================
# Supabase Configuration
# ===================
supabase_access_token     = "sbp_xxx..."  # From Management API
supabase_project_ref      = "nhjjelcexbfumdqtueqt"
supabase_url              = "https://nhjjelcexbfumdqtueqt.supabase.co"
supabase_anon_key         = "eyJxxx..."
supabase_service_role_key = "eyJxxx..."
supabase_jwt_secret       = "your-jwt-secret"

# Database
supabase_db_host     = "db.nhjjelcexbfumdqtueqt.supabase.co"
supabase_db_password = "your-db-password"

# Application
supabase_site_url = "https://yourapp.com"
supabase_redirect_urls = [
  "https://yourapp.com/auth/callback",
  "http://localhost:3000/auth/callback"  # For local dev
]

# Email
supabase_email_autoconfirm = false  # Set true for dev only
supabase_email_sender_name = "Grounded"
```

### 3. Verify Domain Ownership (SES)

If you're NOT using Route53, you'll need to add DNS records manually.

First, run Terraform to get the verification values:

```bash
terraform init
terraform plan -var-file="production.tfvars"
terraform apply -var-file="production.tfvars" -target=aws_ses_domain_identity.main
```

Get the DNS records needed:

```bash
# Domain verification token
terraform output ses_domain_verification_token

# DKIM tokens (3 values)
terraform output ses_dkim_tokens
```

Add these DNS records to your domain:

| Type  | Name | Value |
|-------|------|-------|
| TXT   | `_amazonses.yourdomain.com` | `<verification_token>` |
| CNAME | `<token1>._domainkey.yourdomain.com` | `<token1>.dkim.amazonses.com` |
| CNAME | `<token2>._domainkey.yourdomain.com` | `<token2>.dkim.amazonses.com` |
| CNAME | `<token3>._domainkey.yourdomain.com` | `<token3>.dkim.amazonses.com` |
| TXT   | `yourdomain.com` | `v=spf1 include:amazonses.com ~all` |
| TXT   | `_dmarc.yourdomain.com` | `v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com` |

**Wait for DNS propagation** (up to 72 hours, usually faster).

Verify domain status:

```bash
aws ses get-identity-verification-attributes --identities yourdomain.com
```

### 4. Apply Full Configuration

Once domain is verified:

```bash
terraform apply -var-file="production.tfvars"
```

Review the plan and type `yes` to apply.

### 5. Request SES Production Access

By default, SES is in sandbox mode (can only send to verified addresses).

To send to any email address:

1. Go to [AWS SES Console](https://console.aws.amazon.com/ses)
2. Click "Account Dashboard"
3. Click "Request production access"
4. Fill out the form:
   - **Use case**: "Transactional emails for user authentication"
   - **Website URL**: Your app URL
   - **How users sign up**: "Through our web application"
   - **How you handle bounces**: "Monitored via SNS notifications"
5. Submit and wait for approval (24-48 hours)

### 6. Test Email Sending

While in sandbox mode, test with verified email:

```bash
# Verify your test email
aws ses verify-email-identity --email-address your-email@gmail.com

# Test SMTP
terraform output ses_smtp_host
terraform output ses_smtp_username
terraform output ses_smtp_password

# Use these credentials to send a test email from your app
```

### 7. Verify Supabase Configuration

Check that Supabase is configured correctly:

```bash
# Get confirmation
terraform output supabase_smtp_configured

# Test auth flow in your app:
# 1. Go to your app's signup page
# 2. Register a new user
# 3. Check email for confirmation (should come from SES)
```

### 8. Update Your Application

#### Frontend (.env)

```bash
# packages/ui/customer-ui/.env
VITE_SUPABASE_URL=https://nhjjelcexbfumdqtueqt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

#### Backend (if using Supabase in Lambdas)

Environment variables are automatically set by Terraform:

```bash
SUPABASE_CREDENTIALS_SECRET_ARN=arn:aws:secretsmanager:us-east-1:xxx:secret:production/grounded/supabase-credentials
```

Use the helper module:

```typescript
import { verifyUserToken } from '@grounded/server-shared/supabase';

const user = await verifyUserToken(jwtToken);
```

See `packages/server/shared/supabase/README.md` for full documentation.

### 9. Install Frontend Dependencies

```bash
cd packages/ui/customer-ui
npm install
```

Your existing `@supabase/supabase-js` package will work with the new configuration.

## Verification Checklist

- [ ] SES domain verified (check AWS console)
- [ ] DNS records added and propagated
- [ ] SMTP credentials generated (check outputs)
- [ ] Supabase SMTP configured (check dashboard)
- [ ] Email templates deployed
- [ ] Frontend .env updated
- [ ] Test signup flow works
- [ ] Test confirmation email received
- [ ] Test password reset works
- [ ] SES production access requested (if needed)

## Testing the Complete Flow

### 1. Test Signup with Email Confirmation

```typescript
// In your frontend
import { supabase } from '~/lib/supabase';

const { data, error } = await supabase.auth.signUp({
  email: 'test@yourdomain.com',
  password: 'SecurePass123!',
  options: {
    emailRedirectTo: 'https://yourapp.com/auth/callback',
  },
});

// User receives email via SES → clicks link → confirmed
```

### 2. Test Password Reset

```typescript
const { error } = await supabase.auth.resetPasswordForEmail(
  'test@yourdomain.com',
  {
    redirectTo: 'https://yourapp.com/auth/reset-password',
  }
);

// User receives reset email via SES → clicks link → resets password
```

### 3. Test Magic Link Login

```typescript
const { error } = await supabase.auth.signInWithOtp({
  email: 'test@yourdomain.com',
  options: {
    emailRedirectTo: 'https://yourapp.com/auth/callback',
  },
});

// User receives magic link via SES → clicks link → logged in
```

### 4. Verify Lambda Integration (Optional)

```typescript
// In a Lambda function
import { verifyUserToken } from '@grounded/server-shared/supabase';

export async function handler(event) {
  const token = event.headers.Authorization?.replace('Bearer ', '');
  const user = await verifyUserToken(token);
  
  if (!user) {
    return { statusCode: 401, body: 'Unauthorized' };
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify({ userId: user.id, email: user.email }),
  };
}
```

## Monitoring

### SES Email Delivery

```bash
# Check send quota
aws ses get-send-quota

# Check sending statistics
aws ses get-send-statistics
```

### CloudWatch Metrics

- Go to AWS Console → CloudWatch → Metrics → SES
- Monitor: Sends, Deliveries, Bounces, Complaints

### Supabase Auth Logs

- Go to Supabase Dashboard → Logs → Auth
- Filter by: signups, logins, password_resets

## Cost Estimate

| Service | Free Tier | Estimated Cost |
|---------|-----------|----------------|
| **AWS SES** | 62,000 emails/month | $0-5/month |
| **AWS Secrets Manager** | 30 secrets | $1-2/month |
| **Supabase Free** | 50,000 MAU | $0/month |
| **Supabase Pro** | 100,000 MAU | $25/month |
| **Total** | - | **$1-32/month** |

## Troubleshooting

### Emails Not Sending

**Check SES domain verification:**
```bash
aws ses get-identity-verification-attributes --identities yourdomain.com
```

**Check Supabase SMTP config:**
- Dashboard → Settings → Auth → SMTP Settings
- Verify host, port, username, password

**Check sandbox mode:**
- SES sandbox only allows verified emails
- Request production access or verify recipient

### Domain Verification Stuck

**Check DNS propagation:**
```bash
dig TXT _amazonses.yourdomain.com
dig CNAME <token>._domainkey.yourdomain.com
```

**Wait longer:**
- DNS can take up to 72 hours
- Check with your DNS provider

### Lambda Can't Access Supabase

**Check IAM policy attached:**
```bash
aws iam list-attached-role-policies --role-name your-lambda-role
```

**Check environment variable:**
```bash
aws lambda get-function-configuration --function-name your-function | grep SUPABASE
```

**Check Secrets Manager:**
```bash
aws secretsmanager get-secret-value --secret-id production/grounded/supabase-credentials
```

## Next Steps

1. **Customize Email Templates** - Edit HTML in `terraform/supabase-email-templates/`
2. **Set Up OAuth** - Add Google/GitHub OAuth (see `SUPABASE-AUTH-SETUP.md`)
3. **Configure Rate Limiting** - Adjust in Supabase dashboard
4. **Set Up Monitoring** - CloudWatch alarms for bounces/complaints
5. **Enable MFA** - Supabase supports TOTP multi-factor auth

## Documentation

- [Supabase Auth Setup](./SUPABASE-AUTH-SETUP.md) - Detailed Supabase configuration
- [SES SMTP Setup](./SES-SMTP-SETUP.md) - Detailed SES configuration
- [Lambda Integration](../packages/server/shared/supabase/README.md) - Using Supabase in Lambda

## Support

- **AWS SES**: [AWS Support](https://console.aws.amazon.com/support)
- **Supabase**: [Discord](https://discord.supabase.com/) | [GitHub Discussions](https://github.com/supabase/supabase/discussions)
- **Terraform**: [Terraform Registry](https://registry.terraform.io/)

## Summary

You now have:
- ✅ Supabase authentication configured
- ✅ AWS SES SMTP for reliable email delivery
- ✅ Custom branded email templates
- ✅ Secure credential storage in Secrets Manager
- ✅ Lambda integration ready to use
- ✅ Full auth flow working (signup, login, reset)

**Remember to request SES production access** to send to non-verified emails!
