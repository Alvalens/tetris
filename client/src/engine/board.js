// Grid operations: collision, locking, line clearing. Pure JS.

import { COLS, ROWS } from './constants.js';

// An empty ROWS x COLS grid; each cell is null (empty) or a color string.
export function createGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

// True if any cell is out of bounds (sides/floor) or overlaps a locked block.
// Cells above the top (y < 0) are allowed so pieces can spawn/rotate near the top.
export function collides(grid, cells) {
  for (const { x, y } of cells) {
    if (x < 0 || x >= COLS || y >= ROWS) return true;
    if (y >= 0 && grid[y][x] !== null) return true;
  }
  return false;
}

// Return a new grid with `cells` written as `color`.
export function lock(grid, cells, color) {
  const next = grid.map((row) => row.slice());
  for (const { x, y } of cells) {
    if (y >= 0 && y < ROWS && x >= 0 && x < COLS) next[y][x] = color;
  }
  return next;
}

// Remove full rows; returns { grid, cleared }. New empty rows are added on top.
export function clearLines(grid) {
  const kept = grid.filter((row) => row.some((cell) => cell === null));
  const cleared = ROWS - kept.length;
  const empty = Array.from({ length: cleared }, () => Array(COLS).fill(null));
  return { grid: empty.concat(kept), cleared };
}

// True if freshly spawned cells overlap existing locked blocks -> game over.
export function isSpawnBlocked(grid, cells) {
  return collides(grid, cells);
}
