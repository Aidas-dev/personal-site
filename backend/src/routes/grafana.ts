import { Hono } from 'hono'

const route = new Hono()

/**
 * POST /api/grafana/token
 * Stub endpoint for future Grafana embed token generation.
 * Returns a placeholder token.
 */
route.post('/token', async (c) => {
  return c.json(
    {
      token: 'stub-token',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      note: 'Stub endpoint — Grafana token generation pending',
    },
    201
  )
})

export default route
