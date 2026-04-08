import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import healthRoute from './routes/health.js'
import metricsRoute from './routes/metrics.js'
import grafanaRoute from './routes/grafana.js'

const app = new Hono()

// Middleware
app.use('*', cors())
app.use('*', logger())

// Routes
app.route('/', healthRoute)
app.route('/api', metricsRoute)
app.route('/api/grafana', grafanaRoute)

// 404 handler
app.notFound((c) => c.json({ error: 'Not Found' }, 404))

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json({ error: 'Internal Server Error' }, 500)
})

const port = Number(process.env.PORT) || 8000
console.log(`Server running on http://localhost:${port}`)

serve({ fetch: app.fetch, port })

export default app
