# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev          # Run both server and client concurrently (from root)
npm install          # Install root deps (concurrently)
npm install --prefix server   # Install server deps
npm install --prefix client   # Install client deps
```

### Server (from `server/`)
```bash
npm run dev   # node --watch index.js (hot reload)
npm start     # node index.js (production)
```

### Client (from `client/`)
```bash
npm run dev      # Vite dev server on port 5173
npm run build    # Production build
npm run preview  # Preview production build
```

No lint or test commands are configured.

## Environment Variables

- `TMDB_API_KEY` — required; free API key from themoviedb.org
- `PORT` — optional; defaults to 3001
- `VITE_SERVER_URL` — optional client build-time var; points frontend to deployed backend URL

## Architecture

MovieMatch is a real-time two-player movie swiping app. Two users join the same room, swipe through the same set of movies simultaneously, and get notified when both like the same movie.

### Backend (`server/`)

- **`index.js`** — Express + Socket.io server. Handles all socket events and wires them to room logic.
- **`roomManager.js`** — In-memory room state (a `Map`). Manages room creation, player tracking, vote recording, and match detection. No database — rooms exist only in memory.
- **`tmdb.js`** — TMDB API wrapper. Fetches 3 random pages of popular movies, filters for ones with poster/title/overview, shuffles and returns 20 per room.

### Frontend (`client/src/`)

- **`socket.js`** — Singleton Socket.io client instance shared across the app.
- **`App.jsx`** — React Router: two routes, `/` (Home) and `/room/:roomId` (Room).
- **`pages/Home.jsx`** — Genre picker + room creation, plus join-by-code form. Emits `create-room` and navigates to the room page.
- **`pages/Room.jsx`** — Main swiping UI. Listens for `partner-joined`, `partner-disconnected`, and `match` socket events. Drives the card stack.
- **`components/MovieCard.jsx`** — Swipeable card with touch/mouse gesture detection, velocity-based flick recognition, spring-back on partial drag, and ♥/✕ button fallbacks.
- **`components/MatchModal.jsx`** — Celebration overlay shown when a match occurs.

### Socket Event Flow

| Event | Direction | Description |
|---|---|---|
| `create-room` | client → server | Create room with genreId; server responds with roomId + movies |
| `join-room` | client → server | Join by 6-letter code |
| `partner-joined` | server → client | Broadcast to creator when second player joins |
| `vote` | client → server | Send `{ movieId, liked }` |
| `match` | server → client | Broadcast to room when both players liked same movie |
| `partner-disconnected` | server → client | Broadcast when other player's socket disconnects |

### Client State

Movies and roomId are stored in `sessionStorage` so they survive page refreshes within the session. React hooks manage UI state within components — no global state library is used.

## Deployment

- **Backend:** Railway (`railway.json`, `nixpacks.toml`)
- **Frontend:** Vercel via GitHub Actions (`.github/workflows/deploy.yml`) — triggers on push to `main`
