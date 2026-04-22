import { Hono } from 'hono'

const app = new Hono()

app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})

app.get('/api/metrics', (c) => {
  return c.json({
    nodes: [],
    pods: [],
    cluster: {
      cpu: { used: '0%', total: '' },
      memory: { used: '0%', total: '' },
    },
    timestamp: new Date().toISOString(),
    source: 'cloudflare-workers',
  })
})

app.get('/api/grafana', (c) => {
  return c.json({
    dashboards: [],
    timestamp: new Date().toISOString(),
  })
})

app.notFound((c) => c.json({ error: 'Not Found' }, 404))

export default app