import { pool } from './db.js';

const rooms = new Map();

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return rooms.has(code) ? generateCode() : code;
}

export async function createRoom(socketId, movies) {
  const id = generateCode();
  rooms.set(id, {
    id,
    users: [socketId],
    movies,
    votes: { [socketId]: {} },
    matches: [],
    done: new Set(),
  });

  if (pool) {
    await pool.query('INSERT INTO rooms (id, movies) VALUES ($1, $2)', [id, JSON.stringify(movies)])
      .catch(err => console.error('DB createRoom error:', err));
  }

  return id;
}

export async function joinRoom(code, socketId) {
  let room = rooms.get(code);

  // Cache miss — server may have restarted; check DB for the room
  if (!room && pool) {
    const { rows } = await pool.query('SELECT id, movies FROM rooms WHERE id = $1', [code])
      .catch(() => ({ rows: [] }));
    if (rows.length > 0) {
      room = { id: rows[0].id, users: [], movies: rows[0].movies, votes: {}, matches: [], done: new Set() };
      rooms.set(code, room);
    }
  }

  if (!room) return { error: 'Room not found. Check your code and try again.' };

  // Re-joining with the same socket (e.g. duplicate emit) — treat as success
  if (room.users.includes(socketId)) return { room };

  if (room.users.length >= 2) return { error: 'Room is full. Only 2 players allowed.' };

  room.users.push(socketId);
  room.votes[socketId] = {};
  return { room };
}

export function getRoom(code) {
  return rooms.get(code) || null;
}

export function getRoomBySocket(socketId) {
  for (const room of rooms.values()) {
    if (room.users.includes(socketId)) return room;
  }
  return null;
}

export function recordVote(roomId, socketId, movieId, liked) {
  const room = rooms.get(roomId);
  if (!room) return;

  if (!room.votes[socketId]) room.votes[socketId] = {};
  room.votes[socketId][movieId] = liked;

  if (!liked) return;

  const other = room.users.find(id => id !== socketId);
  if (other && room.votes[other]?.[movieId] === true) {
    const movie = room.movies.find(m => String(m.id) === String(movieId));
    if (movie) room.matches.push(movie);
  }
}

// Call when a player finishes all movies. Returns matches array when both
// players are done, null while still waiting.
export function markDone(roomId, socketId) {
  const room = rooms.get(roomId);
  if (!room) return null;

  room.done.add(socketId);

  const allDone = room.users.length > 0 && room.users.every(id => room.done.has(id));
  return allDone ? room.matches : null;
}

export function removeUser(socketId) {
  const room = getRoomBySocket(socketId);
  if (!room) return null;

  room.users = room.users.filter(id => id !== socketId);
  delete room.votes[socketId];

  if (room.users.length === 0) {
    const ROOM_TTL_MS = 2 * 60 * 60 * 1000;
    setTimeout(async () => {
      if (rooms.get(room.id)?.users.length === 0) {
        rooms.delete(room.id);
        if (pool) {
          await pool.query('DELETE FROM rooms WHERE id = $1', [room.id])
            .catch(err => console.error('DB cleanup error:', err));
        }
      }
    }, ROOM_TTL_MS);
    return null;
  }

  return room;
}
