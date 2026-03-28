import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { fetchMovies } from './tmdb.js';
import { initSchema } from './db.js';
import {
  createRoom,
  joinRoom,
  getRoom,
  getRoomBySocket,
  recordVote,
  markDone,
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
  socket.on('create-room', async ({ genreId, yearFrom, yearTo, minRating, runtimeMin, runtimeMax, language, certification } = {}) => {
    if (!TMDB_API_KEY) {
      socket.emit('error', 'Server is missing TMDB_API_KEY. Check server/.env');
      return;
    }
    try {
      const movies = await fetchMovies(TMDB_API_KEY, genreId || null, { yearFrom, yearTo, minRating, runtimeMin, runtimeMax, language, certification });
      if (movies.length === 0) {
        socket.emit('error', 'No movies found for those filters. Try adjusting your settings.');
        return;
      }
      const roomId = await createRoom(socket.id, movies);
      socket.join(roomId);
      socket.emit('room-created', { roomId, movies });
      console.log('room created', roomId);
    } catch (err) {
      console.error(err);
      socket.emit('error', 'Failed to fetch movies from TMDB. Try again.');
    }
  });

  // ── Join Room ─────────────────────────────────────────────────────────────
  socket.on('join-room', async (code) => {
    const upperCode = (code || '').toUpperCase().trim();
    const result = await joinRoom(upperCode, socket.id);

    if (result.error) {
      socket.emit('error', result.error);
      return;
    }

    const { room } = result;
    socket.join(room.id);
    socket.emit('room-joined', { roomId: room.id, movies: room.movies });

    // Notify the creator and confirm to the joiner that their partner (creator) is present
    const creatorId = room.users.find(id => id !== socket.id);
    if (creatorId) {
      socket.to(room.id).emit('partner-joined');
      socket.emit('partner-joined');
    }
    console.log('room joined', room.id, 'by', socket.id);
  });

  // ── Vote ──────────────────────────────────────────────────────────────────
  socket.on('vote', ({ roomId, movieId, liked }) => {
    recordVote(roomId, socket.id, movieId, liked);
  });

  // ── Player done ───────────────────────────────────────────────────────────
  socket.on('player-done', (roomId) => {
    const matches = markDone(roomId, socket.id);
    if (matches !== null) {
      io.to(roomId).emit('all-done', matches);
      console.log('all done in room', roomId, '—', matches.length, 'match(es)');
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

initSchema()
  .then(() => console.log('DB schema ready'))
  .catch(err => console.warn('DB init skipped (no DATABASE_URL?):', err.message));

httpServer.listen(PORT, () => {
  console.log(`MovieMatch server running on http://localhost:${PORT}`);
  if (!TMDB_API_KEY) {
    console.warn('⚠  TMDB_API_KEY not set — create server/.env with your key');
  }
});
