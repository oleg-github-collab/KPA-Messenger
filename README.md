# Simple AI Messenger

A tiny Google Meet style messenger: two predefined users can authenticate, generate one-time meeting links, chat with persistence, and hop on a WebRTC call. Socket.IO handles real-time messaging + signaling, SQLite keeps message history, and credentials live in environment variables ready for Railway deployment.

## Features
- One-time meeting links with automatic expiration once the host ends the call.
- Two-factor authentication via pre-provisioned credentials defined in `.env`.
- Real-time text chat stored per meeting in SQLite.
- WebRTC video/audio with STUN defaults; drop in TURN credentials if required.
- Copy/share invite links, mute/video toggles, host-only “end meeting” control.

## Quick start
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the sample environment file and adjust credentials:
   ```bash
   cp .env.example .env
   ```
3. Run the server:
   ```bash
   npm start
   ```
4. Open <http://localhost:3000> and log in as `alice`/`secret123` (or the credentials you set).
5. Create a meeting link, share it, and join the room. Guests just need the link and a display name.

## Railway deployment
- Railway auto-detects the Node.js project. Push the repo, add environment variables (`PORT`, `USER*_NAME`, `USER*_PASS`, optionally `SESSION_TTL_MS`), and deploy.
- Enable a persistent volume if you want to retain `db.sqlite` chat history between deploys.

## TURN server (optional but recommended)
Pure STUN works when both peers are on permissive networks. For reliability behind strict NAT/firewalls, configure TURN credentials and extend the ICE server list in `public/client.js`.

---
Built with care for quick, secure two-person calls.
