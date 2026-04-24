# Cloudflare Worker Deployment

This directory contains the deployment configuration for the personal site on Cloudflare Workers.

## Current Working State

The deployment is confirmed functional as of April 2026.

### Handler Implementation (`worker.ts`)
The worker uses the TanStack Start server handler directly. We bypassed the Hono wrapper because of a signature mismatch between Hono's execution context and what TanStack Start's `createCloudflareHandler` expects.

```typescript
import { createCloudflareHandler } from '@tanstack/start/server-handler'
import { getManifest } from '@tanstack/start/server'

const handler = createCloudflareHandler({
  getManifest,
})

export default {
  async fetch(request: Request, env: any, ctx: any) {
    return handler(request, env, ctx)
  },
}
```

### Static Assets (`wrangler.toml`)
Static assets (CSS, JS, images) are served using the built-in Cloudflare Workers `[assets]` configuration. This ensures that the built frontend files in `frontend/dist/client` are correctly mapped and served.

```toml
[assets]
directory = "frontend/dist/client"
not_found_handling = "single-page-application"
```

## Maintenance Notes
- **CI/CD**: The GitHub Actions workflow builds the frontend and then deploys from this directory using Wrangler.
- **Route Conflicts**: Avoid adding manual API routes (like `src/routes/api.health.ts`) if they conflict with TanStack Start's automatic route generation, as this causes build failures in the production manifest.
