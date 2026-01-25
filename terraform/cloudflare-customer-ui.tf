# ==============================================================================
# Cloudflare Workers - Customer UI Deployment
# ==============================================================================
#
# This configuration manages DNS and custom domain setup for the customer UI.
# The actual Worker deployment is handled by Wrangler CLI (npm run deploy).
#
# Deployment workflow:
# 1. Build and deploy worker: cd packages/ui/customer-ui && npm run deploy
# 2. Apply Terraform to set up custom domain: terraform apply
#
# ==============================================================================

# Get the worker script that was deployed via Wrangler
data "cloudflare_worker_script" "customer_ui" {
  account_id = var.cloudflare_account_id
  name       = var.customer_ui_worker_name

  depends_on = [
    # This data source expects the worker to be deployed via Wrangler first
    # Run: cd packages/ui/customer-ui && npm run deploy
  ]
}

# DNS record for the custom domain
resource "cloudflare_record" "customer_ui" {
  zone_id = var.cloudflare_zone_id
  name    = "grounded"
  content = var.customer_ui_worker_name
  type    = "CNAME"
  proxied = true # Enable Cloudflare proxy for Workers
  comment = "DNS record for Grounded customer UI"
}

# Custom domain binding for the Worker
resource "cloudflare_worker_domain" "customer_ui" {
  account_id = var.cloudflare_account_id
  hostname   = var.customer_ui_domain
  service    = var.customer_ui_worker_name
  zone_id    = var.cloudflare_zone_id

  depends_on = [
    cloudflare_record.customer_ui
  ]
}

# ==============================================================================
# Outputs
# ==============================================================================

output "customer_ui_url" {
  value       = "https://${var.customer_ui_domain}"
  description = "Customer UI URL"
}

output "customer_ui_worker_name" {
  value       = var.customer_ui_worker_name
  description = "Cloudflare Worker name"
}

output "customer_ui_deployment_instructions" {
  value = <<-EOT
    
    Customer UI Deployment Instructions:
    =====================================
    
    1. Build and deploy the Worker:
       cd packages/ui/customer-ui
       npm run deploy
    
    2. Verify deployment:
       wrangler deployments list
    
    3. Access the application:
       https://${var.customer_ui_domain}
    
    Note: The Worker must be deployed via Wrangler before running terraform apply.
    Terraform manages the custom domain configuration only.
    
  EOT
  description = "Instructions for deploying the customer UI"
}
