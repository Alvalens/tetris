# Tetris Clone — Implementation Plan

A browser Tetris clone with name entry, difficulty levels, dynamic speed, next-shape
preview, and a SQLite-backed leaderboard.

## Stack

- **Frontend:** Vite + React. Game rendered on HTML5 Canvas.
- **Styling:** Tailwind CSS + shadcn/ui for all non-canvas UI (menus, leaderboard, buttons).
- **Backend:** Express (single process, also serves the built client in prod).
- **DB:** better-sqlite3 (synchronous, zero-config, single file).
- **Tests:** Vitest for the pure game engine + DB layer.

## Decisions (defaults chosen for speed — flip if you disagree)

- **Rotation:** simple rotation (rotate in place; if it collides, cancel). No SRS
  wall-kicks. Fastest to build; feels fine for a clone.
- **Ghost piece:** INCLUDED (shows landing position). ~15 lines, big feel improvement.
- **Difficulty → starting level:** Easy = 0, Medium = 5, Hard = 9.
- **Level up:** every 10 lines cleared. Gravity interval shrinks with level (classic curve).

## Project layout

```
tetris/
├── package.json            # scripts: dev (concurrent client+server), build, start, test
├── vite.config.js          # dev proxy /api -> localhost:3001
├── .gitignore              # node_modules, server/tetris.db, client/dist
├── server/
│   ├── server.js           # Express: static (dist) + API
│   └── db.js               # better-sqlite3 init + prepared queries
├── client/
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx             # screen state machine
│       ├── api.js              # fetch wrappers
│       ├── engine/             # PURE logic — no React, no DOM
│       │   ├── constants.js    # board size, piece shapes, colors, speed table
│       │   ├── tetromino.js    # piece defs, rotation, random bag
│       │   ├── board.js        # grid, collision, lock, line clear
│       │   ├── scoring.js      # points, level/speed progression
│       │   └── engine.js       # game state machine + tick()
│       ├── components/
│       │   ├── ui/             # shadcn/ui primitives (generated: button, input, table...)
│       │   ├── GameCanvas.jsx  # RAF loop, input, canvas draw
│       │   ├── Sidebar.jsx     # next preview, score, level, lines
│       │   ├── StartScreen.jsx # name + difficulty
│       │   ├── GameOver.jsx    # submit score
│       │   └── Leaderboard.jsx # top scores, difficulty filter
│       ├── lib/utils.js        # shadcn `cn()` helper
│       └── index.css           # Tailwind directives + theme tokens
```

## Data model

```sql
CREATE TABLE IF NOT EXISTS scores (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  username   TEXT    NOT NULL,
  score      INTEGER NOT NULL,
  level      INTEGER NOT NULL,
  lines      INTEGER NOT NULL,
  difficulty TEXT    NOT NULL,          -- 'easy' | 'medium' | 'hard'
  created_at TEXT    NOT NULL           -- ISO 8601 timestamp
);
CREATE INDEX IF NOT EXISTS idx_scores_board ON scores (difficulty, score DESC);
```

## API

- `GET  /api/scores?difficulty=<all|easy|medium|hard>&limit=20`
  → `[{ id, username, score, level, lines, difficulty, created_at }]` ordered by score desc.
- `POST /api/scores` body `{ username, score, level, lines, difficulty }`
  → validates, inserts, returns `{ id, rank }`.

Validation: username 1–20 chars (trimmed, fallback "ANON"), score/level/lines are
non-negative integers, difficulty in the allowed set. Reject otherwise with 400.

---

## Build phases

### Phase 0 — Scaffold

- [x] `npm init`, install deps: `express`, `better-sqlite3`; dev: `vite`, `@vitejs/plugin-react`, `react`, `react-dom`, `concurrently`, `vitest`.
- [x] `vite.config.js` with React plugin + `/api` proxy to `:3001` + `@` path alias to `client/src`.
- [x] Tailwind setup: install `tailwindcss @tailwindcss/vite`, add plugin, `index.css` with `@import "tailwindcss"`.
- [x] shadcn wired manually (non-interactive): `components.json`, `jsconfig.json` paths, `lib/utils.js` (`cn`), `components/ui/button.jsx`. Add more components just-in-time (`input`, `label`, `select`, `table`, `card`).
- [x] Scripts: `dev` (concurrently run server + vite), `build`, `start`, `test`.
- [x] `.gitignore`, `client/index.html`, `client/src/main.jsx` + `App.jsx` render.

- **Verify:** ✅ `npm run build` compiles (Tailwind CSS emitted, shadcn `Button` resolves via `@` alias); server responds `{"status":"ok"}` on `:3001` with request logging; SPA fallback serves built client.

### Phase 1 — Pure game engine (test-first)

Build in `client/src/engine/`, no React. Write Vitest tests alongside.

- [x] `constants.js` — 10×20 board, 7 piece shape matrices + colors, gravity-by-level table.
- [x] `tetromino.js` — piece definitions, `rotate()` (simple), 7-bag randomizer for `next`.
- [x] `board.js` — `collides()`, `lock()`, `clearLines()` (returns cleared count), `isSpawnBlocked()`.
- [x] `scoring.js` — line-clear points × (level+1), soft/hard drop bonus, `levelFor(lines)`, `gravityMs(level)`.
- [x] `engine.js` — holds board, active piece, next piece, score, level, lines; methods
  `moveLeft/Right`, `softDrop`, `hardDrop`, `rotate`, `tick(dt)`, `getState()`. Difficulty
  sets starting level. Exposes `ghostPosition()`.

- **Verify (tests):** ✅ 41 engine tests pass — collision at walls/floor/stack; single & tetris clears;
  score math incl. drop bonuses; level +1 every 10 lines; gravity strictly decreasing then floored;
  game-over on spawn collision; 7-bag completeness; rotation-cancel-on-collision.

### Phase 2 — Rendering & input

- [x] `GameCanvas.jsx` — owns an engine instance, `requestAnimationFrame` loop calling
  `tick(dt)`, draws board + active piece + ghost. Keyboard: ← → ↓ Space ↑/X Z P.
- [x] `Sidebar.jsx` — next-piece preview (mini canvas), score, level, lines; wrapped in shadcn `Card`.
- [x] Layout board + sidebar with Tailwind (flex/grid); theme tokens in `index.css`.

- **Verify:** ✅ build clean; engine↔canvas boundary confirmed (getState shape, HUD stats, ghost,
  next-piece). ⚠️ Interactive browser playthrough not yet run manually.

### Phase 3 — Screens & flow

- [x] `StartScreen.jsx` — shadcn `Input` (name) + `Button` (difficulty) → starts game.
- [x] `GameOver.jsx` — shadcn `Card` with final score/level, POSTs to `/api/scores`, shows rank.
- [x] `App.jsx` — state machine: `start → playing → gameover → leaderboard → start`.
- [x] `api.js` — `getScores`, `postScore` (unwraps `{error:{code,message}}`).

- **Verify:** ✅ POST payload matches server validators; submit is StrictMode-double-submit-guarded;
  state machine wired. ⚠️ Full click-through in a browser pending.

### Phase 4 — Backend & persistence

- [x] `server/db.js` — `openDb(filename)`, schema idempotent, prepared statements `topScores`, `insertScore`, `rankFor`.
- [x] `server/server.js` — Express JSON, request logging (method/path/status/ms), `GET`/`POST /api/scores`
  with boundary validation, central error-handling middleware (consistent `{error:{code,message}}` shape),
  404 handler, serve `client/dist` in prod. See `rules/api.md`.
- [x] `Leaderboard.jsx` — fetch + render shadcn `Table` (rank, name, score, level, date), difficulty filter via `Select`.

- **Verify:** ✅ 6 DB tests pass (in-memory); live smoke test — persisted scores return via GET,
  201+rank on valid POST, 400 on bad body, 404 shape on unknown route. (`vitest.config.js` added so
  vitest discovers both client + server tests.)

### Phase 5 — Polish & ship

- [x] Production build: `npm run build` → Express serves static from `dist` (verified via `npm start`).
- [x] README with run instructions (`README.md` + `docs/`).
- [ ] Final playthrough on each difficulty; confirm speed curve + leaderboard end-to-end (needs a browser).

## Run

```bash
npm install
npm run dev      # dev: vite (client) + express (api) together
# or production:
npm run build && npm start   # express serves built client + api on :3001
```

## Out of scope (YAGNI)

No accounts/auth, no multiplayer, no hold-piece, no sound, no SRS wall-kicks.
