# Terraform Outputs

output "worker_script_name" {
  description = "Name of the Workers script"
  value       = "portfolio-cf-worker"
}

output "worker_route_pattern" {
  description = "Route pattern for the worker"
  value       = cloudflare_workers_route.portfolio_route.pattern
}

output "domain" {
  description = "Domain configured for the worker"
  value       = var.domain
}
