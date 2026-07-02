// Scoring and level progression. Pure JS.

// Points by number of lines cleared at once, index 1..4 (0 = no clear).
const LINE_POINTS = [0, 100, 300, 500, 800];

const SOFT_DROP_PER_CELL = 1;
const HARD_DROP_PER_CELL = 2;
const LINES_PER_LEVEL = 10;

// Line-clear score scales with (level + 1).
export function lineClearPoints(cleared, level) {
  if (cleared <= 0) return 0;
  return LINE_POINTS[cleared] * (level + 1);
}

export function softDropPoints(cells) {
  return cells * SOFT_DROP_PER_CELL;
}

export function hardDropPoints(cells) {
  return cells * HARD_DROP_PER_CELL;
}

// Level rises by one every LINES_PER_LEVEL total lines cleared.
export function levelFor(startLevel, totalLines) {
  return startLevel + Math.floor(totalLines / LINES_PER_LEVEL);
}
