import { describe, it, expect } from 'vitest';
import { TYPES } from './constants.js';
import {
  createPiece,
  cellsFor,
  matrixCells,
  rotateMatrix,
  createBag,
} from './tetromino.js';

describe('rotateMatrix', () => {
  const t = [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ];

  it('rotates a T piece clockwise', () => {
    expect(rotateMatrix(t, 1)).toEqual([
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ]);
  });

  it('rotates counter-clockwise as the inverse of clockwise', () => {
    expect(rotateMatrix(rotateMatrix(t, 1), -1)).toEqual(t);
  });

  it('returns to the original after four clockwise turns', () => {
    let m = t;
    for (let i = 0; i < 4; i++) m = rotateMatrix(m, 1);
    expect(m).toEqual(t);
  });

  it('does not mutate the input matrix', () => {
    const copy = t.map((r) => r.slice());
    rotateMatrix(t, 1);
    expect(t).toEqual(copy);
  });
});

describe('createPiece', () => {
  it('spawns horizontally centered near the top', () => {
    const piece = createPiece('O');
    expect(piece.type).toBe('O');
    expect(piece.y).toBe(0);
    expect(cellsFor(piece).length).toBe(4);
  });
});

describe('matrixCells', () => {
  it('returns filled cells in 0..3 preview coordinates', () => {
    const cells = matrixCells(createPiece('I').matrix);
    expect(cells).toHaveLength(4);
    for (const { x, y } of cells) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(3);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(3);
    }
  });
});

describe('createBag 7-bag randomizer', () => {
  it('yields all 7 types before repeating any', () => {
    const bag = createBag();
    const first = Array.from({ length: 7 }, () => bag.next());
    const second = Array.from({ length: 7 }, () => bag.next());
    expect(new Set(first)).toEqual(new Set(TYPES));
    expect(new Set(second)).toEqual(new Set(TYPES));
  });

  it('produces no duplicates within a single bag', () => {
    const bag = createBag();
    const drawn = Array.from({ length: 7 }, () => bag.next());
    expect(new Set(drawn).size).toBe(7);
  });
});
