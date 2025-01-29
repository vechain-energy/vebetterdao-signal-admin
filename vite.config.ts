import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['mersenne-twister'],
    exclude: ['lucide-react'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['mersenne-twister']
        }
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