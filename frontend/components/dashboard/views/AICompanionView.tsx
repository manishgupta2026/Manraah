"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/frontend/lib/context/AuthContext";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import UserAvatar from "@/frontend/components/ui/UserAvatar";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
}

const SUGGESTED_PROMPTS = [
  "I'm feeling overwhelmed",
  "I need help with stress",
  "I haven't been sleeping well",
  "I just need someone to talk to",
  "I'm having a difficult day",
];

export default function AICompanionView() {
  const { categoryDetails, category } = useCategory();
  const { user } = useAuth();
  const userName = user?.sanctuaryName || user?.name || "Sanctuary Member";
  const userCategory = user?.selectedCategory || category || "General";

  const [inputMessage, setInputMessage] = useState("");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-1",
      sender: "ai",
      text: `Hello ${userName} 🌿. I'm your Manraah AI Companion, calibrated for your wellness journey. How are you feeling right now? Take a slow, deep breath—I'm here for you.`,
      time: "Just now",
    },
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg: Message = {
      id: "usr-" + Date.now(),
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsAiTyping(true);

    try {
      if (user?.id) {
        fetch("/api/chat/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId: "room_" + user.id,
            senderType: "user",
            message: text,
          }),
        }).catch(() => {});
      }
    } catch (e) {}

    // Empathetic contextual AI response
    setTimeout(() => {
      let reply = `I hear you completely, ${userName}. It takes vulnerability to express what you're experiencing. Let's take a gentle 4-second breath together. What part of this feels most demanding right now?`;

      const lower = text.toLowerCase();
      if (lower.includes("overwhelm") || lower.includes("stress") || lower.includes("burnout")) {
        reply = `It is completely valid to feel overwhelmed when multiple demands press on you at once. Remember: you don't have to solve everything today. Let's break things into one tiny, manageable step. Would you like a 2-minute grounding exercise, or just space to vent?`;
      } else if (lower.includes("sleep") || lower.includes("insomnia") || lower.includes("tired")) {
        reply = `Sleep disruption often signals that our nervous system has been running in high alert mode. Try letting your shoulders drop and relaxing your jaw. Would you like some Non-Sleep Deep Rest (NSDR) guidance tonight?`;
      } else if (lower.includes("talk") || lower.includes("listen") || lower.includes("difficult")) {
        reply = `I'm holding space right here with you. There are no expectations or judgments. Take all the time you need to share what's on your mind.`;
      }

      const aiMsg: Message = {
        id: "ai-" + Date.now(),
        sender: "ai",
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsAiTyping(false);
    }, 900);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-full min-w-0 flex flex-col gap-5">
      {/* 1. Companion Header Card */}
      <div className="bg-white dark:bg-[#102F27] rounded-3xl p-6 sm:p-7 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center text-xl shadow-xs shrink-0">
            ✦
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                Manraah AI Companion
              </h1>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#008968] dark:text-[#88F7D6] bg-[#EAF6F0] dark:bg-[#14382F] px-2.5 py-0.5 rounded-full border border-[#D5E8DF] dark:border-[#23483E]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#008968] dark:bg-[#88F7D6] animate-pulse" />
                Here for you
              </span>
            </div>
            <p className="text-xs text-[#6B857C] dark:text-[#A9C5BC] font-medium mt-1">
              Calibrated for {userCategory.replace(/_/g, " ")} well-being • Confidential &amp; Safe
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Voice Mode Action */}
          <button
            onClick={() => setIsVoiceActive(!isVoiceActive)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isVoiceActive
                ? "bg-[#006C56] dark:bg-[#00A982] text-white dark:text-[#071C17] shadow-sm animate-pulse"
                : "bg-[#F4F9F6] dark:bg-[#14382F] text-[#4F685F] dark:text-[#A9C5BC] hover:bg-[#EAF6F0] border border-[#E2ECE6] dark:border-[#23483E]"
            }`}
          >
            <span>🎙️</span>
            <span>{isVoiceActive ? "Voice Active" : "Voice Mode"}</span>
          </button>

          {/* Reset Chat */}
          <button
            onClick={() => {
              if (confirm("Clear conversation history?")) {
                setMessages([
                  {
                    id: "init-reset",
                    sender: "ai",
                    text: `Hello ${userName} 🌿. We have a fresh space. What would you like to explore today?`,
                    time: "Just now",
                  },
                ]);
              }
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#14382F] transition-colors cursor-pointer border border-[#E2ECE6] dark:border-[#23483E]"
            title="Clear conversation"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. Main Chat Conversation Box */}
      <div className="bg-white dark:bg-[#102F27] rounded-3xl p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs flex flex-col justify-between space-y-5 transition-colors">
        {/* Messages Stream Container */}
        <div className="min-h-[340px] max-h-[480px] overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar Icon */}
              {msg.sender === "user" ? (
                <UserAvatar user={user} sizeClass="w-8 h-8 text-xs" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] border border-[#D2E8DC] dark:border-[#23483E]">
                  ✦
                </div>
              )}

              {/* Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-2xs space-y-1.5 ${
                  msg.sender === "user"
                    ? "bg-[#004D3D] dark:bg-[#00A982] text-white dark:text-[#071C17] rounded-tr-xs"
                    : "bg-[#F4FAF7] dark:bg-[#0E2A23] text-[#19332A] dark:text-[#F4FAF7] border border-[#E2ECE6] dark:border-[#23483E] rounded-tl-xs"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <p
                  className={`text-[9px] font-medium text-right ${
                    msg.sender === "user"
                      ? "text-white/70 dark:text-[#071C17]/70"
                      : "text-[#789389] dark:text-[#78958C]"
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          ))}

          {isAiTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center font-bold text-xs">
                ✦
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F4FAF7] dark:bg-[#0E2A23] border border-[#E2ECE6] dark:border-[#23483E] text-xs text-[#789389] dark:text-[#78958C] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#006C56] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#006C56] animate-bounce delay-150" />
                <span className="w-2 h-2 rounded-full bg-[#006C56] animate-bounce delay-300" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Section: Suggested Prompts + Input Bar */}
        <div className="space-y-3 pt-2 border-t border-[#E2ECE6] dark:border-[#23483E]">
          {/* Suggested Prompt Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSendMessage(prompt)}
                className="px-3 py-1 rounded-full bg-[#F4F9F6] dark:bg-[#14382F] hover:bg-[#EAF6F0] dark:hover:bg-[#19463B] text-[#4F685F] dark:text-[#A9C5BC] hover:text-[#006C56] text-[10.5px] font-bold border border-[#E2ECE6] dark:border-[#23483E] whitespace-nowrap transition-colors cursor-pointer"
              >
                “{prompt}”
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind... (Press Enter to send)"
              className="flex-1 py-3 px-4.5 rounded-2xl bg-[#F8FCFA] dark:bg-[#0E2A23] border border-[#D5E3DB] dark:border-[#23483E] text-xs sm:text-sm text-[#19332A] dark:text-[#F4FAF7] focus:outline-none focus:ring-2 focus:ring-[#006C56]/40 placeholder:text-[#8EAAA1]"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim()}
              className="py-3 px-5 rounded-2xl bg-[#004D3D] hover:bg-[#003B2E] disabled:bg-slate-200 dark:bg-[#00A982] dark:hover:bg-[#00916F] dark:disabled:bg-[#14382F] text-white dark:text-[#071C17] text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              <span>Send</span>
              <span>➤</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
