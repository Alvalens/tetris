import { useEffect, useRef, useState } from 'react';
import StartScreen from './components/StartScreen.jsx';
import GameCanvas from './components/GameCanvas.jsx';
import Sidebar from './components/Sidebar.jsx';
import GameOver from './components/GameOver.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import { Button } from '@/components/ui/button';
import { DIFFICULTY_LEVELS } from '@/engine/constants.js';

export default function App() {
  const [screen, setScreen] = useState('start');
  const [player, setPlayer] = useState({ username: 'ANON', difficulty: 'easy' });
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState(null);

  // Latest HUD stats, mirrored into a ref so endGame reads current values
  // without re-subscribing the Esc listener on every score change.
  const statsRef = useRef(null);
  const handleStats = (s) => {
    statsRef.current = s;
    setStats(s);
  };

  const startGame = ({ username, difficulty }) => {
    setPlayer({ username, difficulty });
    setStats(null);
    statsRef.current = null;
    setScreen('playing');
  };

  const playAgain = () => {
    setStats(null);
    statsRef.current = null;
    setScreen('playing');
  };

  const handleGameOver = (finalResult) => {
    setResult(finalResult);
    setScreen('gameover');
  };

  // End the current run early — go to Game Over with the current score so it can still be submitted.
  const endGame = () => {
    const s = statsRef.current;
    handleGameOver({
      score: s?.score ?? 0,
      level: s?.level ?? DIFFICULTY_LEVELS[player.difficulty] ?? 0,
      lines: s?.lines ?? 0,
    });
  };

  // Esc ends the game while playing.
  useEffect(() => {
    if (screen !== 'playing') return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        endGame();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      {screen === 'start' && (
        <StartScreen onStart={startGame} onLeaderboard={() => setScreen('leaderboard')} />
      )}

      {screen === 'playing' && (
        <div className="flex items-start gap-6">
          <GameCanvas
            difficulty={player.difficulty}
            onStats={handleStats}
            onGameOver={handleGameOver}
          />
          <div className="flex flex-col gap-4">
            <Sidebar stats={stats} />
            <Button variant="outline" onClick={endGame}>
              End Game (Esc)
            </Button>
          </div>
        </div>
      )}

      {screen === 'gameover' && (
        <GameOver
          result={result}
          player={player}
          onPlayAgain={playAgain}
          onLeaderboard={() => setScreen('leaderboard')}
        />
      )}

      {screen === 'leaderboard' && (
        <Leaderboard initialDifficulty={player.difficulty} onBack={() => setScreen('start')} />
      )}
    </div>
  );
}
