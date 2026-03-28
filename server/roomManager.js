const rooms = new Map();

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return rooms.has(code) ? generateCode() : code;
}

export function createRoom(socketId, movies) {
  const id = generateCode();
  rooms.set(id, {
    id,
    users: [socketId],
    movies,
    votes: { [socketId]: {} },
  });
  return id;
}

export function joinRoom(code, socketId) {
  const room = rooms.get(code);
  if (!room) return { error: 'Room not found. Check your code and try again.' };
  if (room.users.length >= 2) return { error: 'Room is full. Only 2 players allowed.' };
  if (room.users.includes(socketId)) return { error: 'Already in this room.' };

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
  if (!room) return null;

  room.votes[socketId][movieId] = liked;

  if (!liked) return null;

  // Check if the other user also liked this movie
  const other = room.users.find(id => id !== socketId);
  if (other && room.votes[other]?.[movieId] === true) {
    const movie = room.movies.find(m => String(m.id) === String(movieId));
    return movie || null;
  }

  return null;
}

export function removeUser(socketId) {
  const room = getRoomBySocket(socketId);
  if (!room) return null;

  room.users = room.users.filter(id => id !== socketId);
  delete room.votes[socketId];

  // Keep the room alive even with 0 connected users so a brief disconnect
  // (network hiccup, tab backgrounded) doesn't destroy the room before the
  // partner can join. Rooms will be cleaned up after 2 hours.
  if (room.users.length === 0) {
    const ROOM_TTL_MS = 2 * 60 * 60 * 1000;
    setTimeout(() => {
      if (rooms.get(room.id)?.users.length === 0) rooms.delete(room.id);
    }, ROOM_TTL_MS);
    return null;
  }

  return room;
}
