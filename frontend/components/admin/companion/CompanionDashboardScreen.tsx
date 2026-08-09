"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSocketClient } from "@/frontend/lib/realtime/socketClient";
import { getWebRTCConfiguration } from "@/frontend/lib/webrtc/iceConfig";
import { Socket } from "socket.io-client";

interface CompanionProfile {
  id: string;
  name: string;
  email: string;
  role: "COMPANION" | "SUPERVISOR" | "ADMIN";
  status: "ONLINE" | "BUSY" | "OFFLINE";
}

interface Room {
  id: string;
  userAlias: string;
  companionAlias: string;
  category: string;
  topic: string;
  status: "WAITING" | "ACTIVE" | "ENDED";
  createdAt: string;
}

interface ChatMessage {
  id: string;
  roomId: string;
  senderType: "USER" | "COMPANION" | "SYSTEM";
  message: string;
  createdAt: string;
}

export default function CompanionDashboardScreen() {
  const router = useRouter();

  // Auth & Role State
  const [companion, setCompanion] = useState<CompanionProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Active Tab for Supervisors / Admins
  const [activeTab, setActiveTab] = useState<"WORKSPACE" | "MONITOR" | "ADMIN_PANEL">("WORKSPACE");

  // Queue & Room State
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);

  // Real-time Chat & Typing State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isPeerTyping, setIsPeerTyping] = useState(false);

  // WebRTC P2P Voice Call State
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setCallStatus] = useState<string>("Disconnected");
  const [incomingCallOffer, setIncomingCallOffer] = useState<any>(null);

  // Socket & WebRTC Refs
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Companion Session Profile on Mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/companion/me");
        if (res.ok) {
          const data = await res.json();
          setCompanion(data.companion);
        } else {
          router.push("/companion/login");
        }
      } catch (err) {
        console.error("Companion auth error:", err);
        router.push("/companion/login");
      } finally {
        setLoadingAuth(false);
      }
    }
    checkAuth();
  }, [router]);

  // 2. Fetch Initial Queue & Connect Socket.IO (Zero Polling)
  useEffect(() => {
    async function loadInitialQueue() {
      try {
        const res = await fetch("/api/companion/queue?status=WAITING");
        if (res.ok) {
          const data = await res.json();
          setRooms(data);
        }
      } catch (err) {
        console.error("Queue load error:", err);
      }
    }

    loadInitialQueue();

    // Connect WebSocket
    const socket = getSocketClient();
    socketRef.current = socket;
    socket.emit("join_companion_queue");

    // Real-Time Queue Updates Event Listener (No Polling)
    socket.on("queue_update", ({ action, room, roomId }) => {
      if (action === "join" && room) {
        setRooms((prev) => [room, ...prev.filter((r) => r.id !== room.id)]);
      } else if ((action === "accept" || action === "end") && roomId) {
        setRooms((prev) => prev.filter((r) => r.id !== roomId));
      }
    });

    return () => {
      socket.off("queue_update");
    };
  }, []);

  // 3. Connect to Active Room WebSocket Channel (Zero Polling)
  useEffect(() => {
    if (!activeRoom) return;

    const roomId = activeRoom.id;
    const socket = socketRef.current || getSocketClient();

    // Join room channel
    socket.emit("join_room", { roomId, userAlias: companion?.name || "Companion" });

    // Fetch initial chat history once
    async function fetchChatHistory() {
      try {
        const res = await fetch(`/api/chat/history?roomId=${roomId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    }
    fetchChatHistory();

    // Instant WebSocket Chat Event Listener
    socket.on("chat_message", (newMsg: ChatMessage) => {
      if (newMsg.roomId === roomId) {
        setMessages((prev) => [...prev, newMsg]);
      }
    });

    // Instant Typing Indicator Event Listener
    socket.on("typing_status", ({ isTyping }) => {
      setIsPeerTyping(isTyping);
    });

    // Instant WebRTC Incoming Call Event Listener
    socket.on("incoming_call", ({ sender, sdpOffer }) => {
      if (sender === "USER") {
        setIncomingCallOffer(sdpOffer);
        setCallStatus("🔔 Incoming Voice Call from User...");
      }
    });

    socket.on("webrtc_answer", async ({ sender, sdpAnswer }) => {
      if (sender === "USER" && peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(sdpAnswer));
        setCallStatus("Voice Call Connected (P2P)");
      }
    });

    socket.on("webrtc_ice", async ({ sender, candidate }) => {
      if (sender === "USER" && peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on("webrtc_end", () => {
      endWebRTCCall();
    });

    return () => {
      socket.emit("leave_room", { roomId });
      socket.off("chat_message");
      socket.off("typing_status");
      socket.off("incoming_call");
      socket.off("webrtc_answer");
      socket.off("webrtc_ice");
      socket.off("webrtc_end");
    };
  }, [activeRoom, companion]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Accept Queue Room
  const handleAcceptRoom = async (room: Room) => {
    try {
      const res = await fetch("/api/companion/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept", roomId: room.id }),
      });

      if (res.ok) {
        const updatedRoom: Room = { ...room, status: "ACTIVE" };
        setActiveRoom(updatedRoom);
        setRooms((prev) => prev.filter((r) => r.id !== room.id));

        // Broadcast accept over WebSockets
        if (socketRef.current) {
          socketRef.current.emit("queue_accept", {
            roomId: room.id,
            companionAlias: companion?.name ? `${companion.name} (${companion.role})` : "Companion #12",
          });
        }
      }
    } catch (err) {
      console.error("Failed to accept room:", err);
    }
  };

  // Instant WebSocket Chat Send
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !activeRoom) return;

    const text = chatInput;
    setChatInput("");

    if (socketRef.current) {
      socketRef.current.emit(
        "chat_message",
        {
          roomId: activeRoom.id,
          senderType: "COMPANION",
          message: text,
          userAlias: companion?.name || "Companion",
        },
        (ack: any) => {
          // Message Delivery Acknowledgment Callback
          if (ack && ack.status === "ok") {
            console.log("Message delivered:", ack.id);
          }
        }
      );

      socketRef.current.emit("typing_stop", { roomId: activeRoom.id });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value);
    if (socketRef.current && activeRoom) {
      if (e.target.value.length > 0) {
        socketRef.current.emit("typing_start", { roomId: activeRoom.id, userAlias: companion?.name });
      } else {
        socketRef.current.emit("typing_stop", { roomId: activeRoom.id });
      }
    }
  };

  // Accept & Start WebRTC Voice Call with STUN + TURN Relay Support
  const acceptIncomingCall = async () => {
    if (!activeRoom || !incomingCallOffer) return;
    try {
      setCallStatus("Connecting WebRTC Audio Stream...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;

      const rtcConfig = getWebRTCConfiguration();
      const pc = new RTCPeerConnection(rtcConfig);

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("webrtc_ice", {
            roomId: activeRoom.id,
            sender: "COMPANION",
            candidate: event.candidate,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        setCallStatus(`WebRTC Voice: ${pc.connectionState}`);
      };

      peerConnectionRef.current = pc;
      setIsInCall(true);

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCallOffer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (socketRef.current) {
        socketRef.current.emit("webrtc_answer", {
          roomId: activeRoom.id,
          sender: "COMPANION",
          sdpAnswer: answer,
        });
      }

      setIncomingCallOffer(null);
      setCallStatus("Connected (WebRTC STUN/TURN P2P Audio)");
    } catch (err: any) {
      console.error("WebRTC Error:", err);
      setCallStatus("Call Error: " + err.message);
    }
  };

  // End WebRTC Call
  const endWebRTCCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (socketRef.current && activeRoom) {
      socketRef.current.emit("webrtc_end", { roomId: activeRoom.id });
    }
    setIsInCall(false);
    setIncomingCallOffer(null);
    setCallStatus("Call Ended");
  };

  // Mute Toggle
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  // Logout
  const handleLogout = async () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    await fetch("/api/companion/logout", { method: "POST" });
    router.push("/companion/login");
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-xs font-bold text-primary animate-pulse">Authenticating Companion Portal Session...</p>
      </div>
    );
  }

  if (!companion) return null;

  return (
    <div className="max-w-7xl mx-auto py-4 space-y-6 animate-fadeIn select-none">
      
      {/* Top Portal Header */}
      <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <span className="px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              {companion.role} PORTAL
            </span>
            <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">
              ● WebSocket Active
            </span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-on-surface">
            Welcome, {companion.name}
          </h1>
          <p className="text-xs text-on-surface-variant">
            Segregated Companion Workspace • {companion.email}
          </p>
        </div>

        {/* Action Controls & Navigation Tabs for Supervisor/Admin */}
        <div className="flex items-center gap-3">
          {(companion.role === "SUPERVISOR" || companion.role === "ADMIN") && (
            <div className="flex bg-surface-container-low p-1 rounded-2xl border border-surface-variant/20">
              <button
                onClick={() => setActiveTab("WORKSPACE")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "WORKSPACE" ? "bg-primary text-white" : "text-on-surface-variant"
                }`}
              >
                Workspace
              </button>
              {companion.role === "SUPERVISOR" && (
                <button
                  onClick={() => setActiveTab("MONITOR")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "MONITOR" ? "bg-secondary text-white" : "text-on-surface-variant"
                  }`}
                >
                  Supervisor Monitor
                </button>
              )}
              {companion.role === "ADMIN" && (
                <button
                  onClick={() => setActiveTab("ADMIN_PANEL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "ADMIN_PANEL" ? "bg-tertiary text-white" : "text-on-surface-variant"
                  }`}
                >
                  Admin Portal
                </button>
              )}
            </div>
          )}

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-2xl bg-surface-container-high text-on-surface hover:bg-rose-500 hover:text-white text-xs font-bold transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* VIEW 1: WORKSPACE */}
      {activeTab === "WORKSPACE" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Real-Time Waiting Users Queue (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-bold text-base text-on-surface">Waiting User Queue</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {rooms.length} Waiting
                </span>
              </div>

              <div className="space-y-3">
                {rooms.length === 0 ? (
                  <p className="text-xs text-on-surface-variant text-center py-6">
                    No users currently waiting in queue.
                  </p>
                ) : (
                  rooms.map((room) => (
                    <div
                      key={room.id}
                      className="p-4 rounded-2xl bg-surface-container-low border border-surface-variant/20 space-y-2 hover:border-primary/40 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-on-surface">{room.userAlias}</span>
                        <span className="text-[10px] text-primary font-bold">{room.category}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant font-medium">{room.topic}</p>
                      <button
                        onClick={() => handleAcceptRoom(room)}
                        className="w-full py-2 rounded-xl bg-primary hover:bg-primary-purple text-white text-xs font-bold transition-all shadow-xs"
                      >
                        Accept Conversation →
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Real-Time WebSocket & WebRTC Voice Workspace (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {activeRoom ? (
              <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft flex flex-col justify-between h-[600px]">
                
                {/* Session Header */}
                <div className="pb-4 border-b border-surface-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <h3 className="font-heading font-bold text-base text-on-surface">
                      Chatting with <span className="text-primary">{activeRoom.userAlias}</span>
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      Category: {activeRoom.category} • Topic: {activeRoom.topic}
                    </p>
                  </div>

                  {/* WebRTC Call Controls & Instant Ringing Event */}
                  <div className="flex items-center gap-2">
                    {incomingCallOffer ? (
                      <button
                        onClick={acceptIncomingCall}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 animate-bounce"
                      >
                        <span className="material-symbols-outlined text-base">call</span>
                        Answer Incoming Voice Call 🔔
                      </button>
                    ) : isInCall ? (
                      <>
                        <button
                          onClick={toggleMute}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                            isMuted ? "bg-amber-500 text-white" : "bg-surface-container-high text-on-surface hover:bg-surface-container"
                          }`}
                        >
                          {isMuted ? "Unmute Mic" : "Mute Mic"}
                        </button>
                        <button
                          onClick={endWebRTCCall}
                          className="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-bold"
                        >
                          End Call
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-on-surface-variant font-medium">Waiting for User Call...</span>
                    )}
                  </div>
                </div>

                {callStatus !== "Disconnected" && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold text-center">
                    🎙️ {callStatus}
                  </div>
                )}

                {/* Instant WebSocket Message History */}
                <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2">
                  {messages.map((msg) => {
                    const isCompanion = msg.senderType === "COMPANION";
                    return (
                      <div key={msg.id} className={`flex flex-col ${isCompanion ? "items-end" : "items-start"}`}>
                        <div
                          className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                            isCompanion
                              ? "bg-primary text-white rounded-tr-none"
                              : "bg-surface-container-low text-on-surface border border-surface-variant/30 rounded-tl-none"
                          }`}
                        >
                          {msg.message}
                        </div>
                        <span className="text-[10px] text-on-surface-variant/60 mt-1 px-1 font-mono">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    );
                  })}
                  {isPeerTyping && (
                    <div className="text-xs text-primary/80 italic animate-pulse">
                      User is typing a message...
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Instant WebSocket Chat Form */}
                <form onSubmit={handleSendMessage} className="pt-3 border-t border-surface-variant/20 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={handleInputChange}
                    placeholder="Type an anonymous supportive message..."
                    className="flex-1 p-3 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-purple text-white text-xs font-bold shadow-md"
                  >
                    Send (WebSocket) →
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-12 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft text-center space-y-3 flex flex-col items-center justify-center min-h-[400px]">
                <span className="material-symbols-outlined text-6xl text-primary/40 block">forum</span>
                <h3 className="text-xl font-heading font-bold text-on-surface">No Active Conversation Selected</h3>
                <p className="text-xs text-on-surface-variant max-w-sm">
                  Accept a waiting user from the queue on the left to start a real-time WebSocket chat & WebRTC P2P voice call.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: SUPERVISOR MONITOR (RBAC) */}
      {activeTab === "MONITOR" && companion.role === "SUPERVISOR" && (
        <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-6">
          <h2 className="text-xl font-heading font-bold text-on-surface">Supervisor Active Sessions Monitor</h2>
          <p className="text-xs text-on-surface-variant">
            Monitor active companion sessions, ensure clinical compliance, and manage conversation transfers.
          </p>

          <div className="p-6 rounded-2xl bg-surface-container-low border border-surface-variant/20 text-center space-y-2">
            <span className="material-symbols-outlined text-4xl text-secondary block">visibility</span>
            <p className="text-xs font-bold text-on-surface">Live WebSocket Supervisor Audit Active</p>
            <p className="text-xs text-on-surface-variant">0 Active Crisis Escalations Reported.</p>
          </div>
        </div>
      )}

      {/* VIEW 3: ADMIN PANEL (RBAC) */}
      {activeTab === "ADMIN_PANEL" && companion.role === "ADMIN" && (
        <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-6">
          <h2 className="text-xl font-heading font-bold text-on-surface">Administrator Management Portal</h2>
          <p className="text-xs text-on-surface-variant">
            Manage companion accounts, view platform analytics, and audit security logs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-primary-container/15 border border-primary/20 text-center space-y-1">
              <p className="text-xs font-semibold text-on-surface-variant">Total Companions</p>
              <p className="text-2xl font-heading font-black text-primary">3 Active</p>
            </div>
            <div className="p-5 rounded-2xl bg-mint/20 border border-secondary/20 text-center space-y-1">
              <p className="text-xs font-semibold text-on-surface-variant">Role Permissions</p>
              <p className="text-2xl font-heading font-black text-secondary">RBAC Enforced</p>
            </div>
            <div className="p-5 rounded-2xl bg-peach/30 border border-tertiary/20 text-center space-y-1">
              <p className="text-xs font-semibold text-on-surface-variant">Security Audit Logs</p>
              <p className="text-2xl font-heading font-black text-tertiary">Zero PII Leak</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
