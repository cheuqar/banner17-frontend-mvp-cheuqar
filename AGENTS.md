# Chatbot App AGENTS.md

## Overview
- React + Vite frontend for Banner17 conversational UI
- Material UI components, streaming chat, native render instructions
- Uses Supabase auth, connects to backend `/api/v1/*` and `/api/v1/enhanced-chat/*`

## Setup / Commands
```bash
# Start services (containerized)
doppler run --config dev -- docker compose up --build

# Dev server (container)
doppler run --config dev -- docker compose exec chatbot-app npm run dev

# Lint & Type-check
doppler run --config dev -- docker compose exec chatbot-app npm run lint
```

## Build / Deploy (Fly.io)
- Use `deploy-chatbot-with-secrets.sh` to inject Vite build‑time env via `--build-arg`
- Required build args: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL`, `VITE_WS_BASE_URL`

## Streaming Contract (Critical)
- Handle SSE frames with and without `event:`
- On any chunk with `render_instruction`, set it on the in‑flight AI message
- On final `result` frame, attach `result.data.render_instruction` before completion
- Never show fallback text when a valid `render_instruction` exists

## UI Validation Checklist
- PropertyList path: list, title contains location (e.g., “within 3km of …”), distances ordered
- AmenityList: renders list/map, empty state only when zero results
- MapPins: pins appear with correct coordinates
- Guidance context: displayed above render instruction when present
- Session resume: previously saved render instructions restore correctly

## Smart Suggestions UI
- `intelligent_suggestions` are surfaced when zero results
- Nearby suburb suggestions display `display_text`, distance (km), and property_count
- Preserve snapshot and avoid duplicate markdown rendering when native components exist

## Dev Notes
- Keep render instruction anti‑duplication: skip markdown when type in [PropertyList, MapPins, Message]
- Performance: avoid debug logs in render loop; ensure unique React keys for list/map items
- Debug mode: use `?debug=true` or env to enable debug UI elements

## Troubleshooting
- “Didn’t find any results” while backend returns PropertyList → check streaming parser attaching final render_instruction
- Duplicate amenity content → ensure markdown suppressed when native component rendered
- TypeScript build errors → run `npx tsc --noEmit` inside container; fix prop types and casts


