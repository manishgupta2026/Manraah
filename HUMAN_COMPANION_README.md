# 🎧 Manraah — Human Companion Sanctuary & Listener Portal Guide

Welcome to the **Human Companion Sanctuary** in Manraah! This module connects members seeking anonymous 1-on-1 emotional support with trained peer listeners in real time over secure WebSockets & WebRTC.

---

## 🌟 Overview & Feature Matrix

| Feature | User Side (`/human-companion`) | Admin/Listener Side (`/admin/human-companion`) |
| :--- | :--- | :--- |
| **Authentication** | Regular Member Auth (`/login`) | Dedicated Companion Auth (`/companion/login`) |
| **Topic Selection** | Choose preset or enter custom topic | Receives member topic on incoming match card |
| **1-on-1 Chat** | Bidirectional real-time Socket.IO chat | Real-time chat with internal private notes |
| **Voice Calling** | Encrypted 2-Way WebRTC audio call | Live call console with mute & duration timer |
| **Disconnect** | Ends session -> Session Feedback | Ends session -> Supervisor Flagging |

---

## 🚀 Quick Start Guide

### 1. Start the Real-Time Socket.IO Server
```bash
node server/socket-server.js
```
*Runs on port `3005`.*

### 2. Start the Next.js Web App
```bash
npm run dev
```
*Runs on port `3000`.*

---

## 📱 How to Use: Member & Listener User Flow

### 👤 Member Support Flow (User Side)
1. Navigate to **[`http://localhost:3000/human-companion`](http://localhost:3000/human-companion)**.
2. Select what you would like to talk about today (Choose a quick chip or type a custom topic like *"Navigating work stress"*).
3. Click the circular **"Find a Listener"** CTA button.
4. Once matched, enter 1-on-1 anonymous chat or click **"Call"** for encrypted voice support.
5. When finished, click **"End Session"** to rate your session experience.

---

### 🛡️ Admin Listener Operations Console (Companion Side)
1. Navigate to **[`http://localhost:3000/companion/login`](http://localhost:3000/companion/login)**.
   - **Email**: `companion@manraah.com`
   - **Password**: `CompanionPass123!`
2. You will be redirected to the secure **[`http://localhost:3000/admin/human-companion`](http://localhost:3000/admin/human-companion)** operations console.
3. Toggle your status to **"Available to Listen"**.
4. When a real member requests support, an **Incoming Match** card will appear with their topic.
5. Click **"Accept Match"** to open the real-time chat console.
6. Record confidential internal listener notes in the right sidebar.
7. Click **"Call"** to switch to live WebRTC audio calling. Tapping **"🎙️ Tap to Enable Microphone Access"** grants microphone access.
8. Click **"End Session"** to complete the session and submit supervisor flags if needed.

---

## 🔐 Security & Access Controls

- **Strict Middleware Isolation**: Regular user sessions (`manraah_session`) cannot access `/admin/*` or `/companion/dashboard`. Access requires the secure `manraah_companion_session` cookie.
- **Privacy Guarantee**: Zero PII exposed. Members are assigned anonymized alias tags (`Anonymous Member #...`).
- **WebRTC STUN/TURN**: Configured with Google STUN servers (`stun:stun.l.google.com:19302`) and dynamic TURN environment fallback (`NEXT_PUBLIC_TURN_URL`).

---

## ☁️ Deployment Guide

1. **Database**: Managed on Neon PostgreSQL (`DATABASE_URL`).
2. **Web Server**: Deployed on Vercel / Netlify.
3. **Socket Server**: Deployed on Render.com or Railway (`node server/socket-server.js`) with `NEXT_PUBLIC_SOCKET_URL` pointed to your HTTPS socket host.
