"use client";

import React, { useState, useEffect, useRef } from "react";
import { getClientSession } from "@/backend/auth/client";

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

export default function HumanCompanionView() {
  const session = getClientSession();
  const userName = session?.user?.name || session?.user?.sanctuaryName || "Sanctuary Member";

  const [step, setStep] = useState<FlowStep>("ENTRY");
  const [activeTopic, setActiveTopic] = useState("Emotional Venting & Guidance");
  const [customTopic, setCustomTopic] = useState("");
  const [searchTimer, setSearchTimer] = useState(0);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    {
      id: "m-1",
      sender: "listener",
      text: "Hello! I am Priya, your peer listener today. I am here to listen without judgment. What is feeling heavy on your mind today?",
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

  // Search countdown simulation
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

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputMessage.trim();
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
    }, 1800);
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
        text: "Hello! I am Priya, your peer listener today. I am here to listen without judgment. What is feeling heavy on your mind today?",
        time: "Just now",
      },
    ]);
  };

  return (
    <div className="w-full min-w-0 flex flex-col gap-5">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-[#102F27] rounded-3xl p-6 sm:p-7 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#006C56] dark:text-[#00A982]">
              1-ON-1 ACTIVE LISTENER SANCTUARY
            </span>
            <h1 className="text-2xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight mt-0.5">
              Human Companion
            </h1>
            <p className="text-xs text-[#6B857C] dark:text-[#A9C5BC] font-medium mt-1">
              Connect anonymously 1-on-1 with trained, compassionate peer listeners for genuine warmth and understanding.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#EAF5EF] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] text-xs font-bold flex items-center gap-1.5">
              <span>🛡️</span> 100% Anonymous & Masked
            </span>
          </div>
        </div>
      </div>

      {/* 2. Multi-Step Controller Container */}
      <div className="bg-white dark:bg-[#102F27] rounded-3xl border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs p-6 sm:p-8 transition-colors">
        {/* =================================================================== */}
        {/* STEP 1: ENTRY & TOPIC SELECTION                                     */}
        {/* =================================================================== */}
        {step === "ENTRY" && (
          <div className="max-w-2xl mx-auto space-y-7 text-center">
            {/* Topic Selection Card */}
            <div className="text-left space-y-4">
              <div>
                <h2 className="text-base font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                  What would you like to speak about today?
                </h2>
                <p className="text-xs text-[#6B857C] dark:text-[#A9C5BC]">
                  Pick a topic or type your own. Our peer listeners are trained across emotional well-being areas.
                </p>
              </div>

              {/* Preset Chips */}
              <div className="flex flex-wrap gap-2">
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
                      className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
                        isSelected
                          ? "bg-[#006C56] text-white border-[#006C56] shadow-xs"
                          : "bg-[#F8FCFA] dark:bg-[#14382F] border-[#D5E3DB] dark:border-[#23483E] text-[#4F685F] dark:text-[#A9C5BC] hover:border-[#006C56]/40"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              {/* Custom Topic Input */}
              <div>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Or enter a custom topic (e.g. Navigating exam anxiety, feeling unheard)..."
                  className="w-full py-2.5 px-4 rounded-2xl bg-[#F8FCFA] dark:bg-[#0E2A23] border border-[#D5E3DB] dark:border-[#23483E] text-xs font-bold text-[#19332A] dark:text-[#F4FAF7] focus:outline-none focus:ring-2 focus:ring-[#006C56]/40 placeholder:text-[#8EAAA1]"
                />
              </div>
            </div>

            {/* Pulsing Connect Button */}
            <div className="py-4">
              <button
                onClick={handleStartSearch}
                className="w-44 h-44 mx-auto rounded-full bg-gradient-to-br from-[#006C56] via-[#008968] to-[#00A982] text-white font-heading font-black text-sm shadow-xl shadow-[#006C56]/30 hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer border-4 border-white dark:border-[#14382F]"
              >
                <span className="text-3xl">🎙️</span>
                <span>Find a Listener</span>
                <span className="text-[10px] opacity-80 font-medium">Ready in ~10s</span>
              </button>
            </div>

            {/* Privacy Commitments */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#E2ECE6] dark:border-[#23483E] text-left">
              <div className="p-3.5 rounded-2xl bg-[#F8FCFA] dark:bg-[#14382F]/40 border border-[#E2ECE6] dark:border-[#23483E] space-y-1">
                <span className="text-xs font-bold text-[#19332A] dark:text-[#F4FAF7] flex items-center gap-1.5">
                  <span>🔒</span> Zero Identifiers
                </span>
                <p className="text-[10.5px] text-[#6B857C] dark:text-[#A9C5BC] leading-relaxed">
                  Real names, numbers, or emails are never shared with listeners.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FCFA] dark:bg-[#14382F]/40 border border-[#E2ECE6] dark:border-[#23483E] space-y-1">
                <span className="text-xs font-bold text-[#19332A] dark:text-[#F4FAF7] flex items-center gap-1.5">
                  <span>🕊️</span> Active Listening
                </span>
                <p className="text-[10.5px] text-[#6B857C] dark:text-[#A9C5BC] leading-relaxed">
                  No unsolicited advice or judgment. Just warm, present companionship.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FCFA] dark:bg-[#14382F]/40 border border-[#E2ECE6] dark:border-[#23483E] space-y-1">
                <span className="text-xs font-bold text-[#19332A] dark:text-[#F4FAF7] flex items-center gap-1.5">
                  <span>🛑</span> Full Control
                </span>
                <p className="text-[10.5px] text-[#6B857C] dark:text-[#A9C5BC] leading-relaxed">
                  You can end the session or switch modes anytime with a single tap.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 2: SEARCHING / RADAR PULSE                                    */}
        {/* =================================================================== */}
        {step === "SEARCHING" && (
          <div className="max-w-md mx-auto py-12 text-center space-y-8 animate-in fade-in duration-200">
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#006C56]/15 dark:bg-[#00A982]/15 animate-ping" />
              <div className="absolute inset-3 rounded-full bg-[#006C56]/20 dark:bg-[#00A982]/20 animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-[#006C56] text-white flex items-center justify-center text-3xl shadow-lg">
                <span>📡</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-[#EAF5EF] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] text-xs font-bold uppercase tracking-wider inline-block">
                Scanning Peer Network...
              </span>
              <h2 className="text-xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                Matching with an Available Peer Listener
              </h2>
              <p className="text-xs text-[#6B857C] dark:text-[#A9C5BC] max-w-xs mx-auto leading-relaxed">
                Topic: <em>&quot;{customTopic || activeTopic}&quot;</em>
              </p>
            </div>

            <button
              onClick={handleCancelSearch}
              className="px-6 py-2 rounded-full bg-[#F4F9F6] dark:bg-[#14382F] hover:bg-[#E2ECE6] text-[#4F685F] dark:text-[#A9C5BC] text-xs font-bold border border-[#D5E3DB] dark:border-[#23483E] transition-all cursor-pointer"
            >
              Cancel Search
            </button>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 3: MATCHED                                                    */}
        {/* =================================================================== */}
        {step === "MATCHED" && (
          <div className="max-w-md mx-auto py-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <span className="px-3.5 py-1 rounded-full bg-[#EAF5EF] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] text-xs font-bold uppercase tracking-wider inline-block">
              ✓ Listener Connected
            </span>

            {/* Listener Card */}
            <div className="p-6 rounded-3xl bg-[#F8FCFA] dark:bg-[#14382F]/60 border border-[#E2ECE6] dark:border-[#23483E] space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#006C56] to-[#00A982] text-white flex items-center justify-center font-bold text-lg mx-auto shadow-md">
                PL
              </div>
              <div>
                <h3 className="text-base font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                  Peer Listener Priya (#104)
                </h3>
                <p className="text-xs text-[#6B857C] dark:text-[#A9C5BC] mt-0.5">
                  Trained Active Listener • Empathy & Anxiety Support
                </p>
                <div className="flex items-center justify-center gap-3 mt-2 text-xs font-bold text-[#006C56] dark:text-[#00A982]">
                  <span>★ 4.9 Rating</span>
                  <span>•</span>
                  <span>140+ Support Sessions</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#4F685F] dark:text-[#A9C5BC]">
              Choose how you would like to connect with Priya right now:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setStep("CHAT")}
                className="py-3 px-5 rounded-2xl bg-[#006C56] hover:bg-[#005241] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] text-xs font-bold shadow-md shadow-[#006C56]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>💬</span>
                <span>Start Text Chat</span>
              </button>

              <button
                onClick={() => setStep("CALL")}
                className="py-3 px-5 rounded-2xl bg-[#F4F9F6] dark:bg-[#14382F] hover:bg-[#EAF6F0] text-[#006C56] dark:text-[#00A982] text-xs font-bold border border-[#006C56]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>📞</span>
                <span>Start Voice Call</span>
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 4: CHAT SESSION                                               */}
        {/* =================================================================== */}
        {step === "CHAT" && (
          <div className="flex flex-col h-[560px] max-w-2xl mx-auto border border-[#E2ECE6] dark:border-[#23483E] rounded-3xl overflow-hidden bg-[#F8FCFA] dark:bg-[#0E2A23]">
            {/* Chat Session Header */}
            <div className="p-4 bg-white dark:bg-[#102F27] border-b border-[#E2ECE6] dark:border-[#23483E] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#006C56] text-white flex items-center justify-center font-bold text-xs">
                  PL
                </div>
                <div>
                  <h4 className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                    Priya (Peer Listener)
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active • {formatTimer(sessionSeconds)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep("CALL")}
                  className="px-3 py-1.5 rounded-full bg-[#F4F9F6] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] text-xs font-bold cursor-pointer hover:bg-[#EAF6F0]"
                >
                  📞 Call
                </button>
                <button
                  onClick={handleEndSession}
                  className="px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800 hover:bg-rose-100 cursor-pointer"
                >
                  End Session
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#006C56] text-white rounded-br-none"
                        : "bg-white dark:bg-[#14382F] text-[#19332A] dark:text-[#F4FAF7] border border-[#E2ECE6] dark:border-[#23483E] rounded-bl-none shadow-2xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9.5px] text-[#8EAAA1] mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              ))}

              {isListenerTyping && (
                <div className="flex items-center gap-1.5 text-xs text-[#8EAAA1] italic p-1">
                  <span className="w-2 h-2 rounded-full bg-[#006C56] animate-bounce" />
                  <span>Priya is listening and typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-white dark:bg-[#102F27] border-t border-[#E2ECE6] dark:border-[#23483E] flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message with complete anonymity..."
                className="flex-1 py-2 px-4 rounded-full bg-[#F8FCFA] dark:bg-[#0E2A23] border border-[#D5E3DB] dark:border-[#23483E] text-xs text-[#19332A] dark:text-[#F4FAF7] focus:outline-none focus:ring-2 focus:ring-[#006C56]/40"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="w-9 h-9 rounded-full bg-[#006C56] text-white flex items-center justify-center text-sm disabled:opacity-40 cursor-pointer shadow-xs"
              >
                ↑
              </button>
            </form>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 5: CALL SESSION                                               */}
        {/* =================================================================== */}
        {step === "CALL" && (
          <div className="max-w-md mx-auto py-8 text-center space-y-8 animate-in fade-in duration-200">
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                ● Live Voice Session
              </span>
              <h3 className="text-xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7] pt-2">
                Peer Listener Priya
              </h3>
              <p className="text-xs font-mono font-bold text-[#006C56] dark:text-[#00A982]">
                {formatTimer(sessionSeconds)}
              </p>
            </div>

            {/* Pulsing Voice Avatar */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#006C56]/15 animate-ping" />
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#006C56] to-[#00A982] text-white flex items-center justify-center text-4xl shadow-xl">
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
                    : "bg-[#F4F9F6] dark:bg-[#14382F] text-[#19332A] dark:text-[#F4FAF7] border-[#D5E3DB] dark:border-[#23483E]"
                }`}
                title={isMuted ? "Unmute mic" : "Mute mic"}
              >
                {isMuted ? "🔇 Muted" : "🎙️ Mute"}
              </button>

              <button
                onClick={() => setStep("CHAT")}
                className="p-3.5 rounded-full bg-[#F4F9F6] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] border border-[#D5E3DB] dark:border-[#23483E] text-xs font-bold cursor-pointer"
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
        {/* STEP 6: FEEDBACK                                                   */}
        {/* =================================================================== */}
        {step === "FEEDBACK" && (
          <div className="max-w-md mx-auto py-6 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <span className="text-3xl block">🌿</span>
            <div className="space-y-1">
              <h3 className="text-xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                Session Completed
              </h3>
              <p className="text-xs text-[#6B857C] dark:text-[#A9C5BC]">
                How was your conversation with Peer Listener Priya? Your feedback helps maintain sanctuary quality.
              </p>
            </div>

            {/* 5-Star Rating */}
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl cursor-pointer transition-transform hover:scale-110 ${
                    rating >= star ? "text-amber-400" : "text-slate-300 dark:text-slate-600"
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
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#006C56] text-white"
                        : "bg-[#F4F9F6] dark:bg-[#14382F] text-[#4F685F] dark:text-[#A9C5BC]"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleFinishFeedback}
              className="px-8 py-2.5 rounded-full bg-[#006C56] hover:bg-[#005241] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] text-xs font-bold shadow-md shadow-[#006C56]/20 transition-all cursor-pointer"
            >
              Finish & Return to Companion →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
