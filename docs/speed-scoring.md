# Speed & scoring

The logic behind difficulty, the dynamic speed curve, level progression, and points.
Lives in `scoring.js` (pure functions) and is driven by the engine.

## The three knobs and how they relate

Your requirements named two things — "difficulties" and "dynamic speed based on progress."
They're connected through a single quantity: **level**.

```
difficulty ──sets──▶ starting level ──feeds──▶ gravity speed
                          ▲
lines cleared ──every 10──┘ (level goes up as you progress)
```

- **Difficulty** picks where you *start*.
- **Progress** (lines cleared) raises the level as you play.
- **Level** is the single input to the speed curve.

This is why there's no separate "speed" setting — speed is always a pure function of level,
and level is the one number everything agrees on. Single source of truth.

## Difficulty → starting level

| Difficulty | Starting level |
| ---------- | -------------- |
| Easy       | 0              |
| Medium     | 5              |
| Hard       | 9              |

Difficulty only sets the *initial* level. From there, everyone progresses by the same rule.
So "Hard" simply means "start where an Easy player would be after clearing ~90 lines."

## Level progression

`levelFor(lines)` = `startingLevel + floor(linesCleared / 10)`.

Every 10 lines cleared bumps the level by one. This is the classic Tetris cadence and the
"dynamic speed based on progress" your spec asked for — the longer you survive, the faster
it gets, automatically.

## Dynamic speed curve

`gravityMs(level)` returns the interval (in milliseconds) between automatic downward steps.
Higher level → smaller interval → faster fall.

We store this as a **level → interval table** (with a floor so it can't hit zero), rather
than a formula, because:

- it's easy to read and tune by hand,
- it lets us match the feel of classic Tetris (which used per-level frame counts), and
- it's trivially testable: assert `gravityMs(9) < gravityMs(0)`.

The engine's fixed-timestep loop consumes this value (see
[architecture](./architecture.md#fixed-timestep-gravity)): it accumulates real elapsed time
and steps gravity once per `gravityMs(level)`. Because the level can change mid-game (after
a line clear), the interval is read fresh each step — speed ramps the instant you level up.

## Scoring

`scoreForClear(linesCleared, level)` awards points based on how many lines a single lock
cleared, multiplied by the current level:

| Lines cleared | Base points | Total at level L |
| ------------- | ----------- | ---------------- |
| 1 (single)    | 100         | 100 × (L + 1)    |
| 2 (double)    | 300         | 300 × (L + 1)    |
| 3 (triple)    | 500         | 500 × (L + 1)    |
| 4 (tetris)    | 800         | 800 × (L + 1)    |

Key detail: clearing multiple lines at once is worth **more per line** (a tetris = 800 vs
four singles = 400). This is the classic incentive to build up and clear four rows at once
rather than one at a time.

`(level + 1)` as the multiplier means the same clear is worth more at higher speed — a
reward for surviving longer, and it keeps the leaderboard's `score` and `level` correlated
in a sensible way.

### Drop bonuses

- **Soft drop** (holding ↓): small points per row dropped, rewarding active play.
- **Hard drop** (Space): points per row instantly dropped.

These are minor compared to line clears but nudge players toward faster, deliberate play.

## What ends up on the leaderboard

When the game ends, the engine's final `score`, `level`, and `lines` are submitted together
with the chosen `difficulty`. Storing all four lets the leaderboard show meaningful context:
a high score on Hard is not the same achievement as the same number on Easy, and `level`
shows how far the run progressed. See [backend & data](./backend.md).
