"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnonymizedUser, CompanionChatMessage } from "@/backend/types";
import SharedChatBubble from "@/frontend/components/ui/SharedChatBubble";
import SharedChatInput from "@/frontend/components/ui/SharedChatInput";
import { getSocketClient } from "@/frontend/lib/realtime/socketClient";

interface ListenerChatScreenProps {
  user: AnonymizedUser;
  onEndSession: () => void;
  onSwitchToCall: () => void;
  onTriggerFlag?: () => void;
}

export default function ListenerChatScreen({
  user,
  onEndSession,
  onSwitchToCall,
  onTriggerFlag = () => {},
}: ListenerChatScreenProps) {
  const [messages, setMessages] = useState<CompanionChatMessage[]>([
    {
      id: "msg_init",
      sender: "system",
      text: `Connected with ${user.userTag}. Sanctuary safe space active.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const socket = getSocketClient();

    const handleReceiveMessage = (data: { sender: string; text: string; timestamp?: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}`,
          sender: "user",
          text: data.text,
          timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    };

    const handleUserTyping = () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    };

    socket.on("companion_message_received", handleReceiveMessage);
    socket.on("user_typing", handleUserTyping);

    return () => {
      socket.off("companion_message_received", handleReceiveMessage);
      socket.off("user_typing", handleUserTyping);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const newMsg: CompanionChatMessage = {
      id: `msg_${Date.now()}`,
      sender: "listener",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);

    const socket = getSocketClient();
    socket.emit("send_companion_message", {
      roomId: user.id,
      text,
      sender: "companion",
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-soft-xl overflow-hidden select-none">
      {/* Header */}
      <div className="p-4 bg-surface-container-low border-b border-surface-variant/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            🤝
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-on-surface">
              {user.userTag}
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                {user.categoryTag}
              </span>
              <span>Topic: {user.topic}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSwitchToCall}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">call</span>
            Start Voice Call
          </button>

          <button
            onClick={onEndSession}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 text-xs font-bold transition-all"
          >
            End Session
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg) => (
          <SharedChatBubble
            key={msg.id}
            message={msg}
            isSelf={msg.sender === "listener"}
          />
        ))}

        {isTyping && (
          <div className="text-[11px] text-on-surface-variant/70 italic px-2">
            {user.userTag} is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-surface-container-low border-t border-surface-variant/30">
        <SharedChatInput
          onSendMessage={handleSendMessage}
          placeholder={`Empathetic reply to ${user.userTag}...`}
        />
      </div>
    </div>
  );
}
