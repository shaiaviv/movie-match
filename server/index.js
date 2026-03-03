import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { fetchMovies } from './tmdb.js';
import {
  createRoom,
  joinRoom,
  getRoom,
  getRoomBySocket,
  recordVote,
  removeUser,
} from './roomManager.js';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

const PORT = process.env.PORT || 3001;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

app.get('/health', (_req, res) => res.json({ ok: true }));

io.on('connection', (socket) => {
  console.log('connect', socket.id);

  // ── Create Room ──────────────────────────────────────────────────────────
  socket.on('create-room', async () => {
    if (!TMDB_API_KEY) {
      socket.emit('error', 'Server is missing TMDB_API_KEY. Check server/.env');
      return;
    }
    try {
      const movies = await fetchMovies(TMDB_API_KEY);
      const roomId = createRoom(socket.id, movies);
      socket.join(roomId);
      socket.emit('room-created', { roomId, movies });
      console.log('room created', roomId);
    } catch (err) {
      console.error(err);
      socket.emit('error', 'Failed to fetch movies from TMDB. Try again.');
    }
  });

  // ── Join Room ─────────────────────────────────────────────────────────────
  socket.on('join-room', (code) => {
    const upperCode = (code || '').toUpperCase().trim();
    const result = joinRoom(upperCode, socket.id);

    if (result.error) {
      socket.emit('error', result.error);
      return;
    }

    const { room } = result;
    socket.join(room.id);
    socket.emit('room-joined', { roomId: room.id, movies: room.movies });

    // Notify the creator
    const creatorId = room.users.find(id => id !== socket.id);
    if (creatorId) {
      socket.to(room.id).emit('partner-joined');
    }
    console.log('room joined', room.id, 'by', socket.id);
  });

  // ── Vote ──────────────────────────────────────────────────────────────────
  socket.on('vote', ({ roomId, movieId, liked }) => {
    const match = recordVote(roomId, socket.id, movieId, liked);
    if (match) {
      io.to(roomId).emit('match', match);
      console.log('match!', match.title, 'in room', roomId);
    }
  });

  // ── Disconnect ────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    console.log('disconnect', socket.id);
    const room = removeUser(socket.id);
    if (room) {
      io.to(room.id).emit('partner-disconnected');
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`MovieMatch server running on http://localhost:${PORT}`);
  if (!TMDB_API_KEY) {
    console.warn('⚠  TMDB_API_KEY not set — create server/.env with your key');
  }
});
