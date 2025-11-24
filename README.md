# Listez Chatbot App

This is the frontend application for the Listez Chatbot. It is a React application built with Vite.

## Getting Started

### Prerequisites

*   Node.js (v18+)
*   Docker (optional)

### Configuration

Create a `.env` file in the root of this directory (copy from `.env.example` if available, or see below).

Required environment variables:
*   `VITE_API_BASE_URL`: URL of the backend API (e.g., `http://localhost:8100` or `https://listez-backend.fly.dev`)
*   `VITE_WS_BASE_URL`: WebSocket URL of the backend (e.g., `ws://localhost:8100` or `wss://listez-backend.fly.dev`)
*   `VITE_SUPABASE_URL`: Supabase URL
*   `VITE_SUPABASE_ANON_KEY`: Supabase Anonymous Key

### Running Locally (Node.js)

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Run the development server:
    ```bash
    npm run dev
    ```

### Running with Docker

1.  Build and run:
    ```bash
    docker compose up --build
    ```

## Deployment

This app is deployed to Fly.io. See `fly.toml` for configuration.
