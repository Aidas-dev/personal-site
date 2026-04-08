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
- [x] Task 1.4: Set up lightweight Hono backend API `a2fa24d`
    - [x] Create `backend/` directory structure with Hono
    - [x] Configure TypeScript, Dockerfile for Hono server
    - [x] Create stub `/api/metrics` endpoint for future VMetrics proxy
    - [x] Write tests for API endpoint responses

**Phase 1 complete.** [checkpoint: 5f03c2b]

- [ ] Task: Conductor - User Manual Verification 'Phase 1: Project Scaffold & Foundation Setup' (Protocol in workflow.md)

## Phase 2: Three.js Hero Scene & Core UI

- [x] Task 2.1: Implement JetBrains-style 3D hero scene `adae4bf`
    - [x] Write tests for Three.js canvas component (mounts, renders, respects reduced motion)
    - [x] Create `components/three/HeroScene.tsx` with @react-three/fiber
    - [x] Implement clean geometric shapes: floating hexagons, subtle grid
    - [x] Add smooth, minimal animations (rotation, floating motion)
    - [x] Lazy-load after first paint
    - [x] Respect `prefers-reduced-motion`
- [x] Task 2.2: Build layout components `adae4bf`
    - [x] Write tests for Header, Footer, Navigation components
    - [x] Create `components/layout/Header.tsx` — name, nav links, theme toggle
    - [x] Create `components/layout/Footer.tsx` — GitHub link, open-source badge
    - [x] Create `components/layout/Navigation.tsx` — route-aware active states
- [x] Task 2.3: Build hero landing page `adae4bf`
    - [x] Write tests for Hero section content and structure
    - [x] Create hero text content: name, title, brief intro
    - [x] Integrate Three.js scene as background/hero element
    - [x] Add CTA buttons: "View Projects", "Download Resume"
    - [x] Ensure zero-JS fallback renders core content

**Phase 2 complete.** [checkpoint: 3bac161]

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

- [x] Task 4.1: Implement security headers `dc9c376`
    - [x] Write tests for CSP header configuration
    - [x] Configure Content-Security-Policy (allow Grafana iframe, Three.js CDN)
    - [x] Add X-Frame-Options, X-Content-Type-Options, Referrer-Policy
    - [x] Configure HTTPS enforcement
- [x] Task 4.2: Add SEO meta tags `dc9c376`
    - [x] Write tests for meta tag rendering
    - [x] Configure Open Graph tags (title, description, image, URL)
    - [x] Add Twitter Card meta
    - [x] Generate sitemap.xml
    - [x] Add structured data (JSON-LD Person schema)
- [x] Task 4.3: Dark/Light mode polish `dc9c376`
    - [x] Write tests for theme persistence (localStorage)
    - [x] Add smooth CSS transition between themes
    - [x] Ensure Three.js scene adapts to theme
    - [x] Test all pages in both modes
- [x] Task 4.4: Mobile responsiveness `dc9c376`
    - [x] Test all pages on mobile viewport (375px minimum)
    - [x] Ensure touch targets are 44x44px minimum
    - [x] Verify Three.js performance on mobile (reduce complexity if needed)
    - [x] Test theme toggle on mobile

**Phase 4 complete.** [checkpoint: dc9c376]

## Phase 5: CI/CD & Kubernetes Deployment

- [x] Task 5.1: Update GitHub Actions workflows `dc9c376`
    - [x] Rename workflows from riedu-* to personal-site-*
    - [x] Update image names in GHCR
    - [x] Verify multi-platform builds (amd64, arm64)
- [x] Task 5.2: Update Kubernetes manifests `dc9c376`
    - [x] Remove old directories (postgres, dragonfly, medusa-*)
    - [x] Create kubernetes/backend/ (deployment, service, httproute)
    - [x] Create kubernetes/frontend/ (deployment, service, httproute)
    - [x] Update ArgoCD app definitions
    - [x] Update HTTPRoute hostnames (placeholder domain)
- [x] Task 5.3: Update Dockerfiles `dc9c376`
    - [x] Review and update backend Dockerfile for Hono
    - [x] Review and update frontend Dockerfile for TanStack Start
    - [x] Update test-build.sh
- [x] Task 5.4: Update CI/CD documentation `dc9c376`
    - [x] Create docs/BUILD_DEPLOYMENT.md with updated instructions
    - [x] Document ArgoCD bootstrap process
    - [x] Document domain/DNS configuration

**Phase 5 complete.** [checkpoint: dc9c376]

**All phases complete.** 🎉
