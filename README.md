# Listez Chatbot App

This is the frontend application for the Listez Chatbot, built with React and Vite. It interacts with the Listez Backend API to provide a conversational interface for property search.

## 📂 Project Structure

*   `src/`: Source code
    *   `components/`: Reusable UI components
    *   `pages/`: Application pages (e.g., SmartSearch)
    *   `services/`: API services and logic
    *   `store/`: Redux state management
    *   `types/`: TypeScript type definitions
*   `tests/`: Test files
*   `public/`: Static assets

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18+)
*   Docker (optional, for containerized development)

### 1. Configuration

You need a `.env` file to configure the application.

**Option A: Automatic Setup (Recommended)**
Run the startup script `./run-app-local.sh`, which will attempt to create a `.env` file from `.env.example` if it doesn't exist.

**Option B: Manual Setup**
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure the following variables are set for local development with a local backend:
```env
VITE_API_BASE_URL=http://localhost:8100
VITE_WS_BASE_URL=ws://localhost:8100
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### 2. Running Locally

**Method A: Using the Helper Script (Recommended)**
This script sets up the environment variables and starts the app using Docker Compose.
```bash
./run-app-local.sh
```
*   Access the app at: http://localhost:3301

**Method B: Manual Node.js Run**
1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Run the development server:
    ```bash
    npm run dev
    ```
*   Access the app at: http://localhost:3000 (default Vite port)

**Method C: Docker Compose**
```bash
docker compose up --build
```
*   Access the app at: http://localhost:3301

## 🛠 Maintenance

### Linting
Run the linter to check for code quality issues:
```bash
npm run lint
```

### Updating Dependencies
Check `package.json` for dependencies. Use `npm update` to update them, or manually change versions and run `npm install`.

## 🧪 Testing

The project uses Jest for unit testing.

*   **Run all tests:**
    ```bash
    npm test
    ```
*   **Run tests in watch mode:**
    ```bash
    npm run test:watch
    ```
*   **Generate coverage report:**
    ```bash
    npm run test:coverage
    ```

## 📦 Deployment

This app is deployed to Fly.io.

### Deploying with Doppler (Recommended)
Use the included script to deploy with secrets injected from Doppler:
```bash
./deploy-with-doppler.sh
```

### Manual Deployment
*   **Configuration:** See `fly.toml` (note: `dockerfile` path is relative to this repo root).
*   **Deployment:** The main project's `deploy-to-flyio.sh` script handles deployment by entering this directory.
