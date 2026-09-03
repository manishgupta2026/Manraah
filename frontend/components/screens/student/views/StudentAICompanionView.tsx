"use client";

import React, { useState } from "react";
import { useStudentDashboard } from "@/frontend/components/screens/student/context/StudentDashboardContext";

export function StudentAICompanionContent() {
  const { user } = useStudentDashboard();
  const [activeTab, setActiveTab] = useState<"chat" | "modes" | "voice">("chat");
  const [selectedEmotion, setSelectedEmotion] = useState<string>("Seeking Calm");
  const [inputMessage, setInputMessage] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([
    {
      id: "1",
      sender: "ai",
      text: `Hello! I'm your Manraah Companion, calibrated for student wellness. How are you holding up today? You can share whatever is on your mind.`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  ]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");

    setTimeout(() => {
      const aiReply = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: `I hear you completely. It takes strength to express how you feel. Let's take a slow 4-second breath together. What feels most challenging right now?`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left animate-fadeIn">
      <div>
        <h2 className="text-2xl font-heading font-black text-[#100E26] dark:text-slate-100">AI Companion</h2>
        <p className="text-xs font-semibold text-slate-400 mt-1">Talk with your private AI reset partner, practice breathing, or vent anonymously.</p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between p-1.5 rounded-2xl bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-800 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab("modes")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "modes" ? "bg-[#5F4EA5] text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-[#5F4EA5]"
          }`}
        >
          Emotion Mode
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "chat" ? "bg-[#5F4EA5] text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-[#5F4EA5]"
          }`}
        >
          Text Chat
        </button>
        <button
          onClick={() => setActiveTab("voice")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "voice" ? "bg-[#5F4EA5] text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-[#5F4EA5]"
          }`}
        >
          Voice Call
        </button>
      </div>

      {/* EMOTION MODE */}
      {activeTab === "modes" && (
        <div className="p-8 rounded-[32px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 space-y-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#F5F3FC] dark:bg-slate-855/50 text-[#5F4EA5] mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">psychology</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-heading font-black text-slate-850 dark:text-slate-100">Choose Companion Support Tone</h3>
            <p className="text-xs font-semibold text-slate-400">Select the energy you need from your AI companion today:</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {[
              { title: "Seeking Calm", desc: "Gentle, slow-paced grounding", icon: "filter_vintage", color: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600" },
              { title: "Academic / Study Help", desc: "Structured problem solving", icon: "lightbulb", color: "bg-[#F5F3FC] dark:bg-purple-950/20 text-[#5F4EA5]" },
              { title: "Empathetic Venting", desc: "Non-judgmental listener", icon: "favorite", color: "bg-pink-50 dark:bg-pink-950/20 text-pink-500" },
              { title: "Crisis Redirection", desc: "Direct wellness resources", icon: "local_hospital", color: "bg-red-50 dark:bg-red-950/20 text-red-500" }
            ].map((tone) => (
              <button
                key={tone.title}
                onClick={() => {
                  setSelectedEmotion(tone.title);
                  setActiveTab("chat");
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: Date.now().toString(),
                      sender: "ai",
                      text: `Support tone updated to **${tone.title}**. Ready when you are.`,
                      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    }
                  ]);
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedEmotion === tone.title
                    ? "bg-[#F5F3FC] dark:bg-slate-800 border-[#5F4EA5] scale-102"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-850 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tone.color}`}>
                    <span className="material-symbols-outlined text-base">{tone.icon}</span>
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-850 dark:text-slate-200">{tone.title}</h5>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">{tone.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TEXT CHAT */}
      {activeTab === "chat" && (
        <div className="p-6 rounded-[32px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 flex flex-col h-[500px]">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm select-none ${
                  m.sender === "user" ? "bg-[#5F4EA5] text-white" : "bg-[#F5F3FC] dark:bg-slate-800 text-[#5F4EA5]"
                }`}>
                  {m.sender === "user" ? "👤" : "🤖"}
                </div>
                <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-[#5F4EA5] text-white rounded-tr-none"
                    : "bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-750 rounded-tl-none"
                }`}>
                  <p>{m.text}</p>
                  <span className="block text-[8px] text-slate-400 font-bold text-right mt-1.5">{m.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              placeholder="Write a message to your sanctuary companion..."
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-850 dark:text-slate-200 font-bold"
            />
            <button
              onClick={handleSendMessage}
              className="w-11 h-11 rounded-2xl bg-[#5F4EA5] hover:bg-[#100E26] text-white flex items-center justify-center shadow-md transition-all shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </div>
        </div>
      )}

      {/* VOICE CALL */}
      {activeTab === "voice" && (
        <div className="p-12 rounded-[32px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center mx-auto animate-pulse">
            <span className="material-symbols-outlined text-4xl">phone_in_talk</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-heading font-black text-slate-850 dark:text-slate-100">Sanctuary Voice Support</h3>
            <p className="text-xs font-semibold text-slate-400 max-w-xs mx-auto leading-normal">
              Practice slow-paced breathing exercises with real-time interactive guide voice help.
            </p>
          </div>

          <div className="inline-block py-2 px-5 rounded-full bg-[#5F4EA5]/5 border border-[#5F4EA5]/15 text-[10px] font-black text-[#5F4EA5] uppercase tracking-wider">
            🚀 Coming Soon to Student Portal
          </div>
        </div>
      )}
    </div>
  );
}
