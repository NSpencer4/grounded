import { defineConfig, PluginOption } from 'vite'
import { vitePlugin as remix } from '@remix-run/dev'
import { cloudflare } from '@cloudflare/vite-plugin'

export default defineConfig({
  plugins: [remix() as PluginOption, cloudflare() as PluginOption],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '127.0.0.1',
  },
})
