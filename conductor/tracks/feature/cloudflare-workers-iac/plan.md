# Plan: Cloudflare Workers IaC Deployment

## Phase 1: Infrastructure Scaffolding
- [x] Initialize Terraform project structure (main.tf, variables.tf, outputs.tf) b2369b2
- [x] Configure Cloudflare Provider and backend b510569
- [x] Define Worker Script and Domain Route resources da437d8
- [x] **Checkpoint**: `terraform validate` and `terraform plan` succeed without errors d67367e

## Phase 2: Worker Application Development (TDD)
- [x] Initialize Hono Worker project with pnpm e40bf74
- [x] **TDD**: Write failing test for "Hello World" endpoint 6f15fdb
- [x] **Green**: Implement "Hello World" to pass test 6f15fdb
- [x] Configure `wrangler.toml` for local development and compatibility 503b2e3

## Phase 3: GitHub Actions CI/CD
- [x] Create `.github/workflows/terraform.yml` (with action version fixes) ee567a2
- [x] **TDD**: Add failing CI test for format check
- [x] **Green**: Fix formatting to pass CI
- [x] **Checkpoint**: PR checks pass in CI (re-triggered after @v4 fix)

## Phase 4: Deployment & Handover
- [x] Add required GitHub Secrets (`CF_API_TOKEN` added, `CF_ZONE_ID` added)
- [ ] **Verify**: DNS propagation via `nslookup portfolio.kubexa.tech`
- [ ] **Verify**: `curl https://portfolio.kubexa.tech` returns "Hello World"
- [ ] Push feature branch and open PR
- [ ] **Checkpoint**: Live deployment passes smoke test

## Verification Commands
```bash
# DNS check
nslookup portfolio.kubexa.tech

# Smoke test
curl -s https://portfolio.kubexa.tech

# Local dev
cd src/worker && pnpm dev
```