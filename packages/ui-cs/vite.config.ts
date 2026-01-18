import {defineConfig, PluginOption} from 'vite';
import { vitePlugin as remix } from "@remix-run/dev";

export default defineConfig({
  plugins: [remix() as PluginOption],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '127.0.0.1',
  },
});
