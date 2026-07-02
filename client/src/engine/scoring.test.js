import { describe, it, expect } from 'vitest';
import {
  lineClearPoints,
  softDropPoints,
  hardDropPoints,
  levelFor,
} from './scoring.js';

describe('lineClearPoints', () => {
  it('awards 100/300/500/800 at level 0', () => {
    expect(lineClearPoints(1, 0)).toBe(100);
    expect(lineClearPoints(2, 0)).toBe(300);
    expect(lineClearPoints(3, 0)).toBe(500);
    expect(lineClearPoints(4, 0)).toBe(800);
  });

  it('scales with (level + 1)', () => {
    expect(lineClearPoints(4, 1)).toBe(1600);
    expect(lineClearPoints(1, 4)).toBe(500);
  });

  it('awards nothing for zero lines', () => {
    expect(lineClearPoints(0, 5)).toBe(0);
  });
});

describe('drop bonuses', () => {
  it('gives +1 per soft-dropped cell', () => {
    expect(softDropPoints(3)).toBe(3);
  });

  it('gives +2 per hard-dropped cell', () => {
    expect(hardDropPoints(3)).toBe(6);
  });
});

describe('levelFor', () => {
  it('increments every 10 lines from the starting level', () => {
    expect(levelFor(0, 0)).toBe(0);
    expect(levelFor(0, 9)).toBe(0);
    expect(levelFor(0, 10)).toBe(1);
    expect(levelFor(0, 25)).toBe(2);
    expect(levelFor(5, 20)).toBe(7);
    expect(levelFor(9, 0)).toBe(9);
  });
});
