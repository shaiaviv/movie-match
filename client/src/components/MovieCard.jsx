import { useRef, useState, useEffect } from 'react';

const SWIPE_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 0.3; // px/ms — enables flick gestures

export default function MovieCard({ movie, onVote, voted }) {
  const [dragX, setDragX] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const cardRef = useRef(null);
  const onVoteRef = useRef(onVote);
  const votedRef = useRef(voted);

  useEffect(() => { onVoteRef.current = onVote; }, [onVote]);
  useEffect(() => { votedRef.current = voted; }, [voted]);

  // Shared exit logic — used by both swipe gestures and buttons
  function triggerExit(liked) {
    if (votedRef.current) return;
    votedRef.current = true;
    setIsExiting(true);
    setDragX(liked ? 600 : -600);
    setTimeout(() => onVoteRef.current(liked), 350);
  }

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    let startX = null;
    let startTime = null;

    function finish(endX, elapsed) {
      if (startX === null) return;
      const delta = endX - startX;
      startX = null;
      startTime = null;
      if (votedRef.current) return;
      const velocity = elapsed > 0 ? Math.abs(delta) / elapsed : 0;
      if (Math.abs(delta) >= SWIPE_THRESHOLD || velocity >= VELOCITY_THRESHOLD) {
        votedRef.current = true;
        setIsExiting(true);
        setDragX(delta > 0 ? 600 : -600);
        const liked = delta > 0;
        setTimeout(() => onVoteRef.current(liked), 350);
      } else {
        setDragX(0);
      }
    }

    function onTouchStart(e) {
      if (votedRef.current) return;
      startX = e.touches[0].clientX;
      startTime = Date.now();
    }
    function onTouchMove(e) {
      if (startX === null) return;
      e.preventDefault();
      setDragX(e.touches[0].clientX - startX);
    }
    function onTouchEnd(e) {
      if (startX === null) return;
      finish(e.changedTouches[0].clientX, Date.now() - startTime);
    }

    function onMouseDown(e) {
      if (votedRef.current) return;
      startX = e.clientX;
      startTime = Date.now();
    }
    function onMouseMove(e) {
      if (startX === null) return;
      setDragX(e.clientX - startX);
    }
    function onMouseUp(e) {
      if (startX === null) return;
      finish(e.clientX, Date.now() - startTime);
    }

    card.addEventListener('touchstart', onTouchStart, { passive: true });
    card.addEventListener('touchmove', onTouchMove, { passive: false });
    card.addEventListener('touchend', onTouchEnd);
    card.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      card.removeEventListener('touchstart', onTouchStart);
      card.removeEventListener('touchmove', onTouchMove);
      card.removeEventListener('touchend', onTouchEnd);
      card.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const rotate = dragX / 12;
  const likeOpacity = Math.min(1, Math.max(0, dragX / SWIPE_THRESHOLD));
  const nopeOpacity = Math.min(1, Math.max(0, -dragX / SWIPE_THRESHOLD));
  const transition = (isExiting || dragX === 0) ? 'transform 0.35s ease' : 'none';

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      <div
        ref={cardRef}
        style={{
          transform: `translateX(${dragX}px) rotate(${rotate}deg)`,
          transition,
          cursor: voted ? 'default' : 'grab',
          userSelect: 'none',
          touchAction: 'pan-y',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(240,230,211,0.04)',
        }}
        className="relative w-full rounded-2xl overflow-hidden bg-noir-900"
      >
        {/* Poster image or fallback */}
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            draggable={false}
            className="w-full object-cover pointer-events-none"
            style={{ aspectRatio: '2/3' }}
          />
        ) : (
          <div className="w-full bg-noir-800 flex items-center justify-center" style={{ aspectRatio: '2/3' }}>
            <span className="text-6xl opacity-30">🎬</span>
          </div>
        )}

        {/* LIKE badge */}
        <div
          className="absolute top-8 left-5 px-3 py-1 border-2 border-gold-400 rounded-sm"
          style={{ opacity: likeOpacity, transform: 'rotate(-18deg)' }}
        >
          <span className="font-display font-semibold text-gold-400 text-2xl tracking-widest uppercase">Like</span>
        </div>

        {/* NOPE badge */}
        <div
          className="absolute top-8 right-5 px-3 py-1 border-2 border-crimson-400 rounded-sm"
          style={{ opacity: nopeOpacity, transform: 'rotate(18deg)' }}
        >
          <span className="font-display font-semibold text-crimson-400 text-2xl tracking-widest uppercase">Nope</span>
        </div>

        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 pt-14" style={{ background: 'linear-gradient(to top, rgba(8,6,12,0.97) 0%, rgba(8,6,12,0.7) 50%, transparent 100%)' }}>
          <h2 className="font-display text-2xl font-medium text-cream-200 leading-tight">{movie.title}</h2>
          <div className="flex items-center gap-2 mt-1 font-sans text-xs text-cream-500 tracking-wider">
            <span>{movie.year}</span>
            <span className="text-cream-700">·</span>
            <span>★ {movie.rating}</span>
          </div>
          <p className="mt-2 font-sans text-xs text-cream-600 line-clamp-3 leading-relaxed">{movie.overview}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 mt-5 w-full px-2">
        <button
          onClick={() => triggerExit(false)}
          disabled={voted}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded font-sans font-medium text-sm tracking-[0.15em] uppercase text-crimson-400 bg-noir-800 border border-crimson-500/20 hover:bg-crimson-600/12 hover:border-crimson-400/35 disabled:opacity-40 active:scale-[0.97] transition-all"
        >
          <span className="text-base leading-none">✕</span>
          Pass
        </button>
        <button
          onClick={() => triggerExit(true)}
          disabled={voted}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded font-sans font-medium text-sm tracking-[0.15em] uppercase text-gold-400 bg-noir-800 border border-gold-400/20 hover:bg-gold-400/8 hover:border-gold-400/40 disabled:opacity-40 active:scale-[0.97] transition-all"
          style={{ boxShadow: voted ? '' : '0 0 20px rgba(232,192,90,0.07)' }}
        >
          <span className="text-base leading-none">♥</span>
          Yes
        </button>
      </div>
    </div>
  );
}
