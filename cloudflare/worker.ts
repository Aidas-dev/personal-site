import { Hono } from 'hono'
import server from './frontend/dist/server/server.js'

export default {
  fetch: (req: Request, env: Record<string, ctx: ExecutionContext) => {
    const app = new Hono()
    
    app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))
    app.get('/api/metrics', (c) => c.json({
      nodes: [], pods: [],
      cluster: { cpu: { used: '0%', total: '' }, memory: { used: '0%', total: '' } },
      timestamp: new Date().toISOString(),
      source: 'cloudflare-workers',
    }))
    app.get('/api/grafana', (c) => c.json({ dashboards: [], timestamp: new Date().toISOString() }))
    app.all('*', (c) => server.fetch(c.req, c.env, c.executionCtx))
    
    return app.fetch(req, env, ctx)
  }
}

export default app