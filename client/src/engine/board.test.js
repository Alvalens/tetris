import { describe, it, expect } from 'vitest';
import { COLS, ROWS } from './constants.js';
import {
  createGrid,
  collides,
  lock,
  clearLines,
  isSpawnBlocked,
} from './board.js';

const fullRow = () => Array(COLS).fill('#fff');

describe('collides', () => {
  it('detects the left wall', () => {
    expect(collides(createGrid(), [{ x: -1, y: 5 }])).toBe(true);
  });

  it('detects the right wall', () => {
    expect(collides(createGrid(), [{ x: COLS, y: 5 }])).toBe(true);
  });

  it('detects the floor', () => {
    expect(collides(createGrid(), [{ x: 3, y: ROWS }])).toBe(true);
  });

  it('detects overlap with a locked block', () => {
    const grid = createGrid();
    grid[10][4] = '#abc';
    expect(collides(grid, [{ x: 4, y: 10 }])).toBe(true);
  });

  it('allows an in-bounds empty cell', () => {
    expect(collides(createGrid(), [{ x: 4, y: 10 }])).toBe(false);
  });

  it('allows cells above the top of the board', () => {
    expect(collides(createGrid(), [{ x: 4, y: -1 }])).toBe(false);
  });
});

describe('lock', () => {
  it('writes cells without mutating the original grid', () => {
    const grid = createGrid();
    const next = lock(grid, [{ x: 2, y: 3 }], '#f00');
    expect(next[3][2]).toBe('#f00');
    expect(grid[3][2]).toBe(null);
  });
});

describe('clearLines', () => {
  it('clears a single completed row', () => {
    const grid = createGrid();
    grid[ROWS - 1] = fullRow();
    const { grid: after, cleared } = clearLines(grid);
    expect(cleared).toBe(1);
    expect(after.length).toBe(ROWS);
    expect(after[ROWS - 1].every((c) => c === null)).toBe(true);
  });

  it('clears four rows at once (tetris)', () => {
    const grid = createGrid();
    for (let r = ROWS - 4; r < ROWS; r++) grid[r] = fullRow();
    const { cleared } = clearLines(grid);
    expect(cleared).toBe(4);
  });

  it('does not clear a partially filled row', () => {
    const grid = createGrid();
    grid[ROWS - 1] = fullRow();
    grid[ROWS - 1][0] = null;
    const { cleared } = clearLines(grid);
    expect(cleared).toBe(0);
  });
});

describe('isSpawnBlocked', () => {
  it('is true when spawn cells overlap locked blocks', () => {
    const grid = createGrid();
    grid[0][5] = '#000';
    expect(isSpawnBlocked(grid, [{ x: 5, y: 0 }])).toBe(true);
  });

  it('is false on an empty grid', () => {
    expect(isSpawnBlocked(createGrid(), [{ x: 5, y: 0 }])).toBe(false);
  });
});
