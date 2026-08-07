"use client";

import React, { useState, useEffect } from "react";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { getClientSession } from "@/backend/auth/client";
import { getDailyCheckInSummaryAction } from "@/backend/auth/actions";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
}

export default function AICompanionChat() {
  const { categoryDetails } = useCategory();
  const [activeTab, setActiveTab] = useState<"chat" | "modes" | "voice">("chat");
  const [selectedEmotion, setSelectedEmotion] = useState<string>("Seeking Calm");
  const [inputMessage, setInputMessage] = useState<string>(" ");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    async function loadGreeting() {
      const session = getClientSession();
      if (!session.user) return;
      try {
        const [dailyRes, weeklyRes] = await Promise.all([
          getDailyCheckInSummaryAction(session.user.id),
          fetch("/api/mood/weekly").then((r) => r.ok ? r.json() : null),
        ]);

        let greeting = `Hello! I'm your Manraah Companion, calibrated for ${categoryDetails.name} wellness. How are you feeling right now?`;
        
        const displayName = session.user.sanctuaryName || session.user.name || "friend";
        if (weeklyRes && (weeklyRes.frequentMood === "Overwhelmed" || weeklyRes.frequentMood === "Low" || weeklyRes.frequentMood === "Anxious" || weeklyRes.frequentMood === "Exhausted")) {
          greeting = `Hello ${displayName} 🌿. I noticed you've been feeling a bit ${weeklyRes.frequentMood.toLowerCase()} this week. 
          
Would you like to slow down together and try a gentle five-minute breathing exercise? I'm here to listen.`;
        } else if (dailyRes.success && dailyRes.summary) {
          const sum = dailyRes.summary;
          
          if (sum.energy_level <= 2) {
            greeting = `Hello ${displayName} 🌿. I noticed your energy is a little low today (${sum.energy_level}/5) and you are feeling a bit ${sum.mood}. 
            
Would you like to meditate together for five minutes, or perhaps share what is on your mind? I'm here to listen.`;
          } else if (sum.sleep_quality <= 2) {
            greeting = `Hello ${displayName} 🌸. I see you logged feeling ${sum.mood} today, and your sleep last night was a bit light. 
            
It's completely okay to take things slow. Would you like to try a calming breathing reset or explore some restful soundscapes?`;
          } else {
            greeting = `Welcome back, ${displayName} ✨. I see that you logged a feeling of **${sum.mood}** in today's check-in, focusing on your intention to **${sum.daily_intention}**.
            
How has this focus been serving you so far? Let's take a slow breath and talk about whatever you need today.`;
          }
        }

        setMessages([
          {
            id: "1",
            sender: "ai",
            text: greeting,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }
        ]);
      } catch (err) {
        console.error("Failed to load initial greeting:", err);
      }
    }
    loadGreeting();
  }, [categoryDetails]);


  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");

    setTimeout(() => {
      const aiReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: `I hear you completely. It takes strength to express how you feel. Let's take a slow 4-second breath together. What feels most challenging right now?`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between p-2 rounded-2xl bg-surface-container-low border border-surface-variant/30 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab("modes")}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "modes" ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-primary"
          }`}
        >
          1. Emotion Mode
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "chat" ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-primary"
          }`}
        >
          2. Text Chat
        </button>
        <button
          onClick={() => setActiveTab("voice")}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "voice" ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-primary"
          }`}
        >
          3. Voice Call
        </button>
      </div>

      {/* MODE 1: EMOTION SELECTION */}
      {activeTab === "modes" && (
        <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 space-y-6 shadow-soft text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-primary-container/20 text-primary mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">psychology</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-heading font-bold text-on-surface">Choose Companion Support Tone</h2>
            <p className="text-sm text-on-surface-variant">Select the energy you need from your AI companion today:</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              { title: "Seeking Calm", desc: "Gentle, slow-paced grounding", icon: "filter_vintage", color: "bg-mint/20 text-secondary" },
              { title: "Academic / Work Advice", desc: "Structured problem solving", icon: "lightbulb", color: "bg-primary-container/20 text-primary" },
              { title: "Empathetic Venting", desc: "Non-judgmental listener", icon: "favorite", color: "bg-pink/30 text-tertiary" },
              { title: "Mindful Meditation Guide", desc: "Voice breathing prompts", icon: "self_improvement", color: "bg-pale-yellow/40 text-on-surface" },
            ].map((mode) => (
              <div
                key={mode.title}
                onClick={() => {
                  setSelectedEmotion(mode.title);
                  setActiveTab("chat");
                }}
                className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                  selectedEmotion === mode.title
                    ? "bg-surface-container-lowest border-primary shadow-md ring-2 ring-primary/30"
                    : "bg-surface-container-low border-surface-variant/30 hover:bg-surface-container"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl ${mode.color} flex items-center justify-center mb-3`}>
                  <span className="material-symbols-outlined text-xl">{mode.icon}</span>
                </div>
                <h4 className="font-heading font-bold text-sm text-on-surface">{mode.title}</h4>
                <p className="text-xs text-on-surface-variant">{mode.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODE 2: INTERACTIVE CHAT SESSION */}
      {activeTab === "chat" && (
        <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-3xl shadow-soft h-[600px] flex flex-col overflow-hidden">
          {/* Top Chat Bar */}
          <div className="p-4 bg-surface-container-low/60 border-b border-surface-variant/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container/30 border border-primary/20 flex items-center justify-center text-primary font-bold">
                <span className="material-symbols-outlined text-xl">smart_toy</span>
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-on-surface">Manraah AI Companion</h3>
                <p className="text-xs text-secondary font-medium">● Active Tone: {selectedEmotion}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("voice")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-mint/20 text-secondary text-xs font-semibold hover:bg-mint/30"
            >
              <span className="material-symbols-outlined text-base">call</span>
              <span>Voice Mode</span>
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-surface-container-lowest to-surface-container-low/20">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-md p-4 rounded-3xl text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-primary text-white rounded-br-none shadow-md"
                      : "bg-surface-container-low text-on-surface border border-surface-variant/40 rounded-bl-none shadow-sm"
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className={`block text-[10px] mt-1.5 ${msg.sender === "user" ? "text-white/70 text-right" : "text-on-surface-variant/60"}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input Bar */}
          <div className="p-4 border-t border-surface-variant/30 bg-surface-container-lowest flex items-center gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Share what's on your mind..."
              className="flex-1 py-3 px-5 rounded-full bg-surface-container-low border border-surface-variant/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              onClick={handleSendMessage}
              className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary-purple transition-all"
            >
              <span className="material-symbols-outlined text-xl">send</span>
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: VOICE CALL SESSION */}
      {activeTab === "voice" && (
        <div className="p-12 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft text-center space-y-8 max-w-xl mx-auto">
          <div className="relative w-36 h-36 mx-auto rounded-full bg-primary-container/20 border-4 border-primary/30 flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-6xl text-primary">mic</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-heading font-bold text-on-surface">Voice Session Active</h2>
            <p className="text-sm text-on-surface-variant">Listening gently... Speak naturally about your day.</p>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <button className="w-14 h-14 rounded-full bg-surface-container text-on-surface flex items-center justify-center hover:bg-surface-container-high">
              <span className="material-symbols-outlined text-2xl">mic_off</span>
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className="w-14 h-14 rounded-full bg-error text-white flex items-center justify-center shadow-lg hover:bg-error/90"
            >
              <span className="material-symbols-outlined text-2xl">call_end</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
