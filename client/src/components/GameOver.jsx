import { useEffect, useRef, useState } from 'react';
import { postScore } from '@/api.js';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function Stat({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-lg font-semibold tabular-nums">{value}</span>
    </div>
  );
}

export default function GameOver({ result, player, onPlayAgain, onLeaderboard }) {
  const [rank, setRank] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(true);
  const postedRef = useRef(false);

  useEffect(() => {
    if (postedRef.current) return;
    postedRef.current = true;
    postScore({
      username: player.username,
      difficulty: player.difficulty,
      score: result.score,
      level: result.level,
      lines: result.lines,
    })
      .then((res) => {
        setRank(res.rank);
        setSubmitting(false);
      })
      .catch((err) => {
        setError(err.message);
        setSubmitting(false);
      });
  }, [player, result]);

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="text-center text-3xl">Game Over</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 text-sm">
          <Stat label="Score" value={result.score} />
          <Stat label="Level" value={result.level} />
          <Stat label="Lines" value={result.lines} />
        </div>
        <div className="text-center text-sm">
          {submitting && <span className="text-muted-foreground">Submitting score…</span>}
          {!submitting && error && <span className="text-destructive">{error}</span>}
          {!submitting && !error && rank != null && (
            <span>
              You ranked <span className="font-semibold">#{rank}</span>
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button className="w-full" onClick={onPlayAgain}>
          Play again
        </Button>
        <Button variant="outline" className="w-full" onClick={onLeaderboard}>
          View leaderboard
        </Button>
      </CardFooter>
    </Card>
  );
}
