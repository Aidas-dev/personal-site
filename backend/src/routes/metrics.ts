import { Hono } from 'hono'

const route = new Hono()

/**
 * GET /api/metrics
 * Stub endpoint for future VMetrics proxy integration.
 * Returns placeholder cluster metrics data.
 */
route.get('/metrics', (c) => {
  return c.json({
    nodes: [],
    pods: [],
    cluster: {
      cpu: { used: '0%', total: '' },
      memory: { used: '0%', total: '' },
    },
    timestamp: new Date().toISOString(),
    source: 'vmetrics',
    note: 'Stub endpoint — VMetrics integration pending',
  })
})

export default route
