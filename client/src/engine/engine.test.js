import { describe, it, expect } from 'vitest';
import { COLS, ROWS } from './constants.js';
import { createGrid } from './board.js';
import { createPiece, cellsFor } from './tetromino.js';
import { Engine } from './engine.js';

describe('difficulty -> starting level', () => {
  it('maps easy/medium/hard to 0/5/9', () => {
    expect(new Engine('easy').level).toBe(0);
    expect(new Engine('medium').level).toBe(5);
    expect(new Engine('hard').level).toBe(9);
  });
});

describe('getState shape', () => {
  it('returns the full documented snapshot', () => {
    const state = new Engine('easy').getState();
    expect(Object.keys(state).sort()).toEqual(
      ['active', 'ghost', 'grid', 'level', 'lines', 'next', 'score', 'status'].sort(),
    );
    expect(state.status).toBe('playing');
    expect(state.grid).toHaveLength(ROWS);
    expect(state.grid[0]).toHaveLength(COLS);
    expect(state.active.cells).toHaveLength(4);
    expect(state.ghost.cells).toHaveLength(4);
    expect(state.next.type).toBeTypeOf('string');
    expect(state.next.cells).toHaveLength(4);
  });
});

describe('game over', () => {
  it('flags gameover when a freshly spawned piece is blocked', () => {
    const engine = new Engine('easy');
    engine.grid = Array.from({ length: ROWS }, () => Array(COLS).fill('#333'));
    engine.spawn();
    expect(engine.status).toBe('gameover');
  });
});

describe('rotation', () => {
  it('cancels the rotation when the result would collide', () => {
    const engine = new Engine('easy');
    engine.active = { ...createPiece('T'), x: 4, y: ROWS - 2 };
    const before = engine.active.matrix.map((r) => r.slice());
    engine.rotate(1);
    expect(engine.active.matrix).toEqual(before);
  });

  it('applies the rotation in open space', () => {
    const engine = new Engine('easy');
    engine.active = { ...createPiece('T'), x: 4, y: 5 };
    const before = engine.active.matrix.map((r) => r.slice());
    engine.rotate(1);
    expect(engine.active.matrix).not.toEqual(before);
  });
});

describe('drops and scoring', () => {
  it('awards +1 per cell and moves down on soft drop', () => {
    const engine = new Engine('easy');
    const before = Math.max(...cellsFor(engine.active).map((c) => c.y));
    engine.softDrop();
    const after = Math.max(...cellsFor(engine.active).map((c) => c.y));
    expect(engine.score).toBe(1);
    expect(after).toBe(before + 1);
  });

  it('awards +2 per cell on hard drop and clears completed lines', () => {
    const engine = new Engine('easy');
    engine.active = createPiece('O'); // spawns over columns 4,5
    const grid = createGrid();
    for (const r of [ROWS - 2, ROWS - 1]) {
      grid[r] = Array(COLS).fill('#999');
      grid[r][4] = null;
      grid[r][5] = null;
    }
    engine.grid = grid;

    engine.hardDrop();

    // Dropped from y=0 to y=ROWS-2 = 18 cells (+2 each) plus a double clear (300).
    expect(engine.lines).toBe(2);
    expect(engine.score).toBe(18 * 2 + 300);
  });
});

describe('pause', () => {
  it('toggles between playing and paused', () => {
    const engine = new Engine('easy');
    engine.togglePause();
    expect(engine.status).toBe('paused');
    engine.togglePause();
    expect(engine.status).toBe('playing');
  });

  it('ignores movement while paused', () => {
    const engine = new Engine('easy');
    engine.togglePause();
    const before = cellsFor(engine.active).map((c) => c.x);
    engine.moveLeft();
    expect(cellsFor(engine.active).map((c) => c.x)).toEqual(before);
  });
});

describe('gravity tick', () => {
  it('advances the piece down as intervals elapse', () => {
    const engine = new Engine('easy');
    const before = Math.max(...cellsFor(engine.active).map((c) => c.y));
    engine.tick(10000); // far more than one gravity interval
    const after = Math.max(...cellsFor(engine.active).map((c) => c.y));
    expect(after).toBeGreaterThan(before);
  });
});
