#!/bin/bash

# Deploy chatbot with Doppler environment variables as build arguments
# This approach uses Doppler to inject secrets during Docker build time
# Uses production build with TypeScript compilation (all TypeScript issues resolved)

set -e

echo "🚀 Deploying Chatbot with Doppler Environment Variables..."

# Check if doppler is available
if ! command -v doppler &> /dev/null; then
    echo "❌ Doppler CLI not found. Please install it first."
    exit 1
fi

echo "📋 Using Production Build deployment mode..."
echo "   - Dockerfile: Dockerfile.production"
echo "   - Build process: npm run build + nginx"
echo "   - Port: 80"
echo "   - Status: TypeScript issues have been resolved ✅"


echo ""

echo "🔑 Using Doppler to inject environment variables during build..."
echo "📦 Building and deploying with Docker build arguments..."

# Get the environment variables from Doppler and store them
VITE_SUPABASE_URL=$(doppler secrets get VITE_SUPABASE_URL --config stg --plain)
VITE_SUPABASE_ANON_KEY=$(doppler secrets get VITE_SUPABASE_ANON_KEY --config stg --plain)
VITE_API_BASE_URL=$(doppler secrets get VITE_API_BASE_URL --config stg --plain)
VITE_WS_BASE_URL=$(doppler secrets get VITE_WS_BASE_URL --config stg --plain)
VERSION_MAJOR=$(doppler secrets get VERSION_MAJOR --config stg --plain || echo "0")
VERSION_MINOR=$(doppler secrets get VERSION_MINOR --config stg --plain || echo "0")
RELEASE_NO=$(date -u +%Y%m%d%H%M%S)
APP_VERSION="v${VERSION_MAJOR}.${VERSION_MINOR}.${RELEASE_NO}"
BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "nogit")

echo "🔍 Using environment variables:"
echo "  VITE_SUPABASE_URL: $VITE_SUPABASE_URL"
echo "  VITE_API_BASE_URL: $VITE_API_BASE_URL"
echo "  VITE_WS_BASE_URL: $VITE_WS_BASE_URL"
echo "  VERSION_MAJOR: $VERSION_MAJOR"
echo "  VERSION_MINOR: $VERSION_MINOR"
echo "  APP_VERSION: $APP_VERSION"
echo "  BUILD_TIME: $BUILD_TIME"
echo "  GIT_SHA: $GIT_SHA"

# Deploy with explicit build arguments
fly deploy --app listez-chatbot --local-only \
  --build-arg VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
  --build-arg VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
  --build-arg VITE_API_BASE_URL="$VITE_API_BASE_URL" \
  --build-arg VITE_WS_BASE_URL="$VITE_WS_BASE_URL" \
  --build-arg VITE_APP_VERSION="$APP_VERSION" \
  --build-arg VITE_BUILD_TIME="$BUILD_TIME" \
  --build-arg VITE_GIT_SHA="$GIT_SHA"

echo ""
echo "✅ Deployment completed!"

echo "🌐 Production Build deployed:"
echo "   URL: $VITE_API_BASE_URL"
echo "   Mode: Static files served by nginx"
echo "   Performance: Optimized for production"
echo "   TypeScript: All compilation issues resolved ✅"
echo "   Version: $APP_VERSION ($GIT_SHA)"

echo ""
echo "🔧 Debugging tips:"
echo "   - Check logs: fly logs --app listez-chatbot"
echo "   - Check status: fly status --app listez-chatbot"
echo "   - SSH access: fly ssh console --app listez-chatbot"
