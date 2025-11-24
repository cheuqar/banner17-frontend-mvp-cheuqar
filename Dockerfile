# Dockerfile for Local Development Only
# This is used by docker-compose.yml for local development
# No multi-stage complexity, just simple development setup

FROM node:20-alpine as development
WORKDIR /app

# Copy package files (build context is ./chatbot-app for local development)
COPY package*.json ./

# Install all dependencies (including dev dependencies for Vite)
RUN npm install --legacy-peer-deps

# Verify that vite is installed
RUN npx vite --version

# Copy source code
COPY . .

# Make startup script executable
RUN chmod +x start-dev.sh

EXPOSE 3000
CMD ["./start-dev.sh"]