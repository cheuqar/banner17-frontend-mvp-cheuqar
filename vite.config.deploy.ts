import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Lightweight Vite config for Fly.io development deployment
// Optimized for lower memory usage
export default defineConfig({
  plugins: [react()],
  
  // Memory optimizations
  build: {
    // Not used in dev mode, but set low limits just in case
    rollupOptions: {
      maxParallelFileOps: 2, // Reduce parallel operations
    },
    chunkSizeWarningLimit: 1000, // Reduce chunk size warnings
  },
  
  // Dev server optimizations for lower memory
  server: {
    host: '0.0.0.0',
    port: 3000,
    hmr: false, // Disable Hot Module Replacement to save memory
    // Allow Fly.io domain and common development hosts
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      'listez-chatbot.fly.dev',
      '.fly.dev' // Allow any *.fly.dev subdomain
    ],
    watch: {
      usePolling: false, // Disable polling to save CPU/memory
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**'
      ]
    }
  },

  // Reduce memory usage during development
  optimizeDeps: {
    include: ['react', 'react-dom'], // Pre-bundle only essential deps
    exclude: ['@types/*'] // Exclude type-only packages
  },

  // Disable source maps in production deployment to save memory
  css: {
    devSourcemap: false
  }
})
