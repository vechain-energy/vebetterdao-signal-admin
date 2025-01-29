import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  resolve: {
    alias: {
      stream: 'stream-browserify',
      http: 'agent-base',
      https: 'agent-base',
      util: 'util'
    }
  },
  define: {
    global: 'globalThis',
    'process.env': process.env
  },
  base: process.env.BASE_PATH || '/',
});