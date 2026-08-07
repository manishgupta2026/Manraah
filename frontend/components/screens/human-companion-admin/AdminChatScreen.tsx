"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnonymizedUser, CompanionChatMessage } from "@/backend/types";
import SharedChatBubble from "@/frontend/components/ui/SharedChatBubble";
import SharedChatInput from "@/frontend/components/ui/SharedChatInput";
import { getSocketClient } from "@/frontend/lib/realtime/socketClient";

interface AdminChatScreenProps {
  user: AnonymizedUser;
  onEndSession: () => void;
  onSwitchToCall: () => void;
  onTriggerFlag?: () => void;
}

export default function AdminChatScreen({
  user,
  onEndSession,
  onSwitchToCall,
  onTriggerFlag = () => {},
}: AdminChatScreenProps) {
  const [messages, setMessages] = useState<CompanionChatMessage[]>([
    {
      id: "msg_init",
      sender: "system",
      text: `Connected with ${user.userTag} (${user.categoryTag} • ${user.topic}). Listen with warmth and active empathy.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [privateNotes, setPrivateNotes] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const roomId = user.id;

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

    socket.emit("join_room", { roomId, userAlias: "Peer Listener #104" });

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
    const msgId = "msg_l_" + Date.now();

    // Optimistic UI update
    setMessages((prev) => [
      ...prev,
      {
        id: msgId,
        sender: "listener",
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    // Emit real Socket.IO message
    socket.emit("chat_message", {
      roomId,
      senderType: "listener",
      message: text,
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-4 space-y-4 animate-fadeIn select-none">
      {/* Top Header */}
      <div className="p-4 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-base text-on-surface">{user.userTag}</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
              {user.categoryTag}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">Topic: {user.topic}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSwitchToCall}
            className="px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-bold flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base text-secondary">call</span>
            Call
          </button>
          <button
            onClick={onTriggerFlag}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-700 font-bold text-xs hover:bg-amber-500/30"
          >
            Flag Session
          </button>
          <button
            onClick={onEndSession}
            className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold"
          >
            End Session
          </button>
        </div>
      </div>

      {/* Main Grid: Chat Console (8 cols) & Private Listener Notes (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Chat Console */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft h-[560px] flex flex-col justify-between">
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-2 pr-2">
            {messages.map((msg) => (
              <SharedChatBubble key={msg.id} message={msg} isSelf={msg.sender === "listener"} accentColor="peach" />
            ))}
          </div>

          <SharedChatInput
            onSendMessage={handleSendMessage}
            placeholder="Type an empathetic response..."
            quickPromptChips={[
              "I hear how heavy that feels for you.",
              "That takes courage to express.",
              "What is one small thing that would bring you comfort right now?",
            ]}
            accentButtonClass="bg-secondary hover:bg-secondary/90 text-white"
          />
        </div>

        {/* Right: Private Listener Notes Sidebar */}
        <div className="lg:col-span-4 p-5 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4 h-[560px] overflow-y-auto">
          <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-primary">
            Private Listener Notes (Internal)
          </h4>

          <textarea
            value={privateNotes}
            onChange={(e) => setPrivateNotes(e.target.value)}
            rows={8}
            placeholder="Record confidential observation notes here... (Not shared with user)"
            className="w-full p-3 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />

          <div className="pt-2 border-t border-surface-variant/20 space-y-2 text-[11px] text-on-surface-variant">
            <p className="font-bold text-rose-500 uppercase">Listener Active Rules:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Validate feelings without clinical diagnosis.</li>
              <li>Maintain complete confidentiality.</li>
              <li>Use **Flag Session** if user discloses self-harm intent.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
