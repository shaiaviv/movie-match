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
  const [matches, setMatches] = useState([]);
  const [partnerLeft, setPartnerLeft] = useState(false);
  const [done, setDone] = useState(false);
  const [waitingForPartner, setWaitingForPartner] = useState(false);
  const [code, setCode] = useState(roomId);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    // Always emit join-room so the server tracks this socket for votes and match events.
    // This also handles reconnects after a server restart — the server will re-register
    // the socket in the room, re-initialise votes, and reply with room-joined.
    socket.emit('join-room', roomId);

    // Re-emit on reconnect (socket ID changes after a disconnect/reconnect cycle)
    function handleReconnect() {
      socket.emit('join-room', roomId);
    }
    socket.on('connect', handleReconnect);

    socket.on('room-joined', ({ roomId: joinedId, movies: m }) => {
      sessionStorage.setItem('movies', JSON.stringify(m));
      sessionStorage.setItem('roomId', joinedId);
      setMovies(m);
      setCode(joinedId);
    });

    socket.on('partner-joined', () => {
      setPartnerJoined(true);
      setWaitingForPartner(false);
    });

    socket.on('match', (movie) => {
      setMatch(movie);
      setMatches(prev => [...prev, movie]);
    });

    socket.on('partner-disconnected', () => {
      setPartnerLeft(true);
    });

    socket.on('error', () => {
      navigate('/', { replace: true });
    });

    return () => {
      socket.off('connect', handleReconnect);
      socket.off('room-joined');
      socket.off('partner-joined');
      socket.off('match');
      socket.off('partner-disconnected');
      socket.off('error');
    };
  }, [roomId, navigate]);

  const handleVote = useCallback((liked) => {
    if (voted || done) return;
    const movie = movies[index];
    socket.emit('vote', { roomId, movieId: movie.id, liked });
    setVoted(true);

    const next = index + 1;
    if (next >= movies.length) {
      setDone(true);
    } else {
      setIndex(next);
      setVoted(false);
    }
  }, [voted, done, movies, index, roomId]);

  function copyLink() {
    const url = `${window.location.origin}/room/${code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Joining via direct URL — show loading until movies arrive
  if (movies.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-noir-950">
        <p className="font-sans text-cream-500 text-sm tracking-[0.2em]">Joining room…</p>
      </div>
    );
  }

  const currentMovie = movies[index];
  const progress = Math.round((index / movies.length) * 100);

  return (
    <div className="h-[100dvh] flex flex-col bg-noir-950 overflow-hidden">
      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-5 py-3.5 sticky top-0 z-10 border-b border-cream-200/8"
        style={{ background: 'rgba(12,10,15,0.88)', backdropFilter: 'blur(14px)' }}
      >
        <span className="font-display text-xl italic font-light text-cream-200 tracking-tight select-none">
          Movie <span className="not-italic font-semibold text-gold-400">Match</span>
        </span>

        <button
          onClick={copyLink}
          className="flex items-center gap-2 bg-noir-800 hover:bg-noir-700 active:scale-[0.97] transition-all px-3.5 py-2 rounded border border-cream-200/10 font-mono text-sm tracking-[0.2em] text-cream-300 uppercase"
        >
          {code}
          <span className="text-cream-600 text-[10px] ml-0.5">{copied ? '✓ copied' : '⎘'}</span>
        </button>
      </header>

      {/* ── Partner status ── */}
      {!partnerJoined && !partnerLeft && (
        <div
          className="px-5 py-2.5 text-xs font-sans tracking-wider text-center border-b"
          style={{ background: 'rgba(180,140,40,0.07)', borderColor: 'rgba(180,140,40,0.18)', color: '#c9a840' }}
        >
          Waiting for partner — tap the code above to copy the link
        </div>
      )}
      {partnerLeft && (
        <div
          className="px-5 py-2.5 text-xs font-sans tracking-wider text-center border-b"
          style={{ background: 'rgba(180,60,60,0.07)', borderColor: 'rgba(180,60,60,0.18)', color: '#d06060' }}
        >
          Your partner disconnected.
        </div>
      )}
      {partnerJoined && !partnerLeft && (
        <div
          className="px-5 py-2.5 text-xs font-sans tracking-wider text-center border-b"
          style={{ background: 'rgba(50,130,80,0.07)', borderColor: 'rgba(50,130,80,0.18)', color: '#58b880' }}
        >
          Partner connected — start swiping
        </div>
      )}

      {/* ── Progress bar ── */}
      <div className="h-[2px] bg-noir-800">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #d4a83e, #f2d875)' }}
        />
      </div>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-3 relative min-h-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(232,192,90,0.045) 0%, transparent 70%)' }}
        />

        {done ? (
          <div className="relative z-10 w-full max-w-sm mx-auto text-center">
            <div className="text-5xl mb-4">🍿</div>
            <h2 className="font-display italic font-light text-3xl text-cream-200">All done!</h2>

            {matches.length > 0 ? (
              <>
                <p className="font-sans text-gold-400 text-xs tracking-[0.25em] uppercase mt-3 mb-4">
                  {matches.length} match{matches.length > 1 ? 'es' : ''} tonight
                </p>
                <div className="flex flex-col gap-2 mb-6">
                  {matches.map(m => (
                    <div key={m.id} className="flex items-center gap-3 bg-noir-800 border border-cream-200/8 rounded px-3 py-2 text-left">
                      {m.poster_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${m.poster_path}`}
                          alt={m.title}
                          className="w-10 h-14 object-cover rounded shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-display italic text-cream-200 text-base leading-tight truncate">{m.title}</p>
                        <p className="font-sans text-cream-600 text-xs mt-0.5">
                          {m.release_date?.slice(0, 4)} · ★ {m.vote_average?.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="font-sans text-cream-500 text-sm mt-2 mb-6 tracking-wide">No matches this time.</p>
            )}

            <button
              onClick={() => { sessionStorage.clear(); navigate('/'); }}
              className="font-sans font-medium text-sm tracking-[0.2em] uppercase text-noir-950 bg-gold-400 hover:bg-gold-300 active:scale-[0.98] transition-all px-10 py-3.5 rounded"
              style={{ boxShadow: '0 4px 24px rgba(232,192,90,0.22)' }}
            >
              Start Over
            </button>
          </div>
        ) : (
          <div className="w-full relative z-10">
            <div className="text-center font-sans text-[10px] text-cream-600 tracking-[0.3em] uppercase mb-3">
              {index + 1} of {movies.length}
            </div>
            <MovieCard
              key={index}
              movie={currentMovie}
              onVote={handleVote}
              voted={voted}
            />
          </div>
        )}
      </main>

      <MatchModal movie={match} onClose={() => setMatch(null)} />
    </div>
  );
}
