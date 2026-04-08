# Product Guidelines — Personal Portfolio Website

## Prose & Content Style
- **Conversational tone** — Write as if explaining to a fellow developer over coffee. Friendly, approachable, but technically accurate.
- **First-person voice** — Use "I" and "my" throughout. This is your personal space, not a corporate page.
- **Developer humor welcome** — Occasional wit, terminal jokes, and self-aware asides are encouraged (especially in Easter eggs and project write-ups).
- **No marketing fluff** — Avoid buzzwords like "passionate," "synergy," "rockstar." Show, don't tell.

## UX Principles
- **First impression matters** — The landing page must load fast, look intentional, and communicate who you are within 3 seconds.
- **Keep it simple** — No over-engineered interactions. Every element should serve a purpose. Less is more.
- **Zero-JS fallback** — Core content (bio, projects, resume link) must be readable and navigable without JavaScript. Progressive enhancement, not dependency.
- **Performance is a feature** — Target <1s First Contentful Paint. Optimize Three.js to load after initial render.

## Branding
- **Personal name as brand** — "Aidas Kriščiūnas" is the primary identity. GitHub handle (Aidas-dev) as secondary identifier.
- **Consistent visual identity** — Dark green hexagon motif (`#0a5c36`), developer-centric layout, clean typography.
- **Professional but personal** — This is your work, your cluster, your code. Own it openly.

## Content Philosophy
- **Open-source everything** — The site itself, configs, infrastructure-as-code, and project write-ups are all public. The repo is part of the portfolio.
- **Transparent infrastructure** — Live cluster dashboard demonstrates real engineering. Don't hide the fact that you run Talos Linux on bare metal.
- **Security-first** — No third-party trackers, no analytics cookies, CSP headers, HTTPS everywhere. Document this on a security page.

## Accessibility
- **WCAG 2.1 AA minimum** — Color contrast, keyboard navigation, ARIA labels on interactive elements.
- **Respect user preferences** — `prefers-reduced-motion` disables Three.js animations. `prefers-color-scheme` sets initial theme.
- **Semantic HTML** — Use proper elements (`<nav>`, `<main>`, `<article>`, `<section>`), not div soup.

## Performance Standards
- **Lighthouse >90** — All four categories (Performance, Accessibility, Best Practices, SEO)
- **Three.js budget** — Max 150KB gzipped for 3D assets. Lazy-load after first paint.
- **Image optimization** — WebP/AVIF formats, lazy-loaded, with blur-up placeholders.
