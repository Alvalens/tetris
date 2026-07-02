import { useEffect, useRef } from 'react';
import { Engine } from '@/engine/engine.js';
import { COLS, ROWS } from '@/engine/constants.js';

// Pixel size of one board cell; drives the canvas buffer dimensions.
const CELL = 30;
const BOARD_BG = '#0a0a0a';
const GRID_LINE = 'rgba(255, 255, 255, 0.06)';
const GHOST_ALPHA = 0.25;

function fillCell(ctx, x, y, color, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
  ctx.globalAlpha = 1;
}

function draw(ctx, state) {
  const width = COLS * CELL;
  const height = ROWS * CELL;

  ctx.fillStyle = BOARD_BG;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = GRID_LINE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let c = 0; c <= COLS; c++) {
    ctx.moveTo(c * CELL, 0);
    ctx.lineTo(c * CELL, height);
  }
  for (let r = 0; r <= ROWS; r++) {
    ctx.moveTo(0, r * CELL);
    ctx.lineTo(width, r * CELL);
  }
  ctx.stroke();

  // Locked blocks.
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const color = state.grid[y][x];
      if (color) fillCell(ctx, x, y, color);
    }
  }

  // Ghost landing preview (faint), then the active piece on top.
  for (const { x, y } of state.ghost.cells) {
    if (y >= 0) fillCell(ctx, x, y, state.ghost.color, GHOST_ALPHA);
  }
  for (const { x, y } of state.active.cells) {
    if (y >= 0) fillCell(ctx, x, y, state.active.color);
  }

  if (state.status === 'paused') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#fafafa';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PAUSED', width / 2, height / 2);
  }
}

export default function GameCanvas({ difficulty, onStats, onGameOver }) {
  const canvasRef = useRef(null);
  const onStatsRef = useRef(onStats);
  const onGameOverRef = useRef(onGameOver);
  onStatsRef.current = onStats;
  onGameOverRef.current = onGameOver;

  useEffect(() => {
    const engine = new Engine(difficulty);
    const ctx = canvasRef.current.getContext('2d');

    let raf = 0;
    let last = performance.now();
    let lastSig = '';
    let reported = false;

    const step = (now) => {
      const dt = now - last;
      last = now;
      engine.tick(dt);
      const state = engine.getState();
      draw(ctx, state);

      // Only push HUD updates into React when a displayed value changes.
      const sig = `${state.score}:${state.level}:${state.lines}:${state.next.type}`;
      if (sig !== lastSig) {
        lastSig = sig;
        onStatsRef.current({
          score: state.score,
          level: state.level,
          lines: state.lines,
          next: state.next,
        });
      }

      if (state.status === 'gameover') {
        if (!reported) {
          reported = true;
          onGameOverRef.current({
            score: state.score,
            level: state.level,
            lines: state.lines,
          });
        }
        return; // stop the loop; final frame is already drawn
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const handleKey = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          engine.moveLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          engine.moveRight();
          break;
        case 'ArrowDown':
          e.preventDefault();
          engine.softDrop();
          break;
        case ' ':
          e.preventDefault();
          engine.hardDrop();
          break;
        case 'ArrowUp':
          e.preventDefault();
          engine.rotate(1);
          break;
        case 'x':
        case 'X':
          engine.rotate(1);
          break;
        case 'z':
        case 'Z':
          engine.rotate(-1);
          break;
        case 'p':
        case 'P':
          engine.togglePause();
          break;
        default:
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', handleKey);
    };
  }, [difficulty]);

  return (
    <canvas
      ref={canvasRef}
      width={COLS * CELL}
      height={ROWS * CELL}
      className="rounded-md border border-border bg-[#0a0a0a]"
    />
  );
}
