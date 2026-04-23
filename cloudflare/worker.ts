import handler from './frontend/dist/server/server.js'

export default {
  fetch: (req, env, ctx) => {
    return handler.fetch(req, env, ctx)
  }
}