import { useRef, useState, useEffect } from 'react';

const SWIPE_THRESHOLD = 80;

export default function MovieCard({ movie, onVote, voted }) {
  const [drag, setDrag] = useState({ x: 0, flying: false });
  const dragging = useRef(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  // Attach document-level listeners so fast drags don't escape the card
  useEffect(() => {
    function onMouseMove(e) {
      if (!dragging.current) return;
      currentX.current = e.clientX - startX.current;
      setDrag({ x: currentX.current, flying: false });
    }
    function onMouseUp() {
      if (!dragging.current) return;
      dragging.current = false;
      finish(currentX.current);
    }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  function finish(x) {
    if (Math.abs(x) >= SWIPE_THRESHOLD) {
      setDrag({ x: x > 0 ? 600 : -600, flying: true });
      setTimeout(() => onVote(x > 0), 300);
    } else {
      setDrag({ x: 0, flying: false });
    }
  }

  function onMouseDown(e) {
    if (voted) return;
    dragging.current = true;
    startX.current = e.clientX;
    currentX.current = 0;
  }

  function onTouchStart(e) {
    if (voted) return;
    dragging.current = true;
    startX.current = e.touches[0].clientX;
    currentX.current = 0;
  }

  function onTouchMove(e) {
    if (!dragging.current) return;
    e.preventDefault();
    currentX.current = e.touches[0].clientX - startX.current;
    setDrag({ x: currentX.current, flying: false });
  }

  function onTouchEnd() {
    if (!dragging.current) return;
    dragging.current = false;
    finish(currentX.current);
  }

  const rotate = drag.x / 12;
  const likeOpacity = Math.min(1, Math.max(0, drag.x / SWIPE_THRESHOLD));
  const nopeOpacity = Math.min(1, Math.max(0, -drag.x / SWIPE_THRESHOLD));

  const cardStyle = {
    transform: `translateX(${drag.x}px) rotate(${rotate}deg)`,
    transition: dragging.current ? 'none' : 'transform 0.35s ease',
    cursor: voted ? 'default' : 'grab',
    userSelect: 'none',
    touchAction: 'none',
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      <div
        style={cardStyle}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="relative w-full rounded-3xl overflow-hidden shadow-2xl bg-gray-900 select-none"
      >
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            draggable={false}
            className="w-full object-cover pointer-events-none"
            style={{ aspectRatio: '2/3' }}
          />
        ) : (
          <div className="w-full bg-gray-800 flex items-center justify-center" style={{ aspectRatio: '2/3' }}>
            <span className="text-6xl">🎬</span>
          </div>
        )}

        {/* LIKE stamp */}
        <div
          className="absolute top-8 left-6 border-4 border-green-400 text-green-400 font-black text-3xl px-3 py-1 rounded-xl rotate-[-20deg]"
          style={{ opacity: likeOpacity }}
        >
          LIKE
        </div>

        {/* NOPE stamp */}
        <div
          className="absolute top-8 right-6 border-4 border-red-400 text-red-400 font-black text-3xl px-3 py-1 rounded-xl rotate-[20deg]"
          style={{ opacity: nopeOpacity }}
        >
          NOPE
        </div>

        {/* Gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pt-12">
          <h2 className="text-xl font-bold leading-tight">{movie.title}</h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-300">
            <span>{movie.year}</span>
            <span>•</span>
            <span>⭐ {movie.rating}</span>
          </div>
          <p className="mt-2 text-xs text-gray-400 line-clamp-3">{movie.overview}</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-6 mt-6">
        <button
          onClick={() => onVote(false)}
          disabled={voted}
          className="flex flex-col items-center gap-1 w-20 h-20 rounded-full bg-gray-800 hover:bg-red-900/60 border-2 border-gray-700 hover:border-red-500 disabled:opacity-40 active:scale-90 transition-all shadow-lg"
        >
          <span className="text-3xl mt-3">✕</span>
          <span className="text-xs text-gray-400">Nope</span>
        </button>
        <button
          onClick={() => onVote(true)}
          disabled={voted}
          className="flex flex-col items-center gap-1 w-20 h-20 rounded-full bg-gray-800 hover:bg-green-900/60 border-2 border-gray-700 hover:border-green-500 disabled:opacity-40 active:scale-90 transition-all shadow-lg"
        >
          <span className="text-3xl mt-3">♥</span>
          <span className="text-xs text-gray-400">Yes!</span>
        </button>
      </div>
    </div>
  );
}
