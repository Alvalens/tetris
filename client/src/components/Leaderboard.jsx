import { useEffect, useState } from 'react';
import { getScores } from '@/api.js';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { DIFFICULTY_LEVELS } from '@/engine/constants.js';

const FILTERS = ['all', ...Object.keys(DIFFICULTY_LEVELS)];

function formatDate(iso) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString();
}

export default function Leaderboard({ initialDifficulty = 'all', onBack }) {
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [scores, setScores] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getScores({ difficulty, limit: 20 })
      .then((rows) => {
        if (active) {
          setScores(rows);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [difficulty]);

  return (
    <Card className="w-[32rem] max-w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">Leaderboard</CardTitle>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-32 capitalize">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map((f) => (
              <SelectItem key={f} value={f} className="capitalize">
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!loading && error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && scores.length === 0 && (
          <p className="text-sm text-muted-foreground">No scores yet.</p>
        )}
        {!loading && !error && scores.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Level</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scores.map((row, i) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell className="max-w-[10rem] truncate">{row.username}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{row.score}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{row.level}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDate(row.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onBack}>
          Back
        </Button>
      </CardFooter>
    </Card>
  );
}
