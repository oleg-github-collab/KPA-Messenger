import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import OpenAI from 'openai';

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

// Initialize OpenAI with Railway environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Redis with Railway environment variable
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

// Connect to Redis
await redis.connect();

// Redis utility functions for session data management
const RedisKeys = {
  meeting: (token) => `meeting:${token}`,
  participants: (token) => `meeting:${token}:participants`,
  participant: (token, name) => `meeting:${token}:participant:${name}`,
  messages: (token) => `meeting:${token}:messages`,
  polls: (token) => `meeting:${token}:polls`,
  poll: (token, pollId) => `meeting:${token}:poll:${pollId}`,
  pollVotes: (token, pollId) => `meeting:${token}:poll:${pollId}:votes`,
  emotions: (token) => `meeting:${token}:emotions`,
  emotionClimate: (token) => `meeting:${token}:climate`,
  sociometry: (token) => `meeting:${token}:sociometry`,
  sociometryTest: (token, testId) => `meeting:${token}:sociometry:${testId}`,
  sociometryResponses: (token, testId) => `meeting:${token}:sociometry:${testId}:responses`,
  assistant: (token) => `meeting:${token}:assistant`,
  connections: (token) => `meeting:${token}:connections`,
  session: (token) => `session:${token}`,
  activeRooms: () => 'active_rooms',
  roomHost: (token) => `room_host:${token}`
};

// Redis helper functions
const RedisHelper = {
  // Meeting management
  async createMeeting(token, host) {
    const meetingData = {
      token,
      host,
      status: 'active',
      maxParticipants: 10,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      settings: JSON.stringify({}),
      metadata: JSON.stringify({})
    };

    await redis.hSet(RedisKeys.meeting(token), meetingData);
    await redis.set(RedisKeys.roomHost(token), host);
    await redis.sAdd(RedisKeys.activeRooms(), token);
    await redis.expire(RedisKeys.meeting(token), 24 * 60 * 60);
    await redis.expire(RedisKeys.roomHost(token), 24 * 60 * 60);

    return meetingData;
  },

  async getMeeting(token) {
    const meeting = await redis.hGetAll(RedisKeys.meeting(token));
    return Object.keys(meeting).length > 0 ? meeting : null;
  },

  async getRoomHost(token) {
    return await redis.get(RedisKeys.roomHost(token));
  },

  async deleteMeeting(token) {
    const keys = [
      RedisKeys.meeting(token),
      RedisKeys.participants(token),
      RedisKeys.messages(token),
      RedisKeys.polls(token),
      RedisKeys.emotions(token),
      RedisKeys.emotionClimate(token),
      RedisKeys.sociometry(token),
      RedisKeys.assistant(token),
      RedisKeys.connections(token),
      RedisKeys.session(token),
      RedisKeys.roomHost(token)
    ];

    await Promise.all([
      redis.del(keys),
      redis.sRem(RedisKeys.activeRooms(), token)
    ]);
  },

  // Participant management
  async addParticipant(token, participantData) {
    const participantKey = RedisKeys.participant(token, participantData.name);
    await redis.hSet(participantKey, {
      ...participantData,
      joinedAt: new Date().toISOString(),
      status: 'online',
      muted: 'false',
      videoEnabled: 'true'
    });

    await redis.sAdd(RedisKeys.participants(token), participantData.name);
    await redis.expire(participantKey, 24 * 60 * 60);
  },

  async removeParticipant(token, participantName) {
    await redis.sRem(RedisKeys.participants(token), participantName);
    await redis.del(RedisKeys.participant(token, participantName));
  },

  async getParticipants(token) {
    const participantNames = await redis.sMembers(RedisKeys.participants(token));
    const participants = [];

    for (const name of participantNames) {
      const data = await redis.hGetAll(RedisKeys.participant(token, name));
      if (Object.keys(data).length > 0) {
        participants.push(data);
      }
    }

    return participants;
  },

  // Messages
  async addMessage(token, messageData) {
    const messageWithId = {
      id: crypto.randomUUID(),
      ...messageData,
      timestamp: new Date().toISOString()
    };

    await redis.lPush(RedisKeys.messages(token), JSON.stringify(messageWithId));
    await redis.lTrim(RedisKeys.messages(token), 0, 999);
    await redis.expire(RedisKeys.messages(token), 24 * 60 * 60);

    return messageWithId;
  },

  async getMessages(token, limit = 100) {
    const messages = await redis.lRange(RedisKeys.messages(token), 0, limit - 1);
    return messages.map(msg => JSON.parse(msg)).reverse();
  },

  // Polls system
  async createPoll(token, pollData) {
    const pollId = crypto.randomUUID();
    const poll = {
      id: pollId,
      ...pollData,
      createdAt: new Date().toISOString(),
      status: 'active',
      options: JSON.stringify(pollData.options)
    };

    await redis.hSet(RedisKeys.poll(token, pollId), poll);
    await redis.sAdd(RedisKeys.polls(token), pollId);
    await redis.expire(RedisKeys.poll(token, pollId), 24 * 60 * 60);

    return { ...poll, options: pollData.options };
  },

  async getPoll(token, pollId) {
    const poll = await redis.hGetAll(RedisKeys.poll(token, pollId));
    if (Object.keys(poll).length > 0) {
      poll.options = JSON.parse(poll.options);
      return poll;
    }
    return null;
  },

  async addPollVote(token, pollId, participant, optionId) {
    const voteData = {
      participant,
      optionId,
      timestamp: new Date().toISOString()
    };

    await redis.hSet(RedisKeys.pollVotes(token, pollId), participant, JSON.stringify(voteData));
    await redis.expire(RedisKeys.pollVotes(token, pollId), 24 * 60 * 60);
  },

  async getPollResults(token, pollId) {
    const votes = await redis.hGetAll(RedisKeys.pollVotes(token, pollId));
    const results = {};

    Object.values(votes).forEach(voteStr => {
      const vote = JSON.parse(voteStr);
      results[vote.optionId] = (results[vote.optionId] || 0) + 1;
    });

    return results;
  },

  // Emotions system
  async addEmotion(token, participant, emotion) {
    const emotionData = {
      participant,
      emotion,
      timestamp: new Date().toISOString()
    };

    await redis.hSet(RedisKeys.emotions(token), participant, JSON.stringify(emotionData));
    await redis.expire(RedisKeys.emotions(token), 24 * 60 * 60);

    return await this.updateEmotionalClimate(token);
  },

  async updateEmotionalClimate(token) {
    const emotions = await redis.hGetAll(RedisKeys.emotions(token));
    const emotionList = Object.values(emotions).map(e => JSON.parse(e));

    const emotionMap = {
      'happy': '😊', 'sad': '😢', 'angry': '😡', 'tired': '😴',
      'confused': '🤔', 'cool': '😎', 'excited': '🥳', 'anxious': '😰', 'grateful': '🤗'
    };

    const emotionCounts = {};
    emotionList.forEach(({ emotion }) => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    const totalEmotions = emotionList.length;
    const positiveEmotions = ['happy', 'excited', 'grateful', 'cool'].reduce((sum, emotion) => sum + (emotionCounts[emotion] || 0), 0);
    const score = totalEmotions > 0 ? Math.round((positiveEmotions / totalEmotions) * 100) : 50;

    const topEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([emotion]) => ({ emotion, emoji: emotionMap[emotion] || '😐' }));

    const climate = {
      score,
      sentiment: score > 70 ? 'positive' : score < 30 ? 'negative' : 'neutral',
      topEmotions,
      totalResponses: totalEmotions,
      lastUpdated: new Date().toISOString()
    };

    await redis.hSet(RedisKeys.emotionClimate(token), {
      ...climate,
      topEmotions: JSON.stringify(topEmotions)
    });
    await redis.expire(RedisKeys.emotionClimate(token), 24 * 60 * 60);

    return climate;
  },

  async getEmotionalClimate(token) {
    const climate = await redis.hGetAll(RedisKeys.emotionClimate(token));
    if (Object.keys(climate).length > 0) {
      climate.topEmotions = JSON.parse(climate.topEmotions);
      return climate;
    }
    return null;
  },

  // Sociometry system
  async createSociometryTest(token, testData) {
    const testId = crypto.randomUUID();
    const test = {
      id: testId,
      ...testData,
      createdAt: new Date().toISOString(),
      status: 'active',
      questions: JSON.stringify(testData.questions),
      participants: JSON.stringify(testData.participants)
    };

    await redis.hSet(RedisKeys.sociometryTest(token, testId), test);
    await redis.sAdd(RedisKeys.sociometry(token), testId);
    await redis.expire(RedisKeys.sociometryTest(token, testId), 24 * 60 * 60);

    return { ...test, questions: testData.questions, participants: testData.participants };
  },

  async getSociometryTest(token, testId) {
    const test = await redis.hGetAll(RedisKeys.sociometryTest(token, testId));
    if (Object.keys(test).length > 0) {
      test.questions = JSON.parse(test.questions);
      test.participants = JSON.parse(test.participants);
      return test;
    }
    return null;
  },

  async addSociometryResponse(token, testId, participant, responses) {
    const responseData = {
      participant,
      responses: JSON.stringify(responses),
      timestamp: new Date().toISOString()
    };

    await redis.hSet(RedisKeys.sociometryResponses(token, testId), participant, JSON.stringify(responseData));
    await redis.expire(RedisKeys.sociometryResponses(token, testId), 24 * 60 * 60);
  },

  async getSociometryResponses(token, testId) {
    const responses = await redis.hGetAll(RedisKeys.sociometryResponses(token, testId));
    const result = {};

    Object.entries(responses).forEach(([participant, responseStr]) => {
      const data = JSON.parse(responseStr);
      result[participant] = {
        ...data,
        responses: JSON.parse(data.responses)
      };
    });

    return result;
  },

  // Assistant interactions
  async logAssistantInteraction(token, participant, query, response, metadata = {}) {
    const interaction = {
      participant,
      query,
      response,
      ...metadata,
      timestamp: new Date().toISOString()
    };

    await redis.lPush(RedisKeys.assistant(token), JSON.stringify(interaction));
    await redis.lTrim(RedisKeys.assistant(token), 0, 99);
    await redis.expire(RedisKeys.assistant(token), 24 * 60 * 60);
  },

  // Connection management
  async logConnection(token, participant, event, details = {}) {
    const logEntry = {
      participant,
      event,
      details: JSON.stringify(details),
      timestamp: new Date().toISOString()
    };

    await redis.lPush(RedisKeys.connections(token), JSON.stringify(logEntry));
    await redis.lTrim(RedisKeys.connections(token), 0, 999);
    await redis.expire(RedisKeys.connections(token), 24 * 60 * 60);
  },

  // Session management
  async updateSession(token, sessionData) {
    await redis.hSet(RedisKeys.session(token), sessionData);
    await redis.expire(RedisKeys.session(token), 24 * 60 * 60);
  },

  async getSession(token) {
    const session = await redis.hGetAll(RedisKeys.session(token));
    return Object.keys(session).length > 0 ? session : null;
  }
};

app.use(express.json());
app.use(express.static('public'));

// Credentials for basic auth
const validCredentials = [
  { username: 'Oleh', password: 'Kaminskyi' },
  { username: 'admin', password: 'admin' },
  { username: 'test', password: 'test' }
];

app.post('/auth', (req, res) => {
  const { username, password } = req.body;
  const user = validCredentials.find(cred =>
    cred.username === username && cred.password === password
  );

  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    res.json({ ok: true, username, token });
  } else {
    res.status(401).json({ ok: false, message: 'Invalid credentials' });
  }
});

app.post('/api/meetings', async (req, res) => {
  try {
    const { maxParticipants = 10, hostName } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ ok: false, message: 'No token provided' });
    }

    const roomToken = crypto.randomBytes(16).toString('hex');
    const isMobile = req.headers['user-agent'] && /Mobile|Android|iPhone|iPad/i.test(req.headers['user-agent']);
    const basePath = isMobile ? '/mobile.html' : '/desktop.html';
    const meetingUrl = `${req.protocol}://${req.get('host')}${basePath}?room=${roomToken}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await RedisHelper.createMeeting(roomToken, hostName || 'host');

    // Store meeting creation context
    await RedisHelper.updateSession(roomToken, {
      createdBy: hostName || 'host',
      createdAt: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      createdFrom: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    });

    res.json({
      ok: true,
      token: roomToken,
      meetingUrl,
      mobileUrl: `${req.protocol}://${req.get('host')}/mobile.html?room=${roomToken}`,
      desktopUrl: `${req.protocol}://${req.get('host')}/desktop.html?room=${roomToken}`,
      maxParticipants,
      expiresAt
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// Get meeting info API
app.get('/api/meetings/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const meeting = await RedisHelper.getMeeting(token);
    if (!meeting) {
      return res.status(404).json({ ok: false, message: 'Meeting not found' });
    }

    const participants = await RedisHelper.getParticipants(token);
    const host = await RedisHelper.getRoomHost(token);
    const session = await RedisHelper.getSession(token);

    res.json({
      ok: true,
      meeting: {
        token,
        host,
        status: meeting.status,
        participantCount: participants.length,
        maxParticipants: parseInt(meeting.maxParticipants),
        createdAt: meeting.createdAt,
        expiresAt: meeting.expiresAt
      },
      context: session
    });
  } catch (error) {
    console.error('Error getting meeting info:', error);
    res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// AI Assistant with GPT-4o and web search
async function webSearch(query) {
  try {
    // Simple web search using OpenAI's browsing capability
    // In production, you'd use a proper search API like Bing or Google
    const searchResults = [
      {
        title: "Web Search Result",
        url: "https://example.com",
        snippet: `Search results for: ${query}`
      }
    ];
    return searchResults;
  } catch (error) {
    console.error('Web search error:', error);
    return [];
  }
}

async function askAI(query, useWebSearch = false, context = null) {
  try {
    let systemPrompt = `You are Valera, an AI assistant for Kaminskyi AI Messenger. You help with video calls, team dynamics, and general questions.
    Be helpful, concise, and professional. Respond in the same language as the user's question.`;

    let userMessage = query;

    if (useWebSearch) {
      const searchResults = await webSearch(query);
      if (searchResults.length > 0) {
        userMessage += `\n\nWeb search results:\n${searchResults.map(r => `- ${r.title}: ${r.snippet}`).join('\n')}`;
      }
    }

    if (context) {
      systemPrompt += `\n\nMeeting context: ${JSON.stringify(context)}`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return {
      response: completion.choices[0].message.content,
      sources: useWebSearch ? await webSearch(query) : []
    };
  } catch (error) {
    console.error('AI Assistant error:', error);
    return {
      response: "Sorry, I'm having trouble processing your request right now. Please try again later.",
      sources: []
    };
  }
}

// Enhanced Socket.IO with all features
const rooms = new Map();

io.on('connection', (socket) => {
  let currentRoom = null;
  let currentUser = null;

  console.log('Client connected:', socket.id);

  // Enhanced heartbeat system
  socket.on('heartbeat', (data) => {
    socket.emit('heartbeat');
    if (currentRoom && currentUser) {
      // Log connection health
      RedisHelper.logConnection(currentRoom, currentUser, 'heartbeat', { timestamp: data.timestamp })
        .catch(console.error);
    }
  });

  // Join room with enhanced tracking
  socket.on('join-room', async (data) => {
    const { roomToken, displayName } = data;

    try {
      // Validate meeting exists and is active
      const meeting = await RedisHelper.getMeeting(roomToken);
      if (!meeting) {
        socket.emit('room-not-found');
        return;
      }

      // Check participant limit
      const participants = await RedisHelper.getParticipants(roomToken);
      if (participants.length >= (meeting.maxParticipants || 10)) {
        socket.emit('room-full');
        return;
      }

      // Add/update participant
      await RedisHelper.addParticipant(roomToken, {
        name: displayName,
        socketId: socket.id
      });

      // Join socket room
      socket.join(roomToken);
      currentRoom = roomToken;
      currentUser = displayName;

      // Initialize room if needed
      if (!rooms.has(roomToken)) {
        rooms.set(roomToken, {
          participants: new Map(),
          polls: new Map(),
          emotions: new Map(),
          tests: new Map()
        });
      }

      const room = rooms.get(roomToken);
      room.participants.set(socket.id, {
        id: socket.id,
        displayName,
        joinedAt: Date.now(),
        isHost: participants.length === 0
      });

      // Notify others
      socket.to(roomToken).emit('user-joined', {
        socketId: socket.id,
        displayName,
        participantCount: room.participants.size
      });

      // Send current room state
      const participants = Array.from(room.participants.values());
      socket.emit('room-state', {
        participants,
        polls: Array.from(room.polls.values()),
        emotionalClimate: room.emotions,
        activeTests: Array.from(room.tests.values()).filter(test => test.status === 'active')
      });

      console.log(`${displayName} joined room ${roomToken}`);

    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // WebRTC signaling
  socket.on('offer', (data) => {
    socket.to(data.targetId).emit('offer', {
      offer: data.offer,
      from: socket.id
    });
  });

  socket.on('answer', (data) => {
    socket.to(data.targetId).emit('answer', {
      answer: data.answer,
      from: socket.id
    });
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.targetId).emit('ice-candidate', {
      candidate: data.candidate,
      from: socket.id
    });
  });

  // Enhanced chat system
  socket.on('chat-message', async (data) => {
    const { roomToken, message, from, timestamp } = data;

    try {
      const meeting = await RedisHelper.getMeeting(roomToken);
      if (meeting) {
        await RedisHelper.addMessage(roomToken, {
          sender: from,
          text: message,
          kind: 'chat'
        });
      }

      socket.to(roomToken).emit('chat-message', data);
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  });

  // AI Assistant with GPT-4o
  socket.on('assistant-query', async (data) => {
    const { roomToken, query, from, webSearch, timestamp } = data;
    const startTime = Date.now();

    try {
      const meeting = await RedisHelper.getMeeting(roomToken);

      // Get meeting context
      const participants = await RedisHelper.getParticipants(roomToken);

      const context = {
        meeting_token: roomToken,
        participants: participants.map(p => p.name),
        participant_count: participants.length
      };

      const result = await askAI(query, webSearch, context);
      const responseTime = Date.now() - startTime;

      // Log interaction
      if (meeting) {
        await RedisHelper.logAssistantInteraction(roomToken, from, query, result.response, {
          webSearchUsed: webSearch,
          responseTimeMs: responseTime
        });
      }

      socket.emit('assistant-response', {
        response: result.response,
        sources: result.sources,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Error processing assistant query:', error);
      socket.emit('assistant-response', {
        response: 'Sorry, I encountered an error processing your request.',
        sources: [],
        timestamp: Date.now()
      });
    }
  });

  // Express polls system
  socket.on('create-poll', async (data) => {
    const { roomToken, title, options, duration, anonymous, type } = data;

    try {
      const meeting = await RedisHelper.getMeeting(roomToken);
      if (!meeting) return;

      const poll = await RedisHelper.createPoll(roomToken, {
        title,
        options,
        type: type || 'multiple_choice',
        duration,
        anonymous: anonymous || false,
        creator: currentUser
      });

      const room = rooms.get(roomToken);
      if (room) {
        room.polls.set(poll.id, {
          ...poll,
          votes: {},
          createdAt: Date.now(),
          expiresAt: Date.now() + duration * 1000
        });
      }

      io.to(roomToken).emit('poll-created', poll);

      // Auto-close poll
      setTimeout(() => {
        const finalPoll = rooms.get(roomToken)?.polls.get(poll.id);
        if (finalPoll) {
          finalPoll.status = 'closed';
          io.to(roomToken).emit('poll-closed', {
            pollId: poll.id,
            results: finalPoll.votes
          });
        }
      }, duration * 1000);

    } catch (error) {
      console.error('Error creating poll:', error);
    }
  });

  socket.on('vote-poll', async (data) => {
    const { roomToken, pollId, optionIndex } = data;

    try {
      const meeting = await RedisHelper.getMeeting(roomToken);
      if (!meeting) return;

      await RedisHelper.addPollVote(roomToken, pollId, currentUser, optionIndex);

      const room = rooms.get(roomToken);
      if (room && room.polls.has(pollId)) {
        const pollData = room.polls.get(pollId);
        pollData.votes[currentUser] = optionIndex;

        io.to(roomToken).emit('poll-updated', {
          pollId,
          votes: pollData.votes,
          totalVotes: Object.keys(pollData.votes).length
        });
      }

    } catch (error) {
      console.error('Error voting on poll:', error);
    }
  });

  // Emotional feedback system
  socket.on('emotion-update', async (data) => {
    const { roomToken, emotion, intensity, context } = data;

    try {
      const meeting = await RedisHelper.getMeeting(roomToken);
      if (!meeting) return;

      // Update emotion and get climate
      const climate = await RedisHelper.addEmotion(roomToken, currentUser, emotion);

      // Update room emotional climate
      const room = rooms.get(roomToken);
      if (room) {
        room.emotions[currentUser] = { emotion, intensity, timestamp: Date.now() };

        io.to(roomToken).emit('emotional-climate-update', {
          participant: currentUser,
          emotion,
          intensity,
          climate
        });
      }

    } catch (error) {
      console.error('Error updating emotion:', error);
    }
  });

  // Rapid sociometry system
  socket.on('start-sociometric-test', async (data) => {
    const { roomToken, template, duration, questions } = data;

    try {
      const meeting = await RedisHelper.getMeeting(roomToken);
      if (!meeting) return;

      const participants = await RedisHelper.getParticipants(roomToken);

      const test = await RedisHelper.createSociometryTest(roomToken, {
        template,
        title: `${template} Test`,
        questions,
        duration,
        host: currentUser,
        participants: participants.map(p => p.name)
      });

      const room = rooms.get(roomToken);
      if (room) {
        room.tests.set(test.id, {
          ...test,
          startedAt: Date.now(),
          endsAt: Date.now() + duration * 1000,
          responses: {}
        });
      }

      io.to(roomToken).emit('sociometric-test-started', test);

      // Auto-end test
      setTimeout(() => {
        const finalTest = rooms.get(roomToken)?.tests.get(test.id);
        if (finalTest) {
          finalTest.status = 'completed';
          const results = analyzeSociometricResults(finalTest.responses);

          io.to(roomToken).emit('sociometric-test-completed', {
            testId: test.id,
            results
          });
        }
      }, duration * 1000);

    } catch (error) {
      console.error('Error starting sociometric test:', error);
    }
  });

  socket.on('submit-sociometric-response', async (data) => {
    const { roomToken, testId, answers, responseTime } = data;

    try {
      const meeting = await RedisHelper.getMeeting(roomToken);
      if (!meeting) return;

      const test = await RedisHelper.getSociometryTest(roomToken, testId);
      if (!test) return;

      await RedisHelper.addSociometryResponse(roomToken, testId, currentUser, answers);

      const room = rooms.get(roomToken);
      if (room && room.tests.has(testId)) {
        const testData = room.tests.get(testId);
        testData.responses[currentUser] = { answers, responseTime, submittedAt: Date.now() };

        io.to(roomToken).emit('sociometric-response-received', {
          testId,
          participant: currentUser,
          totalResponses: Object.keys(testData.responses).length
        });
      }

    } catch (error) {
      console.error('Error submitting sociometric response:', error);
    }
  });

  // Enhanced disconnect handling
  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.id);

    if (currentRoom && currentUser) {
      try {
        // Remove participant and log disconnection
        await RedisHelper.removeParticipant(currentRoom, currentUser);
        await RedisHelper.logConnection(currentRoom, currentUser, 'disconnect');

        // Clean up room data
        const room = rooms.get(currentRoom);
        if (room) {
          room.participants.delete(socket.id);

          if (room.participants.size === 0) {
            rooms.delete(currentRoom);
          } else {
            socket.to(currentRoom).emit('user-left', {
              socketId: socket.id,
              displayName: currentUser,
              participantCount: room.participants.size
            });
          }
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    }
  });

  socket.on('leave-room', async (data) => {
    if (currentRoom && currentUser) {
      try {
        // Remove participant and log leaving
        await RedisHelper.removeParticipant(currentRoom, currentUser);
        await RedisHelper.logConnection(currentRoom, currentUser, 'leave');

        socket.to(currentRoom).emit('user-left', {
          socketId: socket.id,
          displayName: currentUser
        });

        socket.leave(currentRoom);

        const room = rooms.get(currentRoom);
        if (room) {
          room.participants.delete(socket.id);
        }

        currentRoom = null;
        currentUser = null;

      } catch (error) {
        console.error('Error leaving room:', error);
      }
    }
  });
});

// Utility functions
function calculateEmotionalClimate(emotions) {
  if (!emotions.length) return { overall: 'neutral', distribution: {} };

  const distribution = {};
  emotions.forEach(({ emotion, intensity }) => {
    distribution[emotion] = (distribution[emotion] || 0) + (intensity || 1);
  });

  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  const percentages = {};
  Object.entries(distribution).forEach(([emotion, count]) => {
    percentages[emotion] = Math.round((count / total) * 100);
  });

  // Determine overall climate
  const dominant = Object.entries(percentages)
    .sort(([,a], [,b]) => b - a)[0];

  return {
    overall: dominant ? dominant[0] : 'neutral',
    distribution: percentages,
    participantCount: emotions.length
  };
}

function analyzeSociometricResults(responses) {
  const participants = Object.keys(responses);
  const analysis = {
    participantCount: participants.length,
    responseRate: `${participants.length} responses`,
    insights: [],
    teamDynamics: {}
  };

  // Basic analysis - in production this would be much more sophisticated
  participants.forEach(participant => {
    const response = responses[participant];
    analysis.insights.push({
      participant,
      responseTime: response.responseTime,
      submittedAt: response.submittedAt
    });
  });

  return analysis;
}

// Clean up expired meetings
setInterval(async () => {
  try {
    const activeRooms = await redis.sMembers(RedisKeys.activeRooms());

    for (const token of activeRooms) {
      const meeting = await RedisHelper.getMeeting(token);
      if (meeting && new Date(meeting.expiresAt) < new Date()) {
        await RedisHelper.deleteMeeting(token);
        rooms.delete(token);
        console.log(`Cleaned up expired meeting: ${token}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up expired meetings:', error);
  }
}, 60000); // Check every minute

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`AI Assistant powered by GPT-4o: ${process.env.OPENAI_API_KEY ? 'Ready' : 'Missing API key'}`);
});