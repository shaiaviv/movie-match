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
- **`tmdb.js`** — TMDB API wrapper. Fetches 3 random pages via TMDB Discover, applies all filter params, shuffles and returns 20 per room. Filters: `genreId`, `yearFrom`, `yearTo`, `minRating`, `runtimeMin`, `runtimeMax`, `language`, `certification`.

### Frontend (`client/src/`)

- **`socket.js`** — Singleton Socket.io client instance shared across the app.
- **`App.jsx`** — React Router: two routes, `/` (Home) and `/room/:roomId` (Room).
- **`pages/Home.jsx`** — Two-step flow: mode picker (Create / Join), then either the filter form or the join input. Filter form includes genre grid (12 genres, 3-col with emoji), dual-handle year range slider (1900–present), runtime pills, age rating pills, language pills, and a min-rating slider. Accepts full room URLs in the join input (normalizes to 6-letter code client-side). Also renders `CinemaParticles` (canvas particle animation) and CSS floating gradient orbs.
- **`pages/Room.jsx`** — Main swiping UI. Glassmorphism header (backdrop-blur) with clickable room code (copies share link to clipboard), gold progress bar, partner status banner (waiting / connected / disconnected), and "X of Y" counter. Shows a "done" screen with Start Over when all movies are swiped.
- **`components/MovieCard.jsx`** — Swipeable card with touch/mouse gesture detection, velocity-based flick recognition, spring-back on partial drag. CSS `perspective`/`rotateY` adds a 3D tilt as you drag. LIKE/NOPE badge overlays appear proportionally to drag distance. Pass and Yes buttons trigger the same exit animation. Renders 2 ghost cards behind the active card that scale/fade forward as the user drags (card stack effect).
- **`components/MatchModal.jsx`** — Celebration overlay with 32-piece deterministic confetti burst (clipped to card bounds), gold accent bar, ornamental "Perfect Match" header, pulsing gold ring animation on the poster, movie year + rating, and "Keep Swiping →" dismiss button.

### Design System (`client/tailwind.config.js`, `client/src/index.css`)

Cinema noir aesthetic. Custom Tailwind color scales:

| Scale | Usage |
|---|---|
| `noir-950/900/800/700/600` | Backgrounds (near-black purples) |
| `gold-300/400/500/600` | Primary actions, accents, match highlights |
| `crimson-400/500/600` | Pass/reject actions, error states |
| `cream-100–600` | Text hierarchy (light to muted) |

Fonts: `font-display` = Cormorant Garamond (serif, used for headings/titles), `font-sans` = DM Sans, `font-mono` = DM Mono.

CSS animations defined in `index.css`: `fadeUp`, `floatOrb`, `shimmerText`, `confettiFall`, `pulseGlow`, `ringPulse`.

### Socket Event Flow

| Event | Direction | Description |
|---|---|---|
| `create-room` | client → server | Create room with filter params (see below); server responds with `room-created` |
| `join-room` | client → server | Join by 6-letter code (or normalized from URL) |
| `room-created` | server → client | `{ roomId, movies }` — response to creator |
| `room-joined` | server → client | `{ roomId, movies }` — response to joiner |
| `partner-joined` | server → client | Emitted to both players when the second player joins |
| `vote` | client → server | `{ roomId, movieId, liked }` |
| `match` | server → client | `movie` object broadcast to room when both liked same film |
| `partner-disconnected` | server → client | Broadcast when other player's socket disconnects |
| `error` | server → client | String error message (e.g. room not found, no movies matched filters) |

#### `create-room` payload

```js
{
  genreId,       // TMDB genre ID (null = all)
  yearFrom,      // e.g. 1990
  yearTo,        // e.g. 2024
  minRating,     // 0–8 (TMDB vote_average)
  runtimeMin,    // minutes
  runtimeMax,    // minutes
  language,      // ISO 639-1 code e.g. 'en', 'ko'
  certification, // US rating e.g. 'PG-13', 'R' (applied as .lte)
}
```

### Client State

Movies and roomId are stored in `sessionStorage` so they survive page refreshes within the session. React hooks manage UI state within components — no global state library is used.

## Deployment

- **Backend:** Railway (`railway.json`, `nixpacks.toml`)
- **Frontend:** Vercel via GitHub Actions (`.github/workflows/deploy.yml`) — triggers on push to `main`
