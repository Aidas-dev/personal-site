# Technology Stack

## Frontend
- **Framework:** TanStack Start (React 19, SSR with Nitro)
- **Routing:** TanStack Router (type-safe, file-based routing)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with dark green hexagon theme (`#0a5c36`)
- **3D Graphics:** Three.js via `@react-three/fiber` + `@react-three/drei` (helpers)
- **Build Tool:** Vite
- **Charts:** Recharts (for custom VMetrics widgets)

## Backend
- **Runtime:** Node.js 24 LTS
- **Framework:** Hono (lightweight, fast API server)
- **Language:** TypeScript
- **Purpose:** Proxy VMetrics API, handle authentication, serve Grafana embed tokens

## Data Sources
- **VMetrics (VictoriaMetrics):** Primary data source for cluster metrics
  - VictoriaMetrics HTTP API for custom widgets (node count, CPU/memory usage, pod status)
  - Grafana public embeds for full dashboards
- **No persistent database** — all data is live-queried from VMetrics

## Infrastructure
- **Orchestration:** Kubernetes (Talos Linux nodes)
- **CI/CD:** GitHub Actions → GHCR (multi-platform builds: amd64, arm64)
- **GitOps:** ArgoCD App of Apps pattern
- **Ingress:** Cilium Gateway API (HTTPRoute)
- **TLS:** Cert-Manager with Let's Encrypt (wildcard certificates)
- **Container Registry:** GitHub Container Registry (GHCR)

## Monitoring
- **Metrics:** VictoriaMetrics (VMetrics)
- **Dashboards:** Grafana (embedded in portfolio site)
- **Alerting:** VMAlert (infrastructure-level, not site-level)

## Development Tools
- **Package Manager:** pnpm
- **Linting:** ESLint + Prettier
- **Testing:** Vitest (unit), Playwright (E2E)
- **Type Checking:** TypeScript strict mode
- **Code Coverage:** >80% required
