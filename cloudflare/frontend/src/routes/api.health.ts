import { createFileRoute } from '@tanstack/react-start/router'
import { z } from '@tanstack/react-start/zod'

export const Route = createFileRoute('/api/health')({
  loader: () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  },
  server: {
    handlers: {
      GET: ({ loader }) => {
        return Response.json(loader())
      },
    },
  },
})