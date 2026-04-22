import { Hono } from 'hono'
import { fetch as frontendFetch } from './frontend/dist/server/server.js'

const app = new Hono()

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api/metrics', (c) => {
  return c.json({
    nodes: [],
    pods: [],
    cluster: { cpu: { used: '0%', total: '' }, memory: { used: '0%', total: '' } },
    timestamp: new Date().toISOString(),
    source: 'cloudflare-workers',
  })
})

app.get('/api/grafana', (c) => {
  return c.json({ dashboards: [], timestamp: new Date().toISOString() })
})

app.all('*', async (c) => {
  return frontendFetch(c.req, c.env, c.executionCtx) as Response
})

export default app