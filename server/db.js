import Database from 'better-sqlite3'

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS scores (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    username   TEXT    NOT NULL,
    score      INTEGER NOT NULL,
    level      INTEGER NOT NULL,
    lines      INTEGER NOT NULL,
    difficulty TEXT    NOT NULL,
    created_at TEXT    NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_scores_board ON scores (difficulty, score DESC);
`

// Open the DB, apply the schema idempotently, and return named query functions
// backed by prepared statements. No SQL is ever built by string interpolation.
export function openDb(filename) {
  const db = new Database(filename)
  db.pragma('journal_mode = WAL')
  db.exec(SCHEMA)

  const statements = {
    insert: db.prepare(
      `INSERT INTO scores (username, score, level, lines, difficulty, created_at)
       VALUES (@username, @score, @level, @lines, @difficulty, @created_at)`
    ),
    topAll: db.prepare(
      `SELECT id, username, score, level, lines, difficulty, created_at
         FROM scores
        ORDER BY score DESC, created_at ASC
        LIMIT @limit`
    ),
    topByDifficulty: db.prepare(
      `SELECT id, username, score, level, lines, difficulty, created_at
         FROM scores
        WHERE difficulty = @difficulty
        ORDER BY score DESC, created_at ASC
        LIMIT @limit`
    ),
    higherCount: db.prepare(
      `SELECT COUNT(*) AS higher
         FROM scores
        WHERE difficulty = @difficulty AND score > @score`
    ),
  }

  return {
    topScores({ difficulty, limit }) {
      return difficulty === 'all'
        ? statements.topAll.all({ limit })
        : statements.topByDifficulty.all({ difficulty, limit })
    },

    insertScore({ username, score, level, lines, difficulty, created_at }) {
      const info = statements.insert.run({ username, score, level, lines, difficulty, created_at })
      return Number(info.lastInsertRowid)
    },

    rankFor({ score, difficulty }) {
      return statements.higherCount.get({ difficulty, score }).higher + 1
    },
  }
}
