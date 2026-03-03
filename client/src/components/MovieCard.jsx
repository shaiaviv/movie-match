import { useRef, useState } from 'react';

const SWIPE_THRESHOLD = 80;

export default function MovieCard({ movie, onVote, voted }) {
  const [dragX, setDragX] = useState(0);
  const startX = useRef(null);

  function onPointerDown(e) {
    if (voted) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startX.current = e.clientX;
  }

  function onPointerMove(e) {
    if (startX.current === null) return;
    setDragX(e.clientX - startX.current);
  }

  function onPointerUp(e) {
    if (startX.current === null) return;
    const x = e.clientX - startX.current;
    startX.current = null;

    if (Math.abs(x) >= SWIPE_THRESHOLD) {
      setDragX(x > 0 ? 600 : -600);
      setTimeout(() => onVote(x > 0), 300);
    } else {
      setDragX(0);
    }
  }

  const rotate = dragX / 12;
  const likeOpacity = Math.min(1, Math.max(0, dragX / SWIPE_THRESHOLD));
  const nopeOpacity = Math.min(1, Math.max(0, -dragX / SWIPE_THRESHOLD));
  const dragging = startX.current !== null;

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          transform: `translateX(${dragX}px) rotate(${rotate}deg)`,
          transition: dragging ? 'none' : 'transform 0.35s ease',
          cursor: voted ? 'default' : 'grab',
          touchAction: 'none',
          userSelect: 'none',
        }}
        className="relative w-full rounded-3xl overflow-hidden shadow-2xl bg-gray-900"
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

        <div
          className="absolute top-8 left-6 border-4 border-green-400 text-green-400 font-black text-3xl px-3 py-1 rounded-xl rotate-[-20deg]"
          style={{ opacity: likeOpacity }}
        >
          LIKE
        </div>

        <div
          className="absolute top-8 right-6 border-4 border-red-400 text-red-400 font-black text-3xl px-3 py-1 rounded-xl rotate-[20deg]"
          style={{ opacity: nopeOpacity }}
        >
          NOPE
        </div>

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
