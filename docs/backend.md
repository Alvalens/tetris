# Backend & data

The logic behind the leaderboard API, the SQLite schema, ranking, validation, and error
handling. Lives in `server/` and follows [`rules/api.md`](../rules/api.md).

## Design stance: a thin, boring backend

The server holds **no game logic**. Its only job is to validate incoming scores, persist
them, and return the leaderboard. Everything gameplay-related happens client-side. Keeping
the backend thin means fewer places for bugs and a smaller thing to reason about.

## Schema

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

Why each column:

- **username** — who set the score (arcade-style name, not an account).
- **score / level / lines** — the run's outcome. All three are stored (not just score) so
  the leaderboard shows context: level = how far you got, and score means more on Hard.
- **difficulty** — lets the board be filtered per difficulty (comparing like with like).
- **created_at** — the "timestamp" from your requirements. Stored as an ISO 8601 string so
  it's unambiguous and sorts lexicographically; the client formats it for display.

**The index** `(difficulty, score DESC)` matches the exact query the leaderboard runs —
filter by difficulty, order by score descending — so top-N reads stay fast as rows grow.

`CREATE ... IF NOT EXISTS` runs at startup so the schema is self-provisioning: the DB file
and table are created on first launch, no migration step.

## API contract

### `GET /api/scores?difficulty=&limit=`

- `difficulty` ∈ `{all, easy, medium, hard}` (default `all`). `all` omits the filter.
- `limit` clamped to 1–100 (default 20) — a whitelist so a client can't request the whole
  table or a nonsense value.
- Returns rows ordered by `score DESC`.

### `POST /api/scores`

- Body: `{ username, score, level, lines, difficulty }`.
- On success: inserts one row and returns `{ id, rank }`.

## Ranking logic

`rank` = "how does this score place on its difficulty board." It's computed as
**1 + (count of scores on the same difficulty with a strictly higher score)**. So the top
score is rank 1. Returning the rank on submit lets the Game Over screen tell the player
"you placed #3" immediately, without a second request.

Ranking lives in `db.js` as a named query — not inline in the route — so the route stays a
thin parse → validate → call → respond pipeline.

## Validation (at the boundary)

Every field is validated and normalized **before** it reaches SQL:

- `username` — trimmed, 1–20 chars; empty falls back to `"ANON"`.
- `score`, `level`, `lines` — non-negative integers.
- `difficulty` — must be one of `easy | medium | hard`.

Anything invalid returns **400** with a consistent error body. Validating at the edge means
the DB layer can trust its inputs and every query uses well-formed data.

## Prepared statements only

All SQL is defined as prepared statements in `db.js`; routes call named functions
(`topScores`, `insertScore`, `rankFor`) and never build SQL strings. This is both a
**security** rule (no injection surface — values are bound, never concatenated) and a
**DRY/clarity** one (all SQL in one place, reused rather than rewritten).

## Error handling & logging

- **One error-handling middleware**, registered last, catches everything and emits a
  consistent shape:
  ```json
  { "error": { "code": "VALIDATION_ERROR", "message": "..." } }
  ```
- **Status codes** are meaningful: 200 read, 201 created, 400 bad input, 404 unknown route,
  500 unexpected. Never a 200 wrapping an error.
- **No internal leakage** — stack traces and SQL are logged server-side; the client gets a
  generic message for 500s.
- **Request logging** — one structured line per request (method, path, status, duration).

This is the whole contract the client's `api.js` is written against, and what the Phase 4
verification checks (persistence across restart, correct ordering, 400 on bad bodies).
