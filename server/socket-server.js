const { Server } = require("socket.io");
const http = require("http");
const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

// Load .env.local manually
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim();
      if (key && !process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const DATABASE_URL = process.env.DATABASE_URL;
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Manraah Real-Time WebSocket & WebRTC Signaling Server Active\n");
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

console.log("⚡ Initializing Manraah Real-Time Socket.IO Server...");

io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // 1. Companion Queue Subscriptions
  socket.on("join_companion_queue", () => {
    socket.join("companion_queue");
    console.log(`👤 Socket ${socket.id} joined companion_queue`);
  });

  // 2. Room Architecture (Isolated user-companion pairs)
  socket.on("join_room", ({ roomId, userAlias }) => {
    socket.join(`room_${roomId}`);
    console.log(`💬 Socket ${socket.id} (${userAlias || "User"}) joined room_${roomId}`);
  });

  socket.on("leave_room", ({ roomId }) => {
    socket.leave(`room_${roomId}`);
    console.log(`🚪 Socket ${socket.id} left room_${roomId}`);
  });

  // 3. Instant Chat Message with Delivery Acknowledgment Callback
  socket.on("chat_message", async (data, ack) => {
    const { roomId, senderType, message, userAlias } = data;
    const msgId = "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const createdAt = new Date().toISOString();

    const payload = {
      id: msgId,
      roomId,
      senderType,
      message,
      createdAt,
    };

    // Instant room broadcast to recipient (excludes sender to prevent duplicate echo)
    socket.to(`room_${roomId}`).emit("chat_message", payload);

    // Neon DB async persistence with safe room upsert
    if (sql) {
      sql`
        INSERT INTO anonymous_rooms (id, user_id, user_alias, status)
        VALUES (${roomId}, 'usr_anonymous', ${userAlias || "Anonymous Member"}, 'ACTIVE')
        ON CONFLICT (id) DO NOTHING
      `
        .then(() => {
          return sql`
            INSERT INTO messages (id, room_id, sender_type, message)
            VALUES (${msgId}, ${roomId}, ${senderType}, ${message})
          `;
        })
        .catch((err) => console.error("Error saving message to DB:", err));
    }

    if (typeof ack === "function") {
      ack({ status: "ok", id: msgId, timestamp: createdAt });
    }
  });

  // 4. Typing Indicators
  socket.on("typing_start", ({ roomId, userAlias }) => {
    socket.to(`room_${roomId}`).emit("typing_status", { isTyping: true, userAlias });
  });

  socket.on("typing_stop", ({ roomId }) => {
    socket.to(`room_${roomId}`).emit("typing_status", { isTyping: false });
  });

  // 5. Queue Join, Accept, & Broadcasts
  socket.on("queue_join", ({ room }) => {
    io.to("companion_queue").emit("queue_update", { action: "join", room });
  });

  socket.on("queue_accept", ({ roomId, companionAlias }) => {
    io.to("companion_queue").emit("queue_update", { action: "accept", roomId });
    io.to(`room_${roomId}`).emit("session_accepted", { companionAlias, status: "ACTIVE" });
  });

  socket.on("queue_end", ({ roomId }) => {
    io.to(`room_${roomId}`).emit("session_ended", { roomId });
    io.to("companion_queue").emit("queue_update", { action: "end", roomId });
  });

  socket.on("mode_switch", ({ roomId, mode }) => {
    io.to(`room_${roomId}`).emit("mode_switch", { mode });
  });

  // 6. WebRTC Voice Call Signaling Suite
  socket.on("offer", ({ roomId, sender, sdpOffer }) => {
    socket.to(`room_${roomId}`).emit("offer", { sender, sdpOffer });
    socket.to(`room_${roomId}`).emit("incoming_call", { sender, sdpOffer });
  });

  socket.on("webrtc_offer", ({ roomId, sender, sdpOffer }) => {
    socket.to(`room_${roomId}`).emit("webrtc_offer", { sender, sdpOffer });
    socket.to(`room_${roomId}`).emit("offer", { sender, sdpOffer });
    socket.to(`room_${roomId}`).emit("incoming_call", { sender, sdpOffer });
  });

  socket.on("answer", ({ roomId, sender, sdpAnswer }) => {
    socket.to(`room_${roomId}`).emit("answer", { sender, sdpAnswer });
  });

  socket.on("webrtc_answer", ({ roomId, sender, sdpAnswer }) => {
    socket.to(`room_${roomId}`).emit("webrtc_answer", { sender, sdpAnswer });
    socket.to(`room_${roomId}`).emit("answer", { sender, sdpAnswer });
  });

  socket.on("ice_candidate", ({ roomId, sender, candidate }) => {
    socket.to(`room_${roomId}`).emit("ice_candidate", { sender, candidate });
  });

  socket.on("webrtc_ice", ({ roomId, sender, candidate }) => {
    socket.to(`room_${roomId}`).emit("webrtc_ice", { sender, candidate });
    socket.to(`room_${roomId}`).emit("ice_candidate", { sender, candidate });
  });

  socket.on("call_accepted", ({ roomId, sender }) => {
    socket.to(`room_${roomId}`).emit("call_accepted", { sender });
  });

  socket.on("call_rejected", ({ roomId, sender }) => {
    socket.to(`room_${roomId}`).emit("call_rejected", { sender });
  });

  socket.on("call_ended", ({ roomId }) => {
    io.to(`room_${roomId}`).emit("call_ended");
    io.to(`room_${roomId}`).emit("webrtc_end");
  });

  socket.on("webrtc_end", ({ roomId }) => {
    io.to(`room_${roomId}`).emit("webrtc_end");
    io.to(`room_${roomId}`).emit("call_ended");
  });

  // 7. Presence Updates
  socket.on("presence_update", ({ companionId, status }) => {
    io.to("companion_queue").emit("presence_update", { companionId, status });
  });

  socket.on("disconnect", () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.SOCKET_PORT || 3005;
server.listen(PORT, () => {
  console.log(`🚀 Manraah Socket.IO Server running on http://localhost:${PORT}`);
});
