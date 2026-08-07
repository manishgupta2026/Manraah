"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { getSocketClient } from "@/frontend/lib/realtime/socketClient";
import { getWebRTCConfiguration } from "@/frontend/lib/webrtc/iceConfig";
import { Socket } from "socket.io-client";

interface ChatMessage {
  id: string;
  senderType: "USER" | "COMPANION" | "SYSTEM";
  message: string;
  createdAt: string;
}

export default function ActiveSessionScreen() {
  const { categoryDetails } = useCategory();

  // Anonymous Session State
  const [roomId, setRoomId] = useState<string | null>(null);
  const [userAlias, setUserAlias] = useState<string>("Anonymous User #104");
  const [companionAlias, setCompanionAlias] = useState<string>("Companion #12");
  const [sessionStatus, setSessionStatus] = useState<"WAITING" | "ACTIVE" | "ENDED">("WAITING");

  // Real-time Chat & Typing State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isPeerTyping, setIsPeerTyping] = useState<boolean>(false);

  // WebRTC Audio Call State
  const [isInCall, setIsInCall] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [callStatus, setCallStatus] = useState<string>("Disconnected");

  // Socket & WebRTC Refs
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Join Anonymous Queue & Connect Socket.IO (Zero Polling)
  useEffect(() => {
    async function joinAnonymousQueue() {
      try {
        const res = await fetch("/api/companion/queue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "join",
            category: categoryDetails.name,
            topic: "Emotional Support & Venting",
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const room = data.room;
          setRoomId(room.id);
          setUserAlias(room.userAlias);
          setCompanionAlias(room.companionAlias);
          setSessionStatus(room.status);

          setMessages([
            {
              id: "msg_init",
              senderType: "SYSTEM",
              message: `Connected to Anonymous Sanctuary. Your identity is completely protected as ${room.userAlias}. Waiting for an available peer companion...`,
              createdAt: new Date().toISOString(),
            },
          ]);

          // Broadcast queue join to WebSocket companion_queue
          const socket = getSocketClient();
          socketRef.current = socket;
          socket.emit("queue_join", { room });
        }
      } catch (err) {
        console.error("Failed to join anonymous queue:", err);
      }
    }

    joinAnonymousQueue();
  }, [categoryDetails]);

  // 2. Connect to Room WebSocket Channel (Zero Polling)
  useEffect(() => {
    if (!roomId) return;

    const socket = socketRef.current || getSocketClient();
    socket.emit("join_room", { roomId, userAlias });

    // Instant WebSocket Chat Event Listener
    socket.on("chat_message", (newMsg: ChatMessage) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    // Instant Typing Status Event Listener
    socket.on("typing_status", ({ isTyping }) => {
      setIsPeerTyping(isTyping);
    });

    // Instant Session Accepted Event Listener
    socket.on("session_accepted", ({ companionAlias: acceptedCompanionAlias }) => {
      setSessionStatus("ACTIVE");
      setCompanionAlias(acceptedCompanionAlias);
      setMessages((prev) => [
        ...prev,
        {
          id: "msg_acc_" + Date.now(),
          senderType: "SYSTEM",
          message: `Peer Companion ${acceptedCompanionAlias} has joined your 1-on-1 anonymous sanctuary. You can now chat or start a WebRTC voice call.`,
          createdAt: new Date().toISOString(),
        },
      ]);
    });

    // WebRTC Signaling Event Listeners
    socket.on("webrtc_answer", async ({ sender, sdpAnswer }) => {
      if (sender === "COMPANION" && peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(sdpAnswer));
        setCallStatus("Voice Call Connected (P2P STUN/TURN)");
      }
    });

    socket.on("webrtc_ice", async ({ sender, candidate }) => {
      if (sender === "COMPANION" && peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on("webrtc_end", () => {
      endVoiceCall();
    });

    return () => {
      socket.emit("leave_room", { roomId });
      socket.off("chat_message");
      socket.off("typing_status");
      socket.off("session_accepted");
      socket.off("webrtc_answer");
      socket.off("webrtc_ice");
      socket.off("webrtc_end");
    };
  }, [roomId, userAlias]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Instant WebSocket Message Send with Acknowledgment
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !roomId) return;

    const text = chatInput;
    setChatInput("");

    if (socketRef.current) {
      socketRef.current.emit(
        "chat_message",
        {
          roomId,
          senderType: "USER",
          message: text,
          userAlias,
        },
        (ack: any) => {
          if (ack && ack.status === "ok") {
            console.log("User message delivered:", ack.id);
          }
        }
      );

      socketRef.current.emit("typing_stop", { roomId });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value);
    if (socketRef.current && roomId) {
      if (e.target.value.length > 0) {
        socketRef.current.emit("typing_start", { roomId, userAlias });
      } else {
        socketRef.current.emit("typing_stop", { roomId });
      }
    }
  };

  // Start Native WebRTC Voice Call with STUN/TURN Configuration
  const startVoiceCall = async () => {
    if (!roomId) return;
    try {
      setCallStatus("Requesting Microphone Access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;

      const rtcConfig = getWebRTCConfiguration();
      const pc = new RTCPeerConnection(rtcConfig);

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("webrtc_ice", {
            roomId,
            sender: "USER",
            candidate: event.candidate,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        setCallStatus(`WebRTC State: ${pc.connectionState}`);
      };

      peerConnectionRef.current = pc;
      setIsInCall(true);
      setCallStatus("Ringing Peer Companion...");

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Emit instant WebRTC offer via WebSocket
      if (socketRef.current) {
        socketRef.current.emit("webrtc_offer", {
          roomId,
          sender: "USER",
          sdpOffer: offer,
        });
      }
    } catch (err: any) {
      console.error("WebRTC Error:", err);
      setCallStatus("Microphone Error: " + err.message);
    }
  };

  // End WebRTC Voice Call
  const endVoiceCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (socketRef.current && roomId) {
      socketRef.current.emit("webrtc_end", { roomId });
    }
    setIsInCall(false);
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

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6 animate-fadeIn select-none">
      
      {/* Session Header */}
      <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wider">
              100% Anonymous 1-on-1 Sanctuary
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">
              ● WebSocket Live ({sessionStatus})
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-heading font-bold text-on-surface">
            Anonymous Sanctuary Session
          </h1>
          <p className="text-xs text-on-surface-variant">
            Identity Masked as <span className="font-bold text-primary">{userAlias}</span> • Zero PII Exposure
          </p>
        </div>

        <Link
          href="/human-companion"
          onClick={endVoiceCall}
          className="px-4 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-base">call_end</span>
          Safe Exit / End Session
        </Link>
      </div>

      {/* Main Communication Panel: WebRTC STUN/TURN Call & Real-time WebSocket Text Chat */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Box: WebRTC Voice Call Controls (5 cols) */}
        <div className="md:col-span-5 p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft flex flex-col justify-between items-center text-center space-y-6 h-[560px]">
          
          <div className="space-y-3 w-full">
            <div className="w-28 h-28 mx-auto rounded-full bg-primary-container/20 border-4 border-primary/30 flex items-center justify-center shadow-inner relative">
              <span className={`material-symbols-outlined text-5xl text-primary ${isInCall ? "animate-pulse" : ""}`}>
                {isInCall ? "graphic_eq" : "account_circle"}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-heading font-bold text-lg text-on-surface">{companionAlias}</h3>
              <p className="text-xs text-primary font-semibold">Trained Peer Companion</p>
              <p className="text-[11px] text-on-surface-variant/80">Confidential • STUN/TURN WebRTC Encryption</p>
            </div>

            {callStatus !== "Disconnected" && (
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold">
                🎙️ {callStatus}
              </div>
            )}
          </div>

          {/* Audio Call Buttons */}
          <div className="space-y-3 w-full">
            {!isInCall ? (
              <button
                onClick={startVoiceCall}
                disabled={sessionStatus !== "ACTIVE"}
                className={`w-full py-3.5 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                  sessionStatus === "ACTIVE"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white scale-105 active:scale-95"
                    : "bg-surface-container-high text-on-surface-variant/60 cursor-not-allowed"
                }`}
              >
                <span className="material-symbols-outlined text-lg">call</span>
                {sessionStatus === "ACTIVE" ? "Start WebRTC Voice Call" : "Waiting for Companion..."}
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={toggleMute}
                  className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isMuted ? "bg-amber-500 text-white" : "bg-surface-container-high text-on-surface hover:bg-surface-container"
                  }`}
                >
                  {isMuted ? "Unmute Mic" : "Mute Mic"}
                </button>
                <button
                  onClick={endVoiceCall}
                  className="flex-1 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md"
                >
                  End Call
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Box: Real-Time Anonymous Text Chat (7 cols) */}
        <div className="md:col-span-7 p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft flex flex-col justify-between h-[560px]">
          
          <div className="pb-3 border-b border-surface-variant/20 flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-on-surface">WebSocket Anonymous Chat</h3>
            <span className="text-[10px] text-emerald-600 font-mono font-bold">● Instant Real-Time</span>
          </div>

          {/* Message History */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-2">
            {messages.map((msg) => {
              if (msg.senderType === "SYSTEM") {
                return (
                  <div key={msg.id} className="p-3 rounded-2xl bg-primary-container/15 border border-primary/20 text-xs text-on-surface-variant text-center leading-relaxed">
                    🛡️ {msg.message}
                  </div>
                );
              }
              const isUser = msg.senderType === "USER";
              return (
                <div key={msg.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                  <div
                    className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed shadow-xs ${
                      isUser
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
                Peer Companion is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-surface-variant/20 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={handleInputChange}
              placeholder="Type an anonymous message..."
              className="flex-1 p-3 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-purple text-white text-xs font-bold shadow-md transition-all"
            >
              Send (WebSocket) →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
