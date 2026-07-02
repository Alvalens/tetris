# Architecture

## The mental model

The app has three layers, each with one job:

```
┌─────────────────────────────────────────────────────────┐
│  React UI  (components/)                                  │
│  screens, canvas drawing, keyboard input, leaderboard    │
│      │ reads getState()          │ POST/GET              │
│      ▼ feeds input               ▼                       │
│  Game engine (engine/)      Express API (server/)        │
│  pure rules, no I/O          validate → db → respond     │
│                                    │                     │
│                                    ▼                     │
│                              SQLite (tetris.db)          │
└─────────────────────────────────────────────────────────┘
```

1. **Engine** (`client/src/engine/`) — pure game rules. No React, no DOM, no network.
2. **UI** (`client/src/components/`) — renders engine state to a canvas, captures input,
   and talks to the API for the leaderboard.
3. **Backend** (`server/`) — a thin Express API over a SQLite leaderboard.

## Why the engine is pure (the core principle)

The single most important design decision: **game rules never touch React, the DOM, or
the network.**

Reasoning:

- **Testable.** A pure engine is deterministic — feed it inputs and a fixed time delta,
  assert on the returned state. No browser, no mocking canvas, no flaky timers. Phase 1
  is test-first precisely because this is possible.
- **Refresh-rate independent.** Game logic advances by simulated time, not by frames, so
  it behaves identically on 60 Hz and 144 Hz displays.
- **Swappable presentation.** Because the engine only exposes `getState()` and input
  methods, we could re-skin (canvas → WebGL, or a different UI) without touching rules.
- **Reasoning-friendly.** Rules live in small, focused files you can hold in your head.

If you ever feel the urge to `import React` inside `engine/`, the logic belongs in a
component instead. This is a hard invariant (see [`rules/frontend.md`](../rules/frontend.md)).

## Data flow within a frame

The UI drives the engine on a `requestAnimationFrame` loop:

```
rAF tick →  compute dt (ms since last frame)
         →  engine.tick(dt)        // advances gravity by simulated time
         →  state = engine.getState()
         →  draw(state) onto <canvas>   // board, active piece, ghost, next preview
```

Keyboard events call engine methods directly (`moveLeft()`, `rotate()`, `hardDrop()`, …),
which mutate engine state immediately; the next `draw` reflects them. Input is decoupled
from the tick — the game feels responsive because moves apply the instant a key is pressed,
while gravity is governed by simulated time.

### Fixed-timestep gravity

`tick(dt)` accumulates elapsed time and steps gravity once per `gravityMs(level)` interval:

```
accumulator += dt
while (accumulator >= gravityMs(level)) {
  stepGravityDown()          // move active piece down one row (or lock it)
  accumulator -= gravityMs(level)
}
```

This keeps falling speed tied to wall-clock time regardless of frame rate, and makes the
engine deterministic for tests (feed exact `dt` values, assert the piece dropped N rows).

## Client/server split & why SQLite

- The **client** owns all gameplay. Scores are computed in the browser.
- The **server** is deliberately thin: it validates and persists scores, and serves the
  leaderboard. It holds no game logic.
- **SQLite** because the leaderboard is small, relational, and needs zero operational
  overhead — a single file, synchronous access, no separate DB server. Perfect for a
  local/single-host game.

Consequence: because scores originate client-side, the leaderboard is trivially spoofable.
That's an accepted trade-off for a local game (no server-side replay validation — YAGNI).

## Dev vs production topology

- **Dev:** Vite dev server (client, HMR) + Express (API) run side by side; Vite proxies
  `/api` → `:3001`. Two processes, one command (`npm run dev`).
- **Production:** `vite build` emits static files; Express serves them **and** the API from
  a single port (`:3001`). One process.

The `/api` prefix is what lets the same client code work in both topologies unchanged.
