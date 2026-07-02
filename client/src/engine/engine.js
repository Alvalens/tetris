// Game state machine tying the pure modules together. No React, no DOM, no fetch.

import { DIFFICULTY_LEVELS, gravityMs } from './constants.js';
import {
  createBag,
  createPiece,
  cellsFor,
  matrixCells,
  rotateMatrix,
} from './tetromino.js';
import { createGrid, collides, lock, clearLines, isSpawnBlocked } from './board.js';
import {
  lineClearPoints,
  softDropPoints,
  hardDropPoints,
  levelFor,
} from './scoring.js';

export class Engine {
  constructor(difficulty = 'easy', rng = Math.random) {
    this.startLevel = DIFFICULTY_LEVELS[difficulty] ?? DIFFICULTY_LEVELS.easy;
    this.grid = createGrid();
    this.bag = createBag(rng);
    this.score = 0;
    this.lines = 0;
    this.level = this.startLevel;
    this.status = 'playing';
    this.elapsed = 0;
    this.nextType = this.bag.next();
    this.spawn();
  }

  // Pull the next type from the bag and place a fresh active piece.
  spawn() {
    const type = this.nextType;
    this.nextType = this.bag.next();
    this.active = createPiece(type);
    this.elapsed = 0;
    if (isSpawnBlocked(this.grid, cellsFor(this.active))) {
      this.status = 'gameover';
    }
  }

  // Attempt to shift the active piece; returns whether it moved.
  tryMove(dx, dy) {
    const moved = { ...this.active, x: this.active.x + dx, y: this.active.y + dy };
    if (collides(this.grid, cellsFor(moved))) return false;
    this.active = moved;
    return true;
  }

  moveLeft() {
    if (this.status !== 'playing') return;
    this.tryMove(-1, 0);
  }

  moveRight() {
    if (this.status !== 'playing') return;
    this.tryMove(1, 0);
  }

  // Soft drop: move down one and award a point, or lock if blocked.
  softDrop() {
    if (this.status !== 'playing') return;
    if (this.tryMove(0, 1)) {
      this.score += softDropPoints(1);
    } else {
      this.lockActive();
    }
  }

  // Hard drop: fall to the landing row, award 2/cell, then lock.
  hardDrop() {
    if (this.status !== 'playing') return;
    let distance = 0;
    while (this.tryMove(0, 1)) distance++;
    this.score += hardDropPoints(distance);
    this.lockActive();
  }

  // Rotate in place; cancel (revert) if the result collides. No wall kicks.
  rotate(dir = 1) {
    if (this.status !== 'playing') return;
    const rotated = { ...this.active, matrix: rotateMatrix(this.active.matrix, dir) };
    if (!collides(this.grid, cellsFor(rotated))) {
      this.active = rotated;
    }
  }

  togglePause() {
    if (this.status === 'playing') this.status = 'paused';
    else if (this.status === 'paused') this.status = 'playing';
  }

  // Lock the active piece into the grid, clear lines, score, and spawn next.
  lockActive() {
    this.grid = lock(this.grid, cellsFor(this.active), this.active.color);
    const { grid, cleared } = clearLines(this.grid);
    this.grid = grid;
    if (cleared > 0) {
      this.score += lineClearPoints(cleared, this.level);
      this.lines += cleared;
      this.level = levelFor(this.startLevel, this.lines);
    }
    this.spawn();
  }

  // Advance gravity by elapsed time, dropping/locking as intervals pass.
  tick(dtMs) {
    if (this.status !== 'playing') return;
    this.elapsed += dtMs;
    while (this.status === 'playing') {
      const step = gravityMs(this.level);
      if (this.elapsed < step) break;
      this.elapsed -= step;
      if (!this.tryMove(0, 1)) this.lockActive();
    }
  }

  // Landing position of the active piece if it were hard-dropped now.
  ghostPosition() {
    let ghost = { ...this.active };
    while (true) {
      const next = { ...ghost, y: ghost.y + 1 };
      if (collides(this.grid, cellsFor(next))) break;
      ghost = next;
    }
    return ghost;
  }

  getState() {
    const ghost = this.ghostPosition();
    const nextPiece = createPiece(this.nextType);
    return {
      grid: this.grid.map((row) => row.slice()),
      active: { cells: cellsFor(this.active), color: this.active.color },
      ghost: { cells: cellsFor(ghost), color: this.active.color },
      next: {
        type: nextPiece.type,
        color: nextPiece.color,
        cells: matrixCells(nextPiece.matrix),
      },
      score: this.score,
      level: this.level,
      lines: this.lines,
      status: this.status,
    };
  }
}
