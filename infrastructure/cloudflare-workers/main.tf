terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = ">= 4.0.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# Route created via wrangler deploy - managed outside Terraform
# import existing: terraform import cloudflare_workers_route.portfolio_route zone_id:pattern