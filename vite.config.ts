import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Get allowed hosts from environment variable or use defaults
const getAllowedHosts = (): true | string[] => {
  const envHosts = process.env.VITE_ALLOWED_HOSTS
  if (envHosts) {
    const hosts = envHosts.split(',').map(h => h.trim())
    // If 'all' is specified, return true, otherwise return the array
    return hosts.includes('all') ? true : hosts
  }

  // Default: allow all hosts for development flexibility
  return true
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: process.env.VITE_HOST || '0.0.0.0', // Allow external connections
    port: 3000,      // Match Docker port mapping
    allowedHosts: getAllowedHosts(),
    watch: {
      usePolling: true, // For Docker compatibility
      ignored: ['**/node_modules/**', '**/.git/**'], // Ignore unnecessary files
    },
    // HMR configuration - can be disabled for proxy environments
    hmr: process.env.VITE_DISABLE_HMR === 'true' ? false : (
      process.env.VITE_PROXY_DOMAIN && process.env.VITE_PROXY_DOMAIN.trim() !== '' ? {
        // When behind proxy, use the proxy domain and port
        host: process.env.VITE_PROXY_DOMAIN,
        port: 3000,
        clientPort: 80, // Client connects through proxy on port 80
        protocol: 'ws' // Use WebSocket protocol
      } : true // Use default HMR for local development
    ),
    // Disable strict port check
    strictPort: false,
  },
  define: {
    // Enable floating developer console (non-intrusive)
    'process.env.REACT_APP_DEBUG': JSON.stringify('true'),
  },
  // Build configuration for better compatibility
  build: {
    sourcemap: true,
    rollupOptions: {
      onwarn: (warning: { code?: string }, warn: (warning: { code?: string }) => void) => {
        // Suppress certain warnings that might cause issues
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        warn(warning);
      }
    }
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', '@mui/material', '@mui/icons-material']
  }
})
