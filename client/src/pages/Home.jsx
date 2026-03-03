import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket.js';

const GENRES = [
  { id: null,  label: 'All',        emoji: '🎬' },
  { id: 28,    label: 'Action',     emoji: '💥' },
  { id: 35,    label: 'Comedy',     emoji: '😂' },
  { id: 27,    label: 'Horror',     emoji: '👻' },
  { id: 10749, label: 'Romance',    emoji: '❤️' },
  { id: 878,   label: 'Sci-Fi',     emoji: '🚀' },
  { id: 18,    label: 'Drama',      emoji: '🎭' },
  { id: 16,    label: 'Animation',  emoji: '✨' },
  { id: 53,    label: 'Thriller',   emoji: '😰' },
  { id: 12,    label: 'Adventure',  emoji: '🗺️' },
  { id: 14,    label: 'Fantasy',    emoji: '🧙' },
  { id: 80,    label: 'Crime',      emoji: '🔪' },
];

export default function Home() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null); // null | 'create' | 'join' | 'genre'
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(GENRES[0]);

  useEffect(() => {
    socket.connect();

    socket.on('room-created', ({ roomId, movies }) => {
      sessionStorage.setItem('movies', JSON.stringify(movies));
      sessionStorage.setItem('roomId', roomId);
      navigate(`/room/${roomId}`);
    });

    socket.on('room-joined', ({ roomId, movies }) => {
      sessionStorage.setItem('movies', JSON.stringify(movies));
      sessionStorage.setItem('roomId', roomId);
      navigate(`/room/${roomId}`);
    });

    socket.on('error', (msg) => {
      setError(msg);
      setLoading(false);
    });

    return () => {
      socket.off('room-created');
      socket.off('room-joined');
      socket.off('error');
    };
  }, [navigate]);

  function handleCreate() {
    setError('');
    setLoading(true);
    socket.emit('create-room', { genreId: selectedGenre.id });
  }

  function handleJoin(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setError('');
    setLoading(true);
    socket.emit('join-room', code.trim());
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">🎬</div>
        <h1 className="text-4xl font-bold tracking-tight">MovieMatch</h1>
        <p className="text-gray-400 mt-2 text-lg">Swipe together. Watch together.</p>
      </div>

      {/* Home — pick mode */}
      {!mode && (
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => setMode('create')}
            className="bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all text-white font-semibold py-3 px-6 rounded-2xl text-lg shadow-lg"
          >
            Create Room
          </button>
          <button
            onClick={() => setMode('join')}
            className="bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all text-white font-semibold py-3 px-6 rounded-2xl text-lg shadow-lg"
          >
            Join Room
          </button>
        </div>
      )}

      {/* Create — pick genre */}
      {mode === 'create' && (
        <div className="flex flex-col items-center gap-5 w-full max-w-sm">
          <div className="text-center">
            <h2 className="text-xl font-bold">Pick a category</h2>
            <p className="text-gray-400 text-sm mt-1">Your partner will see the same movies</p>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full">
            {GENRES.map(g => (
              <button
                key={g.label}
                onClick={() => setSelectedGenre(g)}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border-2 transition-all active:scale-95 ${
                  selectedGenre.label === g.label
                    ? 'border-rose-500 bg-rose-500/20 text-white'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'
                }`}
              >
                <span className="text-2xl">{g.emoji}</span>
                <span className="text-xs font-medium">{g.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 active:scale-95 transition-all text-white font-semibold py-3 px-6 rounded-2xl text-lg shadow-lg"
          >
            {loading ? `Finding ${selectedGenre.label} movies…` : `Start with ${selectedGenre.emoji} ${selectedGenre.label}`}
          </button>
          <button onClick={() => { setMode(null); setError(''); }} className="text-gray-500 hover:text-gray-300 text-sm">
            Back
          </button>
        </div>
      )}

      {/* Join */}
      {mode === 'join' && (
        <form onSubmit={handleJoin} className="flex flex-col items-center gap-4 w-full max-w-xs">
          <p className="text-gray-300 text-center text-sm">Enter the code your partner shared with you</p>
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="Room code"
            className="w-full text-center uppercase tracking-widest text-2xl font-bold bg-gray-800 border border-gray-600 focus:border-rose-500 focus:outline-none rounded-2xl py-3 px-4 placeholder:text-gray-600"
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 active:scale-95 transition-all text-white font-semibold py-3 px-6 rounded-2xl text-lg shadow-lg"
          >
            {loading ? 'Joining…' : 'Join Room'}
          </button>
          <button type="button" onClick={() => { setMode(null); setError(''); setCode(''); }} className="text-gray-500 hover:text-gray-300 text-sm">
            Back
          </button>
        </form>
      )}

      {error && (
        <p className="mt-4 text-red-400 text-sm text-center max-w-xs">{error}</p>
      )}
    </div>
  );
}
