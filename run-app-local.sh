#!/bin/bash
set -e

echo "💬 Starting Listez Chatbot App - LOCAL DEVELOPMENT MODE"
echo "   (Chatbot App only)"
echo ""

# Ensure we're using the local configuration
echo "📋 Configuration:"
echo "   - Using docker-compose.yml"
echo "   - Backend API: http://localhost:8100"
echo "   - WebSocket: ws://localhost:8100"
echo "   - Frontend Port: 3301"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating one from .env.example if available..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env from .env.example"
    else
        echo "❌ No .env.example found. Please create .env manually."
    fi
fi

# Set environment variables for local development
export VITE_API_BASE_URL="http://localhost:8100"
export VITE_WS_BASE_URL="ws://localhost:8100"

# Start the application
echo "🚀 Starting chatbot-app..."
if command -v doppler >/dev/null 2>&1; then
    echo "   Using Doppler for secrets (Supabase keys)"
    echo "   Overriding API URLs for local development"
    # Use dev_local config for Supabase keys, but override API URLs for localhost via docker-compose env
    doppler run --config dev_local -- \
        env VITE_API_BASE_URL="http://localhost:8100" VITE_WS_BASE_URL="ws://localhost:8100" \
        docker compose up --build
else
    echo "   Using local .env file"
    docker compose up --build
fi
