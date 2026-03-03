export default function MovieCard({ movie, onVote, voted }) {
  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl bg-gray-900">
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full object-cover"
            style={{ aspectRatio: '2/3' }}
          />
        ) : (
          <div className="w-full bg-gray-800 flex items-center justify-center" style={{ aspectRatio: '2/3' }}>
            <span className="text-6xl">🎬</span>
          </div>
        )}

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

      {/* Vote buttons */}
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
