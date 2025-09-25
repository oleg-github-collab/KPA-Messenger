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
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e6,
  transports: ['websocket', 'polling'],
  allowEIO3: true,
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

db.configure('busyTimeout', 30000);

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
    muted INTEGER NOT NULL DEFAULT 0,
    removed INTEGER NOT NULL DEFAULT 0,
    UNIQUE(meeting_id, name),
    FOREIGN KEY(meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER NOT NULL,
    sender TEXT NOT NULL,
    text TEXT NOT NULL,
    ts TEXT NOT NULL,
    target TEXT,
    anonymous INTEGER NOT NULL DEFAULT 0,
    kind TEXT NOT NULL DEFAULT 'chat',
    FOREIGN KEY(meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS emotion_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER NOT NULL,
    participant TEXT NOT NULL,
    emotion TEXT NOT NULL,
    intensity INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS participant_emotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER NOT NULL,
    participant TEXT NOT NULL,
    emotion TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(meeting_id, participant),
    FOREIGN KEY(meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS sociometric_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER NOT NULL,
    template TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL,
    host TEXT NOT NULL,
    status TEXT NOT NULL,
    started_at TEXT NOT NULL,
    ends_at TEXT,
    FOREIGN KEY(meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS sociometric_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_id INTEGER NOT NULL,
    participant TEXT NOT NULL,
    answers TEXT NOT NULL,
    submitted_at TEXT NOT NULL,
    UNIQUE(test_id, participant),
    FOREIGN KEY(test_id) REFERENCES sociometric_tests(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS sociometric_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER NOT NULL,
    participant TEXT NOT NULL,
    metrics TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(meeting_id, participant),
    FOREIGN KEY(meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS camera_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER NOT NULL,
    participant TEXT NOT NULL,
    facing_mode TEXT NOT NULL DEFAULT 'user',
    device_id TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(meeting_id, participant),
    FOREIGN KEY(meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS video_layouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER NOT NULL,
    participant TEXT NOT NULL,
    layout_type TEXT NOT NULL DEFAULT 'grid',
    current_page INTEGER NOT NULL DEFAULT 0,
    participants_per_page INTEGER NOT NULL DEFAULT 8,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(meeting_id, participant),
    FOREIGN KEY(meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS reconnect_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_token TEXT NOT NULL,
    participant TEXT NOT NULL,
    socket_id TEXT,
    last_seen TEXT NOT NULL DEFAULT (datetime('now')),
    connection_count INTEGER NOT NULL DEFAULT 1,
    UNIQUE(meeting_token, participant)
  )`);
});

function ensureColumn(table, columnSql) {
  db.run(`ALTER TABLE ${table} ADD COLUMN ${columnSql}`, (err) => {
    if (err && !String(err.message).includes('duplicate column name')) {
      console.error(`Failed to alter table ${table}`, err);
    }
  });
}

ensureColumn('participants', "muted INTEGER NOT NULL DEFAULT 0");
ensureColumn('participants', "removed INTEGER NOT NULL DEFAULT 0");
ensureColumn('messages', 'target TEXT');
ensureColumn('messages', 'anonymous INTEGER NOT NULL DEFAULT 0');
ensureColumn('messages', "kind TEXT NOT NULL DEFAULT 'chat'");

async function saveCameraSettings(meetingId, participant, facingMode, deviceId = null) {
  await runAsync(
    `INSERT INTO camera_settings (meeting_id, participant, facing_mode, device_id, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(meeting_id, participant)
     DO UPDATE SET facing_mode = excluded.facing_mode, device_id = excluded.device_id, updated_at = excluded.updated_at`,
    [meetingId, participant, facingMode, deviceId, new Date().toISOString()]
  );
}

async function getCameraSettings(meetingId, participant) {
  return getAsync(
    'SELECT facing_mode, device_id FROM camera_settings WHERE meeting_id = ? AND participant = ?',
    [meetingId, participant]
  );
}

async function saveVideoLayout(meetingId, participant, layoutType, currentPage, participantsPerPage) {
  await runAsync(
    `INSERT INTO video_layouts (meeting_id, participant, layout_type, current_page, participants_per_page, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(meeting_id, participant)
     DO UPDATE SET layout_type = excluded.layout_type, current_page = excluded.current_page,
                   participants_per_page = excluded.participants_per_page, updated_at = excluded.updated_at`,
    [meetingId, participant, layoutType, currentPage, participantsPerPage, new Date().toISOString()]
  );
}

async function getVideoLayout(meetingId, participant) {
  return getAsync(
    'SELECT layout_type, current_page, participants_per_page FROM video_layouts WHERE meeting_id = ? AND participant = ?',
    [meetingId, participant]
  );
}

async function updateReconnectSession(meetingToken, participant, socketId) {
  const timestamp = new Date().toISOString();
  await runAsync(
    `INSERT INTO reconnect_sessions (meeting_token, participant, socket_id, last_seen, connection_count)
     VALUES (?, ?, ?, ?, 1)
     ON CONFLICT(meeting_token, participant)
     DO UPDATE SET socket_id = excluded.socket_id, last_seen = excluded.last_seen,
                   connection_count = connection_count + 1`,
    [meetingToken, participant, socketId, timestamp]
  );
}

async function getReconnectSession(meetingToken, participant) {
  return getAsync(
    'SELECT socket_id, last_seen, connection_count FROM reconnect_sessions WHERE meeting_token = ? AND participant = ?',
    [meetingToken, participant]
  );
}

async function recordEmotionEvent({ meetingId, participant, emotion, intensity = 1 }) {
  if (!EMOTION_KEYS.includes(emotion)) {
    throw new Error('Unknown emotion key');
  }
  const timestamp = new Date().toISOString();
  await runAsync(
    'INSERT INTO emotion_events (meeting_id, participant, emotion, intensity, created_at) VALUES (?, ?, ?, ?, ?)',
    [meetingId, participant, emotion, intensity, timestamp],
  );
  await runAsync(
    `INSERT INTO participant_emotions (meeting_id, participant, emotion, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(meeting_id, participant)
     DO UPDATE SET emotion = excluded.emotion, updated_at = excluded.updated_at`,
    [meetingId, participant, emotion, timestamp],
  );
  await updateSociometricProfile(meetingId, participant);
  return timestamp;
}

async function fetchEmotionStats(meetingId) {
  const currentTotals = await allAsync(
    'SELECT emotion, COUNT(*) as count FROM participant_emotions WHERE meeting_id = ? GROUP BY emotion',
    [meetingId],
  );
  const totals = {};
  for (const row of currentTotals) {
    totals[row.emotion] = Number(row.count) || 0;
  }

  const perParticipantRows = await allAsync(
    'SELECT participant, emotion, updated_at FROM participant_emotions WHERE meeting_id = ?',
    [meetingId],
  );
  const perParticipant = perParticipantRows.map((row) => ({
    participant: row.participant,
    emotion: row.emotion,
    updatedAt: row.updated_at,
  }));

  const timelineRows = await allAsync(
    `SELECT participant, emotion, intensity, created_at
     FROM emotion_events
     WHERE meeting_id = ?
     ORDER BY id DESC
     LIMIT 120`,
    [meetingId],
  );
  timelineRows.reverse();

  return {
    totals,
    perParticipant,
    timeline: timelineRows,
  };
}

async function updateSociometricProfile(meetingId, participant) {
  const emotionRows = await allAsync(
    'SELECT emotion, COUNT(*) as count FROM emotion_events WHERE meeting_id = ? AND participant = ? GROUP BY emotion',
    [meetingId, participant],
  );
  const emotionTotals = {};
  for (const row of emotionRows) {
    emotionTotals[row.emotion] = Number(row.count) || 0;
  }

  const latestEmotion = await getAsync(
    'SELECT emotion, updated_at FROM participant_emotions WHERE meeting_id = ? AND participant = ?',
    [meetingId, participant],
  );

  const responseRows = await allAsync(
    `SELECT s.id as test_id, s.template, s.started_at, s.duration_seconds, r.answers, r.submitted_at
     FROM sociometric_responses r
     JOIN sociometric_tests s ON s.id = r.test_id
     WHERE s.meeting_id = ? AND r.participant = ?
     ORDER BY r.submitted_at DESC`,
    [meetingId, participant],
  );

  const testsTaken = responseRows.length;
  const latestResponse = responseRows[0]
    ? {
        testId: responseRows[0].test_id,
        template: responseRows[0].template,
        submittedAt: responseRows[0].submitted_at,
        answers: JSON.parse(responseRows[0].answers || '{}'),
      }
    : null;

  const profile = {
    participant,
    emotionTotals,
    latestEmotion: latestEmotion?.emotion || null,
    latestEmotionAt: latestEmotion?.updated_at || null,
    testsTaken,
    latestResponse,
    updatedAt: new Date().toISOString(),
  };

  await runAsync(
    `INSERT INTO sociometric_profiles (meeting_id, participant, metrics, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(meeting_id, participant)
     DO UPDATE SET metrics = excluded.metrics, updated_at = excluded.updated_at`,
    [meetingId, participant, JSON.stringify(profile), profile.updatedAt],
  );

  return profile;
}

async function fetchProfile(meetingId, participant) {
  const row = await getAsync(
    'SELECT metrics FROM sociometric_profiles WHERE meeting_id = ? AND participant = ?',
    [meetingId, participant],
  );
  if (row?.metrics) {
    try {
      return JSON.parse(row.metrics);
    } catch (error) {
      console.warn('Failed to parse profile metrics', error);
    }
  }
  return updateSociometricProfile(meetingId, participant);
}

async function createSociometricTest({ meetingId, host, template, durationSeconds }) {
  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + durationSeconds * 1000);
  const result = await runAsync(
    `INSERT INTO sociometric_tests (meeting_id, template, duration_seconds, host, status, started_at, ends_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      meetingId,
      template,
      durationSeconds,
      host,
      'active',
      startedAt.toISOString(),
      endsAt.toISOString(),
    ],
  );

  return {
    id: result.lastID,
    template,
    durationSeconds,
    startedAt: startedAt.toISOString(),
    endsAt: endsAt.toISOString(),
    status: 'active',
  };
}

async function broadcastRoster(meetingToken, meetingId) {
  const rosterRows = await allAsync(
    'SELECT name, muted, removed FROM participants WHERE meeting_id = ? ORDER BY joined_at ASC',
    [meetingId],
  );
  const roomState = meetingState.get(meetingToken);
  const roster = rosterRows
    .filter((row) => !row.removed)
    .map((row) => ({
      name: row.name,
      muted: Boolean(row.muted),
      present: roomState ? roomState.socketsByName.has(row.name) : false,
    }));
  io.to(meetingToken).emit('roster-update', roster);
  return roster;
}

async function updateTestStatus(testId, status) {
  const now = new Date().toISOString();
  await runAsync('UPDATE sociometric_tests SET status = ?, ends_at = ? WHERE id = ?', [status, now, testId]);
}

async function getTestById(testId) {
  return getAsync('SELECT * FROM sociometric_tests WHERE id = ?', [testId]);
}

async function submitTestResponse({ testId, participant, answers }) {
  const submittedAt = new Date().toISOString();
  await runAsync(
    `INSERT INTO sociometric_responses (test_id, participant, answers, submitted_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(test_id, participant)
     DO UPDATE SET answers = excluded.answers, submitted_at = excluded.submitted_at`,
    [testId, participant, JSON.stringify(answers || {}), submittedAt],
  );

  const testRow = await getTestById(testId);
  if (testRow) {
    await updateSociometricProfile(testRow.meeting_id, participant);
  }

  return submittedAt;
}

async function computeTestSummary(testId) {
  const responses = await allAsync('SELECT answers FROM sociometric_responses WHERE test_id = ?', [testId]);
  const summary = {};
  for (const row of responses) {
    let answers;
    try {
      answers = JSON.parse(row.answers || '{}');
    } catch (error) {
      answers = {};
    }
    for (const [questionId, value] of Object.entries(answers)) {
      if (!summary[questionId]) summary[questionId] = {};
      const bucket = summary[questionId];
      bucket[value] = (bucket[value] || 0) + 1;
    }
  }
  return {
    totalResponses: responses.length,
    perQuestion: summary,
  };
}

async function finalizeSociometricTest({ meetingToken, testId, reason = 'completed', status = 'completed' }) {
  clearActiveTest(meetingToken, testId);
  const testRow = await getTestById(testId);
  if (!testRow) {
    return null;
  }

  if (ACTIVE_TEST_STATUSES.has(testRow.status)) {
    await updateTestStatus(testId, status);
  }

  const summary = await computeTestSummary(testId);
  io.to(meetingToken).emit('sociometric-test-ended', { testId, status, reason });
  broadcastToHosts(meetingToken, 'sociometric-test-summary', {
    testId,
    status,
    reason,
    summary,
  });

  return summary;
}

app.use(express.json());
// Device detection middleware
function detectDevice(req, res, next) {
  const userAgent = req.headers['user-agent'] || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  req.isMobile = isMobile;
  next();
}

// Routes for adaptive interface
app.get('/chat.html', detectDevice, (req, res) => {
  if (req.isMobile) {
    res.redirect('/mobile.html' + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''));
  } else {
    res.redirect('/desktop.html' + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''));
  }
});

app.use(express.static(path.join(__dirname, 'public')));

const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS || 1000 * 60 * 60 * 24);
const EMOTION_KEYS = [
  'joy',
  'interest',
  'inspired',
  'calm',
  'surprised',
  'love',
  'proud',
  'confident',
  'anxious',
  'tense',
  'confused',
  'sad',
  'uncomfortable',
  'tired',
  'irritated',
];
const ACTIVE_TEST_STATUSES = new Set(['scheduled', 'active']);
const SOCIOMETRIC_TEMPLATES = {
  'pulse-3': { durationSeconds: 180 },
  'pulse-5': { durationSeconds: 300 },
  'resonance-5': { durationSeconds: 300 },
};

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
const meetingState = new Map();

function getMeetingState(token) {
  if (!meetingState.has(token)) {
    meetingState.set(token, {
      hostSockets: new Set(),
      socketsById: new Map(),
      socketsByName: new Map(),
      activeTests: new Map(),
    });
  }
  return meetingState.get(token);
}

function releaseMeetingState(token) {
  const state = meetingState.get(token);
  if (!state) return;
  if (!state.socketsById.size) {
    for (const { timeout } of state.activeTests.values()) {
      if (timeout) {
        clearTimeout(timeout);
      }
    }
    meetingState.delete(token);
  }
}

function broadcastToHosts(meetingToken, event, payload) {
  const state = meetingState.get(meetingToken);
  if (!state) return;
  for (const hostId of state.hostSockets) {
    const hostSocket = io.sockets.sockets.get(hostId);
    if (hostSocket) {
      hostSocket.emit(event, payload);
    }
  }
}

function registerActiveTest(meetingToken, testMeta) {
  const state = getMeetingState(meetingToken);
  const existing = state.activeTests.get(testMeta.id);
  if (existing?.timeout) {
    clearTimeout(existing.timeout);
  }
  const durationMs = Math.max(0, new Date(testMeta.endsAt).getTime() - Date.now());
  const timeout = setTimeout(async () => {
    try {
      await finalizeSociometricTest({ meetingToken, testId: testMeta.id, reason: 'timeout' });
    } catch (error) {
      console.error('Failed to finalize sociometric test on timeout', error);
    }
  }, durationMs).unref();
  state.activeTests.set(testMeta.id, { ...testMeta, timeout });
}

function clearActiveTest(meetingToken, testId) {
  const state = meetingState.get(meetingToken);
  if (!state) return;
  const record = state.activeTests.get(testId);
  if (record?.timeout) {
    clearTimeout(record.timeout);
  }
  state.activeTests.delete(testId);
}

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

  if (global.gc && sessionStore.size > 1000) {
    global.gc();
  }
}, 60 * 1000).unref();

setInterval(() => {
  const now = Date.now();
  const maxAge = 1000 * 60 * 60 * 6;

  for (const [token, state] of meetingState.entries()) {
    if (!state.socketsById.size) {
      meetingState.delete(token);
    }
  }
}, 300 * 1000).unref();

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

    const meetingUrl = `${req.protocol}://${req.get('host')}/mobile.html?room=${encodeURIComponent(
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

    const state = meetingState.get(meeting.token);
    if (state) {
      for (const testId of Array.from(state.activeTests.keys())) {
        try {
          await finalizeSociometricTest({
            meetingToken: meeting.token,
            testId,
            reason: 'meeting-ended',
            status: 'cancelled',
          });
        } catch (error) {
          console.error('Failed to finalize test on meeting end', error);
        }
      }
    }

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

    const requester = (req.query.self || '').trim();
    const session = authenticate(req);
    const isHost = Boolean(session && session.username === meeting.host);

    let messages;
    if (isHost) {
      messages = await allAsync(
        'SELECT sender, text, ts, target, anonymous, kind FROM messages WHERE meeting_id = ? ORDER BY id ASC',
        [meeting.id],
      );
    } else if (requester) {
      messages = await allAsync(
        `SELECT sender, text, ts, target, anonymous, kind
         FROM messages
         WHERE meeting_id = ?
           AND (target IS NULL OR target = ? OR sender = ?)
         ORDER BY id ASC`,
        [meeting.id, requester, requester],
      );
    } else {
      messages = [];
    }

    const formatted = messages.map((row) => {
      const direct = Boolean(row.target);
      const anonymous = Boolean(row.anonymous);
      const sender = anonymous && !isHost ? 'Anonymous' : row.sender;
      return {
        sender,
        actualSender: row.sender,
        text: row.text,
        ts: row.ts,
        target: row.target,
        anonymous,
        kind: row.kind || (direct ? 'direct' : 'chat'),
        isDirect: direct,
      };
    });

    res.json({ ok: true, messages: formatted });
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
    const segments = buffer.split('\n\n');
    buffer = segments.pop() || '';
    for (const segment of segments) {
      const lines = segment.split('\n').filter(Boolean);
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
  function unregisterSocket() {
    const token = socket.data.meetingToken;
    const name = socket.data.name;
    if (!token || !name) return;
    const state = meetingState.get(token);
    if (state) {
      state.socketsByName.delete(name);
      state.socketsById.delete(socket.id);
      state.hostSockets.delete(socket.id);
    }
    releaseMeetingState(token);
  }

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

      const participantsRows = await allAsync(
        'SELECT name, muted, removed FROM participants WHERE meeting_id = ?',
        [meeting.id],
      );

      const existingRecord = participantsRows.find((row) => row.name === nameToUse);
      if (existingRecord?.removed && !isHost) {
        socket.emit('join-error', { message: TEXT.meetingFull });
        return;
      }

      const activeCount = participantsRows.filter((row) => !row.removed).length;
      if (!existingRecord && activeCount >= meeting.max_participants) {
        socket.emit('join-error', { message: TEXT.meetingFull });
        return;
      }

      if (!existingRecord) {
        await runAsync(
          'INSERT INTO participants (meeting_id, name, muted, removed) VALUES (?, ?, 0, 0)',
          [meeting.id, nameToUse],
        );
      } else if (existingRecord.removed) {
        await runAsync('UPDATE participants SET removed = 0 WHERE meeting_id = ? AND name = ?', [
          meeting.id,
          nameToUse,
        ]);
      }

      if (meeting.status === 'pending') {
        await runAsync('UPDATE meetings SET status = ? WHERE id = ?', ['active', meeting.id]);
        meeting.status = 'active';
      }

      const rosterRows = await allAsync(
        'SELECT name, muted, removed FROM participants WHERE meeting_id = ? ORDER BY joined_at ASC',
        [meeting.id],
      );

      const activeRoster = rosterRows.filter((row) => !row.removed);
      const roster = activeRoster.map((row) => ({
        name: row.name,
        muted: Boolean(row.muted),
      }));

      const emotionRows = await allAsync(
        'SELECT participant, emotion FROM participant_emotions WHERE meeting_id = ?',
        [meeting.id],
      );
      const currentEmotions = {};
      for (const row of emotionRows) {
        currentEmotions[row.participant] = row.emotion;
      }

      const activeTests = await allAsync(
        `SELECT id, template, duration_seconds, status, started_at, ends_at
         FROM sociometric_tests
         WHERE meeting_id = ? AND status IN ('scheduled', 'active')`,
        [meeting.id],
      );

      const cameraSettings = await getCameraSettings(meeting.id, nameToUse);
      const videoLayout = await getVideoLayout(meeting.id, nameToUse);
      const reconnectInfo = await getReconnectSession(meeting.token, nameToUse);

      for (const test of activeTests) {
        if (test.status === 'active' && test.ends_at) {
          registerActiveTest(meeting.token, {
            id: test.id,
            template: test.template,
            durationSeconds: test.duration_seconds,
            startedAt: test.started_at,
            endsAt: test.ends_at,
            status: test.status,
          });
        }
      }

      const roomState = getMeetingState(meeting.token);
      const existingSocketId = roomState.socketsByName.get(nameToUse);
      if (existingSocketId && existingSocketId !== socket.id) {
        const existingSocket = io.sockets.sockets.get(existingSocketId);
        if (existingSocket) {
          existingSocket.emit('session-replaced');
          existingSocket.disconnect(true);
        }
        roomState.socketsById.delete(existingSocketId);
        roomState.socketsByName.delete(nameToUse);
        roomState.hostSockets.delete(existingSocketId);
      }

      socket.join(meeting.token);
      socket.data.meetingId = meeting.id;
      socket.data.meetingToken = meeting.token;
      socket.data.name = nameToUse;
      socket.data.isHost = isHost;
      socket.data.muted = Boolean(existingRecord?.muted);

      await updateReconnectSession(meeting.token, nameToUse, socket.id);

      roomState.socketsById.set(socket.id, {
        name: nameToUse,
        meetingId: meeting.id,
        isHost,
        muted: Boolean(existingRecord?.muted),
      });
      roomState.socketsByName.set(nameToUse, socket.id);
      if (isHost) {
        roomState.hostSockets.add(socket.id);
      }

      const peers = [];
      for (const [peerId, meta] of roomState.socketsById.entries()) {
        if (peerId === socket.id) continue;
        if (meta.meetingId !== meeting.id) continue;
        peers.push({
          socketId: peerId,
          name: meta.name,
          muted: Boolean(meta.muted),
        });
      }

      socket.emit('meeting-joined', {
        meeting: {
          token: meeting.token,
          host: meeting.host,
          status: meeting.status,
          maxParticipants: meeting.max_participants,
        },
        roster,
        peers,
        isHost,
        self: nameToUse,
        muted: Boolean(existingRecord?.muted),
        emotions: currentEmotions,
        activeTests: activeTests.map((test) => ({
          id: test.id,
          template: test.template,
          durationSeconds: test.duration_seconds,
          status: test.status,
          startedAt: test.started_at,
          endsAt: test.ends_at,
        })),
        cameraSettings: cameraSettings || { facing_mode: 'user', device_id: null },
        videoLayout: videoLayout || { layout_type: 'auto', current_page: 0, participants_per_page: 8 },
        reconnectInfo: reconnectInfo || { connection_count: 1 },
      });

      socket.to(meeting.token).emit('participant-joined', {
        name: nameToUse,
        socketId: socket.id,
        muted: Boolean(existingRecord?.muted),
      });

      await broadcastRoster(meeting.token, meeting.id);

      if (existingRecord?.muted) {
        socket.emit('moderation', { type: 'force-mute', enforced: true });
      }
    } catch (error) {
      if (error.status) {
        socket.emit('join-error', { message: error.message });
      } else {
        console.error('join-room error', error);
        socket.emit('join-error', { message: TEXT.joinFailed });
      }
    }
  });

  socket.on('chat-message', async ({ text, target, anonymous, metadata }) => {
    if (!socket.data.meetingId || !socket.data.name) {
      socket.emit('chat-error', { message: TEXT.chatJoinRequired });
      return;
    }

    const trimmed = (text || '').trim();
    if (!trimmed) return;

    const targetName = typeof target === 'string' && target.trim() ? target.trim() : null;
    const isAnonymous = Boolean(anonymous);
    const kind = targetName ? 'direct' : 'chat';
    const roomState = getMeetingState(socket.data.meetingToken);
    const targetSocketId = targetName ? roomState.socketsByName.get(targetName) : null;

    if (targetName && !targetSocketId) {
      socket.emit('chat-error', { message: 'Participant is not currently available.', target: targetName });
      return;
    }

    const timestamp = new Date().toISOString();

    try {
      await runAsync(
        'INSERT INTO messages (meeting_id, sender, text, ts, target, anonymous, kind) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          socket.data.meetingId,
          socket.data.name,
          trimmed,
          timestamp,
          targetName,
          isAnonymous ? 1 : 0,
          kind,
        ],
      );

      const payload = {
        sender: isAnonymous ? 'Anonymous' : socket.data.name,
        actualSender: socket.data.name,
        text: trimmed,
        ts: timestamp,
        target: targetName,
        anonymous: isAnonymous,
        kind,
        metadata: metadata || null,
      };

      if (targetName) {
        socket.emit('message', payload);
        if (targetSocketId) {
          const targetSocket = io.sockets.sockets.get(targetSocketId);
          targetSocket?.emit('message', payload);
        }
        for (const hostId of roomState.hostSockets || []) {
          if (hostId === socket.id) continue;
          if (hostId === targetSocketId) continue;
          const hostSocket = io.sockets.sockets.get(hostId);
          hostSocket?.emit('message', payload);
        }
      } else {
        io.to(socket.data.meetingToken).emit('message', payload);
      }
    } catch (error) {
      console.error('Failed to persist message', error);
      socket.emit('chat-error', { message: TEXT.chatSendFailed });
    }
  });

  socket.on('moderation-action', async ({ target, action }) => {
    if (!socket.data.meetingId || !socket.data.isHost) {
      return;
    }

    const targetName = typeof target === 'string' ? target.trim() : '';
    if (!targetName || targetName === socket.data.name) {
      return;
    }

    const meetingToken = socket.data.meetingToken;
    const meetingId = socket.data.meetingId;
    const roomState = getMeetingState(meetingToken);
    const targetSocketId = roomState.socketsByName.get(targetName);
    const targetSocket = targetSocketId ? io.sockets.sockets.get(targetSocketId) : null;

    try {
      if (action === 'mute') {
        await runAsync('UPDATE participants SET muted = 1 WHERE meeting_id = ? AND name = ?', [
          meetingId,
          targetName,
        ]);
        if (roomState.socketsById.has(targetSocketId)) {
          roomState.socketsById.get(targetSocketId).muted = true;
        }
        if (targetSocket) {
          targetSocket.data.muted = true;
        }
        targetSocket?.emit('moderation', {
          type: 'force-mute',
          enforced: true,
          by: socket.data.name,
        });
        io.to(meetingToken).emit('moderation-state', { target: targetName, action: 'mute' });
        await broadcastRoster(meetingToken, meetingId);
      } else if (action === 'unmute') {
        await runAsync('UPDATE participants SET muted = 0 WHERE meeting_id = ? AND name = ?', [
          meetingId,
          targetName,
        ]);
        if (roomState.socketsById.has(targetSocketId)) {
          roomState.socketsById.get(targetSocketId).muted = false;
        }
        if (targetSocket) {
          targetSocket.data.muted = false;
        }
        targetSocket?.emit('moderation', {
          type: 'force-unmute',
          by: socket.data.name,
        });
        io.to(meetingToken).emit('moderation-state', { target: targetName, action: 'unmute' });
        await broadcastRoster(meetingToken, meetingId);
      } else if (action === 'remove') {
        await runAsync('UPDATE participants SET removed = 1 WHERE meeting_id = ? AND name = ?', [
          meetingId,
          targetName,
        ]);
        if (targetSocket) {
          targetSocket.emit('moderation', { type: 'force-leave', reason: 'removed' });
          targetSocket.leave(meetingToken);
          targetSocket.disconnect(true);
        }
        roomState.socketsByName.delete(targetName);
        if (targetSocketId) {
          roomState.socketsById.delete(targetSocketId);
          roomState.hostSockets.delete(targetSocketId);
        }
        io.to(meetingToken).emit('participant-removed', { name: targetName });
        await broadcastRoster(meetingToken, meetingId);
      }
    } catch (error) {
      console.error('moderation-action failed', error);
      socket.emit('moderation-error', { message: 'Moderation action failed', target: targetName });
    }
  });

  socket.on('emotion-update', async ({ emotion, intensity }) => {
    if (!socket.data.meetingId || !socket.data.name) return;
    const key = typeof emotion === 'string' ? emotion.trim() : '';
    if (!EMOTION_KEYS.includes(key)) return;
    const value = Number.isFinite(Number(intensity)) ? Math.max(1, Math.min(5, Number(intensity))) : 1;

    try {
      const timestamp = await recordEmotionEvent({
        meetingId: socket.data.meetingId,
        participant: socket.data.name,
        emotion: key,
        intensity: value,
      });
      io.to(socket.data.meetingToken).emit('emotion-state-update', {
        participant: socket.data.name,
        emotion: key,
        timestamp,
      });
      const stats = await fetchEmotionStats(socket.data.meetingId);
      broadcastToHosts(socket.data.meetingToken, 'emotion-stats', {
        updatedBy: socket.data.name,
        emotion: key,
        timestamp,
        stats,
      });
      socket.emit('emotion-ack', { emotion: key, timestamp });
    } catch (error) {
      console.error('emotion-update failed', error);
      socket.emit('emotion-error', { message: 'Unable to record emotion.' });
    }
  });

  socket.on('request-emotion-stats', async () => {
    if (!socket.data.meetingId || !socket.data.isHost) return;
    try {
      const stats = await fetchEmotionStats(socket.data.meetingId);
      socket.emit('emotion-stats', { stats });
    } catch (error) {
      console.error('request-emotion-stats failed', error);
      socket.emit('emotion-error', { message: 'Failed to load emotional metrics.' });
    }
  });

  socket.on('start-sociometric-test', async ({ templateId, durationSeconds }) => {
    if (!socket.data.meetingId || !socket.data.isHost) return;
    const template = typeof templateId === 'string' ? templateId.trim() : '';
    if (!SOCIOMETRIC_TEMPLATES[template]) {
      socket.emit('sociometric-test-error', { message: 'Unknown test template.' });
      return;
    }

    const roomState = getMeetingState(socket.data.meetingToken);
    if (roomState.activeTests.size) {
      socket.emit('sociometric-test-error', { message: 'Another test is already running.' });
      return;
    }

    const templateDuration = SOCIOMETRIC_TEMPLATES[template].durationSeconds;
    const requested = Number.isFinite(Number(durationSeconds)) ? Number(durationSeconds) : templateDuration;
    const duration = Math.max(60, Math.min(900, requested || templateDuration));

    try {
      const test = await createSociometricTest({
        meetingId: socket.data.meetingId,
        host: socket.data.name,
        template,
        durationSeconds: duration,
      });
      registerActiveTest(socket.data.meetingToken, test);
      io.to(socket.data.meetingToken).emit('sociometric-test-started', {
        id: test.id,
        template,
        durationSeconds: test.durationSeconds,
        startedAt: test.startedAt,
        endsAt: test.endsAt,
      });
    } catch (error) {
      console.error('start-sociometric-test failed', error);
      socket.emit('sociometric-test-error', { message: 'Unable to start test.' });
    }
  });

  socket.on('submit-sociometric-test', async ({ testId, answers }) => {
    if (!socket.data.meetingId || !socket.data.name) return;
    const id = Number(testId);
    if (!Number.isInteger(id)) return;

    const roomState = getMeetingState(socket.data.meetingToken);
    const activeRecord = roomState.activeTests.get(id);
    if (!activeRecord) {
      socket.emit('sociometric-test-error', { message: 'Test is no longer active.', testId: id });
      return;
    }

    try {
      const submittedAt = await submitTestResponse({
        testId: id,
        participant: socket.data.name,
        answers: answers || {},
      });
      socket.emit('sociometric-test-ack', { testId: id, submittedAt });
    } catch (error) {
      console.error('submit-sociometric-test failed', error);
      socket.emit('sociometric-test-error', { message: 'Unable to submit responses.', testId: id });
    }
  });

  socket.on('cancel-sociometric-test', async ({ testId }) => {
    if (!socket.data.meetingId || !socket.data.isHost) return;
    const id = Number(testId);
    if (!Number.isInteger(id)) return;
    try {
      await finalizeSociometricTest({
        meetingToken: socket.data.meetingToken,
        testId: id,
        reason: 'host-cancelled',
        status: 'cancelled',
      });
    } catch (error) {
      console.error('cancel-sociometric-test failed', error);
      socket.emit('sociometric-test-error', { message: 'Unable to cancel test.', testId: id });
    }
  });

  socket.on('request-test-summary', async ({ testId }) => {
    if (!socket.data.meetingId || !socket.data.isHost) return;
    const id = Number(testId);
    if (!Number.isInteger(id)) return;
    try {
      const summary = await computeTestSummary(id);
      socket.emit('sociometric-test-summary', { testId: id, summary });
    } catch (error) {
      console.error('request-test-summary failed', error);
      socket.emit('sociometric-test-error', { message: 'Unable to load test summary.', testId: id });
    }
  });

  socket.on('request-profile', async ({ participant }) => {
    if (!socket.data.meetingId || !socket.data.name) return;
    const requested = typeof participant === 'string' ? participant.trim() : '';
    const target = socket.data.isHost && requested ? requested : socket.data.name;
    if (!target) return;
    if (!socket.data.isHost && requested && requested !== socket.data.name) {
      return;
    }

    try {
      const profile = await fetchProfile(socket.data.meetingId, target);
      socket.emit('profile-data', { participant: target, profile });
    } catch (error) {
      console.error('request-profile failed', error);
      socket.emit('profile-error', { message: 'Unable to load profile.', participant: target });
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

socket.on('camera-flip', async ({ facingMode }) => {
  if (!socket.data.meetingId || !socket.data.name) return;
  try {
    await saveCameraSettings(socket.data.meetingId, socket.data.name, facingMode);
  } catch (error) {
    console.error('camera-flip save error', error);
  }
});

socket.on('video-layout-change', async ({ layoutType, currentPage, participantsPerPage }) => {
  if (!socket.data.meetingId || !socket.data.name) return;
  try {
    await saveVideoLayout(socket.data.meetingId, socket.data.name, layoutType, currentPage, participantsPerPage);
  } catch (error) {
    console.error('video-layout-change save error', error);
  }
});


  socket.on('leave-meeting', async () => {
    if (!socket.data.meetingToken || !socket.data.name) return;
    const meetingToken = socket.data.meetingToken;
    const meetingId = socket.data.meetingId;
    socket.leave(meetingToken);
    unregisterSocket();
    socket.to(meetingToken).emit('participant-left', {
      name: socket.data.name,
      socketId: socket.id,
    });
    if (meetingId) {
      broadcastRoster(meetingToken, meetingId).catch((error) =>
        console.error('Failed to broadcast roster on leave', error),
      );
    }
  });

  socket.on('disconnect', () => {
    if (socket.data.meetingToken && socket.data.name) {
      const meetingToken = socket.data.meetingToken;
      const meetingId = socket.data.meetingId;
      unregisterSocket();
      socket.to(meetingToken).emit('participant-left', {
        name: socket.data.name,
        socketId: socket.id,
      });
      if (meetingId) {
        broadcastRoster(meetingToken, meetingId).catch((error) =>
          console.error('Failed to broadcast roster on disconnect', error),
        );
      }
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
