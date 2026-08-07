"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnonymizedListener, CompanionChatMessage } from "@/backend/types";
import SharedChatBubble from "@/frontend/components/ui/SharedChatBubble";
import SharedChatInput from "@/frontend/components/ui/SharedChatInput";
import { getSocketClient } from "@/frontend/lib/realtime/socketClient";

interface ChatScreenProps {
  listener: AnonymizedListener;
  roomId: string;
  onEndSession: () => void;
  onSwitchToCall: () => void;
}

export default function ChatScreen({ listener, roomId, onEndSession, onSwitchToCall }: ChatScreenProps) {
  const [messages, setMessages] = useState<CompanionChatMessage[]>([
    {
      id: "msg_init",
      sender: "system",
      text: `Connected anonymously with ${listener.displayId}. Identity is masked. Zero PII exposed.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
    {
      id: "msg_welcome",
      sender: "listener",
      text: "Hi there. I'm here to listen. Take your time, whenever you're ready to share.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll ONLY inside the chat container box, keeping outer page fixed and consistent
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    const socket = getSocketClient();

    socket.emit("join_room", { roomId, userAlias: "User" });

    const handleIncomingChatMessage = (data: { id: string; senderType: string; message: string; createdAt?: string }) => {
      const isListener = data.senderType === "listener" || data.senderType === "companion";
      
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;

        return [
          ...prev,
          {
            id: data.id || "msg_" + Date.now(),
            sender: isListener ? "listener" : "user",
            text: data.message,
            timestamp: new Date(data.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ];
      });
    };

    socket.on("chat_message", handleIncomingChatMessage);

    return () => {
      socket.off("chat_message", handleIncomingChatMessage);
    };
  }, [roomId]);

  const handleSendMessage = (text: string) => {
    const socket = getSocketClient();
    const msgId = "msg_u_" + Date.now();

    // Optimistic UI update
    setMessages((prev) => [
      ...prev,
      {
        id: msgId,
        sender: "user",
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    // Emit real Socket.IO message
    socket.emit("chat_message", {
      roomId,
      senderType: "user",
      message: text,
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-4 animate-fadeIn select-none">
      {/* Session Top Bar */}
      <div className="p-4 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${listener.avatarBg} flex items-center justify-center font-bold text-sm`}>
            L
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-on-surface">{listener.displayId}</h3>
            <p className="text-[11px] text-secondary font-medium">● Connected • Active Session</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSwitchToCall}
            className="px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-bold transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base text-secondary">call</span>
            Call
          </button>
          <button
            onClick={onEndSession}
            className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all"
          >
            End Session
          </button>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft h-[520px] flex flex-col justify-between">
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-2 pr-2">
          {messages.map((msg) => (
            <SharedChatBubble key={msg.id} message={msg} isSelf={msg.sender === "user"} accentColor="mint" />
          ))}
        </div>

        <SharedChatInput
          onSendMessage={handleSendMessage}
          placeholder="Type an anonymous message..."
          quickPromptChips={[
            "I'm feeling overwhelmed today.",
            "I need someone to listen without judgment.",
            "Can we talk about exam/work stress?",
          ]}
        />
      </div>
    </div>
  );
}
