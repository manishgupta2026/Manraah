import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocketClient(): Socket {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3005";

    socket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      transports: ["polling", "websocket"],
    });

    socket.on("connect", () => {
      console.log("🔌 Connected to Socket.IO server at:", socketUrl);
    });

    socket.on("connect_error", (err) => {
      console.warn("⚠️ WebSocket connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.warn("❌ WebSocket disconnected:", reason);
    });
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}
