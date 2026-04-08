# Build and Deployment Guide

## Overview

Personal portfolio site — TanStack Start frontend (SSR with Nitro), Hono backend API, deployed on Kubernetes via ArgoCD.

## Local Development

### Prerequisites

- Node.js 22+
- pnpm 9+
- Docker

### Frontend

```bash
cd frontend && npm install
npm run dev      # Development server
npm run build    # Production build
npm test         # Run tests
npm run test:coverage
```

### Backend

```bash
cd backend && npm install
npm run dev      # Development server (tsx watch)
npm run build    # TypeScript compile
npm test         # Run tests
npm run test:coverage
```

## Docker Builds

```bash
# Test both builds
./test-build.sh

# Build individually
docker build -t personal-site-backend:latest -f backend/Dockerfile ./backend
docker build -t personal-site-frontend:latest -f frontend/Dockerfile ./frontend
```

## CI/CD (GitHub Actions)

Two workflows push to GHCR:

| Workflow | Image | Trigger |
|----------|-------|---------|
| `backend-ci.yml` | `ghcr.io/Aidas-dev/personal-site-backend` | Push to `main`, tags `backend-v*` |
| `frontend-ci.yml` | `ghcr.io/Aidas-dev/personal-site-frontend` | Push to `main`, tags `frontend-v*` |

### Version Tags

```bash
git tag backend-v1.0.0 && git push origin backend-v1.0.0
git tag frontend-v1.0.0 && git push origin frontend-v1.0.0
```

## Kubernetes Deployment

### Architecture

```
Cilium Gateway (cilium-gateway-oracle)
├── aidaskrisciunas.dev → frontend:3000
└── aidaskrisciunas.dev/api/* → backend:8000
```

### Bootstrap ArgoCD

```bash
# 1. Apply the App of Apps
kubectl apply -f kubernetes/argocd/app-of-apps.yaml

# 2. ArgoCD will auto-sync all child applications:
#    - namespace (personal-site)
#    - image-pull-secret (GHCR auth)
#    - backend (Hono API, 2 replicas)
#    - frontend (TanStack Start SSR, 2 replicas)

# 3. Monitor sync
argocd app list | grep personal-site
argocd app wait personal-site-apps --timeout 300
```

### Deploy Order

1. `kubectl apply -f kubernetes/namespace.yaml`
2. `kubectl apply -f kubernetes/image-pull-secret.yaml` (with real credentials)
3. `kubectl apply -f kubernetes/argocd/app-of-apps.yaml`

### TLS

TLS is handled via Cert-Manager wildcard certificate for your domain. Update HTTPRoute hostnames in:
- `kubernetes/backend/httproute.yaml`
- `kubernetes/frontend/httproute.yaml`

### TODO Before Production

1. Replace placeholder domain `aidaskrisciunas.dev` in HTTPRoute manifests
2. Generate real GHCR image pull secret
3. Configure Grafana embed URLs in frontend
4. Set up DNS records pointing to Cilium Gateway
5. Update Grafana public embed URLs in dashboard page
