import { describe, it, expect } from 'vitest';
import { COLS, ROWS, COLORS, SHAPES, TYPES, gravityMs } from './constants.js';

describe('board dimensions', () => {
  it('is 10 wide by 20 tall', () => {
    expect(COLS).toBe(10);
    expect(ROWS).toBe(20);
  });
});

describe('shapes and colors', () => {
  it('defines all 7 tetromino types with their standard colors', () => {
    expect(TYPES).toHaveLength(7);
    for (const type of TYPES) {
      expect(SHAPES[type].color).toBe(COLORS[type]);
      expect(SHAPES[type].matrix.length).toBeGreaterThan(0);
    }
  });
});

describe('gravityMs speed curve', () => {
  it('starts near 800ms at level 0', () => {
    expect(gravityMs(0)).toBe(800);
  });

  it('strictly decreases as level rises (until the floor)', () => {
    for (let level = 0; level < 10; level++) {
      expect(gravityMs(level + 1)).toBeLessThan(gravityMs(level));
    }
  });

  it('is floored around 80-100ms at high levels', () => {
    const fast = gravityMs(50);
    expect(fast).toBeGreaterThanOrEqual(80);
    expect(fast).toBeLessThanOrEqual(100);
  });
});
