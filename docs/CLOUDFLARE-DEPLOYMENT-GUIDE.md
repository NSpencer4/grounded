# Cloudflare Customer UI Deployment Guide

This guide walks you through deploying the Grounded customer UI to Cloudflare Workers with a custom domain.

## Prerequisites

1. **Cloudflare Account** with a domain configured (chasespencer.dev)
2. **Cloudflare API Token** with the following permissions:
   - Workers Scripts: Edit
   - Account Settings: Read
   - Zone: Edit
   - DNS: Edit
3. **Wrangler CLI** installed (included in package.json)
4. **Terraform** installed (v1.0+)

## Configuration Steps

### 1. Set up Cloudflare API Token

1. Go to [Cloudflare Dashboard → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use the "Edit Cloudflare Workers" template or create custom with permissions:
   - Workers Scripts: Edit
   - Account Settings: Read
   - Zone: Edit
   - DNS: Edit
4. Copy the token (you'll need it for Terraform)

### 2. Get Cloudflare Account and Zone IDs

1. **Account ID**: 
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Click on any domain
   - Scroll down on the right sidebar to find "Account ID"

2. **Zone ID**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Select your domain (chasespencer.dev)
   - Scroll down on the right sidebar to find "Zone ID"

### 3. Update Terraform Variables

Copy the example tfvars file and fill in your values:

```bash
cd terraform
cp tfvars.example production.tfvars
```

Edit `production.tfvars` and set these required variables:

```hcl
# Cloudflare Configuration
cloudflare_api_token     = "your-cloudflare-api-token"
cloudflare_account_id    = "your-cloudflare-account-id"
cloudflare_zone_id       = "your-cloudflare-zone-id"
customer_ui_domain       = "grounded.chasespencer.dev"
customer_ui_worker_name  = "grounded-customer-ui"
graphql_endpoint         = "https://your-graphql-worker.workers.dev/graphql"
default_org_id           = "org_123"

# Other required variables...
```

### 4. Update Wrangler Configuration

Edit `packages/ui/customer-ui/wrangler.jsonc` and update the production environment:

```jsonc
"env": {
  "production": {
    "name": "grounded-customer-ui",
    "vars": {
      "GRAPHQL_ENDPOINT": "https://your-actual-graphql-endpoint.workers.dev/graphql",
      "DEFAULT_ORG_ID": "org_123"
    },
    "routes": [
      {
        "pattern": "grounded.chasespencer.dev",
        "custom_domain": true
      }
    ]
  }
}
```

### 5. Deploy the Worker

From the customer-ui directory:

```bash
cd packages/ui/customer-ui

# Build and deploy to production
yarn run deploy:production

# Or deploy to staging first
yarn run deploy:staging
```

This will:
- Build the Remix app
- Bundle the worker code
- Deploy to Cloudflare Workers
- Return the worker URL

### 6. Configure Custom Domain with Terraform

After the worker is deployed, use Terraform to set up the custom domain:

```bash
cd terraform

# Initialize Terraform (if not already done)
terraform init

# Preview changes
terraform plan -var-file="production.tfvars"

# Apply configuration
terraform apply -var-file="production.tfvars"
```

This will:
- Create DNS CNAME record for grounded.chasespencer.dev
- Bind the custom domain to your worker
- Enable Cloudflare proxy (orange cloud)

### 7. Verify Deployment

1. Check DNS propagation:
   ```bash
   dig grounded.chasespencer.dev
   ```

2. Test the application:
   ```bash
   curl -I https://grounded.chasespencer.dev
   ```

3. Open in browser:
   ```
   https://grounded.chasespencer.dev
   ```

## Deployment Commands Reference

### Local Development
```bash
cd packages/ui/customer-ui
yarn run dev          # Start local dev server
yarn run start        # Start with Wrangler dev server
```

### Production Deployment
```bash
cd packages/ui/customer-ui
yarn run build                    # Build only
yarn run deploy:production        # Build and deploy to production
yarn run deploy:staging           # Build and deploy to staging
wrangler deployments list        # View deployment history
```

### Terraform Management
```bash
cd terraform
terraform plan -var-file="production.tfvars"      # Preview changes
terraform apply -var-file="production.tfvars"     # Apply changes
terraform destroy -var-file="production.tfvars"   # Remove infrastructure
terraform output customer_ui_url                   # Get deployment URL
```

## Environment Variables

The worker uses these environment variables (configured in wrangler.jsonc):

| Variable | Description | Example |
|----------|-------------|---------|
| `GRAPHQL_ENDPOINT` | GraphQL API endpoint | `https://api.example.com/graphql` |
| `DEFAULT_ORG_ID` | Default organization ID | `org_123` |

To add secrets (not in wrangler.jsonc):

```bash
cd packages/ui/customer-ui
wrangler secret put SUPABASE_ANON_KEY --env production
wrangler secret put SUPABASE_URL --env production
```

## Troubleshooting

### Worker deployment fails
- Ensure you're logged into Wrangler: `wrangler login`
- Check account ID matches in wrangler.jsonc
- Verify build completes successfully: `yarn run build`

### Custom domain not working
- Verify DNS records in Cloudflare dashboard
- Check worker binding: `wrangler deployments list`
- Ensure zone ID is correct in Terraform variables
- DNS propagation can take a few minutes

### CORS errors
- Check GRAPHQL_ENDPOINT is correct
- Verify GraphQL API allows requests from your domain
- Check browser console for specific CORS errors

### 404 errors on routes
- Verify Remix routes are correctly configured
- Check that assets are being served from build/client
- Review Cloudflare Workers logs: `wrangler tail --env production`

## Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────────────┐
│  grounded.chasespencer.dev  │
│  (Cloudflare DNS + Proxy)   │
└──────────┬──────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Cloudflare Worker           │
│  (grounded-customer-ui)      │
│  - Remix SSR                 │
│  - Static Assets             │
│  - GraphQL Client            │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  GraphQL Gateway API         │
│  (Cloudflare Worker)         │
└──────────────────────────────┘
```

## Production Checklist

Before deploying to production:

- [ ] GraphQL endpoint is configured and accessible
- [ ] Environment variables are set correctly
- [ ] Supabase secrets are added via `wrangler secret`
- [ ] Custom domain DNS is configured
- [ ] SSL/TLS is enabled (automatic with Cloudflare)
- [ ] Rate limiting is configured (optional)
- [ ] Analytics/monitoring is enabled
- [ ] Error tracking is configured
- [ ] Tested authentication flow
- [ ] Tested all major user flows

## Rollback Procedure

If you need to rollback a deployment:

```bash
cd packages/ui/customer-ui

# List deployments
wrangler deployments list --env production

# Rollback to a specific deployment
wrangler rollback <deployment-id> --env production
```

## Monitoring

View worker logs in real-time:

```bash
cd packages/ui/customer-ui
wrangler tail --env production
```

View analytics in Cloudflare Dashboard:
- Workers & Pages → grounded-customer-ui → Analytics

## Cost Estimates

Cloudflare Workers pricing (as of 2024):

- **Free Tier**: 100,000 requests/day
- **Paid Plan ($5/month)**:
  - 10 million requests/month included
  - $0.50 per additional million requests
  - Custom domains included
  - No bandwidth charges

## Security Considerations

1. **API Tokens**: Store securely, use separate tokens for different environments
2. **Secrets**: Use `wrangler secret` for sensitive values, never commit to git
3. **CORS**: Configure strict CORS policies in GraphQL API
4. **CSP**: Implement Content Security Policy headers
5. **Rate Limiting**: Use Cloudflare rate limiting to prevent abuse

## Additional Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Remix Cloudflare Adapter](https://remix.run/docs/en/main/guides/deployment#cloudflare-workers)
- [Terraform Cloudflare Provider](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs)
