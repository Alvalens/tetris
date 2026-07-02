# Tetris Clone — Project Guide

Browser Tetris clone: name entry, difficulty levels, dynamic speed, next-shape preview,
SQLite-backed leaderboard. **`plan.md` is the source of truth for scope and design.**

## Stack
- **Frontend:** Vite + React, HTML5 Canvas for the play field.
- **Styling:** Tailwind CSS + shadcn/ui (all non-canvas UI).
- **Backend:** Express (serves API + built client).
- **DB:** better-sqlite3 (single file, prepared statements).
- **Tests:** Vitest (pure engine + DB layer).

## Commands
```bash
npm run dev      # vite client + express api together
npm run build    # build client
npm start        # express serves dist + api on :3001
npm test         # vitest
```

## Rules — read before writing code
These are binding. See `rules/` for detail:
- **`rules/scope.md`** — stay within `plan.md`; no unrequested features; focus on the main goal.
- **`rules/frontend.md`** — Tailwind + shadcn conventions; keep the engine pure (no React/DOM).
- **`rules/api.md`** — error handling, logging, validation, status codes.
- **`rules/code-quality.md`** — DRY, small focused units, naming, no dead code.

## Hard invariant
`client/src/engine/` is **pure JS** — no React, no DOM, no `fetch`. It is the testable core.
React renders engine state and feeds it input; it never contains game rules.

## Reference docs
`docs/` explains the **why** behind the design (read for deeper context):
- `docs/architecture.md` — layers, data flow, engine-purity principle, fixed-timestep loop.
- `docs/game-logic.md` — board model, pieces, rotation, collision, 7-bag, ghost, game over.
- `docs/speed-scoring.md` — difficulty, dynamic speed curve, level progression, scoring math.
- `docs/backend.md` — API contract, schema, ranking, validation, error handling.
