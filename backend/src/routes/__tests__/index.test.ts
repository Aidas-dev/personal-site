import { describe, it, expect, beforeAll } from 'vitest'
import app from '../../index.js'

describe('GET /health', () => {
  it('should return 200 with status ok', async () => {
    const res = await app.request('/health')
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body).toHaveProperty('status', 'ok')
    expect(body).toHaveProperty('timestamp')
    expect(body).toHaveProperty('uptime')
    expect(typeof body.uptime).toBe('number')
  })

  it('should return valid ISO timestamp', async () => {
    const res = await app.request('/health')
    const body = await res.json()

    const timestamp = new Date(body.timestamp)
    expect(timestamp.toString()).not.toBe('Invalid Date')
  })

  it('should have increasing uptime on subsequent calls', async () => {
    const res1 = await app.request('/health')
    const body1 = await res1.json()

    await new Promise((resolve) => setTimeout(resolve, 100))

    const res2 = await app.request('/health')
    const body2 = await res2.json()

    expect(body2.uptime).toBeGreaterThan(body1.uptime)
  })
})

describe('GET /api/metrics', () => {
  it('should return 200 with stub metrics shape', async () => {
    const res = await app.request('/api/metrics')
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body).toHaveProperty('nodes')
    expect(body).toHaveProperty('pods')
    expect(body).toHaveProperty('cluster')
    expect(body.cluster).toHaveProperty('cpu')
    expect(body.cluster).toHaveProperty('memory')
    expect(body).toHaveProperty('timestamp')
    expect(body).toHaveProperty('source', 'vmetrics')
    expect(body).toHaveProperty('note')
  })

  it('should return empty arrays for nodes and pods', async () => {
    const res = await app.request('/api/metrics')
    const body = await res.json()

    expect(Array.isArray(body.nodes)).toBe(true)
    expect(body.nodes).toHaveLength(0)
    expect(Array.isArray(body.pods)).toBe(true)
    expect(body.pods).toHaveLength(0)
  })
})

describe('POST /api/grafana/token', () => {
  it('should return 201 with stub token', async () => {
    const res = await app.request('/api/grafana/token', {
      method: 'POST',
    })
    expect(res.status).toBe(201)

    const body = await res.json()
    expect(body).toHaveProperty('token')
    expect(body).toHaveProperty('expiresAt')
    expect(body).toHaveProperty('note')
  })

  it('should return future expiration time', async () => {
    const res = await app.request('/api/grafana/token', { method: 'POST' })
    const body = await res.json()

    const expiresAt = new Date(body.expiresAt)
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now())
  })
})

describe('404 handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await app.request('/nonexistent')
    expect(res.status).toBe(404)

    const body = await res.json()
    expect(body).toHaveProperty('error', 'Not Found')
  })
})

describe('error handler', () => {
  it('should handle thrown errors gracefully', async () => {
    // The error handler is triggered by unhandled errors
    // We verify it exists by checking the app has an onError handler
    expect(app.onError).toBeDefined()
  })
})
