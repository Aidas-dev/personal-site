terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "4.52.7"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

resource "cloudflare_workers_script" "portfolio_worker" {
  account_id = var.cloudflare_account_id
  name       = "personal-portfolio"
  content    = file("${path.module}/../../src/worker/index.ts") # Placeholder for Phase 2

  module = true
}

resource "cloudflare_workers_route" "portfolio_route" {
  zone_id     = var.cloudflare_zone_id
  pattern     = "${var.domain}/*"
  script_name = cloudflare_workers_script.portfolio_worker.name
}
