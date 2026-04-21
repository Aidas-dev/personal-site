import { defineConfig } from 'vitest/config'
import { getPlatformProxy } from 'wrangler'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  async workerSetup({ worker }) {
    const { proxy } = await getPlatformProxy()
    //@ts-ignore
    worker.env = proxy
  },
})