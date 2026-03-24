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
  const [mode, setMode] = useState(null);
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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Atmospheric background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 55% at 50% 35%, #1c1030 0%, #0c0a0f 65%)' }}
      />
      {/* Ornamental edge lines */}
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(232,192,90,0.25), transparent)' }} />
      <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(232,192,90,0.12), transparent)' }} />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">

        {/* ── Hero ── */}
        <div className="text-center mb-10 animate-fade-up" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, transparent, rgba(232,192,90,0.5))' }} />
            <span className="font-sans text-gold-500 text-[10px] tracking-[0.4em] uppercase">Now Showing</span>
            <div className="h-px w-10" style={{ background: 'linear-gradient(270deg, transparent, rgba(232,192,90,0.5))' }} />
          </div>

          <h1 className="font-display leading-none select-none">
            <span
              className="block italic font-light text-cream-200 leading-none"
              style={{ fontSize: 'clamp(3.5rem, 17vw, 4.8rem)' }}
            >
              Movie
            </span>
            <span
              className="block font-semibold text-gold-400 leading-none tracking-[0.1em] uppercase"
              style={{ fontSize: 'clamp(3.5rem, 17vw, 4.8rem)' }}
            >
              Match
            </span>
          </h1>

          <p className="mt-5 font-sans text-cream-500 text-sm tracking-[0.18em]">
            Swipe together. Decide together.
          </p>
        </div>

        {/* ── Initial mode picker ── */}
        {!mode && (
          <div className="w-full flex flex-col gap-3 animate-fade-up" style={{ animationDelay: '120ms' }}>
            <button
              onClick={() => setMode('create')}
              className="w-full py-4 font-sans font-medium text-sm tracking-[0.2em] uppercase text-noir-950 bg-gold-400 hover:bg-gold-300 active:scale-[0.98] transition-all duration-150 rounded"
              style={{ boxShadow: '0 4px 28px rgba(232,192,90,0.22)' }}
            >
              Create a Room
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full py-4 font-sans font-medium text-sm tracking-[0.2em] uppercase text-cream-300 bg-transparent hover:text-cream-100 active:scale-[0.98] transition-all duration-150 rounded border border-cream-200/15 hover:border-cream-200/30"
            >
              Join a Room
            </button>
          </div>
        )}

        {/* ── Genre picker (create flow) ── */}
        {mode === 'create' && (
          <div className="w-full animate-fade-up" style={{ animationDelay: '0ms' }}>
            <div className="text-center mb-5">
              <p className="font-sans text-cream-400 text-[11px] tracking-[0.35em] uppercase">Choose a genre</p>
              <p className="font-sans text-cream-600 text-xs mt-1">Your partner will see the same films</p>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mb-5">
              {GENRES.map(g => (
                <button
                  key={g.label}
                  onClick={() => setSelectedGenre(g)}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded transition-all duration-150 border text-xs font-sans font-medium tracking-wide ${
                    selectedGenre.label === g.label
                      ? 'border-gold-400/50 bg-gold-400/10 text-gold-300'
                      : 'border-cream-200/8 bg-noir-800 text-cream-500 hover:border-cream-200/20 hover:text-cream-300'
                  }`}
                >
                  <span className="text-lg leading-none">{g.emoji}</span>
                  {g.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-4 font-sans font-medium text-sm tracking-[0.2em] uppercase text-noir-950 bg-gold-400 hover:bg-gold-300 disabled:opacity-50 active:scale-[0.98] transition-all duration-150 rounded"
              style={{ boxShadow: '0 4px 28px rgba(232,192,90,0.22)' }}
            >
              {loading ? 'Finding films…' : `Start — ${selectedGenre.label}`}
            </button>
            <button
              onClick={() => { setMode(null); setError(''); }}
              className="w-full mt-3 py-2 font-sans text-xs tracking-[0.25em] uppercase text-cream-600 hover:text-cream-400 transition-colors"
            >
              ← Back
            </button>
          </div>
        )}

        {/* ── Join flow ── */}
        {mode === 'join' && (
          <form onSubmit={handleJoin} className="w-full animate-fade-up" style={{ animationDelay: '0ms' }}>
            <div className="text-center mb-5">
              <p className="font-sans text-cream-400 text-[11px] tracking-[0.35em] uppercase">Room Code</p>
              <p className="font-sans text-cream-600 text-xs mt-1">Enter the code your partner shared</p>
            </div>

            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="XXXXXX"
              autoFocus
              className="w-full text-center uppercase text-2xl font-mono tracking-[0.5em] text-cream-200 bg-noir-800 border border-cream-200/12 focus:border-gold-400/50 focus:outline-none rounded py-4 px-4 placeholder:text-cream-600/40 transition-colors"
            />

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full mt-3 py-4 font-sans font-medium text-sm tracking-[0.2em] uppercase text-noir-950 bg-gold-400 hover:bg-gold-300 disabled:opacity-40 active:scale-[0.98] transition-all duration-150 rounded"
              style={{ boxShadow: '0 4px 28px rgba(232,192,90,0.22)' }}
            >
              {loading ? 'Joining…' : 'Join Room'}
            </button>
            <button
              type="button"
              onClick={() => { setMode(null); setError(''); setCode(''); }}
              className="w-full mt-3 py-2 font-sans text-xs tracking-[0.25em] uppercase text-cream-600 hover:text-cream-400 transition-colors"
            >
              ← Back
            </button>
          </form>
        )}

        {error && (
          <p className="mt-5 font-sans text-crimson-400 text-sm text-center animate-fade-up">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
