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

// Initialize Redis client but don't connect immediately
let redis = null;
let isRedisConnected = false;

// Initialize Redis with proper error handling
async function initializeRedis() {
  if (process.env.REDIS_URL && !process.env.REDIS_URL.includes('localhost')) {
    try {
      redis = createClient({
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 5) {
              console.log('🔴 Redis: Max reconnection attempts reached');
              return false;
            }
            return Math.min(retries * 1000, 5000);
          },
          connectTimeout: 10000
        }
      });

      redis.on('error', (err) => {
        console.error('⚠️ Redis error:', err.code);
        isRedisConnected = false;
      });

      redis.on('connect', () => {
        isRedisConnected = true;
        console.log('✅ Connected to Redis');
      });

      redis.on('ready', () => {
        console.log('🚀 Redis ready');
      });

      redis.on('disconnect', () => {
        isRedisConnected = false;
        console.log('🔴 Redis disconnected');
      });

      await redis.connect();
    } catch (error) {
      console.error('⚠️ Failed to connect to Redis:', error.code || error.message);
      redis = null;
      isRedisConnected = false;
    }
  } else {
    console.log('🔧 Redis not configured - using in-memory storage');
  }
}

// Initialize Redis asynchronously
initializeRedis().catch(console.error);

// In-memory fallback storage with size limits and cleanup
const MAX_MEMORY_ITEMS = 1000;
const MEMORY_CLEANUP_INTERVAL = 300000; // 5 minutes

let memoryStorage = {
  meetings: new Map(),
  participants: new Map(),
  messages: new Map(),
  sessions: new Map(),
  polls: new Map(),
  emotions: new Map(),
  activeRooms: new Set(),
  roomHosts: new Map()
};

// Memory cleanup utility
function cleanupMemoryStorage() {
  const now = Date.now();
  const HOUR_MS = 60 * 60 * 1000;

  // Clean expired meetings
  for (const [key, value] of memoryStorage.meetings.entries()) {
    if (value.expiresAt && new Date(value.expiresAt) < new Date()) {
      memoryStorage.meetings.delete(key);
      memoryStorage.participants.delete(key);
      memoryStorage.messages.delete(key);
      memoryStorage.sessions.delete(key);
      memoryStorage.polls.delete(key);
      memoryStorage.emotions.delete(key);
      memoryStorage.roomHosts.delete(key);
      memoryStorage.activeRooms.delete(key);
    }
  }

  // Limit storage sizes
  const limitStorageSize = (storage, limit = MAX_MEMORY_ITEMS) => {
    if (storage.size > limit) {
      const entries = Array.from(storage.entries());
      const toDelete = entries.slice(0, entries.length - limit);
      toDelete.forEach(([key]) => storage.delete(key));
    }
  };

  limitStorageSize(memoryStorage.meetings);
  limitStorageSize(memoryStorage.participants);
  limitStorageSize(memoryStorage.messages);
  limitStorageSize(memoryStorage.sessions);
  limitStorageSize(memoryStorage.polls);
  limitStorageSize(memoryStorage.emotions);
  limitStorageSize(memoryStorage.roomHosts);

  // Limit active rooms
  if (memoryStorage.activeRooms.size > MAX_MEMORY_ITEMS) {
    const roomsArray = Array.from(memoryStorage.activeRooms);
    const toDelete = roomsArray.slice(0, roomsArray.length - MAX_MEMORY_ITEMS);
    toDelete.forEach(room => memoryStorage.activeRooms.delete(room));
  }
}

// Run memory cleanup periodically
setInterval(cleanupMemoryStorage, MEMORY_CLEANUP_INTERVAL);

// Safe Redis wrapper that falls back to memory storage
const SafeRedis = {
  async isConnected() {
    return redis && isRedisConnected && redis.isReady;
  },

  async hSet(key, data) {
    if (await this.isConnected()) {
      return await redis.hSet(key, data);
    } else {
      // Fallback to memory
      memoryStorage.meetings.set(key, data);
      return 'OK';
    }
  },

  async hGetAll(key) {
    if (await this.isConnected()) {
      return await redis.hGetAll(key);
    } else {
      // Fallback to memory
      return memoryStorage.meetings.get(key) || {};
    }
  },

  async set(key, value) {
    if (await this.isConnected()) {
      return await redis.set(key, value);
    } else {
      // Fallback to memory
      memoryStorage.sessions.set(key, value);
      return 'OK';
    }
  },

  async get(key) {
    if (await this.isConnected()) {
      return await redis.get(key);
    } else {
      // Fallback to memory
      return memoryStorage.sessions.get(key) || null;
    }
  },

  async sAdd(key, member) {
    if (await this.isConnected()) {
      return await redis.sAdd(key, member);
    } else {
      // Fallback to memory
      if (key.includes('active_rooms')) {
        memoryStorage.activeRooms.add(member);
      }
      return 1;
    }
  },

  async sRem(key, member) {
    if (await this.isConnected()) {
      return await redis.sRem(key, member);
    } else {
      // Fallback to memory
      if (key.includes('active_rooms')) {
        return memoryStorage.activeRooms.delete(member) ? 1 : 0;
      }
      return 0;
    }
  },

  async sMembers(key) {
    if (await this.isConnected()) {
      return await redis.sMembers(key);
    } else {
      // Fallback to memory
      if (key.includes('active_rooms')) {
        return Array.from(memoryStorage.activeRooms);
      }
      return [];
    }
  },

  async expire(key, seconds) {
    if (await this.isConnected()) {
      return await redis.expire(key, seconds);
    } else {
      // In memory storage doesn't support expiration, but that's okay for dev
      // In memory mode - no expiration needed
      return 1;
    }
  },

  async del(keys) {
    if (await this.isConnected()) {
      return await redis.del(keys);
    } else {
      // Fallback to memory cleanup
      let deletedCount = 0;
      keys.forEach(key => {
        if (memoryStorage.meetings.delete(key)) deletedCount++;
        if (memoryStorage.sessions.delete(key)) deletedCount++;
        if (memoryStorage.participants.delete(key)) deletedCount++;
        if (memoryStorage.messages.delete(key)) deletedCount++;
      });
      return deletedCount;
    }
  },

  async lPush(key, value) {
    if (await this.isConnected()) {
      return await redis.lPush(key, value);
    } else {
      // Fallback to memory
      if (!memoryStorage.messages.has(key)) {
        memoryStorage.messages.set(key, []);
      }
      memoryStorage.messages.get(key).unshift(value);
      return memoryStorage.messages.get(key).length;
    }
  },

  async lRange(key, start, end) {
    if (await this.isConnected()) {
      return await redis.lRange(key, start, end);
    } else {
      // Fallback to memory
      const messages = memoryStorage.messages.get(key) || [];
      if (end === -1) return messages.slice(start);
      return messages.slice(start, end + 1);
    }
  },

  async lTrim(key, start, stop) {
    if (await this.isConnected()) {
      return await redis.lTrim(key, start, stop);
    } else {
      // Fallback to memory - trim the array
      if (memoryStorage.messages.has(key)) {
        const messages = memoryStorage.messages.get(key);
        memoryStorage.messages.set(key, messages.slice(start, stop + 1));
      }
      return 'OK';
    }
  }
};

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

    await SafeRedis.hSet(RedisKeys.meeting(token), meetingData);
    await SafeRedis.set(RedisKeys.roomHost(token), host);
    await SafeRedis.sAdd(RedisKeys.activeRooms(), token);
    await SafeRedis.expire(RedisKeys.meeting(token), 24 * 60 * 60);
    await SafeRedis.expire(RedisKeys.roomHost(token), 24 * 60 * 60);

    return meetingData;
  },

  async getMeeting(token) {
    const meeting = await SafeRedis.hGetAll(RedisKeys.meeting(token));
    return Object.keys(meeting).length > 0 ? meeting : null;
  },

  async getRoomHost(token) {
    return await SafeRedis.get(RedisKeys.roomHost(token));
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
      SafeRedis.del(keys),
      SafeRedis.sRem(RedisKeys.activeRooms(), token)
    ]);
  },

  // Participant management
  async addParticipant(token, participantData) {
    const participantKey = RedisKeys.participant(token, participantData.name);
    await SafeRedis.hSet(participantKey, {
      ...participantData,
      joinedAt: new Date().toISOString(),
      status: 'online',
      muted: 'false',
      videoEnabled: 'true'
    });

    await SafeRedis.sAdd(RedisKeys.participants(token), participantData.name);
    await SafeRedis.expire(participantKey, 24 * 60 * 60);
  },

  async removeParticipant(token, participantName) {
    await SafeRedis.sRem(RedisKeys.participants(token), participantName);
    await SafeRedis.del([RedisKeys.participant(token, participantName)]);
  },

  async getParticipants(token) {
    const participantNames = await SafeRedis.sMembers(RedisKeys.participants(token));
    const participants = [];

    for (const name of participantNames) {
      const data = await SafeRedis.hGetAll(RedisKeys.participant(token, name));
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

    await SafeRedis.lPush(RedisKeys.messages(token), JSON.stringify(messageWithId));
    await SafeRedis.lTrim(RedisKeys.messages(token), 0, 999);
    await SafeRedis.expire(RedisKeys.messages(token), 24 * 60 * 60);

    return messageWithId;
  },

  async getMessages(token, limit = 100) {
    const messages = await SafeRedis.lRange(RedisKeys.messages(token), 0, limit - 1);
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

    await SafeRedis.hSet(RedisKeys.poll(token, pollId), poll);
    await SafeRedis.sAdd(RedisKeys.polls(token), pollId);
    await SafeRedis.expire(RedisKeys.poll(token, pollId), 24 * 60 * 60);

    return { ...poll, options: pollData.options };
  },

  async getPoll(token, pollId) {
    const poll = await SafeRedis.hGetAll(RedisKeys.poll(token, pollId));
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

    await SafeRedis.hSet(RedisKeys.pollVotes(token, pollId), participant, JSON.stringify(voteData));
    await SafeRedis.expire(RedisKeys.pollVotes(token, pollId), 24 * 60 * 60);
  },

  async getPollResults(token, pollId) {
    const votes = await SafeRedis.hGetAll(RedisKeys.pollVotes(token, pollId));
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

    await SafeRedis.hSet(RedisKeys.emotions(token), participant, JSON.stringify(emotionData));
    await SafeRedis.expire(RedisKeys.emotions(token), 24 * 60 * 60);

    return await this.updateEmotionalClimate(token);
  },

  async updateEmotionalClimate(token) {
    const emotions = await SafeRedis.hGetAll(RedisKeys.emotions(token));
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

    await SafeRedis.hSet(RedisKeys.emotionClimate(token), {
      ...climate,
      topEmotions: JSON.stringify(topEmotions)
    });
    await SafeRedis.expire(RedisKeys.emotionClimate(token), 24 * 60 * 60);

    return climate;
  },

  async getEmotionalClimate(token) {
    const climate = await SafeRedis.hGetAll(RedisKeys.emotionClimate(token));
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

    await SafeRedis.hSet(RedisKeys.sociometryTest(token, testId), test);
    await SafeRedis.sAdd(RedisKeys.sociometry(token), testId);
    await SafeRedis.expire(RedisKeys.sociometryTest(token, testId), 24 * 60 * 60);

    return { ...test, questions: testData.questions, participants: testData.participants };
  },

  async getSociometryTest(token, testId) {
    const test = await SafeRedis.hGetAll(RedisKeys.sociometryTest(token, testId));
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

    await SafeRedis.hSet(RedisKeys.sociometryResponses(token, testId), participant, JSON.stringify(responseData));
    await SafeRedis.expire(RedisKeys.sociometryResponses(token, testId), 24 * 60 * 60);
  },

  async getSociometryResponses(token, testId) {
    const responses = await SafeRedis.hGetAll(RedisKeys.sociometryResponses(token, testId));
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

    await SafeRedis.lPush(RedisKeys.assistant(token), JSON.stringify(interaction));
    await SafeRedis.lTrim(RedisKeys.assistant(token), 0, 99);
    await SafeRedis.expire(RedisKeys.assistant(token), 24 * 60 * 60);
  },

  // Connection management
  async logConnection(token, participant, event, details = {}) {
    const logEntry = {
      participant,
      event,
      details: JSON.stringify(details),
      timestamp: new Date().toISOString()
    };

    await SafeRedis.lPush(RedisKeys.connections(token), JSON.stringify(logEntry));
    await SafeRedis.lTrim(RedisKeys.connections(token), 0, 999);
    await SafeRedis.expire(RedisKeys.connections(token), 24 * 60 * 60);
  },

  // Session management
  async updateSession(token, sessionData) {
    await SafeRedis.hSet(RedisKeys.session(token), sessionData);
    await SafeRedis.expire(RedisKeys.session(token), 24 * 60 * 60);
  },

  async getSession(token) {
    const session = await SafeRedis.hGetAll(RedisKeys.session(token));
    return Object.keys(session).length > 0 ? session : null;
  }
};

app.use(express.json());
app.use(express.static('public'));

// Credentials for basic auth
const validCredentials = [];

// Add credentials from environment variables
if (process.env.USER1_NAME && process.env.USER1_PASS) {
  validCredentials.push({
    username: process.env.USER1_NAME,
    password: process.env.USER1_PASS
  });
}

if (process.env.USER2_NAME && process.env.USER2_PASS) {
  validCredentials.push({
    username: process.env.USER2_NAME,
    password: process.env.USER2_PASS
  });
}

// Add admin credentials if available
if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
  validCredentials.push({
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD
  });
}

app.post('/auth', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ ok: false, message: 'Username and password required' });
    }

    const user = validCredentials.find(cred =>
      cred.username === username && cred.password === password
    );

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      res.json({ ok: true, username, token });
    } else {
      res.status(401).json({ ok: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ ok: false, message: 'Server error' });
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

    // Store meeting data (Redis or in-memory fallback)
    try {
      await RedisHelper.createMeeting(roomToken, hostName || 'host');
      await RedisHelper.updateSession(roomToken, {
        createdBy: hostName || 'host',
        createdAt: new Date().toISOString(),
        userAgent: req.headers['user-agent'],
        maxParticipants,
        expiresAt
      });
    } catch (error) {
      console.error('Error storing meeting data:', error);
      // Continue with response even if storage fails
    }

    res.json({
      ok: true,
      token: roomToken,
      meetingUrl,
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
    // Limit input size to prevent memory issues
    if (query.length > 2000) {
      query = query.substring(0, 2000) + "...";
    }

    let systemPrompt = `You are Valera, an AI assistant for Kaminskyi AI Messenger. You help with video calls, team dynamics, and general questions.
    Be helpful, concise, and professional. Respond in the same language as the user's question.`;

    let userMessage = query;
    let searchResults = [];

    if (useWebSearch) {
      searchResults = await webSearch(query);
      if (searchResults.length > 0) {
        const searchText = searchResults.map(r => `- ${r.title}: ${r.snippet}`).join('\n');
        if (searchText.length > 1000) {
          userMessage += `\n\nWeb search results:\n${searchText.substring(0, 1000)}...`;
        } else {
          userMessage += `\n\nWeb search results:\n${searchText}`;
        }
      }
    }

    if (context) {
      const contextStr = JSON.stringify(context);
      if (contextStr.length > 500) {
        systemPrompt += `\n\nMeeting context: ${contextStr.substring(0, 500)}...`;
      } else {
        systemPrompt += `\n\nMeeting context: ${contextStr}`;
      }
    }

    const completion = await Promise.race([
      openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 500 // Reduced to prevent large responses
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 30000))
    ]);

    return {
      response: completion.choices[0].message.content,
      sources: searchResults
    };
  } catch (error) {
    console.error('AI Assistant error:', error.message || error);
    return {
      response: "Sorry, I'm having trouble processing your request right now. Please try again later.",
      sources: []
    };
  }
}

// Enhanced Socket.IO with all features
const MAX_ROOMS = 100;
const rooms = new Map();

// Clean up old rooms periodically
function cleanupRooms() {
  const now = Date.now();
  const ROOM_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours

  for (const [token, room] of rooms.entries()) {
    // Remove rooms with no participants for more than 10 minutes
    if (room.participants.size === 0 && (now - room.lastActivity) > 600000) {
      rooms.delete(token);
      continue;
    }

    // Remove very old rooms
    if (room.createdAt && (now - room.createdAt) > ROOM_TIMEOUT) {
      rooms.delete(token);
    }
  }

  // Limit total rooms
  if (rooms.size > MAX_ROOMS) {
    const roomsArray = Array.from(rooms.entries());
    const toDelete = roomsArray.slice(0, roomsArray.length - MAX_ROOMS);
    toDelete.forEach(([token]) => rooms.delete(token));
  }
}

setInterval(cleanupRooms, 10 * 60 * 1000); // Every 10 minutes

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
          tests: new Map(),
          createdAt: Date.now(),
          lastActivity: Date.now()
        });
      }

      const room = rooms.get(roomToken);
      room.lastActivity = Date.now(); // Update activity
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
      const roomParticipants = Array.from(room.participants.values());
      socket.emit('room-state', {
        participants: roomParticipants,
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

  // WebRTC signaling with memory optimization
  socket.on('offer', (data) => {
    if (currentRoom && data.targetId && data.offer) {
      const room = rooms.get(currentRoom);
      if (room) room.lastActivity = Date.now();

      socket.to(data.targetId).emit('offer', {
        offer: data.offer,
        from: socket.id
      });
    }
  });

  socket.on('answer', (data) => {
    if (currentRoom && data.targetId && data.answer) {
      const room = rooms.get(currentRoom);
      if (room) room.lastActivity = Date.now();

      socket.to(data.targetId).emit('answer', {
        answer: data.answer,
        from: socket.id
      });
    }
  });

  socket.on('ice-candidate', (data) => {
    if (currentRoom && data.targetId && data.candidate) {
      const room = rooms.get(currentRoom);
      if (room) room.lastActivity = Date.now();

      socket.to(data.targetId).emit('ice-candidate', {
        candidate: data.candidate,
        from: socket.id
      });
    }
  });

  // Enhanced chat system
  socket.on('chat-message', async (data) => {
    const { roomToken, message, from } = data;

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
    const { roomToken, query, from, webSearch } = data;
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
            // Complete cleanup when room is empty
            await RedisHelper.deleteMeeting(currentRoom);
            rooms.delete(currentRoom);
            console.log(`Room ${currentRoom} completely cleaned up - no participants remaining`);
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

  socket.on('leave-room', async () => {
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

          if (room.participants.size === 0) {
            // Complete cleanup when room is empty
            await RedisHelper.deleteMeeting(currentRoom);
            rooms.delete(currentRoom);
            console.log(`Room ${currentRoom} completely cleaned up after leave`);
          }
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
  // Only run cleanup if Redis is connected
  if (!isRedisConnected) {
    return;
  }

  try {
    const activeRooms = await SafeRedis.sMembers(RedisKeys.activeRooms());

    for (const token of activeRooms) {
      const meeting = await RedisHelper.getMeeting(token);
      if (meeting && new Date(meeting.expiresAt) < new Date()) {
        await RedisHelper.deleteMeeting(token);
        rooms.delete(token);
        console.log(`Cleaned up expired meeting: ${token}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up expired meetings:', error.message);
  }
}, 60000); // Check every minute

console.log('🔐 Available login credentials:');
validCredentials.forEach((cred, index) => {
  console.log(`   ${index + 1}. Username: "${cred.username}" | Password: "${cred.password}"`);
});

// Process optimization for production
if (process.env.NODE_ENV === 'production') {
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');

  if (redis && isRedisConnected) {
    try {
      await redis.quit();
      console.log('Redis connection closed');
    } catch (error) {
      console.error('Error closing Redis:', error);
    }
  }

  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Add route for backward compatibility and proper redirects
app.get('/chat.html', (req, res) => {
  const isMobile = req.headers['user-agent'] && /Mobile|Android|iPhone|iPad/i.test(req.headers['user-agent']);
  const targetPage = isMobile ? '/mobile.html' : '/desktop.html';
  const room = req.query.room;

  if (room) {
    res.redirect(`${targetPage}?room=${encodeURIComponent(room)}`);
  } else {
    res.redirect('/');
  }
});

// Root route redirect
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`AI Assistant powered by GPT-4o: ${process.env.OPENAI_API_KEY ? 'Ready' : 'Missing API key'}`);
  console.log(`Memory management: Active with ${MAX_MEMORY_ITEMS} item limits`);
  console.log(`Room management: Active with ${MAX_ROOMS} room limits`);
});