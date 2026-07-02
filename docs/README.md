# Documentation

Reference docs explaining the **logic and reasoning** behind the Tetris clone.
These complement the higher-level files:

- [`../plan.md`](../plan.md) — the build plan (what to build, in what order).
- [`../rules/`](../rules) — binding conventions (how to write the code).
- [`../README.md`](../README.md) — user/run-facing overview.

These docs are the **why**: they explain how the pieces work and why they're shaped
this way, so anyone (human or agent) can extend the game without re-deriving decisions.

## Index

1. [Architecture](./architecture.md) — layers, data flow, and the engine-purity principle.
2. [Game logic](./game-logic.md) — board model, pieces, rotation, collision, line clears, 7-bag, game over.
3. [Speed & scoring](./speed-scoring.md) — difficulty, dynamic speed curve, level progression, scoring math.
4. [Backend & data](./backend.md) — API contract, SQLite schema, leaderboard ranking, validation, error handling.

## Reading order

New to the project? Read them top to bottom. Architecture gives you the mental model;
the other three drill into the subsystems that model names.
