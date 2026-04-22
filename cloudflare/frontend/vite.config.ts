import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@': '/src',
    },
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: 'workers' } }),
    tanstackStart({
      target: 'cloudflare-module',
    }),
    tailwindcss(),
    viteReact(),
  ],
});
