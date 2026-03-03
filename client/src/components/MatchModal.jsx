export default function MatchModal({ movie, onClose }) {
  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl w-full max-w-sm animate-[fadeInScale_0.35s_ease]">

        {/* Confetti-style gradient top bar */}
        <div className="h-2 bg-gradient-to-r from-rose-500 via-yellow-400 to-rose-500" />

        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className="text-5xl">🎉</div>
          <div>
            <h2 className="text-2xl font-bold text-rose-400">It's a Match!</h2>
            <p className="text-gray-400 text-sm mt-1">You both want to watch this</p>
          </div>

          {movie.poster && (
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-32 rounded-2xl shadow-lg"
            />
          )}

          <div>
            <h3 className="text-lg font-semibold">{movie.title}</h3>
            <p className="text-gray-400 text-sm">{movie.year} • ⭐ {movie.rating}</p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all text-white font-semibold py-3 rounded-2xl"
          >
            Keep swiping
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
