# Rule: Scope & Focus

**`plan.md` defines what we build. Do not go out of bounds.**

## Do
- Build only what the phases in `plan.md` describe.
- Keep the main goal first: a playable Tetris game with difficulty, dynamic speed,
  next-piece preview, and a working SQLite leaderboard.
- Finish and verify the current phase before starting the next.
- Prefer the smallest change that satisfies the requirement.

## Don't
- No features not listed in `plan.md`.
- No speculative abstraction, config, or "might need it later" code (YAGNI).
- No unrelated refactors, dependencies, or tooling.

## Explicitly out of scope
Accounts/auth, multiplayer, hold-piece, sound, SRS wall-kicks, animations beyond basic feel.

## When unsure
If a task seems to require going beyond `plan.md`, **stop and ask** rather than expanding scope.
