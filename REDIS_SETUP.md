# Redis Setup Instructions for Kaminskyi AI Messenger

## Overview
This application uses Redis for session storage, connection handling, and real-time data management. Redis provides excellent performance and reliability for the messenger's features.

## Railway Redis Setup (Recommended)

### Step 1: Create Redis Database on Railway
1. Go to [Railway.app](https://railway.app)
2. Sign up or log in to your account
3. Click "New Project" and select "Provision Redis"
4. Railway will automatically provision a Redis database for you
5. Once created, go to the "Variables" tab of your Redis service
6. Copy the `REDIS_URL` value (it will look like: `redis://default:password@host:port`)

### Step 2: Configure Environment Variables
1. In your KPA-Messenger project on Railway, go to the "Variables" tab
2. Add a new environment variable:
   - **Variable:** `REDIS_URL`
   - **Value:** The Redis URL from step 1 (e.g., `redis://default:your_password@redis-production-xxxx.railway.app:6379`)

### Step 3: Add OpenAI API Key (if using AI features)
1. In the same Variables tab, add:
   - **Variable:** `OPENAI_API_KEY`
   - **Value:** Your OpenAI API key (get one at https://platform.openai.com/api-keys)

## Local Development Setup

### Option 1: Using Docker (Recommended)
```bash
# Start Redis using Docker
docker run --name redis-messenger -p 6379:6379 -d redis:latest

# Your .env file should contain:
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_openai_api_key_here
```

### Option 2: Native Redis Installation

#### On macOS:
```bash
# Install Redis using Homebrew
brew install redis

# Start Redis service
brew services start redis

# Or start manually
redis-server
```

#### On Ubuntu/Debian:
```bash
# Install Redis
sudo apt update
sudo apt install redis-server

# Start Redis service
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

#### On Windows:
1. Download Redis from: https://github.com/microsoftarchive/redis/releases
2. Extract and run `redis-server.exe`
3. Or use WSL with Ubuntu instructions above

### Local Environment Configuration
Create a `.env` file in your project root:
```env
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

## Redis Data Structure

The application uses the following Redis key patterns:

### Meeting Management
- `meeting:{token}` - Hash containing meeting metadata
- `meeting:{token}:participants` - Set of participant names
- `meeting:{token}:participant:{name}` - Hash containing participant data
- `room_host:{token}` - String containing host identifier
- `active_rooms` - Set of active meeting tokens

### Communication Features
- `meeting:{token}:messages` - List of chat messages
- `meeting:{token}:polls` - Set of poll IDs
- `meeting:{token}:poll:{pollId}` - Hash containing poll data
- `meeting:{token}:poll:{pollId}:votes` - Hash containing vote data

### Advanced Features
- `meeting:{token}:emotions` - Hash containing participant emotions
- `meeting:{token}:climate` - Hash containing emotional climate data
- `meeting:{token}:sociometry` - Set of sociometry test IDs
- `meeting:{token}:sociometry:{testId}` - Hash containing test data
- `meeting:{token}:sociometry:{testId}:responses` - Hash containing responses

### Session Management
- `session:{token}` - Hash containing session metadata
- `meeting:{token}:connections` - List of connection logs
- `meeting:{token}:assistant` - List of AI assistant interactions

## Redis Configuration Best Practices

### Memory Settings
Redis is configured to automatically expire data after 24 hours to prevent memory buildup:
- Meeting data: 24 hours
- Messages: Limited to 1000 per room
- Sessions: 24 hours

### Performance Optimization
- **Persistence:** For production, enable AOF (Append Only File) for data durability
- **Memory Policy:** Set `maxmemory-policy allkeys-lru` for automatic cleanup
- **Connection Pooling:** The app uses the Redis client's built-in connection pooling

### Security
- **Authentication:** Always use Redis AUTH in production
- **Network:** Bind Redis to specific interfaces, not 0.0.0.0
- **Encryption:** Use TLS for Redis connections in production (Railway provides this automatically)

## Troubleshooting

### Common Issues

**Connection Refused:**
```
Error: Redis connection error: connect ECONNREFUSED 127.0.0.1:6379
```
- Check if Redis is running: `redis-cli ping`
- Verify REDIS_URL environment variable
- Check firewall settings

**Authentication Failed:**
```
Error: Redis connection error: WRONGPASS invalid username-password pair
```
- Verify the Redis password in your REDIS_URL
- Check Railway Redis variables tab for correct credentials

**Memory Issues:**
```
Error: OOM command not allowed when used memory > 'maxmemory'
```
- Check Redis memory usage: `redis-cli info memory`
- Configure memory policy: `redis-cli config set maxmemory-policy allkeys-lru`

### Monitoring
Monitor your Redis instance:
```bash
# Check Redis info
redis-cli info

# Monitor commands in real-time
redis-cli monitor

# Check specific key patterns
redis-cli --scan --pattern "meeting:*"
```

## Migration from SQLite
The application has been fully migrated from SQLite to Redis. All data operations now use Redis for:
- ✅ Session storage
- ✅ Real-time message handling
- ✅ Participant management
- ✅ Poll and survey data
- ✅ Emotional feedback tracking
- ✅ AI assistant interactions
- ✅ Connection logging

No SQLite dependencies remain in the codebase.

## Support
If you encounter issues with Redis setup:
1. Check the Railway Redis service logs
2. Verify environment variables are correctly set
3. Test the connection using `redis-cli` with your REDIS_URL
4. Ensure your Railway project has sufficient resources allocated

For production deployments, consider enabling Redis AUTH and configuring appropriate memory limits based on your expected usage.