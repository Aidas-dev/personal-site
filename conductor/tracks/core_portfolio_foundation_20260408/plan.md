# Implementation Plan — Core Portfolio Foundation

## Track: Core Portfolio Foundation
**Track ID:** `core_portfolio_foundation_20260408`
**Status:** new

---

## Phase 1: Project Scaffold & Foundation Setup

- [x] Task 1.1: Clean up existing frontend project — remove Medusa-specific code, unused components, and e-commerce dependencies `dbd55aa`
    - [x] Write tests for cleanup verification (package.json dependency check)
    - [x] Remove Medusa client, e-commerce routes, cart/order contexts
    - [x] Update package.json: name, description, remove unused deps
    - [x] Run build to confirm no broken imports
- [x] Task 1.2: Set up project structure for portfolio site `dbd55aa`
    - [x] Create route files: `/`, `/about`, `/projects`, `/dashboard`, `/security`
    - [x] Create component directories: `components/hero/`, `components/layout/`, `components/ui/`, `components/three/`
    - [x] Set up root layout with navigation, footer, and theme toggle shell
- [x] Task 1.3: Configure Tailwind CSS with hexagon theme `dbd55aa`
    - [x] Define custom color palette (`#0a5c36` primary, dark/light mode tokens)
    - [x] Create hexagon utility classes and decorative components
    - [x] Set up dark mode via CSS custom properties + Tailwind `dark:` variant
    - [x] Test theme toggle with system preference detection
- [~] Task 1.4: Set up lightweight Hono backend API
    - [ ] Create `backend/` directory structure with Hono
    - [ ] Configure TypeScript, Dockerfile for Hono server
    - [ ] Create stub `/api/metrics` endpoint for future VMetrics proxy
    - [ ] Write tests for API endpoint responses

- [ ] Task: Conductor - User Manual Verification 'Phase 1: Project Scaffold & Foundation Setup' (Protocol in workflow.md)

## Phase 2: Three.js Hero Scene & Core UI

- [ ] Task 2.1: Implement JetBrains-style 3D hero scene
    - [ ] Write tests for Three.js canvas component (mounts, renders, respects reduced motion)
    - [ ] Create `components/three/HeroScene.tsx` with @react-three/fiber
    - [ ] Implement clean geometric shapes: floating hexagons, subtle grid
    - [ ] Add smooth, minimal animations (rotation, floating motion)
    - [ ] Lazy-load after first paint
    - [ ] Respect `prefers-reduced-motion`
- [ ] Task 2.2: Build layout components
    - [ ] Write tests for Header, Footer, Navigation components
    - [ ] Create `components/layout/Header.tsx` — name, nav links, theme toggle
    - [ ] Create `components/layout/Footer.tsx` — GitHub link, open-source badge
    - [ ] Create `components/layout/Navigation.tsx` — route-aware active states
- [ ] Task 2.3: Build hero landing page
    - [ ] Write tests for Hero section content and structure
    - [ ] Create hero text content: name, title, brief intro
    - [ ] Integrate Three.js scene as background/hero element
    - [ ] Add CTA buttons: "View Projects", "Download Resume"
    - [ ] Ensure zero-JS fallback renders core content

- [ ] Task: Conductor - User Manual Verification 'Phase 2: Three.js Hero Scene & Core UI' (Protocol in workflow.md)

## Phase 3: Content Pages & Dashboard

- [ ] Task 3.1: Build About Me page
    - [ ] Write tests for About page structure
    - [ ] Create bio content section
    - [ ] Add skills/tech stack visualization
    - [ ] Include personal interests section
- [ ] Task 3.2: Build Project Showcases page
    - [ ] Write tests for project card component
    - [ ] Create `components/ui/ProjectCard.tsx` with tech stack tags
    - [ ] Build project listing page with placeholder projects
    - [ ] Add filter/sort by tech stack (client-side)
- [ ] Task 3.3: Build Resume download
    - [ ] Add resume download link/button
    - [ ] Create placeholder PDF in `public/resume.pdf`
    - [ ] Track download with console log (no analytics)
- [ ] Task 3.4: Build Grafana Dashboard embed page
    - [ ] Write tests for dashboard embed container
    - [ ] Create `components/dashboard/GrafanaEmbed.tsx`
    - [ ] Configure Grafana public embed URLs (user to provide actual URLs)
    - [ ] Add loading states and error handling for iframe failures
    - [ ] Create cluster overview summary section

- [ ] Task: Conductor - User Manual Verification 'Phase 3: Content Pages & Dashboard' (Protocol in workflow.md)

## Phase 4: Security, SEO & Polish

- [ ] Task 4.1: Implement security headers
    - [ ] Write tests for CSP header configuration
    - [ ] Configure Content-Security-Policy (allow Grafana iframe, Three.js CDN)
    - [ ] Add X-Frame-Options, X-Content-Type-Options, Referrer-Policy
    - [ ] Configure HTTPS enforcement
- [ ] Task 4.2: Add SEO meta tags
    - [ ] Write tests for meta tag rendering
    - [ ] Configure Open Graph tags (title, description, image, URL)
    - [ ] Add Twitter Card meta
    - [ ] Generate sitemap.xml
    - [ ] Add structured data (JSON-LD Person schema)
- [ ] Task 4.3: Dark/Light mode polish
    - [ ] Write tests for theme persistence (localStorage)
    - [ ] Add smooth CSS transition between themes
    - [ ] Ensure Three.js scene adapts to theme
    - [ ] Test all pages in both modes
- [ ] Task 4.4: Mobile responsiveness
    - [ ] Test all pages on mobile viewport (375px minimum)
    - [ ] Ensure touch targets are 44x44px minimum
    - [ ] Verify Three.js performance on mobile (reduce complexity if needed)
    - [ ] Test theme toggle on mobile

- [ ] Task: Conductor - User Manual Verification 'Phase 4: Security, SEO & Polish' (Protocol in workflow.md)

## Phase 5: CI/CD & Kubernetes Deployment

- [ ] Task 5.1: Update GitHub Actions workflows
    - [ ] Rename workflows from riedu-* to personal-site-*
    - [ ] Update image names in GHCR
    - [ ] Verify multi-platform builds (amd64, arm64)
- [ ] Task 5.2: Update Kubernetes manifests
    - [ ] Rename directories: `kubernetes/medusa-backend/` → `kubernetes/backend/`
    - [ ] Rename directories: `kubernetes/riedu-frontend/` → `kubernetes/frontend/`
    - [ ] Remove postgres, dragonfly ArgoCD apps (not needed)
    - [ ] Update ArgoCD app definitions for new structure
    - [ ] Update HTTPRoute hostnames (user to provide domain)
- [ ] Task 5.3: Update Dockerfiles
    - [ ] Review and update backend Dockerfile for Hono
    - [ ] Review and update frontend Dockerfile for TanStack Start
    - [ ] Test local builds with `test-build.sh`
- [ ] Task 5.4: Update CI/CD documentation
    - [ ] Create `docs/BUILD_DEPLOYMENT.md` with updated instructions
    - [ ] Document ArgoCD bootstrap process
    - [ ] Document domain/DNS configuration

- [ ] Task: Conductor - User Manual Verification 'Phase 5: CI/CD & Kubernetes Deployment' (Protocol in workflow.md)
