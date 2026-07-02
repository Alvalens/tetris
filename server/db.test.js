import { describe, it, expect, beforeEach } from 'vitest'
import { openDb } from './db.js'

const base = { level: 3, lines: 12, created_at: '2026-07-02T00:00:00.000Z' }

function seed(db, rows) {
  return rows.map((r) => db.insertScore({ ...base, ...r }))
}

describe('db layer', () => {
  let db
  beforeEach(() => {
    db = openDb(':memory:')
  })

  it('insertScore returns a new numeric id', () => {
    const id = db.insertScore({ ...base, username: 'AAA', score: 100, difficulty: 'easy' })
    expect(typeof id).toBe('number')
    expect(id).toBeGreaterThan(0)
  })

  it('topScores orders by score DESC', () => {
    seed(db, [
      { username: 'LOW', score: 100, difficulty: 'easy' },
      { username: 'HIGH', score: 900, difficulty: 'easy' },
      { username: 'MID', score: 500, difficulty: 'easy' },
    ])
    const rows = db.topScores({ difficulty: 'all', limit: 20 })
    expect(rows.map((r) => r.score)).toEqual([900, 500, 100])
  })

  it('breaks score ties by created_at ASC', () => {
    seed(db, [
      { username: 'LATER', score: 300, difficulty: 'easy', created_at: '2026-07-02T10:00:00.000Z' },
      { username: 'EARLIER', score: 300, difficulty: 'easy', created_at: '2026-07-02T09:00:00.000Z' },
    ])
    const rows = db.topScores({ difficulty: 'all', limit: 20 })
    expect(rows.map((r) => r.username)).toEqual(['EARLIER', 'LATER'])
  })

  it('difficulty="all" returns every row, a specific difficulty filters', () => {
    seed(db, [
      { username: 'E', score: 100, difficulty: 'easy' },
      { username: 'M', score: 200, difficulty: 'medium' },
      { username: 'H', score: 300, difficulty: 'hard' },
    ])
    expect(db.topScores({ difficulty: 'all', limit: 20 })).toHaveLength(3)
    const medium = db.topScores({ difficulty: 'medium', limit: 20 })
    expect(medium).toHaveLength(1)
    expect(medium[0].username).toBe('M')
  })

  it('respects the limit', () => {
    seed(db, [
      { username: 'A', score: 100, difficulty: 'easy' },
      { username: 'B', score: 200, difficulty: 'easy' },
      { username: 'C', score: 300, difficulty: 'easy' },
    ])
    const rows = db.topScores({ difficulty: 'easy', limit: 2 })
    expect(rows.map((r) => r.score)).toEqual([300, 200])
  })

  it('rankFor is 1-based and counts only strictly higher scores in that difficulty', () => {
    seed(db, [
      { username: 'A', score: 900, difficulty: 'easy' },
      { username: 'B', score: 500, difficulty: 'easy' },
      { username: 'C', score: 100, difficulty: 'easy' },
      { username: 'OTHER', score: 9999, difficulty: 'hard' },
    ])
    expect(db.rankFor({ score: 1000, difficulty: 'easy' })).toBe(1)
    expect(db.rankFor({ score: 500, difficulty: 'easy' })).toBe(2) // 900 is higher; tie with 500 does not count
    expect(db.rankFor({ score: 50, difficulty: 'easy' })).toBe(4)
    expect(db.rankFor({ score: 100, difficulty: 'hard' })).toBe(2) // only the hard 9999 is higher
  })
})
