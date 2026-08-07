import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocketClient(): Socket {
  if (!socket) {
    const isBrowser = typeof window !== "undefined";
    const host = isBrowser ? window.location.hostname : "localhost";
    const isLocalhost = host === "localhost" || host === "127.0.0.1";
    const defaultSocketUrl = isLocalhost ? "http://localhost:3005" : "https://tradesagaai.duckdns.org";
    let socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || defaultSocketUrl;

    // Auto-upgrade unencrypted http:// to https:// on production HTTPS origins
    if (isBrowser && window.location.protocol === "https:" && socketUrl.startsWith("http://")) {
      socketUrl = "https://tradesagaai.duckdns.org";
    }

    socket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      transports: ["polling", "websocket"],
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
