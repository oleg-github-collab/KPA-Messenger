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

const TEXT = {
  usernamePasswordRequired: 'Username and password required. / Потрібно вказати ім’я користувача та пароль.',
  invalidCredentials: 'Invalid credentials. / Невірні облікові дані.',
  authRequired: 'Authentication required. / Потрібна автентифікація.',
  meetingCreateFailed: 'Failed to create meeting. / Не вдалося створити зустріч.',
  meetingFetchFailed: 'Failed to fetch meeting. / Не вдалося отримати дані зустрічі.',
  meetingNotFound: 'Meeting not found. / Зустріч не знайдена.',
  meetingEnded: 'Meeting has already ended. / Зустріч уже завершена.',
  meetingEndFailed: 'Failed to end meeting. / Не вдалося завершити зустріч.',
  meetingEndForbidden: 'Only the host can end the meeting. / Лише хост може завершити зустріч.',
  meetingFull: 'Meeting is full or the link has already been used. / Зустріч заповнена або посилання вже використано.',
  displayNameRequired: 'Display name is required to join. / Щоб приєднатися, потрібно вказати ім’я.',
  joinFailed: 'Failed to join meeting. / Не вдалося приєднатися до зустрічі.',
  chatJoinRequired: 'You must join the meeting first. / Спершу приєднайтеся до зустрічі.',
  chatSendFailed: 'Failed to send message. / Не вдалося надіслати повідомлення.',
  messagesFetchFailed: 'Failed to fetch messages. / Не вдалося отримати повідомлення.',
  assistantDisabled: 'Assistant is not configured. / Асистента не налаштовано.',
  assistantHostOnly: 'Only the host can call the assistant. / Лише хост може викликати асистента.',
  assistantFailed: 'Assistant request failed. / Помилка під час запиту до асистента.',
  assistantNoPrompt: 'Assistant prompt is empty. / Порожній запит до асистента.'
};

const ASSISTANT_NAME = process.env.ASSISTANT_NAME || 'Valera';
const ASSISTANT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const ASSISTANT_SYSTEM_PROMPT =
  process.env.ASSISTANT_SYSTEM_PROMPT ||
  `You are ${ASSISTANT_NAME}, an assistant that helps the meeting host with quick research and analysis. Use concise Ukrainian or English depending on the user input. Cite web search snippets when they are provided.`;
const ASSISTANT_MAX_HISTORY = Number(process.env.ASSISTANT_HISTORY_LIMIT || 20);
const ASSISTANT_SEARCH_ENABLED = process.env.ASSISTANT_SEARCH !== 'false';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
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
    return res.status(400).json({ ok: false, message: TEXT.usernamePasswordRequired });
  }

  const matchedUser = validUsers.find(
    (user) => user.username === username && user.password === password,
  );

  if (!matchedUser) {
    return res.status(401).json({ ok: false, message: TEXT.invalidCredentials });
  }

  const token = createSession(username);
  res.json({ ok: true, token, username });
});

function assertMeetingActive(meeting) {
  if (!meeting) {
    const error = new Error(TEXT.meetingNotFound);
    error.status = 404;
    throw error;
  }
  if (meeting.status === 'ended') {
    const error = new Error(TEXT.meetingEnded);
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
    return res.status(401).json({ ok: false, message: TEXT.authRequired });
  }

  try {
    const requestedMax = Number(req.body?.maxParticipants);
    const maxParticipants = Number.isFinite(requestedMax)
      ? Math.min(Math.max(Math.trunc(requestedMax), 2), 10)
      : 10;

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
    res.status(500).json({ ok: false, message: TEXT.meetingCreateFailed });
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
    res.status(500).json({ ok: false, message: TEXT.meetingFetchFailed });
  }
});

app.post('/api/meetings/:token/end', async (req, res) => {
  const session = authenticate(req);
  if (!session) {
    return res.status(401).json({ ok: false, message: TEXT.authRequired });
  }

  try {
    const meeting = await getMeetingByToken(req.params.token);
    if (!meeting) {
      return res.status(404).json({ ok: false, message: TEXT.meetingNotFound });
    }
    if (meeting.host !== session.username) {
      return res.status(403).json({ ok: false, message: TEXT.meetingEndForbidden });
    }

    await runAsync('UPDATE meetings SET status = ? WHERE id = ?', ['ended', meeting.id]);

    io.to(meeting.token).emit('meeting-ended');

    res.json({ ok: true });
  } catch (error) {
    console.error('Failed to end meeting', error);
    res.status(500).json({ ok: false, message: TEXT.meetingEndFailed });
  }
});

app.get('/api/messages/:token', async (req, res) => {
  try {
    const meeting = await getMeetingByToken(req.params.token);
    if (!meeting) {
      return res.status(404).json({ ok: false, message: TEXT.meetingNotFound });
    }

    const messages = await allAsync(
      'SELECT sender, text, ts FROM messages WHERE meeting_id = ? ORDER BY id ASC',
      [meeting.id],
    );

    res.json({ ok: true, messages });
  } catch (error) {
    console.error('Failed to fetch messages', error);
    res.status(500).json({ ok: false, message: TEXT.messagesFetchFailed });
  }
});

async function fetchRecentMessages(meetingId, limit = ASSISTANT_MAX_HISTORY) {
  return allAsync(
    'SELECT sender, text FROM messages WHERE meeting_id = ? ORDER BY id DESC LIMIT ?',
    [meetingId, limit],
  ).then((rows) => rows.reverse());
}

async function performWebSearch(query) {
  if (!ASSISTANT_SEARCH_ENABLED) return null;
  try {
    const url = new URL('https://api.duckduckgo.com/');
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('no_html', '1');
    url.searchParams.set('skip_disambig', '1');
    const response = await fetch(url.toString());
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    const snippets = [];
    if (data.AbstractText) {
      snippets.push(data.AbstractText);
    }
    if (Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics) {
        if (topic && typeof topic.Text === 'string') {
          snippets.push(topic.Text);
        } else if (topic && Array.isArray(topic.Topics)) {
          for (const nested of topic.Topics) {
            if (nested && typeof nested.Text === 'string') {
              snippets.push(nested.Text);
            }
          }
        }
        if (snippets.length >= 5) break;
      }
    }
    if (!snippets.length) {
      return null;
    }
    return snippets.slice(0, 5).map((snippet, index) => `${index + 1}. ${snippet}`).join('\n');
  } catch (error) {
    console.error('performWebSearch error', error);
    return null;
  }
}

async function buildAssistantMessages(meetingId, prompt, { searchSummary } = {}) {
  const history = await fetchRecentMessages(meetingId, ASSISTANT_MAX_HISTORY);
  const messages = [];
  if (ASSISTANT_SYSTEM_PROMPT) {
    messages.push({ role: 'system', content: ASSISTANT_SYSTEM_PROMPT });
  }
  for (const row of history) {
    const role = row.sender === ASSISTANT_NAME ? 'assistant' : 'user';
    messages.push({ role, content: `${row.sender}: ${row.text}` });
  }
  if (searchSummary) {
    messages.push({
      role: 'system',
      content: `Real-time web search summary:
${searchSummary}`,
    });
  }
  messages.push({ role: 'user', content: prompt });
  return messages;
}

async function streamAssistantResponse({
  meetingId,
  meetingToken,
  prompt,
  requestId,
  withSearch,
}) {
  const context = { searchSummary: null };
  if (withSearch) {
    context.searchSummary = await performWebSearch(prompt);
  }
  const messages = await buildAssistantMessages(meetingId, prompt, context);
  const body = JSON.stringify({
    model: ASSISTANT_MODEL,
    stream: true,
    temperature: 0.4,
    messages,
  });

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body,
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';
  let doneStreaming = false;

  while (!doneStreaming) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const segments = buffer.split('

');
    buffer = segments.pop();
    for (const segment of segments) {
      const lines = segment.split('
').filter(Boolean);
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') {
          doneStreaming = true;
          break;
        }
        try {
          const parsed = JSON.parse(payload);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta;
            io.to(meetingToken).emit('assistant-chunk', {
              requestId,
              delta,
            });
          }
        } catch (error) {
          console.error('Failed to parse assistant chunk', error);
        }
      }
    }
  }

  fullText = fullText.trim();
  if (!fullText) {
    throw new Error('Assistant response empty');
  }

  const timestamp = new Date().toISOString();
  await runAsync(
    'INSERT INTO messages (meeting_id, sender, text, ts) VALUES (?, ?, ?, ?)',
    [meetingId, ASSISTANT_NAME, fullText, timestamp],
  );

  io.to(meetingToken).emit('assistant-complete', {
    requestId,
    text: fullText,
    ts: timestamp,
    name: ASSISTANT_NAME,
  });

  io.to(meetingToken).emit('message', {
    sender: ASSISTANT_NAME,
    text: fullText,
    ts: timestamp,
    requestId,
  });
}

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
        socket.emit('join-error', { message: TEXT.displayNameRequired });
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
      message: TEXT.meetingFull,
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

const roomSockets = io.sockets.adapter.rooms.get(meeting.token) || new Set();
const peerSummaries = [];
for (const socketId of roomSockets) {
  const peerSocket = io.sockets.sockets.get(socketId);
  if (peerSocket && peerSocket.data?.meetingToken === meeting.token) {
    peerSummaries.push({
      socketId,
      name: peerSocket.data.name,
    });
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
  peers: peerSummaries,
  isHost,
  self: nameToUse,
});

socket.to(meeting.token).emit('participant-joined', { name: nameToUse, socketId: socket.id });
    } catch (error) {
      if (error.status) {
        socket.emit('join-error', { message: error.message });
      } else {
        console.error('join-room error', error);
        socket.emit('join-error', { message: TEXT.joinFailed });
      }
    }
  });

  socket.on('chat-message', async ({ text }) => {
    if (!socket.data.meetingId || !socket.data.name) {
      socket.emit('chat-error', { message: TEXT.chatJoinRequired });
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
      socket.emit('chat-error', { message: TEXT.chatSendFailed });
    }
  });

  socket.on('assistant-query', async ({ prompt, requestId, withSearch }) => {
    const trimmed = (prompt || '').trim();
    const id = requestId || crypto.randomBytes(8).toString('hex');

    if (!socket.data.meetingId || !socket.data.name) {
      socket.emit('assistant-error', { requestId: id, message: TEXT.chatJoinRequired });
      return;
    }

    if (!socket.data.isHost) {
      socket.emit('assistant-error', { requestId: id, message: TEXT.assistantHostOnly });
      return;
    }

    if (!trimmed) {
      socket.emit('assistant-error', { requestId: id, message: TEXT.assistantNoPrompt });
      return;
    }

    if (!OPENAI_API_KEY) {
      socket.emit('assistant-error', { requestId: id, message: TEXT.assistantDisabled });
      return;
    }

    const shouldSearch =
      typeof withSearch === 'boolean'
        ? withSearch && ASSISTANT_SEARCH_ENABLED
        : ASSISTANT_SEARCH_ENABLED;

    io.to(socket.data.meetingToken).emit('assistant-start', {
      requestId: id,
      name: ASSISTANT_NAME,
      from: socket.data.name,
      prompt: trimmed,
    });

    try {
      await streamAssistantResponse({
        meetingId: socket.data.meetingId,
        meetingToken: socket.data.meetingToken,
        prompt: trimmed,
        requestId: id,
        withSearch: shouldSearch,
      });
    } catch (error) {
      console.error('assistant-query failure', error);
      io.to(socket.data.meetingToken).emit('assistant-error', {
        requestId: id,
        message: TEXT.assistantFailed,
      });
    }
  });


socket.on('webrtc-offer', ({ targetId, offer }) => {
  if (!socket.data.meetingToken || !targetId) return;
  const target = io.sockets.sockets.get(targetId);
  if (!target || target.data?.meetingToken !== socket.data.meetingToken) return;
  target.emit('webrtc-offer', {
    from: socket.id,
    name: socket.data.name,
    offer,
  });
});

socket.on('webrtc-answer', ({ targetId, answer }) => {
  if (!socket.data.meetingToken || !targetId) return;
  const target = io.sockets.sockets.get(targetId);
  if (!target || target.data?.meetingToken !== socket.data.meetingToken) return;
  target.emit('webrtc-answer', {
    from: socket.id,
    answer,
  });
});

socket.on('webrtc-candidate', ({ targetId, candidate }) => {
  if (!socket.data.meetingToken || !targetId || !candidate) return;
  const target = io.sockets.sockets.get(targetId);
  if (!target || target.data?.meetingToken !== socket.data.meetingToken) return;
  target.emit('webrtc-candidate', {
    from: socket.id,
    candidate,
  });
});


  socket.on('leave-meeting', async () => {
    if (!socket.data.meetingToken || !socket.data.name) return;
    socket.leave(socket.data.meetingToken);
    socket.to(socket.data.meetingToken).emit('participant-left', {
      name: socket.data.name,
      socketId: socket.id,
    });
  });

  socket.on('disconnect', () => {
    if (socket.data.meetingToken && socket.data.name) {
      socket.to(socket.data.meetingToken).emit('participant-left', {
        name: socket.data.name,
        socketId: socket.id,
      });
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
