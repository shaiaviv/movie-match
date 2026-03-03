import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socket from '../socket.js';
import MovieCard from '../components/MovieCard.jsx';
import MatchModal from '../components/MatchModal.jsx';

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [movies, setMovies] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('movies') || '[]');
    } catch {
      return [];
    }
  });

  const [index, setIndex] = useState(0);
  const [voted, setVoted] = useState(false);
  const [partnerJoined, setPartnerJoined] = useState(false);
  const [match, setMatch] = useState(null);
  const [partnerLeft, setPartnerLeft] = useState(false);
  const [done, setDone] = useState(false);
  const [waitingForPartner, setWaitingForPartner] = useState(false);
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storedRoomId = sessionStorage.getItem('roomId');

    // If someone navigated here directly without a valid session, go home
    if (!storedRoomId || storedRoomId !== roomId || movies.length === 0) {
      navigate('/', { replace: true });
      return;
    }

    setCode(roomId);

    // Reconnect socket if needed
    if (!socket.connected) socket.connect();

    socket.on('partner-joined', () => {
      setPartnerJoined(true);
      setWaitingForPartner(false);
    });

    socket.on('match', (movie) => {
      setMatch(movie);
    });

    socket.on('partner-disconnected', () => {
      setPartnerLeft(true);
    });

    socket.on('error', (msg) => {
      console.error('Socket error:', msg);
    });

    return () => {
      socket.off('partner-joined');
      socket.off('match');
      socket.off('partner-disconnected');
      socket.off('error');
    };
  }, [roomId, navigate, movies.length]);

  const handleVote = useCallback((liked) => {
    if (voted || done) return;
    const movie = movies[index];
    socket.emit('vote', { roomId, movieId: movie.id, liked });
    setVoted(true);

    setTimeout(() => {
      const next = index + 1;
      if (next >= movies.length) {
        setDone(true);
      } else {
        setIndex(next);
        setVoted(false);
      }
    }, 300);
  }, [voted, done, movies, index, roomId]);

  function copyCode() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (movies.length === 0) return null;

  const currentMovie = movies[index];
  const progress = Math.round((index / movies.length) * 100);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎬</span>
          <span className="font-bold text-lg">MovieMatch</span>
        </div>

        <button
          onClick={copyCode}
          className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all px-3 py-1.5 rounded-xl text-sm font-mono font-bold tracking-wider"
          title="Copy room code"
        >
          {code}
          <span className="text-xs text-gray-400">{copied ? '✓' : '⎘'}</span>
        </button>
      </header>

      {/* Partner status banner */}
      {!partnerJoined && !partnerLeft && (
        <div className="bg-yellow-900/40 border-b border-yellow-700/30 text-yellow-300 text-sm text-center py-2 px-4">
          Waiting for your partner to join… Share the code: <strong>{code}</strong>
        </div>
      )}
      {partnerLeft && (
        <div className="bg-red-900/40 border-b border-red-700/30 text-red-300 text-sm text-center py-2">
          Your partner disconnected.
        </div>
      )}
      {partnerJoined && !partnerLeft && (
        <div className="bg-green-900/30 border-b border-green-700/20 text-green-300 text-sm text-center py-2">
          Partner connected! Start swiping.
        </div>
      )}

      {/* Progress bar */}
      <div className="h-1 bg-gray-800">
        <div
          className="h-full bg-rose-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        {done ? (
          <div className="text-center">
            <div className="text-5xl mb-4">🍿</div>
            <h2 className="text-2xl font-bold">All done!</h2>
            <p className="text-gray-400 mt-2">You've swiped through all the movies.</p>
            <button
              onClick={() => { sessionStorage.clear(); navigate('/'); }}
              className="mt-6 bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all text-white font-semibold py-3 px-8 rounded-2xl"
            >
              Start over
            </button>
          </div>
        ) : (
          <>
            <div className="text-xs text-gray-500 mb-3">
              {index + 1} / {movies.length}
            </div>
            <MovieCard
              movie={currentMovie}
              onVote={handleVote}
              voted={voted}
            />
          </>
        )}
      </main>

      <MatchModal movie={match} onClose={() => setMatch(null)} />
    </div>
  );
}
