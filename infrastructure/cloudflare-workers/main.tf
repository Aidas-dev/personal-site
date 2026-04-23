terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = ">= 4.0.0"
    }
  }
}

provider "cloudflare" {
  api_token = coalesce(env("CLOUDFLARE_API_TOKEN"), "")
}

resource "cloudflare_workers_route" "portfolio_route" {
  zone_id     = var.cloudflare_zone_id
  pattern     = "${var.domain}/*"
  script_name = "portfolio"
}