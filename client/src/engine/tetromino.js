// Piece creation, in-place rotation, and a 7-bag randomizer. Pure JS.

import { SHAPES, TYPES, COLS } from './constants.js';

// Absolute board cells for a piece's current matrix + position.
export function cellsFor(piece) {
  const cells = [];
  const { matrix, x, y } = piece;
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c]) cells.push({ x: x + c, y: y + r });
    }
  }
  return cells;
}

// Filled cells of a matrix in its own 0..3 coordinate space (preview box).
export function matrixCells(matrix) {
  const cells = [];
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c]) cells.push({ x: c, y: r });
    }
  }
  return cells;
}

// A fresh piece of `type` at its spawn position (horizontally centered, top).
export function createPiece(type) {
  const { color, matrix } = SHAPES[type];
  const width = matrix[0].length;
  return {
    type,
    color,
    matrix: matrix.map((row) => row.slice()),
    x: Math.floor((COLS - width) / 2),
    y: 0,
  };
}

// Rotate a square matrix 90deg. dir 1 = clockwise, -1 = counter-clockwise.
export function rotateMatrix(matrix, dir = 1) {
  const n = matrix.length;
  const out = matrix.map((row) => row.slice());
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      out[r][c] = dir === 1 ? matrix[n - 1 - c][r] : matrix[c][n - 1 - r];
    }
  }
  return out;
}

// Fisher-Yates shuffle (pure over the injected rng).
function shuffle(items, rng) {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 7-bag randomizer: yields every type once before any repeats.
export function createBag(rng = Math.random) {
  let queue = [];
  return {
    next() {
      if (queue.length === 0) queue = shuffle(TYPES, rng);
      return queue.shift();
    },
  };
}
