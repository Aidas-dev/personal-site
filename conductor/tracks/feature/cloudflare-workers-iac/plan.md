# Plan: Cloudflare Workers IaC Deployment

## Phase 1: Infrastructure Scaffolding
- [x] Initialize Terraform project structure (main.tf, variables.tf, outputs.tf) b2369b2
- [x] Configure Cloudflare Provider and backend b510569
- [x] Define Worker Script and Domain Route resources da437d8
- [~] **Checkpoint**: `terraform validate` and `terraform plan` succeed without errors

## Phase 2: Worker Application Development (TDD)
- [ ] Initialize Hono Worker project with pnpm
- [ ] **TDD**: Write failing test for "Hello World" endpoint
- [ ] **Green**: Implement "Hello World" to pass test
- [ ] Configure `wrangler.toml` for local development and compatibility
- [ ] **Checkpoint**: `pnpm test` passes with >80% coverage

## Phase 3: CI/CD Pipeline
- [ ] Create GitHub Actions workflow for Terraform Dev environment
- [ ] Create GitHub Actions workflow for Terraform Prod environment
- [ ] Configure GitHub Secrets for Cloudflare authentication
- [ ] **Checkpoint**: Successful 'dry-run' of CI/CD pipeline on PR

## Phase 4: Verification & Handover
- [ ] Verify deployment on `portfolio.kubexa.tech` via browser
- [ ] **TDD**: Write failing Playwright test for live domain
- [ ] **Green**: Verify live domain passes E2E tests
- [ ] Checkpoint and finalize track
