import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket.js';

export default function Home() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null); // null | 'create' | 'join'
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    socket.emit('create-room');
  }

  function handleJoin(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setError('');
    setLoading(true);
    socket.emit('join-room', code.trim());
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center mb-10">
        <div className="text-6xl mb-3">🎬</div>
        <h1 className="text-4xl font-bold tracking-tight">MovieMatch</h1>
        <p className="text-gray-400 mt-2 text-lg">Swipe together. Watch together.</p>
      </div>

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

      {mode === 'create' && (
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          <p className="text-gray-300 text-center">
            A 6-character room code will be generated. Share it with your partner!
          </p>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 active:scale-95 transition-all text-white font-semibold py-3 px-6 rounded-2xl text-lg shadow-lg"
          >
            {loading ? 'Creating…' : 'Create Room'}
          </button>
          <button onClick={() => { setMode(null); setError(''); }} className="text-gray-500 hover:text-gray-300 text-sm">
            Back
          </button>
        </div>
      )}

      {mode === 'join' && (
        <form onSubmit={handleJoin} className="flex flex-col items-center gap-4 w-full max-w-xs">
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
