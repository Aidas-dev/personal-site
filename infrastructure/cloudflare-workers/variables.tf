variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
  default     = "21f60c409f92a6f7bc9d9fcad361616b"
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID"
  type        = string
  default     = "0dd20ed9493a771ee66c376761ecaefa"
}

variable "domain" {
  description = "Domain for the worker"
  type        = string
  default     = "portfolio.kubexa.tech"
}