#!/bin/sh
set -e

echo "Starting chatbot app development server..."

# Ensure we're in the right directory
cd /app

# Install dependencies if node_modules doesn't exist or is empty
if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules)" ]; then
    echo "Installing dependencies..."
    npm install --legacy-peer-deps
else
    echo "Dependencies already installed, checking for updates..."
    npm install --legacy-peer-deps
fi

# Verify vite is available
echo "Verifying vite installation..."
if ! npx vite --version > /dev/null 2>&1; then
    echo "Vite not found, reinstalling dependencies..."
    rm -rf node_modules package-lock.json
    npm install --legacy-peer-deps
fi

# Clear Vite cache to prevent 503 errors from stale cache
echo "Clearing Vite cache..."
rm -rf node_modules/.vite 2>/dev/null || true

# Set environment variables for better server compatibility
export VITE_HOST=${VITE_HOST:-0.0.0.0}
export VITE_PORT=3000

# Ensure API base URL is correct for local development
export VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:8100}
export VITE_WS_BASE_URL=${VITE_WS_BASE_URL:-ws://localhost:8100}

echo "Starting Vite development server..."
echo "Host: $VITE_HOST"
echo "Port: $VITE_PORT"
echo "API Base URL: $VITE_API_BASE_URL"
echo "WebSocket URL: $VITE_WS_BASE_URL"
echo "Allowed hosts: $VITE_ALLOWED_HOSTS"
echo "Proxy domain: ${VITE_PROXY_DOMAIN:-(not set - local mode)}"

exec npm run dev
