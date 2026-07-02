// Pure engine constants: board size, tetromino shapes + colors, speed curve.
// No React, no DOM, no fetch (hard invariant — see CLAUDE.md).

export const COLS = 10;
export const ROWS = 20;

// Standard tetromino colors.
export const COLORS = {
  I: '#22d3ee', // cyan
  O: '#eab308', // yellow
  T: '#a855f7', // purple
  S: '#22c55e', // green
  Z: '#ef4444', // red
  J: '#3b82f6', // blue
  L: '#f97316', // orange
};

// Spawn-orientation shape matrices. Square matrices so rotation is a clean
// in-place transform (no wall kicks — see plan.md).
export const SHAPES = {
  I: {
    color: COLORS.I,
    matrix: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  O: {
    color: COLORS.O,
    matrix: [
      [1, 1],
      [1, 1],
    ],
  },
  T: {
    color: COLORS.T,
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
  S: {
    color: COLORS.S,
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
  },
  Z: {
    color: COLORS.Z,
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
  },
  J: {
    color: COLORS.J,
    matrix: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
  L: {
    color: COLORS.L,
    matrix: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
};

export const TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

// Difficulty -> starting level.
export const DIFFICULTY_LEVELS = {
  easy: 0,
  medium: 5,
  hard: 9,
};

// Gravity interval (ms per cell drop) for a given level. ~800ms at level 0,
// shrinking each level via exponential decay, floored near 90ms.
const GRAVITY_BASE_MS = 800;
const GRAVITY_DECAY = 0.8;
const GRAVITY_FLOOR_MS = 90;

export function gravityMs(level) {
  const raw = Math.round(GRAVITY_BASE_MS * Math.pow(GRAVITY_DECAY, level));
  return Math.max(GRAVITY_FLOOR_MS, raw);
}
