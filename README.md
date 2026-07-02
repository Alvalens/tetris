# Tetris

A browser Tetris clone with name entry, difficulty levels, dynamic speed, a next-shape
preview, and a SQLite-backed leaderboard.

> Status: in development. See [`plan.md`](./plan.md) for the build plan and
> [`rules/`](./rules) for project conventions.

## Features

- **Classic Tetris** — standard 10×20 board, 7 tetrominoes, rotation, line clears, game over.
- **Next-shape preview** — see the upcoming piece, just like the original.
- **Usernames** — arcade-style name entry before each game (no accounts).
- **Difficulty levels** — Easy / Medium / Hard set the starting speed.
- **Dynamic speed** — the game speeds up as you clear lines (level +1 every 10 lines).
- **Ghost piece** — shows where the current piece will land.
- **Leaderboard** — top scores persisted in SQLite with score, level, and timestamp;
  filterable by difficulty.

## Tech stack

| Layer     | Choice                                   |
| --------- | ---------------------------------------- |
| Frontend  | Vite + React                             |
| Rendering | HTML5 Canvas (play field, next preview)  |
| Styling   | Tailwind CSS + shadcn/ui                 |
| Backend   | Express                                  |
| Database  | SQLite (better-sqlite3)                  |
| Tests     | Vitest                                   |

The game engine (`client/src/engine/`) is **pure JavaScript** — no React, no DOM,
no network — so the game rules are testable in isolation. React only renders engine
state and feeds it input.

## Getting started

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

`npm run dev` runs the Vite client and the Express API together. Open the printed
local URL (Vite defaults to http://localhost:5173); API requests to `/api` are proxied
to the Express server on port 3001.

### Production

```bash
npm run build      # build the client into client/dist
npm start          # Express serves the built client + API on :3001
```

## Scripts

| Script          | Description                                        |
| --------------- | -------------------------------------------------- |
| `npm run dev`   | Run client (Vite) + API (Express) concurrently     |
| `npm run build` | Build the client for production                     |
| `npm start`     | Serve the built client + API from Express (`:3001`)|
| `npm test`      | Run the Vitest suite (engine + DB layer)           |

## How to play

1. Enter a name and pick a difficulty on the start screen.
2. Clear lines to score points and level up. The higher the level, the faster pieces fall.
3. When a new piece can't spawn, the game ends — submit your score and view the leaderboard.

### Controls

| Key            | Action              |
| -------------- | ------------------- |
| ← / →          | Move left / right   |
| ↓              | Soft drop           |
| Space          | Hard drop           |
| ↑ / X          | Rotate clockwise    |
| Z              | Rotate anticlockwise|
| P              | Pause               |

### Difficulty & speed

| Difficulty | Starting level |
| ---------- | -------------- |
| Easy       | 0              |
| Medium     | 5              |
| Hard       | 9              |

Level increases by 1 for every 10 lines cleared, and the gravity interval shrinks with
each level (classic Tetris speed curve).

### Scoring

Line clears award `100 / 300 / 500 / 800` points for `1 / 2 / 3 / 4` lines, multiplied by
`(level + 1)`. Soft and hard drops award small bonus points.

## API

Base path: `/api`

### `GET /api/scores`

Query params:

- `difficulty` — `all` | `easy` | `medium` | `hard` (default `all`)
- `limit` — number of rows, clamped 1–100 (default 20)

Returns scores ordered by score descending:

```json
[
  {
    "id": 1,
    "username": "ANON",
    "score": 12000,
    "level": 7,
    "lines": 63,
    "difficulty": "medium",
    "created_at": "2026-07-02T12:34:56.000Z"
  }
]
```

### `POST /api/scores`

Body:

```json
{ "username": "ANON", "score": 12000, "level": 7, "lines": 63, "difficulty": "medium" }
```

Validated at the boundary (username 1–20 chars, non-negative integers, allowed difficulty).
Returns the created row's id and rank:

```json
{ "id": 1, "rank": 3 }
```

Errors use a consistent shape and appropriate HTTP status codes:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "score must be a non-negative integer" } }
```

## Project structure

```
tetris/
├── plan.md                 # implementation plan (source of truth)
├── CLAUDE.md               # project guide for contributors / AI agents
├── rules/                  # project conventions (scope, frontend, api, code quality)
├── server/
│   ├── server.js           # Express: API + serves built client
│   └── db.js               # SQLite init + prepared queries
└── client/
    └── src/
        ├── engine/         # pure game logic (no React/DOM) — testable core
        ├── components/     # React UI (canvas, sidebar, screens) + shadcn ui/
        └── index.css       # Tailwind + theme tokens
```

## Data

Scores are stored in a single SQLite file (`server/tetris.db`, gitignored and created on
first run). Note: scores are computed client-side, so this leaderboard has no anti-cheat —
it's intended for local / trusted use.

## Conventions

This project follows the rules in [`rules/`](./rules):

- [`scope.md`](./rules/scope.md) — stay within `plan.md`; focus on the main goal.
- [`frontend.md`](./rules/frontend.md) — Tailwind + shadcn; keep the engine pure.
- [`api.md`](./rules/api.md) — error handling, logging, validation, prepared statements.
- [`code-quality.md`](./rules/code-quality.md) — DRY, small focused units, no dead code.
