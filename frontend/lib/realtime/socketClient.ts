import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocketClient(): Socket {
  if (!socket) {
    const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
    const isLocalhost = host === "localhost" || host === "127.0.0.1";
    const defaultSocketUrl = isLocalhost ? "http://localhost:3005" : "https://tradesagaai.duckdns.org";
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || defaultSocketUrl;

    console.log("⚡ Connecting Socket.IO client to:", socketUrl);

    socket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("⚡ Connected to Manraah WebSocket Server:", socket?.id);
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
