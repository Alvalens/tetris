import { useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const PREVIEW_BOX = 4; // preview canvas is a 4x4 cell grid
const PREVIEW_CELL = 22;

// Draw the next piece centered in the 4x4 preview box.
function drawNext(canvas, next) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!next || next.cells.length === 0) return;

  const xs = next.cells.map((c) => c.x);
  const ys = next.cells.map((c) => c.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const spanX = Math.max(...xs) - minX + 1;
  const spanY = Math.max(...ys) - minY + 1;
  const offX = Math.floor((PREVIEW_BOX - spanX) / 2);
  const offY = Math.floor((PREVIEW_BOX - spanY) / 2);

  ctx.fillStyle = next.color;
  for (const { x, y } of next.cells) {
    const px = (x - minX + offX) * PREVIEW_CELL;
    const py = (y - minY + offY) * PREVIEW_CELL;
    ctx.fillRect(px + 1, py + 1, PREVIEW_CELL - 2, PREVIEW_CELL - 2);
  }
}

function Stat({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-lg font-semibold tabular-nums">{value}</span>
    </div>
  );
}

export default function Sidebar({ stats }) {
  const canvasRef = useRef(null);
  const next = stats?.next ?? null;

  useEffect(() => {
    drawNext(canvasRef.current, next);
  }, [next]);

  return (
    <Card className="w-48">
      <CardHeader>
        <CardTitle>Next</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <canvas
          ref={canvasRef}
          width={PREVIEW_BOX * PREVIEW_CELL}
          height={PREVIEW_BOX * PREVIEW_CELL}
          className="mx-auto rounded bg-[#0a0a0a]"
        />
        <div className="flex flex-col gap-2 text-sm">
          <Stat label="Score" value={stats?.score ?? 0} />
          <Stat label="Level" value={stats?.level ?? 0} />
          <Stat label="Lines" value={stats?.lines ?? 0} />
        </div>
      </CardContent>
    </Card>
  );
}
