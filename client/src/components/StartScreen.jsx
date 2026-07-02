import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DIFFICULTY_LEVELS } from '@/engine/constants.js';

const DIFFICULTIES = Object.keys(DIFFICULTY_LEVELS); // easy | medium | hard

export default function StartScreen({ onStart, onLeaderboard }) {
  const [username, setUsername] = useState('');
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[0]);

  const submit = (e) => {
    e.preventDefault();
    onStart({ username: username.trim() || 'ANON', difficulty });
  };

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="text-center text-3xl tracking-tight">Tetris</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Name</Label>
            <Input
              id="username"
              maxLength={20}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ANON"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Difficulty</Label>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((d) => (
                <Button
                  key={d}
                  type="button"
                  variant={d === difficulty ? 'default' : 'outline'}
                  onClick={() => setDifficulty(d)}
                  className="capitalize"
                >
                  {d}
                </Button>
              ))}
            </div>
          </div>
          <Button type="submit" size="lg">
            Play
          </Button>
        </form>
        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full"
          onClick={onLeaderboard}
        >
          Leaderboard
        </Button>
      </CardContent>
    </Card>
  );
}
