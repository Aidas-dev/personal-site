# Argo CD App of Apps - Riedu E-Shop

This directory contains Argo CD Application manifests for the Riedu E-Shop platform using the **App of Apps** pattern.

## Structure

```
kubernetes/argocd/
├── app-of-apps.yaml          # Parent application (manages all child apps)
├── apps/                     # Child applications
│   ├── namespace.yaml        # riedu-eshop namespace
│   ├── image-pull-secret.yaml # GHCR authentication
│   ├── postgres.yaml         # CloudNativePG database
│   ├── dragonfly.yaml        # DragonflyDB cache
│   ├── medusa-backend.yaml   # Medusa v2 backend
│   ├── medusa-admin.yaml     # Medusa admin panel
│   └── riedu-frontend.yaml   # TanStack Start frontend
└── README.md
```

## Dependency Order

Applications sync in this order (Argo CD respects `syncWave` by default, but we rely on path ordering):

1. **namespace** — creates `riedu-eshop` namespace
2. **image-pull-secret** — GHCR auth for private images
3. **postgres** — PostgreSQL database (CloudNativePG)
4. **dragonfly** — DragonflyDB cache
5. **medusa-backend** — Backend API (depends on postgres + dragonfly)
6. **medusa-admin** — Admin panel (depends on backend)
7. **riedu-frontend** — Frontend SSR (depends on backend)

## Deployment

### Prerequisites

- Argo CD installed in the cluster
- GitHub repository access configured
- `argocd` CLI logged in

### Bootstrap

```bash
# Apply the App of Apps
kubectl apply -f kubernetes/argocd/app-of-apps.yaml

# Or via Argo CD CLI
argocd app create riedu-eshop-apps \
  --repo https://github.com/Aidas-dev/riedu-eshop.git \
  --path kubernetes/argocd/app-of-apps.yaml \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace argocd \
  --sync-policy automated

# Wait for all child apps to sync
argocd app wait riedu-eshop-apps --timeout 300
argocd app list | grep riedu-eshop
```

### Individual App Management

```bash
# Check sync status
argocd app get medusa-backend

# Sync a specific app
argocd app sync medusa-backend

# View diff before sync
argocd app diff medusa-backend

# Suspend automated sync
argocd app set medusa-backend --sync-policy none

# Resume automated sync
argocd app set medusa-backend --sync-policy automated
```

## Adding New Components

1. Create Kubernetes manifests in `kubernetes/<component>/`
2. Add an Application manifest in `kubernetes/argocd/apps/<component>.yaml`
3. The App of Apps will automatically detect and deploy it on next sync
