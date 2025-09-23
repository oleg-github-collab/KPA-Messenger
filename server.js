import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite'));

const runAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function runCallback(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });

const getAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });

const allAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT UNIQUE NOT NULL,
    host TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    max_participants INTEGER NOT NULL DEFAULT 2,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    joined_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(meeting_id, name),
    FOREIGN KEY(meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER NOT NULL,
    sender TEXT NOT NULL,
    text TEXT NOT NULL,
    ts TEXT NOT NULL,
    FOREIGN KEY(meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
  )`);
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS || 1000 * 60 * 60 * 8);
const sessionStore = new Map();

const validUsers = [
  {
    username: process.env.USER1_NAME,
    password: process.env.USER1_PASS,
  },
  {
    username: process.env.USER2_NAME,
    password: process.env.USER2_PASS,
  },
].filter((user) => user.username && user.password);

function createSession(username) {
  const token = crypto.randomBytes(24).toString('hex');
  sessionStore.set(token, {
    username,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return token;
}

function getSession(token) {
  if (!token) return null;
  const session = sessionStore.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessionStore.delete(token);
    return null;
  }
  return session;
}

setInterval(() => {
  const now = Date.now();
  for (const [token, session] of sessionStore.entries()) {
    if (session.expiresAt < now) {
      sessionStore.delete(token);
    }
  }
}, 60 * 1000).unref();

function authenticate(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer') return null;
  return getSession(token);
}

app.post('/auth', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ ok: false, message: 'Username and password required.' });
  }

  const matchedUser = validUsers.find(
    (user) => user.username === username && user.password === password,
  );

  if (!matchedUser) {
    return res.status(401).json({ ok: false, message: 'Invalid credentials.' });
  }

  const token = createSession(username);
  res.json({ ok: true, token, username });
});

function assertMeetingActive(meeting) {
  if (!meeting) {
    const error = new Error('Meeting not found.');
    error.status = 404;
    throw error;
  }
  if (meeting.status === 'ended') {
    const error = new Error('Meeting has already ended.');
    error.status = 410;
    throw error;
  }
}

async function getMeetingByToken(token) {
  if (!token) return null;
  return getAsync('SELECT * FROM meetings WHERE token = ?', [token]);
}

function generateMeetingToken() {
  const first = crypto.randomBytes(4).toString('hex');
  const second = crypto.randomBytes(2).toString('hex');
  const third = crypto.randomBytes(2).toString('hex');
  return `${first}-${second}-${third}`;
}

app.post('/api/meetings', async (req, res) => {
  const session = authenticate(req);
  if (!session) {
    return res.status(401).json({ ok: false, message: 'Authentication required.' });
  }

  try {
    const requestedMax = Number(req.body?.maxParticipants);
    const maxParticipants = Number.isFinite(requestedMax)
      ? Math.min(Math.max(Math.trunc(requestedMax), 2), 8)
      : 2;

    let token;
    let insertResult;
    do {
      token = generateMeetingToken();
      try {
        insertResult = await runAsync(
          'INSERT INTO meetings(token, host, status, max_participants) VALUES (?, ?, ?, ?)',
          [token, session.username, 'pending', maxParticipants],
        );
      } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          insertResult = null;
        } else {
          throw err;
        }
      }
    } while (!insertResult);

    const meetingUrl = `${req.protocol}://${req.get('host')}/chat.html?room=${encodeURIComponent(
      token,
    )}`;

    res.status(201).json({ ok: true, token, meetingUrl });
  } catch (error) {
    console.error('Failed to create meeting', error);
    res.status(500).json({ ok: false, message: 'Failed to create meeting.' });
  }
});

app.get('/api/meetings/:token', async (req, res) => {
  try {
    const meeting = await getMeetingByToken(req.params.token);
    assertMeetingActive(meeting);

    const participants = await allAsync(
      'SELECT name FROM participants WHERE meeting_id = ? ORDER BY joined_at ASC',
      [meeting.id],
    );

    res.json({
      ok: true,
      meeting: {
        token: meeting.token,
        host: meeting.host,
        status: meeting.status,
        maxParticipants: meeting.max_participants,
        createdAt: meeting.created_at,
      },
      participants: participants.map((p) => p.name),
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ ok: false, message: error.message });
    }
    console.error('Failed to fetch meeting', error);
    res.status(500).json({ ok: false, message: 'Failed to fetch meeting.' });
  }
});

app.post('/api/meetings/:token/end', async (req, res) => {
  const session = authenticate(req);
  if (!session) {
    return res.status(401).json({ ok: false, message: 'Authentication required.' });
  }

  try {
    const meeting = await getMeetingByToken(req.params.token);
    if (!meeting) {
      return res.status(404).json({ ok: false, message: 'Meeting not found.' });
    }
    if (meeting.host !== session.username) {
      return res.status(403).json({ ok: false, message: 'Only the host can end the meeting.' });
    }

    await runAsync('UPDATE meetings SET status = ? WHERE id = ?', ['ended', meeting.id]);

    io.to(meeting.token).emit('meeting-ended');

    res.json({ ok: true });
  } catch (error) {
    console.error('Failed to end meeting', error);
    res.status(500).json({ ok: false, message: 'Failed to end meeting.' });
  }
});

app.get('/api/messages/:token', async (req, res) => {
  try {
    const meeting = await getMeetingByToken(req.params.token);
    if (!meeting) {
      return res.status(404).json({ ok: false, message: 'Meeting not found.' });
    }

    const messages = await allAsync(
      'SELECT sender, text, ts FROM messages WHERE meeting_id = ? ORDER BY id ASC',
      [meeting.id],
    );

    res.json({ ok: true, messages });
  } catch (error) {
    console.error('Failed to fetch messages', error);
    res.status(500).json({ ok: false, message: 'Failed to fetch messages.' });
  }
});

io.on('connection', (socket) => {
  socket.on('join-room', async ({ meetingToken, displayName, authToken }) => {
    try {
      const meeting = await getMeetingByToken(meetingToken);
      assertMeetingActive(meeting);

      const session = getSession(authToken);
      let nameToUse = displayName?.trim();
      let isHost = false;

      if (session && session.username === meeting.host) {
        isHost = true;
        nameToUse = meeting.host;
      } else if (session && session.username) {
        nameToUse = session.username;
      }

      if (!nameToUse) {
        socket.emit('join-error', { message: 'Display name is required to join.' });
        return;
      }

      const existingParticipants = await allAsync(
        'SELECT name FROM participants WHERE meeting_id = ?',
        [meeting.id],
      );

      const participantNames = existingParticipants.map((p) => p.name);
      const alreadyParticipant = participantNames.includes(nameToUse);

      if (!alreadyParticipant) {
        if (existingParticipants.length >= meeting.max_participants) {
          socket.emit('join-error', {
            message: 'Meeting is full or the link has already been used.',
          });
          return;
        }

        try {
          await runAsync('INSERT INTO participants (meeting_id, name) VALUES (?, ?)', [
            meeting.id,
            nameToUse,
          ]);
          participantNames.push(nameToUse);
        } catch (err) {
          if (err.code !== 'SQLITE_CONSTRAINT') {
            throw err;
          }
        }

        if (meeting.status === 'pending') {
          await runAsync('UPDATE meetings SET status = ? WHERE id = ?', ['active', meeting.id]);
          meeting.status = 'active';
        }
      }

      socket.join(meeting.token);
      socket.data.meetingId = meeting.id;
      socket.data.meetingToken = meeting.token;
      socket.data.name = nameToUse;
      socket.data.isHost = isHost;

      socket.emit('meeting-joined', {
        meeting: {
          token: meeting.token,
          host: meeting.host,
          status: meeting.status,
          maxParticipants: meeting.max_participants,
        },
        participants: participantNames,
        isHost,
        self: nameToUse,
      });

      socket.to(meeting.token).emit('participant-joined', { name: nameToUse });
    } catch (error) {
      if (error.status) {
        socket.emit('join-error', { message: error.message });
      } else {
        console.error('join-room error', error);
        socket.emit('join-error', { message: 'Failed to join meeting.' });
      }
    }
  });

  socket.on('chat-message', async ({ text }) => {
    if (!socket.data.meetingId || !socket.data.name) {
      socket.emit('chat-error', { message: 'You must join the meeting first.' });
      return;
    }

    const trimmed = (text || '').trim();
    if (!trimmed) return;

    const timestamp = new Date().toISOString();

    try {
      await runAsync(
        'INSERT INTO messages (meeting_id, sender, text, ts) VALUES (?, ?, ?, ?)',
        [socket.data.meetingId, socket.data.name, trimmed, timestamp],
      );

      io.to(socket.data.meetingToken).emit('message', {
        sender: socket.data.name,
        text: trimmed,
        ts: timestamp,
      });
    } catch (error) {
      console.error('Failed to persist message', error);
      socket.emit('chat-error', { message: 'Failed to send message.' });
    }
  });

  socket.on('webrtc-offer', (offer) => {
    if (!socket.data.meetingToken) return;
    socket.to(socket.data.meetingToken).emit('webrtc-offer', {
      from: socket.data.name,
      offer,
    });
  });

  socket.on('webrtc-answer', (answer) => {
    if (!socket.data.meetingToken) return;
    socket.to(socket.data.meetingToken).emit('webrtc-answer', {
      from: socket.data.name,
      answer,
    });
  });

  socket.on('webrtc-candidate', (candidate) => {
    if (!socket.data.meetingToken) return;
    socket.to(socket.data.meetingToken).emit('webrtc-candidate', {
      from: socket.data.name,
      candidate,
    });
  });

  socket.on('leave-meeting', async () => {
    if (!socket.data.meetingToken || !socket.data.name) return;
    socket.leave(socket.data.meetingToken);
    socket.to(socket.data.meetingToken).emit('participant-left', { name: socket.data.name });
  });

  socket.on('disconnect', () => {
    if (socket.data.meetingToken && socket.data.name) {
      socket.to(socket.data.meetingToken).emit('participant-left', {
        name: socket.data.name,
      });
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
