import { createServer } from 'node:http';
import { server } from './dist/server/server.js';

const PORT = parseInt(process.env.PORT || '3000', 10);
const host = process.env.HOST || '0.0.0.0';

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const request = new Request(url.toString(), {
    method: req.method,
    headers: new Headers(Object.entries(req.headers)),
    body: req.method !== 'HEAD' && req.method !== 'GET' ? req : undefined,
  });

  const response = await server.fetch(request);
  res.writeHead(response.status, Object.fromEntries(response.headers));
  const body = Buffer.from(await response.arrayBuffer());
  res.end(body);
}).listen(PORT, host, () => {
  console.log(`Frontend SSR server running at http://${host}:${PORT}`);
});
