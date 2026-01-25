#!/bin/bash

# ==============================================================================
# Grounded Customer UI Deployment Script
# ==============================================================================
#
# This script automates the deployment of the customer UI to Cloudflare Workers
# with custom domain configuration via Terraform.
#
# Usage:
#   ./deploy-customer-ui.sh [environment]
#
# Environment: production (default) | staging
#
# ==============================================================================

set -e  # Exit on error

# Configuration
ENVIRONMENT="${1:-production}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CUSTOMER_UI_DIR="$PROJECT_ROOT/packages/ui/customer-ui"
TERRAFORM_DIR="$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_step() {
    echo -e "\n${BLUE}==>${NC} ${GREEN}$1${NC}\n"
}

print_error() {
    echo -e "\n${RED}ERROR:${NC} $1\n"
}

print_warning() {
    echo -e "\n${YELLOW}WARNING:${NC} $1\n"
}

check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check if wrangler is installed
    if ! command -v wrangler &> /dev/null; then
        print_error "Wrangler CLI not found. Install with: npm install -g wrangler"
        exit 1
    fi
    
    # Check if terraform is installed
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform not found. Install from: https://www.terraform.io/downloads"
        exit 1
    fi
    
    # Check if logged into Wrangler
    if ! wrangler whoami &> /dev/null; then
        print_warning "Not logged into Wrangler. Running login..."
        wrangler login
    fi
    
    # Check if tfvars file exists
    if [ ! -f "$TERRAFORM_DIR/${ENVIRONMENT}.tfvars" ]; then
        print_error "Terraform variables file not found: $TERRAFORM_DIR/${ENVIRONMENT}.tfvars"
        print_warning "Copy tfvars.example and fill in your values:"
        echo "  cp $TERRAFORM_DIR/tfvars.example $TERRAFORM_DIR/${ENVIRONMENT}.tfvars"
        exit 1
    fi
    
    echo "✓ All prerequisites met"
}

build_and_deploy_worker() {
    print_step "Building and deploying worker..."
    
    cd "$CUSTOMER_UI_DIR"
    
    # Build the application
    echo "Building application..."
    npm run build
    
    # Deploy to Cloudflare Workers
    echo "Deploying to Cloudflare Workers (${ENVIRONMENT})..."
    if [ "$ENVIRONMENT" = "production" ]; then
        npm run deploy:production
    elif [ "$ENVIRONMENT" = "staging" ]; then
        npm run deploy:staging
    else
        npm run deploy
    fi
    
    echo "✓ Worker deployed successfully"
}

configure_custom_domain() {
    print_step "Configuring custom domain with Terraform..."
    
    cd "$TERRAFORM_DIR"
    
    # Initialize Terraform if needed
    if [ ! -d ".terraform" ]; then
        echo "Initializing Terraform..."
        terraform init
    fi
    
    # Apply Terraform configuration for Cloudflare resources only
    echo "Applying Terraform configuration..."
    terraform apply \
        -target=cloudflare_record.customer_ui \
        -target=cloudflare_worker_domain.customer_ui \
        -var-file="${ENVIRONMENT}.tfvars" \
        -auto-approve
    
    echo "✓ Custom domain configured successfully"
}

display_deployment_info() {
    print_step "Deployment Complete!"
    
    cd "$TERRAFORM_DIR"
    
    # Get the customer UI URL from Terraform output
    CUSTOMER_UI_URL=$(terraform output -raw customer_ui_url 2>/dev/null || echo "https://grounded.chasespencer.dev")
    
    echo -e "${GREEN}Your application is now deployed!${NC}"
    echo ""
    echo "  URL: $CUSTOMER_UI_URL"
    echo ""
    echo "Next steps:"
    echo "  1. Test the application: $CUSTOMER_UI_URL"
    echo "  2. View worker logs: cd $CUSTOMER_UI_DIR && wrangler tail --env $ENVIRONMENT"
    echo "  3. View deployments: wrangler deployments list --env $ENVIRONMENT"
    echo ""
}

# Main execution
main() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════╗"
    echo "║  Grounded Customer UI Deployment Script   ║"
    echo "║  Environment: ${ENVIRONMENT}                    ║"
    echo "╚════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    check_prerequisites
    build_and_deploy_worker
    configure_custom_domain
    display_deployment_info
}

# Run main function
main
