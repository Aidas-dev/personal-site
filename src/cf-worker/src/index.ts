import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
  return c.text('Hello from Cloudflare Workers!');
});

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() });
});

export default app;