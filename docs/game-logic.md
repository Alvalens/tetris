# Game logic

How the core Tetris rules work and why they're modeled this way. All of this lives in the
pure engine (`client/src/engine/`).

## Board representation

The playfield is a **10 wide × 20 tall grid** stored as a 2D array of cells. Each cell is
either empty (`0`/`null`) or holds a color/piece id for a locked block.

Why a plain grid: collision, line detection, and rendering all reduce to simple index math.
No spatial data structures needed at this scale.

The **active piece is not baked into the grid** — it's tracked separately as `{ shape,
row, col, rotation }`. Only when a piece can no longer fall is it "locked" into the grid.
This separation is what makes movement, rotation, and the ghost preview cheap: they're just
tests against the grid, not mutations of it.

## Tetrominoes

The seven standard pieces — **I, O, T, S, Z, J, L** — are defined once in `constants.js`
as small matrices, each with a fixed color. `tetromino.js` owns their definitions and
rotation states.

Each piece has a position `{ row, col }` and a `rotation` index. The piece's occupied cells
are derived from `shape[rotation]` offset by its position.

## Rotation (simple, no wall-kicks)

Rotation works by: compute the piece's cells at the next rotation state → test them against
the board with `collides()` → if clear, apply; if blocked, cancel (piece stays put).

We use **simple rotation without SRS wall-kicks** (see [`plan.md`](../plan.md) decisions).
Reasoning: wall-kicks are the bulk of a rotation system's complexity, and a plain
rotate-or-cancel feels perfectly fine for a clone. This is a deliberate scope cut — the
rotation function is isolated, so SRS could be added later without touching callers.

## Collision detection

`collides(board, cells)` is the single primitive every movement builds on. A set of cells
collides if any cell is:

- outside the left/right/bottom bounds, or
- overlapping an already-locked cell in the grid.

Every action — move, rotate, gravity, spawn — proposes new cells and asks `collides()`.
Centralizing this is the main **DRY** win in the engine: one function, one source of truth
for "is this placement legal."

## Gravity, locking, and spawning

- **Gravity** moves the active piece down one row each `gravityMs(level)` interval
  (see [speed & scoring](./speed-scoring.md)).
- When a downward move would collide, the piece **locks**: its cells are written into the
  grid, lines are checked/cleared, and the **next** piece spawns.
- **Spawn** places the new piece at the top-center. If the spawned piece immediately
  collides with existing blocks, the game is over.

## Line clearing

After each lock, `clearLines()` scans rows: any row that is fully filled is removed, and the
rows above shift down. It returns the **count** of cleared lines (0–4), which drives scoring
and level progression.

Returning just the count keeps the engine decoupled from scoring — `clearLines` knows about
the grid; `scoring.js` knows about points. Neither reaches into the other.

## The 7-bag randomizer

The next piece is chosen with a **7-bag** system, not pure random: take all seven pieces,
shuffle them into a "bag," deal them out one at a time, and refill the bag when empty.

Why: pure random can produce long droughts (no I-piece for 20 pieces) or floods. The 7-bag
guarantees every piece appears once per seven spawns — the fair, predictable distribution
players expect from modern/official Tetris. It's also what makes the **next-shape preview**
meaningful: the upcoming piece is always well-defined.

## Next-shape preview

The engine always holds the upcoming piece (`next`) drawn from the bag. `getState()` exposes
it so the `Sidebar` can render a mini preview — exactly like original Tetris. Showing one
piece ahead (not a queue) is the chosen behavior.

## Ghost piece

The **ghost** shows where the active piece would land on a hard drop. It's computed on the
fly: take the active piece and move it down repeatedly until the next step would collide —
that final position is the ghost. It's purely a rendering aid (`ghostPosition()`), never
locked into the grid.

## Game over

The end condition is simple and single-sourced: **a newly spawned piece collides on spawn.**
When that happens the engine flags game over; the UI transitions to the Game Over screen and
offers to submit the score.

## State exposed to the UI

`engine.getState()` returns everything the renderer needs and nothing it doesn't:

```
{
  board,          // the locked grid
  active,         // current piece { shape, cells, row, col, rotation, color }
  ghost,          // ghost cells for the drop preview
  next,           // upcoming piece (for the preview panel)
  score, level, lines,
  status          // 'playing' | 'paused' | 'gameover'
}
```

The UI treats this as read-only and re-reads it every frame. All mutation happens through
engine methods — never by editing the returned state.
