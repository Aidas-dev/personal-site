# Initial Concept

**Project:** Personal Portfolio Website

A Kubernetes-hosted personal portfolio site showcasing technical expertise, project work, and live Kubernetes infrastructure.

**Architecture:**
- Separated Component Containers (Microservices)
- Containerized deployment on personal Kubernetes cluster
- CI/CD via GitHub Actions with GHCR image registry
- GitOps deployment via ArgoCD
- Cilium Gateway API for ingress routing

# Product Guide — Personal Portfolio Website

## Vision
A developer-centric personal portfolio site that showcases technical expertise, project work, and live Kubernetes infrastructure. The site itself demonstrates engineering capability — it's not just a portfolio, it's a statement.

## Target Audience
- **Recruiters & hiring managers** — Quick scanning of skills, experience, and professional presence
- **Fellow developers** — Deep technical content, architecture decisions, and infrastructure transparency

## Core Content Sections
- **Hero Landing Page** — Interactive Three.js scene (JetBrains-style: subtle 3D geometric animations, not overwhelming)
- **About Me** — Personal bio, background, interests, developer philosophy
- **Project Showcases** — Detailed write-ups with tech stack, architecture diagrams, and outcomes
- **Resume / CV** — Downloadable PDF, structured professional summary
- **Live Cluster Dashboard** — Grafana embeds showing real-time Kubernetes cluster health, resource utilization, and service status (pulled from VMetrics backend)
- **Security Page** — Transparent security-first approach: TLS, policies, cluster hardening documentation

## Design Direction
- **Developer-centric aesthetic** — Code-inspired layouts, monospace accents, terminal-inspired elements
- **Color theme**: Dark green hexagon motif (`#0a5c36`) with dark mode as default
- **Dark / Light mode toggle** — Smooth transition, respects `prefers-color-scheme`
- **Three.js integration** — Subtle JetBrains-style 3D geometric animations (floating hexagons, grid patterns) as hero/background elements — performant, non-blocking

## Technical Features
- **Live Kubernetes Dashboards** — Grafana iframe embeds for cluster monitoring; VMetrics API for custom metric widgets (node status, pod count, resource usage)
- **Dark/Light Mode** — System-aware theme toggle with smooth CSS transitions
- **Kubernetes Easter Egg** — Hidden `kubectl`-style console commands that reveal fun cluster facts, hidden pages, or developer messages
- **Security First** — Content Security Policy headers, HTTPS enforcement, no third-party trackers, transparent about infrastructure

## Non-Functional Requirements
- **Performance** — Lighthouse score >90 across all categories
- **Accessibility** — WCAG 2.1 AA compliance
- **SEO** — Open Graph tags, structured data, sitemap
- **Privacy** — Zero tracking, no analytics cookies, GDPR-compliant by design
