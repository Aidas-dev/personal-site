# Track Specification — Core Portfolio Foundation

## Track ID
`core_portfolio_foundation_20260408`

## Description
Build the core foundation of the personal portfolio website with a JetBrains-style clean 3D hero scene, About Me section, project showcases, resume download, dark/light theme toggle, and Grafana dashboard embeds.

## Goals
1. Deployable portfolio site running on Kubernetes
2. JetBrains-inspired subtle 3D geometric animations (Three.js via @react-three/fiber)
3. Core content sections: hero, about me, project showcases, resume download, cluster dashboard
4. Dark/light mode toggle with system preference detection
5. Grafana dashboard embeds for live cluster monitoring
6. Security-first: CSP headers, HTTPS, zero trackers

## Scope

### In Scope
- Frontend: TanStack Start (React 19, SSR), Tailwind CSS, Three.js (@react-three/fiber + @react-three/drei)
- Backend: Lightweight Hono API server for VMetrics proxy and Grafana embed tokens
- Kubernetes: Deployment, Service, HTTPRoute, ConfigMap manifests for both frontend and backend
- CI/CD: GitHub Actions workflows for building and pushing Docker images to GHCR
- ArgoCD: App of Apps pattern for GitOps deployment
- Dark/light theme toggle with `prefers-color-scheme` support
- Three.js hero scene: clean, simple geometric shapes (floating hexagons, grid patterns) — JetBrains DataSpell style
- Grafana iframe embeds on dedicated dashboard page
- Resume/CV download link
- Project showcase section with placeholder content
- About Me section with bio content
- Responsive design (mobile-first)
- Basic SEO: meta tags, Open Graph, sitemap

### Out of Scope
- Blog/CMS functionality (future track)
- Contact form with email integration (future track)
- Full VMetrics API integration with custom Recharts widgets (future track — start with Grafana embeds only)
- Kubernetes Easter egg implementation (future track)
- Accessibility audit beyond WCAG 2.1 AA basics (future track)
- Performance optimization beyond initial Lighthouse baseline (future track)

## Technical Requirements

### Frontend
- TanStack Start with SSR via Nitro
- TypeScript strict mode
- Tailwind CSS with custom hexagon theme (`#0a5c36`)
- @react-three/fiber + @react-three/drei for 3D scene
- Three.js budget: max 150KB gzipped
- Lazy-load 3D assets after first paint
- Dark/light mode: CSS custom properties, `prefers-color-scheme` detection
- Zero-JS fallback: core content readable without JavaScript

### Backend
- Hono (lightweight Node.js API server)
- TypeScript
- Proxy endpoint for VMetrics API (stub for now — real integration in future track)
- No database

### Infrastructure
- Kubernetes manifests: Deployment, Service, ConfigMap, HTTPRoute for both frontend and backend
- Cilium Gateway API for ingress
- TLS via Cert-Manager wildcard certificates
- GitHub Actions CI/CD: multi-platform builds (amd64, arm64) to GHCR
- ArgoCD App of Apps for deployment

## Constraints
- Must run on existing Talos Linux Kubernetes cluster
- No external dependencies beyond VMetrics/Grafana
- Zero third-party trackers or analytics cookies
- Lighthouse score >90 in all categories
- WCAG 2.1 AA compliance

## Success Criteria
1. Site loads and renders correctly on desktop and mobile
2. Three.js hero scene is visually appealing but performant (lazy-loaded, <150KB)
3. Dark/light mode toggle works and respects system preference
4. Grafana dashboard embeds display correctly
5. Resume download link works
6. All CI/CD pipelines pass
7. ArgoCD deploys successfully
8. Lighthouse scores >90 across all categories
9. No CSP violations in browser console
