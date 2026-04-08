# Portfolio Site Infrastructure & CI/CD Update Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update all CI/CD pipelines, Kubernetes manifests, Dockerfiles, and documentation for the new portfolio architecture (Hono backend + TanStack Start frontend).

**Architecture:** GitHub Actions builds multi-platform Docker images and pushes to GHCR. ArgoCD App of Apps bootstraps all child applications. Cilium Gateway routes traffic via HTTPRoute. Backend (Hono) on port 8000, Frontend (TanStack Start SSR) on port 3000.

**Tech Stack:** GitHub Actions, Docker Buildx, ArgoCD, Kubernetes, Cilium Gateway API, Hono, TanStack Start, Nitro

---

## File Map

### Files to Create
- `kubernetes/backend/deployment.yaml` — Hono backend deployment
- `kubernetes/backend/service.yaml` — Backend ClusterIP service
- `kubernetes/backend/httproute.yaml` — HTTPRoute for API backend
- `kubernetes/frontend/deployment.yaml` — TanStack Start frontend deployment
- `kubernetes/frontend/service.yaml` — Frontend ClusterIP service
- `kubernetes/frontend/httproute.yaml` — HTTPRoute for main site
- `kubernetes/argocd/apps/backend.yaml` — ArgoCD app for backend
- `kubernetes/argocd/apps/frontend.yaml` — ArgoCD app for frontend
- `docs/BUILD_DEPLOYMENT.md` — Build and deployment documentation

### Files to Modify
- `.github/workflows/backend-ci.yml` — Rename image to personal-site-backend
- `.github/workflows/frontend-ci.yml` — Rename image to personal-site-frontend
- `kubernetes/argocd/app-of-apps.yaml` — Update repo URL, namespace, labels
- `kubernetes/argocd/apps/namespace.yaml` — Update namespace name and labels
- `kubernetes/argocd/apps/image-pull-secret.yaml` — Update repo URL, namespace
- `kubernetes/namespace.yaml` — Update namespace name
- `kubernetes/image-pull-secret.yaml` — Update if exists (currently doesn't)
- `test-build.sh` — Update image names

### Directories to Remove
- `kubernetes/postgres/`
- `kubernetes/dragonfly/`
- `kubernetes/medusa-backend/`
- `kubernetes/medusa-admin/`
- `kubernetes/riedu-frontend/`

### Files to Delete from `kubernetes/argocd/apps/`
- `dragonfly.yaml`
- `postgres.yaml`
- `medusa-backend.yaml`
- `medusa-admin.yaml`
- `riedu-frontend.yaml`

---

## Task 1: Update GitHub Actions Workflows

**Files:**
- Modify: `.github/workflows/backend-ci.yml`
- Modify: `.github/workflows/frontend-ci.yml`

- [ ] **Step 1: Update backend-ci.yml IMAGE_NAME**

Change line in `env:` block from:
```yaml
  IMAGE_NAME: ${{ github.repository_owner }}/riedu-backend
```
to:
```yaml
  IMAGE_NAME: ${{ github.repository_owner }}/personal-site-backend
```

Also update the job name at the top from `Build and Push Backend Image` to `Build and Push Personal Site Backend Image`, and update the tag pattern from `backend-v*` to `backend-v*` (keep same).

Update the Verify image step echo to say "Personal Site Backend image pushed".

- [ ] **Step 2: Update frontend-ci.yml IMAGE_NAME**

Change line in `env:` block from:
```yaml
  IMAGE_NAME: ${{ github.repository_owner }}/riedu-frontend
```
to:
```yaml
  IMAGE_NAME: ${{ github.repository_owner }}/personal-site-frontend
```

Also update the job name at the top from `Build and Push Frontend Image` to `Build and Push Personal Site Frontend Image`, and update the tag pattern from `frontend-v*` to `frontend-v*` (keep same).

Update the Verify image step echo to say "Personal Site Frontend image pushed".

- [ ] **Step 3: Verify multi-platform builds are configured**

Both workflows already have `platforms: linux/amd64,linux/arm64` in the build-push-action step. Confirm this is present in both files.

---

## Task 2: Remove Unnecessary Kubernetes Directories and Files

**Files:**
- Delete: `kubernetes/postgres/` (entire directory)
- Delete: `kubernetes/dragonfly/` (entire directory)
- Delete: `kubernetes/medusa-backend/` (entire directory)
- Delete: `kubernetes/medusa-admin/` (entire directory)
- Delete: `kubernetes/riedu-frontend/` (entire directory)
- Delete: `kubernetes/argocd/apps/dragonfly.yaml`
- Delete: `kubernetes/argocd/apps/postgres.yaml`
- Delete: `kubernetes/argocd/apps/medusa-backend.yaml`
- Delete: `kubernetes/argocd/apps/medusa-admin.yaml`
- Delete: `kubernetes/argocd/apps/riedu-frontend.yaml`

- [ ] **Step 1: Remove old kubernetes directories**

Run:
```bash
rm -rf kubernetes/postgres kubernetes/dragonfly kubernetes/medusa-backend kubernetes/medusa-admin kubernetes/riedu-frontend
```

- [ ] **Step 2: Remove old ArgoCD app definitions**

Run:
```bash
rm kubernetes/argocd/apps/dragonfly.yaml kubernetes/argocd/apps/postgres.yaml kubernetes/argocd/apps/medusa-backend.yaml kubernetes/argocd/apps/medusa-admin.yaml kubernetes/argocd/apps/riedu-frontend.yaml
```

---

## Task 3: Create Backend Kubernetes Manifests

**Files:**
- Create: `kubernetes/backend/deployment.yaml`
- Create: `kubernetes/backend/service.yaml`
- Create: `kubernetes/backend/httproute.yaml`

- [ ] **Step 1: Create backend deployment.yaml**

Create `kubernetes/backend/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: personal-site-backend
  namespace: personal-site
  labels:
    app: personal-site-backend
    component: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: personal-site-backend
  template:
    metadata:
      labels:
        app: personal-site-backend
        component: backend
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
              - matchExpressions:
                  - key: location
                    operator: In
                    values:
                      - oracle-cloud
      imagePullSecrets:
        - name: ghcr-secret
      containers:
        - name: personal-site-backend
          image: ghcr.io/aidas-dev/personal-site-backend:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 8000
              name: http
              protocol: TCP
          env:
            - name: NODE_ENV
              value: "production"
            - name: PORT
              value: "8000"
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 10
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 5
            periodSeconds: 5
          resources:
            requests:
              memory: "128Mi"
              cpu: "50m"
            limits:
              memory: "256Mi"
              cpu: "250m"
```

- [ ] **Step 2: Create backend service.yaml**

Create `kubernetes/backend/service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: personal-site-backend
  namespace: personal-site
  labels:
    app: personal-site-backend
    component: backend
spec:
  selector:
    app: personal-site-backend
  ports:
    - port: 8000
      targetPort: 8000
      name: http
  type: ClusterIP
```

- [ ] **Step 3: Create backend httproute.yaml**

Create `kubernetes/backend/httproute.yaml`:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: personal-site-backend
  namespace: personal-site
  labels:
    app: personal-site-backend
    component: backend
spec:
  parentRefs:
    - name: cilium-gateway-oracle
      namespace: cilium-gateway
  hostnames:
    - "aidas.dev"
    - "www.aidas.dev"
  rules:
    # API endpoints
    - matches:
        - path:
            type: PathPrefix
            value: /api
      backendRefs:
        - name: personal-site-backend
          port: 8000
    # Health check
    - matches:
        - path:
            type: Exact
            value: /health
      backendRefs:
        - name: personal-site-backend
          port: 8000
```

---

## Task 4: Create Frontend Kubernetes Manifests

**Files:**
- Create: `kubernetes/frontend/deployment.yaml`
- Create: `kubernetes/frontend/service.yaml`
- Create: `kubernetes/frontend/httproute.yaml`

- [ ] **Step 1: Create frontend deployment.yaml**

Create `kubernetes/frontend/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: personal-site-frontend
  namespace: personal-site
  labels:
    app: personal-site-frontend
    component: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: personal-site-frontend
  template:
    metadata:
      labels:
        app: personal-site-frontend
        component: frontend
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
              - matchExpressions:
                  - key: location
                    operator: In
                    values:
                      - oracle-cloud
      imagePullSecrets:
        - name: ghcr-secret
      containers:
        - name: personal-site-frontend
          image: ghcr.io/aidas-dev/personal-site-frontend:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 3000
              name: http
              protocol: TCP
          env:
            - name: NODE_ENV
              value: "production"
            - name: PORT
              value: "3000"
          livenessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 20
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 5
          resources:
            requests:
              memory: "256Mi"
              cpu: "100m"
            limits:
              memory: "512Mi"
              cpu: "500m"
```

- [ ] **Step 2: Create frontend service.yaml**

Create `kubernetes/frontend/service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: personal-site-frontend
  namespace: personal-site
  labels:
    app: personal-site-frontend
    component: frontend
spec:
  selector:
    app: personal-site-frontend
  ports:
    - port: 3000
      targetPort: 3000
      name: http
  type: ClusterIP
```

- [ ] **Step 3: Create frontend httproute.yaml**

Create `kubernetes/frontend/httproute.yaml`:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: personal-site-frontend
  namespace: personal-site
  labels:
    app: personal-site-frontend
    component: frontend
spec:
  parentRefs:
    - name: cilium-gateway-oracle
      namespace: cilium-gateway
  hostnames:
    - "aidas.dev"
    - "www.aidas.dev"
  rules:
    # Main site - everything else goes to frontend
    - matches:
        - path:
            type: PathPrefix
            value: /
      backendRefs:
        - name: personal-site-frontend
          port: 3000
```

---

## Task 5: Update Namespace and Image Pull Secret

**Files:**
- Modify: `kubernetes/namespace.yaml`
- Modify: `kubernetes/argocd/apps/namespace.yaml`
- Modify: `kubernetes/argocd/apps/image-pull-secret.yaml`

- [ ] **Step 1: Update kubernetes/namespace.yaml**

Replace content of `kubernetes/namespace.yaml`:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: personal-site
  labels:
    name: personal-site
```

- [ ] **Step 2: Update kubernetes/argocd/apps/namespace.yaml**

Replace content with:

```yaml
# Personal Site Namespace
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: personal-site-namespace
  namespace: argocd
  labels:
    app.kubernetes.io/part-of: personal-site
    app.kubernetes.io/component: infrastructure
spec:
  project: default
  source:
    repoURL: https://github.com/Aidas-dev/personal-website.git
    targetRevision: main
    path: kubernetes
    directory:
      include: namespace.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: personal-site
  syncPolicy:
    automated:
      prune: false
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

- [ ] **Step 3: Update kubernetes/argocd/apps/image-pull-secret.yaml**

Replace content with:

```yaml
# GHCR Image Pull Secret
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ghcr-image-pull-secret
  namespace: argocd
  labels:
    app.kubernetes.io/part-of: personal-site
    app.kubernetes.io/component: infrastructure
spec:
  project: default
  source:
    repoURL: https://github.com/Aidas-dev/personal-website.git
    targetRevision: main
    path: kubernetes
    directory:
      include: image-pull-secret.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: personal-site
  syncPolicy:
    automated:
      prune: false
      selfHeal: true
```

Note: The `image-pull-secret.yaml` file in `kubernetes/` directory doesn't exist yet — this ArgoCD app references it. We need to create it.

Create `kubernetes/image-pull-secret.yaml`:

```yaml
# GHCR Image Pull Secret for pulling private container images
# NOTE: This Secret requires the ghcr-secret to be created out-of-band
# before ArgoCD can deploy workloads that reference it.
#
# Create the secret manually:
#   kubectl create secret docker-registry ghcr-secret \
#     --docker-server=ghcr.io \
#     --docker-username=<github-username> \
#     --docker-password=<github-pat> \
#     -n personal-site
apiVersion: v1
kind: Secret
metadata:
  name: ghcr-secret
  namespace: personal-site
type: kubernetes.io/dockerconfigjson
data:
  # Placeholder — replace with actual base64-encoded dockerconfigjson
  # echo -n '{"auths":{"ghcr.io":{"username":"aidas-dev","password":"<PAT>","auth":"<base64>"}}}' | base64
  .dockerconfigjson: ""
```

---

## Task 6: Create ArgoCD App Definitions for Backend and Frontend

**Files:**
- Create: `kubernetes/argocd/apps/backend.yaml`
- Create: `kubernetes/argocd/apps/frontend.yaml`

- [ ] **Step 1: Create backend.yaml**

Create `kubernetes/argocd/apps/backend.yaml`:

```yaml
# Personal Site Backend (Hono API Server)
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: personal-site-backend
  namespace: argocd
  labels:
    app.kubernetes.io/part-of: personal-site
    app.kubernetes.io/component: backend
spec:
  project: default
  source:
    repoURL: https://github.com/Aidas-dev/personal-website.git
    targetRevision: main
    path: kubernetes/backend
  destination:
    server: https://kubernetes.default.svc
    namespace: personal-site
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - PruneLast=true
```

- [ ] **Step 2: Create frontend.yaml**

Create `kubernetes/argocd/apps/frontend.yaml`:

```yaml
# Personal Site Frontend (TanStack Start SSR)
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: personal-site-frontend
  namespace: argocd
  labels:
    app.kubernetes.io/part-of: personal-site
    app.kubernetes.io/component: frontend
spec:
  project: default
  source:
    repoURL: https://github.com/Aidas-dev/personal-website.git
    targetRevision: main
    path: kubernetes/frontend
  destination:
    server: https://kubernetes.default.svc
    namespace: personal-site
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - PruneLast=true
```

---

## Task 7: Update ArgoCD App of Apps

**Files:**
- Modify: `kubernetes/argocd/app-of-apps.yaml`

- [ ] **Step 1: Update app-of-apps.yaml**

Replace content with:

```yaml
# Argo CD App of Apps - Personal Site
# This parent application manages all child applications for the personal portfolio site.
# Each child application is deployed independently by Argo CD.
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: personal-site-apps
  namespace: argocd
  labels:
    app.kubernetes.io/part-of: personal-site
    app.kubernetes.io/managed-by: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/Aidas-dev/personal-website.git
    targetRevision: main
    path: kubernetes/argocd/apps
  destination:
    server: https://kubernetes.default.svc
    namespace: personal-site
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: true
    syncOptions:
      - CreateNamespace=true
      - PruneLast=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

---

## Task 8: Update Dockerfiles

**Files:**
- Modify: `backend/Dockerfile`
- Modify: `frontend/Dockerfile`
- Modify: `test-build.sh`

- [ ] **Step 1: Review and update backend/Dockerfile**

The current backend Dockerfile is already production-ready for a Hono server:
- Multi-stage build (base → deps → builder → runner)
- Only copies necessary artifacts to runner stage
- Exposes port 8000
- Uses `node:22-alpine` base

No changes needed to the backend Dockerfile — it's already optimized.

- [ ] **Step 2: Review and update frontend/Dockerfile**

The current frontend Dockerfile is already production-ready for TanStack Start SSR:
- Multi-stage build (builder → production)
- Uses `node:24-alpine` (latest LTS)
- Includes health check with wget
- Uses pnpm for package management
- Exposes port 3000
- Sets NODE_ENV=production and PORT=3000

No changes needed to the frontend Dockerfile — it's already optimized.

- [ ] **Step 3: Update test-build.sh**

Replace content with:

```bash
#!/bin/bash
set -e

echo "=== Testing Backend Docker Build ==="
cd backend
docker build --no-cache -t ghcr.io/aidas-dev/personal-site-backend:test . 2>&1 | tail -50
cd ..

echo ""
echo "=== Testing Frontend Docker Build ==="
cd frontend
docker build --no-cache -t ghcr.io/aidas-dev/personal-site-frontend:test . 2>&1 | tail -50
cd ..

echo ""
echo "=== Build Test Complete ==="
echo "Images built successfully:"
echo "  - ghcr.io/aidas-dev/personal-site-backend:test"
echo "  - ghcr.io/aidas-dev/personal-site-frontend:test"
```

Run:
```bash
chmod +x test-build.sh
```

---

## Task 9: Create Build & Deployment Documentation

**Files:**
- Create: `docs/BUILD_DEPLOYMENT.md`

- [ ] **Step 1: Create docs directory and BUILD_DEPLOYMENT.md**

Create `docs/BUILD_DEPLOYMENT.md`:

```markdown
# Build & Deployment Guide — Personal Portfolio Site

## Overview

This document covers the build, CI/CD pipeline, and deployment processes for the personal portfolio site.

**Architecture:**
- **Backend**: Hono API server (Node.js/TypeScript) on port 8000
- **Frontend**: TanStack Start SSR (React/Nitro) on port 3000
- **Infrastructure**: Kubernetes with Cilium Gateway for routing
- **CI/CD**: GitHub Actions → GHCR → ArgoCD → Kubernetes
- **Domain**: `aidas.dev` (placeholder — update DNS records as needed)

---

## Local Development

### Prerequisites
- Node.js 22+ (backend)
- Node.js 24+ (frontend)
- Docker
- pnpm (frontend package manager)

### Backend (Hono)
```bash
cd backend
npm install
npm run dev          # Start dev server on port 8000
npm test             # Run unit tests
npm run build        # Build for production
```

### Frontend (TanStack Start)
```bash
cd frontend
pnpm install
pnpm dev             # Start dev server with HMR
pnpm build           # Build for production (Nitro output)
pnpm start           # Run production server
```

### Test Docker Builds
```bash
./test-build.sh
```

---

## CI/CD Pipeline

### GitHub Actions Workflows

#### Backend CI/CD (`.github/workflows/backend-ci.yml`)
- **Triggers**: Push to `main` with changes in `backend/`, manual dispatch, or tags `backend-v*`
- **Stages**:
  1. Semantic version calculation
  2. Multi-platform build (linux/amd64, linux/arm64)
  3. Push to GHCR: `ghcr.io/aidas-dev/personal-site-backend`
  4. Tags: version number + `latest` (on main branch)

#### Frontend CI/CD (`.github/workflows/frontend-ci.yml`)
- **Triggers**: Push to `main` with changes in `frontend/`, manual dispatch, or tags `frontend-v*`
- **Stages**:
  1. Semantic version calculation
  2. pnpm dependency cache restore
  3. Multi-platform build (linux/amd64, linux/arm64)
  4. Push to GHCR: `ghcr.io/aidas-dev/personal-site-frontend`
  5. Tags: version number + `latest` (on main branch)

### Manual Version Bump
Trigger via GitHub Actions UI with `workflow_dispatch`:
- `patch` — increment patch (default)
- `minor` — increment minor, reset patch
- `major` — increment major, reset minor and patch

---

## ArgoCD Bootstrap Process

### App of Apps Pattern

This repository uses the ArgoCD **App of Apps** pattern:

1. **Bootstrap**: Apply `kubernetes/argocd/app-of-apps.yaml` to your cluster:
   ```bash
   kubectl apply -f kubernetes/argocd/app-of-apps.yaml
   ```

2. **ArgoCD syncs** the App of Apps, which reads `kubernetes/argocd/apps/` directory

3. **Child applications** are automatically created:
   - `personal-site-namespace` — Creates the `personal-site` namespace
   - `ghcr-image-pull-secret` — Ensures image pull secret exists
   - `personal-site-backend` — Deploys Hono backend (2 replicas, port 8000)
   - `personal-site-frontend` — Deploys TanStack Start frontend (2 replicas, port 3000)

### Sync Policy
- **Automated**: All child apps sync automatically
- **Self-heal**: ArgoCD corrects drift
- **Prune**: Removes resources no longer defined in manifests

### Image Pull Secret

The `ghcr-secret` must exist in the `personal-site` namespace for ArgoCD to pull private images. Create it before deploying:

```bash
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=<your-github-username> \
  --docker-password=<your-github-pat> \
  -n personal-site
```

---

## Kubernetes Architecture

### Namespace: `personal-site`

All application resources run in the `personal-site` namespace.

### Backend Deployment
- **Image**: `ghcr.io/aidas-dev/personal-site-backend:latest`
- **Replicas**: 2
- **Port**: 8000
- **Resources**: 128Mi-256Mi memory, 50m-250m CPU
- **Health**: `/health` endpoint (liveness + readiness probes)
- **Node affinity**: `location=oracle-cloud`

### Frontend Deployment
- **Image**: `ghcr.io/aidas-dev/personal-site-frontend:latest`
- **Replicas**: 2
- **Port**: 3000
- **Resources**: 256Mi-512Mi memory, 100m-500m CPU
- **Health**: `/` endpoint (liveness + readiness probes)
- **Node affinity**: `location=oracle-cloud`

### Routing (Cilium Gateway)

Traffic flows through `cilium-gateway-oracle` in the `cilium-gateway` namespace:

| Hostname | Path | Backend |
|----------|------|---------|
| `aidas.dev` | `/api/*` | personal-site-backend:8000 |
| `aidas.dev` | `/health` | personal-site-backend:8000 |
| `aidas.dev` | `/*` | personal-site-frontend:3000 |
| `www.aidas.dev` | `/*` | personal-site-frontend:3000 |

---

## DNS & Domain Configuration

### Current Placeholder Domain
- **Primary**: `aidas.dev`
- **WWW**: `www.aidas.dev`

### Required DNS Records
Point your domain's DNS to the Cilium Gateway's external IP:

```
aidas.dev.      A    <cilium-gateway-oracle-external-ip>
www.aidas.dev.  CNAME  aidas.dev.
```

To find the gateway IP:
```bash
kubectl get gateway -n cilium-gateway cilium-gateway-oracle -o jsonpath='{.status.addresses[*].value}'
```

### TLS Certificates
TLS is managed by Cilium Gateway. Ensure cert-manager or equivalent is configured for automatic certificate provisioning.

---

## Deployment Checklist

- [ ] Code pushed to `main` branch
- [ ] CI/CD pipeline completes successfully (check GitHub Actions)
- [ ] Docker images pushed to GHCR with correct tags
- [ ] ArgoCD App of Apps is applied to the cluster
- [ ] `ghcr-secret` exists in `personal-site` namespace
- [ ] ArgoCD shows all child apps as `Synced` and `Healthy`
- [ ] DNS points to Cilium Gateway external IP
- [ ] TLS certificates are provisioned
- [ ] Health checks pass: `https://aidas.dev/health`
- [ ] Frontend loads: `https://aidas.dev/`

---

## Troubleshooting

### Image Pull Errors
```bash
kubectl describe pod -n personal-site -l app=personal-site-backend
# Check for "ImagePullBackOff" — verify ghcr-secret exists
```

### ArgoCD Sync Issues
```bash
kubectl get applications -n argocd
argocd app list
argocd app sync personal-site-backend
```

### Pod Health
```bash
kubectl get pods -n personal-site
kubectl logs -n personal-site -l app=personal-site-backend
kubectl logs -n personal-site -l app=personal-site-frontend
```

### Gateway Routing
```bash
kubectl get httproute -n personal-site
kubectl get gateway -n cilium-gateway
```
```

---

## Self-Review Checklist

### 1. Spec Coverage
- [x] Task 5.1: GitHub Actions workflows updated (image names renamed, multi-platform builds confirmed)
- [x] Task 5.2: Kubernetes manifests created (backend + frontend), old directories removed, ArgoCD apps updated
- [x] Task 5.3: Dockerfiles reviewed (both production-ready), test-build.sh updated
- [x] Task 5.4: BUILD_DEPLOYMENT.md created with ArgoCD bootstrap, domain placeholder, full documentation
- [x] All containers have resource requests/limits
- [x] Image names: `ghcr.io/aidas-dev/personal-site-backend:latest` and `ghcr.io/aidas-dev/personal-site-frontend:latest`
- [x] HTTPRoute through Cilium Gateway for both services

### 2. Placeholder Scan
- No TBD, TODO, or "implement later" markers
- All YAML manifests contain complete, valid content
- All code blocks show exact file contents
- No "similar to Task N" references

### 3. Type Consistency
- Namespace: `personal-site` (consistent across all manifests)
- App labels: `personal-site-backend`, `personal-site-frontend`
- Service names match deployment selectors
- HTTPRoute backendRefs match service names
- Image names consistent between CI/CD and Kubernetes manifests
- Gateway reference: `cilium-gateway-oracle` in `cilium-gateway` namespace (matches existing pattern)

### 4. YAML Validity
- All manifests use correct API versions
- Indentation is consistent (2 spaces)
- Labels follow `app.kubernetes.io/*` convention for ArgoCD, `app:` + `component:` for workloads
- Selectors match template labels in all Deployments
