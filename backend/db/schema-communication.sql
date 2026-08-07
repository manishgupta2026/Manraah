-- Production Schema for Anonymous Communication & Companion System

-- 1. Companion Users (Independent from Regular Users)
CREATE TABLE IF NOT EXISTS companion_users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'COMPANION', -- COMPANION, SUPERVISOR, ADMIN
  status VARCHAR(50) NOT NULL DEFAULT 'OFFLINE', -- ONLINE, BUSY, OFFLINE
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Anonymous Rooms
CREATE TABLE IF NOT EXISTS anonymous_rooms (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  companion_id VARCHAR(255),
  user_alias VARCHAR(100) NOT NULL, -- e.g. "Anonymous User #104"
  companion_alias VARCHAR(100) DEFAULT 'Companion #12',
  user_category VARCHAR(100) DEFAULT 'Student',
  topic VARCHAR(255) DEFAULT 'Emotional Support',
  status VARCHAR(50) NOT NULL DEFAULT 'WAITING', -- WAITING, ACTIVE, ENDED
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP
);

-- 3. Anonymous Chat Messages
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(255) PRIMARY KEY,
  room_id VARCHAR(255) NOT NULL REFERENCES anonymous_rooms(id) ON DELETE CASCADE,
  sender_type VARCHAR(50) NOT NULL, -- USER, COMPANION, SYSTEM
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Call Sessions
CREATE TABLE IF NOT EXISTS call_sessions (
  id VARCHAR(255) PRIMARY KEY,
  room_id VARCHAR(255) NOT NULL REFERENCES anonymous_rooms(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'CONNECTING', -- CONNECTING, ACTIVE, ENDED
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP
);

-- 5. WebRTC Call Signals (Offer, Answer, ICE Candidates)
CREATE TABLE IF NOT EXISTS call_signals (
  id VARCHAR(255) PRIMARY KEY,
  call_session_id VARCHAR(255) NOT NULL REFERENCES call_sessions(id) ON DELETE CASCADE,
  sender VARCHAR(50) NOT NULL, -- USER, COMPANION
  type VARCHAR(50) NOT NULL, -- OFFER, ANSWER, ICE_CANDIDATE
  payload TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
