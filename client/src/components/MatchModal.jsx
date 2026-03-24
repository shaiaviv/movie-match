// Deterministic confetti so pieces don't change on re-render
const COLORS = ['#e8c05a', '#f2d875', '#e05858', '#f0e6d3', '#dfd0b8', '#9b8ea0', '#c94444', '#b88e28'];
const CONFETTI = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  left: `${(i * 3.23 + 3) % 94}%`,
  delay: `${(i * 0.065) % 1.2}s`,
  duration: `${1.3 + (i % 6) * 0.16}s`,
  color: COLORS[i % COLORS.length],
  size: 4 + (i % 5),
  rotate: (i * 53) % 360,
  isRect: i % 3 !== 0,
}));

export default function MatchModal({ movie, onClose }) {
  if (!movie) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4"
      style={{ backdropFilter: 'blur(10px)' }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: '#13101c',
          boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(232,192,90,0.1)',
          animation: 'matchReveal 0.52s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        }}
      >
        {/* Confetti burst — clipped to card bounds */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 10, borderRadius: 16 }}>
          {CONFETTI.map(p => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                top: 0,
                left: p.left,
                width: p.size,
                height: p.isRect ? p.size * 1.7 : p.size,
                borderRadius: p.isRect ? 2 : '50%',
                background: p.color,
                transform: `rotate(${p.rotate}deg)`,
                animation: `confettiFall ${p.duration} ${p.delay} ease-in both`,
              }}
            />
          ))}
        </div>

        {/* Gold accent bar */}
        <div
          className="h-[3px]"
          style={{ background: 'linear-gradient(90deg, #b88e28, #f2d875, #e8c05a, #f2d875, #b88e28)' }}
        />

        <div className="p-7 flex flex-col items-center text-center gap-5 relative z-20">
          {/* Ornamental header */}
          <div>
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(232,192,90,0.5))' }} />
              <span className="font-sans text-gold-500 text-[10px] tracking-[0.4em] uppercase">Perfect Match</span>
              <div className="h-px w-8" style={{ background: 'linear-gradient(270deg, transparent, rgba(232,192,90,0.5))' }} />
            </div>
            <h2
              className="font-display italic font-light text-cream-200 leading-none"
              style={{ fontSize: '2.75rem' }}
            >
              It's a Match
            </h2>
            <p className="font-sans text-cream-600 text-xs tracking-wider mt-2">
              You both chose this film
            </p>
          </div>

          {/* Movie poster with pulsing gold ring */}
          {movie.poster ? (
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-36 rounded-lg"
              style={{ animation: 'ringPulse 2s ease-in-out infinite' }}
            />
          ) : (
            <div className="w-36 bg-noir-800 rounded-lg flex items-center justify-center" style={{ aspectRatio: '2/3' }}>
              <span className="text-4xl opacity-30">🎬</span>
            </div>
          )}

          {/* Movie info */}
          <div>
            <h3 className="font-display text-xl font-medium text-cream-200 leading-snug">{movie.title}</h3>
            <p className="font-sans text-cream-600 text-xs mt-1.5 tracking-wider">
              {movie.year} · ★ {movie.rating}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 font-sans font-medium text-sm tracking-[0.2em] uppercase text-noir-950 bg-gold-400 hover:bg-gold-300 active:scale-[0.98] transition-all rounded"
            style={{ boxShadow: '0 4px 20px rgba(232,192,90,0.28)' }}
          >
            Keep Swiping →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes matchReveal {
          0%   { opacity: 0; transform: scale(0.85) translateY(18px); }
          100% { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  );
}
