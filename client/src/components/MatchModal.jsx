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
          boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(232,192,90,0.08)',
          animation: 'matchReveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        }}
      >
        {/* Gold accent bar */}
        <div
          className="h-[3px]"
          style={{ background: 'linear-gradient(90deg, #b88e28, #f2d875, #e8c05a, #f2d875, #b88e28)' }}
        />

        <div className="p-7 flex flex-col items-center text-center gap-5">
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

          {/* Movie poster */}
          {movie.poster ? (
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-36 rounded-lg"
              style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(232,192,90,0.1)' }}
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
            style={{ boxShadow: '0 4px 20px rgba(232,192,90,0.25)' }}
          >
            Keep Swiping →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes matchReveal {
          0%   { opacity: 0; transform: scale(0.88) translateY(14px); }
          100% { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  );
}
