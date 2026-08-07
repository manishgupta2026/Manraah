"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface ChatMessage {
  id: string;
  sender: "listener" | "user" | "system";
  text: string;
  timestamp: string;
}

interface IncomingSession {
  id: string;
  userName: string;
  category: string;
  topic: string;
  language: string;
  waitTime: string;
}

export default function VolunteerListenerScreen() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [activeSession, setActiveSession] = useState<IncomingSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [showCrisisModal, setShowCrisisModal] = useState<boolean>(false);
  const [showEndModal, setShowEndModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const queue: IncomingSession[] = [
    {
      id: "sess_101",
      userName: "Anonymous Student",
      category: "Student",
      topic: "Exam Rank Anxiety & Loneliness",
      language: "English / Hindi",
      waitTime: "2 mins ago",
    },
    {
      id: "sess_102",
      userName: "Young Professional",
      category: "Young Professional",
      topic: "Workplace Burnout & Imposter Syndrome",
      language: "English",
      waitTime: "5 mins ago",
    },
    {
      id: "sess_103",
      userName: "Parent",
      category: "Parents",
      topic: "Teen Relationship Tension",
      language: "Hindi",
      waitTime: "8 mins ago",
    },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAcceptSession = (session: IncomingSession) => {
    setActiveSession(session);
    setMessages([
      {
        id: "m_sys_1",
        sender: "system",
        text: `Connected anonymously with ${session.userName} (${session.category} • ${session.topic}). Remember: Listen with warmth, validate feelings, and never give clinical diagnosis.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
      {
        id: "m_user_1",
        sender: "user",
        text: "Hi... I've been feeling really overwhelmed with my studies and pressure lately.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setToastMessage(`Connected to ${session.userName}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !activeSession) return;

    const newMsg: ChatMessage = {
      id: "m_" + Date.now(),
      sender: "listener",
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage("");

    // Simulate supportive user response after 2.5s
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: "m_reply_" + Date.now(),
          sender: "user",
          text: "Thank you for saying that... it really helps just knowing someone is listening without judging me.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 2500);
  };

  const insertPromptChip = (text: string) => {
    setInputMessage((prev) => (prev ? `${prev} ${text}` : text));
  };

  return (
    <div className="max-w-7xl mx-auto py-4 space-y-6 animate-fadeIn select-none">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-secondary text-white text-xs font-bold text-center shadow-lg border border-white/20 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Top Header & Availability Status Bar */}
      <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <span className="px-3 py-1 rounded-full bg-mint/20 text-secondary text-xs font-bold uppercase tracking-wider">
              Volunteer Peer Listener Workspace
            </span>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
              ID: LST_8824
            </span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-on-surface">Volunteer Listener Portal</h1>
          <p className="text-xs text-on-surface-variant">
            Provide 1-on-1 empathetic support, active listening, and safe emotional venting to users.
          </p>
        </div>

        {/* Availability Switch */}
        <div className="flex items-center gap-3 bg-surface-container-low p-2 rounded-2xl border border-surface-variant/30">
          <span className="text-xs font-bold text-on-surface">Status:</span>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              isOnline
                ? "bg-emerald-500 text-white shadow-md"
                : "bg-surface-container-high text-on-surface-variant"
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-white animate-ping" : "bg-gray-400"}`} />
            {isOnline ? "Online & Ready to Listen" : "Offline (Paused)"}
          </button>
        </div>
      </div>

      {/* Main Grid: Queue / Active Session / Toolkit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Incoming Session Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-base text-on-surface">Incoming Waiting Users</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                {queue.length} Waiting
              </span>
            </div>

            <div className="space-y-3">
              {queue.map((req) => {
                const isSelected = activeSession?.id === req.id;
                return (
                  <div
                    key={req.id}
                    className={`p-4 rounded-2xl border transition-all space-y-2 ${
                      isSelected
                        ? "bg-primary-container/20 border-primary shadow-sm"
                        : "bg-surface-container-low border-surface-variant/20 hover:bg-surface-container"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-on-surface">{req.userName}</span>
                      <span className="text-[10px] text-on-surface-variant/70">{req.waitTime}</span>
                    </div>
                    <p className="text-xs font-semibold text-primary">{req.topic}</p>
                    <div className="flex items-center justify-between text-[11px] text-on-surface-variant/80">
                      <span>🏷️ {req.category}</span>
                      <span>🗣️ {req.language}</span>
                    </div>

                    <button
                      onClick={() => handleAcceptSession(req)}
                      disabled={isSelected}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                        isSelected
                          ? "bg-secondary text-white cursor-default"
                          : "bg-primary hover:bg-primary-purple text-white"
                      }`}
                    >
                      {isSelected ? "Active Session" : "Accept Session →"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle & Right Column: Active Chat Panel & Listener Toolkit (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {activeSession ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Active Chat Panel (8 cols) */}
              <div className="md:col-span-8 p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft flex flex-col justify-between h-[580px]">
                
                {/* Session Header */}
                <div className="pb-4 border-b border-surface-variant/20 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="font-heading font-bold text-base text-on-surface">
                      Session with {activeSession.userName}
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      Category: <span className="font-semibold text-primary">{activeSession.category}</span> • {activeSession.topic}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowCrisisModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-xs flex items-center gap-1"
                      title="Escalate severe crisis disclosure"
                    >
                      <span className="material-symbols-outlined text-sm">emergency</span>
                      Crisis SOS
                    </button>
                    <button
                      onClick={() => setShowEndModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-surface-container-high text-on-surface-variant hover:bg-surface-container text-xs font-bold"
                    >
                      End Session
                    </button>
                  </div>
                </div>

                {/* Message Scroll Window */}
                <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-2">
                  {messages.map((msg) => {
                    if (msg.sender === "system") {
                      return (
                        <div key={msg.id} className="p-3 rounded-2xl bg-primary-container/20 border border-primary/20 text-xs text-on-surface-variant text-center leading-relaxed">
                          🛡️ {msg.text}
                        </div>
                      );
                    }
                    const isListener = msg.sender === "listener";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isListener ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed shadow-xs ${
                            isListener
                              ? "bg-primary text-white rounded-tr-none"
                              : "bg-surface-container-low text-on-surface border border-surface-variant/30 rounded-tl-none"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-on-surface-variant/60 mt-1 px-1 font-mono">
                          {msg.timestamp}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input Form */}
                <form onSubmit={handleSendMessage} className="pt-3 border-t border-surface-variant/20 flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type an empathetic response..."
                    className="flex-1 p-3 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-purple text-white text-xs font-bold shadow-md transition-all shrink-0"
                  >
                    Send →
                  </button>
                </form>
              </div>

              {/* Listener Guidance & Quick Chips Sidebar (4 cols) */}
              <div className="md:col-span-4 p-5 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4 h-[580px] overflow-y-auto">
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-primary">
                  Active Listener Toolkit
                </h4>

                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-on-surface-variant">Empathetic Response Chips:</p>
                  {[
                    "I hear how heavy that feels for you.",
                    "That takes a lot of strength to talk about.",
                    "How has that been affecting your sleep and peace?",
                    "You're not alone in this; take all the time you need.",
                    "What is one small thing that would bring you comfort right now?",
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => insertPromptChip(chip)}
                      className="w-full text-left p-2.5 rounded-xl bg-surface-container-low border border-surface-variant/20 text-[11px] text-on-surface hover:bg-primary-container/20 transition-all leading-tight"
                    >
                      + "{chip}"
                    </button>
                  ))}
                </div>

                <div className="pt-3 border-t border-surface-variant/20 space-y-2">
                  <p className="text-[11px] font-bold text-rose-500 uppercase">Listener Safety Rules:</p>
                  <ul className="text-[11px] text-on-surface-variant space-y-1.5 list-disc pl-4">
                    <li>Never offer medical or clinical diagnosis.</li>
                    <li>Do not share personal contact info or social handles.</li>
                    <li>If user discloses self-harm intent, click **Crisis SOS**.</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft text-center space-y-4 flex flex-col items-center justify-center min-h-[400px]">
              <span className="material-symbols-outlined text-6xl text-primary/40 block">
                forum
              </span>
              <div className="space-y-1">
                <h3 className="text-xl font-heading font-bold text-on-surface">No Active Session Selected</h3>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                  Pick a waiting user from the queue on the left to start an anonymous 1-on-1 listening session.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Crisis Escalation Modal */}
      {showCrisisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl p-8 max-w-md w-full border border-rose-500/50 shadow-soft-xl space-y-5 text-center">
            <span className="material-symbols-outlined text-5xl text-rose-500 animate-pulse block mx-auto">
              emergency
            </span>
            <div className="space-y-2">
              <h3 className="text-xl font-heading font-bold text-on-surface">Trigger Crisis Escalation?</h3>
              <p className="text-xs text-on-surface-variant">
                This will display immediate Tele-MANAS (14416) and NIMHANS helpline numbers to the user and notify senior clinical supervisors.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCrisisModal(false)}
                className="flex-1 py-3 rounded-full bg-surface-container text-on-surface-variant font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCrisisModal(false);
                  setToastMessage("🚨 Crisis Escalation triggered. Supervisor notified.");
                  setTimeout(() => setToastMessage(null), 5000);
                }}
                className="flex-1 py-3 rounded-full bg-rose-500 text-white font-bold text-xs shadow-md hover:bg-rose-600"
              >
                Confirm Escalation 🚨
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Session Confirmation Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl p-8 max-w-md w-full border border-surface-variant/40 shadow-soft-xl space-y-5 text-center">
            <div className="w-12 h-12 rounded-full bg-mint/20 text-secondary mx-auto flex items-center justify-center text-2xl font-bold">
              ✓
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-heading font-bold text-on-surface">Complete Listening Session?</h3>
              <p className="text-xs text-on-surface-variant">
                Thank you for providing a safe listening space for this user.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEndModal(false)}
                className="flex-1 py-3 rounded-full bg-surface-container text-on-surface-variant font-bold text-xs"
              >
                Continue Session
              </button>
              <button
                onClick={() => {
                  setShowEndModal(false);
                  setActiveSession(null);
                  setToastMessage("Session ended. Thank you for your support!");
                  setTimeout(() => setToastMessage(null), 5000);
                }}
                className="flex-1 py-3 rounded-full bg-secondary text-white font-bold text-xs shadow-md hover:bg-secondary/90"
              >
                Complete Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
