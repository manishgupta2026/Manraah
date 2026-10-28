"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/frontend/lib/context/AuthContext";
import { getClientSession } from "@/backend/auth/client";
import UserAvatar from "@/frontend/components/ui/UserAvatar";

type FlowStep = "ENTRY" | "SEARCHING" | "MATCHED" | "CHAT" | "CALL" | "FEEDBACK";

interface ChatMsg {
  id: string;
  sender: "user" | "listener";
  text: string;
  time: string;
}

const PRESET_TOPICS = [
  "Emotional Venting & Guidance",
  "Burnout, Work & Academic Stress",
  "Family & Relationship Dynamics",
  "Feeling Overwhelmed or Anxious",
  "Loneliness & Finding Connection",
];

const SUGGESTED_CHAT_PROMPTS = [
  "I'm feeling overwhelmed today",
  "I need help coping with stress",
  "Family matters are weighing on me",
  "I just need someone to listen",
  "Work burnout is catching up",
];

export default function HumanCompanionView() {
  const { user } = useAuth();
  const session = getClientSession();
  const userName =
    user?.name ||
    user?.sanctuaryName ||
    session?.user?.name ||
    session?.user?.sanctuaryName ||
    "Manraah Member";

  const [step, setStep] = useState<FlowStep>("ENTRY");
  const [activeTopic, setActiveTopic] = useState("Emotional Venting & Guidance");
  const [customTopic, setCustomTopic] = useState("");
  const [searchTimer, setSearchTimer] = useState(0);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    {
      id: "m-1",
      sender: "listener",
      text: `Hello ${userName} 🌿. I am Priya, your peer listener today. I am here to listen without judgment in a completely anonymous and safe space. What is feeling heavy on your mind today?`,
      time: "Just now",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isListenerTyping, setIsListenerTyping] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Feedback state
  const [rating, setRating] = useState(5);
  const [selectedFeedbackTags, setSelectedFeedbackTags] = useState<string[]>([
    "Compassionate",
    "Felt Heard",
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Search countdown simulation (3-4 seconds)
  useEffect(() => {
    let interval: any;
    if (step === "SEARCHING") {
      setSearchTimer(0);
      interval = setInterval(() => {
        setSearchTimer((prev) => {
          if (prev >= 3) {
            clearInterval(interval);
            setStep("MATCHED");
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step]);

  // Session duration timer (for CHAT and CALL)
  useEffect(() => {
    let timer: any;
    if (step === "CHAT" || step === "CALL") {
      timer = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSessionSeconds(0);
    }
    return () => clearInterval(timer);
  }, [step]);

  // Scroll chat
  useEffect(() => {
    if (step === "CHAT") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isListenerTyping, step]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartSearch = () => {
    setStep("SEARCHING");
  };

  const handleCancelSearch = () => {
    setStep("ENTRY");
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg: ChatMsg = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsListenerTyping(true);

    // Empathetic listener response simulation
    setTimeout(() => {
      const listenerReplies = [
        "Thank you for sharing that so openly with me. It takes real courage to put these feelings into words.",
        "I hear how demanding that situation has been for you. Take a slow breath—you are not carrying this alone right now.",
        "That makes total sense given everything you have been navigating. How did your body feel when that occurred?",
        "I am holding space for you. Take all the time you need to talk through it.",
      ];
      const replyText =
        listenerReplies[Math.floor(Math.random() * listenerReplies.length)];

      setChatMessages((prev) => [
        ...prev,
        {
          id: `lis-${Date.now()}`,
          sender: "listener",
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsListenerTyping(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEndSession = () => {
    setStep("FEEDBACK");
  };

  const handleFinishFeedback = () => {
    setStep("ENTRY");
    setChatMessages([
      {
        id: "m-1",
        sender: "listener",
        text: `Hello ${userName} 🌿. I am Priya, your peer listener today. I am here to listen without judgment in a completely anonymous and safe space. What is feeling heavy on your mind today?`,
        time: "Just now",
      },
    ]);
  };

  return (
    <div className="w-full min-w-0 flex flex-col gap-4 sm:gap-5">
      {/* 1. Companion Header Card (Aligned with AI Companion) */}
      <div className="bg-white dark:bg-[#121214] rounded-3xl p-5 sm:p-6 border border-[#CBECE2] dark:border-[#27272a] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#E6F4F0] dark:bg-[#18181b] text-[#006B56] dark:text-zinc-200 flex items-center justify-center text-xl shadow-xs shrink-0 border border-transparent dark:border-[#27272a]">
            👥
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-heading font-black text-[#19332A] dark:text-white">
                Manraah Human Companion
              </h1>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#006B56] dark:text-zinc-200 bg-[#E6F4F0] dark:bg-white/5 px-2.5 py-0.5 rounded-full border border-[#CBECE2] dark:border-[#27272a]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006B56] dark:bg-white dark:text-black animate-pulse" />
                {step === "CHAT"
                  ? `Active • ${formatTimer(sessionSeconds)}`
                  : step === "CALL"
                  ? `Voice Call • ${formatTimer(sessionSeconds)}`
                  : step === "SEARCHING"
                  ? "Matching Listener..."
                  : step === "MATCHED"
                  ? "Listener Connected"
                  : "Peer Network Ready"}
              </span>
            </div>
            <p className="text-xs text-[#6B857C] dark:text-[#A1A1AA] font-medium mt-1">
              Active Peer Listener: Priya (#104) • Topic: {customTopic || activeTopic} • 100% Anonymous &amp; Masked
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {step === "CHAT" && (
            <>
              <button
                onClick={() => setStep("CALL")}
                className="px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-[#F4F9F6] dark:bg-[#18181b] text-[#4F685F] dark:text-[#A1A1AA] hover:bg-[#E6F4F0] dark:hover:bg-[#27272a] border border-[#CBECE2] dark:border-[#27272a]"
              >
                <span>🎙️</span>
                <span>Voice Mode</span>
              </button>
              <button
                onClick={handleEndSession}
                className="px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/40"
              >
                <span>End Session</span>
              </button>
            </>
          )}

          {step === "CALL" && (
            <>
              <button
                onClick={() => setStep("CHAT")}
                className="px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-[#F4F9F6] dark:bg-[#18181b] text-[#4F685F] dark:text-[#A1A1AA] hover:bg-[#E6F4F0] dark:hover:bg-[#27272a] border border-[#CBECE2] dark:border-[#27272a]"
              >
                <span>💬</span>
                <span>Switch to Chat</span>
              </button>
              <button
                onClick={handleEndSession}
                className="px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
              >
                <span>End Call</span>
              </button>
            </>
          )}

          {step === "SEARCHING" && (
            <button
              onClick={handleCancelSearch}
              className="px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-[#F4F9F6] dark:bg-[#18181b] text-[#4F685F] dark:text-[#A1A1AA] hover:bg-[#E6F4F0] dark:hover:bg-[#27272a] border border-[#CBECE2] dark:border-[#27272a]"
            >
              <span>Cancel Search</span>
            </button>
          )}

          {step === "MATCHED" && (
            <button
              onClick={() => setStep("ENTRY")}
              className="px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-[#F4F9F6] dark:bg-[#18181b] text-[#4F685F] dark:text-[#A1A1AA] hover:bg-[#E6F4F0] dark:hover:bg-[#27272a] border border-[#CBECE2] dark:border-[#27272a]"
            >
              <span>Change Topic</span>
            </button>
          )}

          {step === "ENTRY" && (
            <button
              onClick={handleStartSearch}
              className="px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-[#006B56] hover:bg-[#005B48] text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black dark:hover:text-black shadow-sm"
            >
              <span>🎙️ Find a Listener</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Conversation / Interaction Box */}
      <div
        className={`bg-white dark:bg-[#121214] rounded-3xl p-5 sm:p-6 border border-[#CBECE2] dark:border-[#27272a] shadow-2xs flex flex-col transition-colors ${
          step === "CHAT"
            ? "h-[calc(100vh-230px)] min-h-[480px] justify-between space-y-4"
            : "h-auto space-y-4 sm:space-y-5"
        }`}
      >
        {/* =================================================================== */}
        {/* STATE 1: CHAT CONVERSATION (Exact layout & bubble style of AI)      */}
        {/* =================================================================== */}
        {step === "CHAT" && (
          <>
            {/* Messages Stream Container */}
            <div className="flex-1 min-h-[340px] overflow-y-auto space-y-4 pr-2">
              {chatMessages.map((msg) => (
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
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs bg-[#E6F4F0] dark:bg-[#18181b] text-[#006B56] dark:text-zinc-200 border border-[#CBECE2] dark:border-[#27272a]">
                      PL
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-2xs space-y-1.5 ${
                      msg.sender === "user"
                        ? "bg-[#006B56] text-white rounded-tr-xs"
                        : "bg-[#F4FAF7] dark:bg-[#18181b] text-[#19332A] dark:text-white border border-[#CBECE2] dark:border-[#27272a] rounded-tl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap" suppressHydrationWarning>{msg.text}</p>
                    <p
                      className={`text-[9px] font-medium text-right ${
                        msg.sender === "user"
                          ? "text-white/70 dark:text-white/80"
                          : "text-[#789389] dark:text-[#71717A]"
                      }`}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}

              {isListenerTyping && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E6F4F0] dark:bg-[#18181b] text-[#006B56] dark:text-zinc-200 flex items-center justify-center font-bold text-xs border border-transparent dark:border-[#27272a]">
                    PL
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#F4FAF7] dark:bg-[#18181b] border border-[#CBECE2] dark:border-[#27272a] text-xs text-[#789389] dark:text-[#71717A] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#006B56] dark:bg-white dark:text-black animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-[#006B56] dark:bg-white dark:text-black animate-bounce delay-150" />
                    <span className="w-2 h-2 rounded-full bg-[#006B56] dark:bg-white dark:text-black animate-bounce delay-300" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Section: Suggested Prompts + Input Bar */}
            <div className="space-y-3 pt-2 border-t border-[#CBECE2] dark:border-[#27272a]">
              {/* Suggested Prompt Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {SUGGESTED_CHAT_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSendMessage(prompt)}
                    className="px-3 py-1 rounded-full bg-[#F4F9F6] dark:bg-[#18181b] hover:bg-[#E6F4F0] dark:hover:bg-[#27272a] text-[#4F685F] dark:text-[#A1A1AA] hover:text-[#006B56] dark:hover:text-white text-[10.5px] font-bold border border-[#CBECE2] dark:border-[#27272a] whitespace-nowrap transition-colors cursor-pointer"
                  >
                    “{prompt}”
                  </button>
                ))}
              </div>

              {/* Message Input Bar */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Share what's on your mind with Priya... (Press Enter to send)"
                  className="flex-1 py-3 px-4.5 rounded-2xl bg-[#F8FCFA] dark:bg-[#18181b] border border-[#CBECE2] dark:border-[#27272a] text-xs sm:text-sm text-[#19332A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006B56]/40 dark:focus:ring-zinc-400/30 placeholder:text-[#8EAAA1] dark:placeholder:text-[#789990]"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim()}
                  className="py-3 px-6 rounded-full bg-[#006B56] hover:bg-[#005B48] disabled:bg-slate-200 dark:bg-white dark:hover:bg-zinc-200 dark:text-black dark:hover:text-black dark:disabled:bg-[#18181b] dark:disabled:text-[#76968D] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shrink-0"
                >
                  <span>Send</span>
                  <span>➤</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* =================================================================== */}
        {/* STATE 2: ENTRY & TOPIC SELECTION                                   */}
        {/* =================================================================== */}
        {step === "ENTRY" && (
          <div className="space-y-4 sm:space-y-5">
            {/* Topic Selection Card */}
            <div className="space-y-2.5">
              <div>
                <h2 className="text-sm sm:text-base font-heading font-black text-[#19332A] dark:text-white">
                  What would you like to speak about today?
                </h2>
                <p className="text-xs text-[#6B857C] dark:text-[#A1A1AA] mt-0.5">
                  Pick a focus area or write your own. Our verified peer listeners provide warm, non-judgmental space.
                </p>
              </div>

              {/* Preset Chips */}
              <div className="flex flex-wrap gap-2 pt-0.5">
                {PRESET_TOPICS.map((t) => {
                  const isSelected = activeTopic === t && !customTopic;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setActiveTopic(t);
                        setCustomTopic("");
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                        isSelected
                          ? "bg-[#006B56] text-white border-[#006B56] dark:bg-white dark:text-black dark:border-white/20 shadow-xs"
                          : "bg-[#F8FCFA] dark:bg-[#18181b] border-[#CBECE2] dark:border-[#27272a] text-[#4F685F] dark:text-[#A1A1AA] hover:border-[#006B56]/50 dark:hover:border-white/30"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              {/* Custom Topic Input */}
              <div className="pt-0.5">
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Or enter a custom topic (e.g. Navigating exam anxiety, feeling unheard)..."
                  className="w-full py-2.5 sm:py-3 px-4 rounded-2xl bg-[#F8FCFA] dark:bg-[#18181b] border border-[#CBECE2] dark:border-[#27272a] text-xs font-medium text-[#19332A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006B56]/40 dark:focus:ring-zinc-400/30 placeholder:text-[#8EAAA1] dark:placeholder:text-[#789990]"
                />
              </div>
            </div>

            {/* Pulsing Connect Action Button */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#E6F4F0] dark:bg-[#18181b] border border-[#CBECE2] dark:border-[#27272a] flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#006B56] dark:bg-white dark:text-black text-white flex items-center justify-center text-xl shadow-xs shrink-0">
                  🎙️
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-heading font-black text-[#004D3D] dark:text-white">
                    Ready to Connect with a Peer Listener?
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#4F685F] dark:text-[#A1A1AA] mt-0.5">
                    Peer listeners are online right now. Instant match in approximately ~5 seconds.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleStartSearch}
                  className="py-3 px-6 sm:px-7 rounded-full bg-[#006B56] hover:bg-[#005B48] text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black dark:hover:text-black text-xs font-bold shadow-md shadow-[#006B56]/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Connect Now</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Privacy Commitments */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1 border-t border-[#CBECE2] dark:border-[#27272a] text-left">
              <div className="p-3 sm:p-3.5 rounded-2xl bg-[#EAF6F2] dark:bg-[#18181b] border border-[#CBECE2] dark:border-[#27272a] space-y-1">
                <span className="text-xs font-bold text-[#004D3D] dark:text-white flex items-center gap-1.5">
                  <span>🔒</span> Zero Identifiers
                </span>
                <p className="text-[10.5px] text-[#4F685F] dark:text-[#A1A1AA] leading-relaxed">
                  Real names, numbers, or emails are never shared with listeners.
                </p>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl bg-[#EAF6F2] dark:bg-[#18181b] border border-[#CBECE2] dark:border-[#27272a] space-y-1">
                <span className="text-xs font-bold text-[#004D3D] dark:text-white flex items-center gap-1.5">
                  <span>🕊️</span> Active Listening
                </span>
                <p className="text-[10.5px] text-[#4F685F] dark:text-[#A1A1AA] leading-relaxed">
                  No unsolicited advice or judgment. Just warm, present companionship.
                </p>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl bg-[#EAF6F2] dark:bg-[#18181b] border border-[#CBECE2] dark:border-[#27272a] space-y-1">
                <span className="text-xs font-bold text-[#004D3D] dark:text-white flex items-center gap-1.5">
                  <span>🛑</span> Full Control
                </span>
                <p className="text-[10.5px] text-[#4F685F] dark:text-[#A1A1AA] leading-relaxed">
                  You can end the session or switch modes anytime with a single tap.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STATE 3: SEARCHING / RADAR PULSE                                   */}
        {/* =================================================================== */}
        {step === "SEARCHING" && (
          <div className="max-w-md mx-auto py-12 text-center space-y-7 animate-in fade-in duration-200">
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#006B56]/15 dark:bg-white dark:text-black/15 animate-ping" />
              <div className="absolute inset-3 rounded-full bg-[#006B56]/20 dark:bg-white dark:text-black/20 animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-[#006B56] dark:bg-white dark:text-black text-white flex items-center justify-center text-3xl shadow-lg">
                <span>📡</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-[#E6F4F0] dark:bg-white/5 text-[#006B56] dark:text-zinc-200 border border-[#CBECE2] dark:border-[#27272a] text-xs font-bold tracking-wider inline-block">
                Scanning Peer Network... ({3 - searchTimer}s)
              </span>
              <h2 className="text-xl font-heading font-black text-[#19332A] dark:text-white">
                Matching with an Available Peer Listener
              </h2>
              <p className="text-xs text-[#6B857C] dark:text-[#A1A1AA] max-w-xs mx-auto leading-relaxed">
                Topic: <em>&quot;{customTopic || activeTopic}&quot;</em>
              </p>
            </div>

            <button
              onClick={handleCancelSearch}
              className="px-6 py-2 rounded-full bg-[#F4F9F6] dark:bg-[#18181b] hover:bg-[#E6F4F0] dark:hover:bg-[#27272a] text-[#4F685F] dark:text-[#A1A1AA] text-xs font-bold border border-[#CBECE2] dark:border-[#27272a] transition-all cursor-pointer"
            >
              Cancel Search
            </button>
          </div>
        )}

        {/* =================================================================== */}
        {/* STATE 4: MATCHED                                                   */}
        {/* =================================================================== */}
        {step === "MATCHED" && (
          <div className="max-w-md mx-auto py-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <span className="px-3.5 py-1 rounded-full bg-[#E6F4F0] dark:bg-white/5 text-[#006B56] dark:text-zinc-200 border border-[#CBECE2] dark:border-[#27272a] text-xs font-bold tracking-wider inline-block">
              ✓ Listener Connected
            </span>

            {/* Listener Card */}
            <div className="p-6 rounded-3xl bg-[#EAF6F2] dark:bg-[#18181b] border border-[#CBECE2] dark:border-[#27272a] space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#006B56] to-[#5FAF8A] text-white flex items-center justify-center font-bold text-lg mx-auto shadow-md">
                PL
              </div>
              <div>
                <h3 className="text-base font-heading font-black text-[#004D3D] dark:text-white">
                  Peer Listener Priya (#104)
                </h3>
                <p className="text-xs text-[#4F685F] dark:text-[#A1A1AA] mt-0.5">
                  Trained Active Listener • Empathy &amp; Anxiety Support
                </p>
                <div className="flex items-center justify-center gap-3 mt-2 text-xs font-bold text-[#006B56] dark:text-zinc-200">
                  <span>★ 4.9 Rating</span>
                  <span>•</span>
                  <span>140+ Support Sessions</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#4F685F] dark:text-[#A1A1AA]">
              Choose how you would like to connect with Priya right now:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setStep("CHAT")}
                className="py-3 px-5 rounded-2xl bg-[#006B56] hover:bg-[#005B48] text-white text-xs font-bold shadow-md shadow-[#006B56]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>💬</span>
                <span>Start Text Chat</span>
              </button>

              <button
                onClick={() => setStep("CALL")}
                className="py-3 px-5 rounded-2xl bg-[#F4F9F6] dark:bg-[#18181b] hover:bg-[#E6F4F0] dark:hover:bg-[#27272a] text-[#006B56] dark:text-zinc-200 text-xs font-bold border border-[#CBECE2] dark:border-[#27272a] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>📞</span>
                <span>Start Voice Call</span>
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STATE 5: CALL SESSION                                              */}
        {/* =================================================================== */}
        {step === "CALL" && (
          <div className="max-w-md mx-auto py-8 text-center space-y-8 animate-in fade-in duration-200">
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-[#E6F4F0] dark:bg-white/5 text-[#006B56] dark:text-zinc-200 border border-[#CBECE2] dark:border-[#27272a] text-xs font-bold">
                ● Live Voice Session
              </span>
              <h3 className="text-xl font-heading font-black text-[#19332A] dark:text-white pt-2">
                Peer Listener Priya
              </h3>
              <p className="text-xs font-mono font-bold text-[#006B56] dark:text-zinc-200">
                {formatTimer(sessionSeconds)}
              </p>
            </div>

            {/* Pulsing Voice Avatar */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#006B56]/15 dark:bg-white dark:text-black/15 animate-ping" />
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#006B56] to-[#5FAF8A] text-white flex items-center justify-center text-4xl shadow-xl">
                <span>🎙️</span>
              </div>
            </div>

            {/* Call Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                  isMuted
                    ? "bg-rose-500 text-white border-rose-600"
                    : "bg-[#F4F9F6] dark:bg-[#18181b] text-[#19332A] dark:text-white border-[#CBECE2] dark:border-[#27272a]"
                }`}
                title={isMuted ? "Unmute mic" : "Mute mic"}
              >
                {isMuted ? "🔇 Muted" : "🎙️ Mute"}
              </button>

              <button
                onClick={() => setStep("CHAT")}
                className="p-3.5 rounded-full bg-[#F4F9F6] dark:bg-[#18181b] text-[#006B56] dark:text-zinc-200 border border-[#CBECE2] dark:border-[#27272a] text-xs font-bold cursor-pointer"
              >
                💬 Switch to Chat
              </button>

              <button
                onClick={handleEndSession}
                className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 cursor-pointer"
              >
                End Call
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STATE 6: FEEDBACK                                                  */}
        {/* =================================================================== */}
        {step === "FEEDBACK" && (
          <div className="max-w-md mx-auto py-6 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <span className="text-3xl block">🌿</span>
            <div className="space-y-1">
              <h3 className="text-xl font-heading font-black text-[#19332A] dark:text-white">
                Session Completed
              </h3>
              <p className="text-xs text-[#6B857C] dark:text-[#A1A1AA]">
                How was your conversation with Peer Listener Priya? Your feedback helps maintain Manraah quality.
              </p>
            </div>

            {/* 5-Star Rating */}
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl cursor-pointer transition-transform hover:scale-110 ${
                    rating >= star ? "text-amber-400" : "text-slate-300 dark:text-[#71717A]/40"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            {/* Feedback Tags */}
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Compassionate",
                "Felt Heard",
                "Calming Presence",
                "Gentle Guidance",
                "Patient & Warm",
              ].map((tag) => {
                const isSelected = selectedFeedbackTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() =>
                      setSelectedFeedbackTags((prev) =>
                        isSelected ? prev.filter((t) => t !== tag) : [...prev, tag]
                      )
                    }
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-[#006B56] text-white border-[#006B56] dark:bg-white dark:text-black dark:text-white dark:border-white/20"
                        : "bg-[#F4F9F6] dark:bg-[#18181b] text-[#4F685F] dark:text-[#A1A1AA] border-[#CBECE2] dark:border-[#27272a]"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleFinishFeedback}
              className="px-8 py-2.5 rounded-full bg-[#006B56] hover:bg-[#005B48] text-white text-xs font-bold shadow-md shadow-[#006B56]/20 transition-all cursor-pointer"
            >
              Finish &amp; Return to Companion →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
