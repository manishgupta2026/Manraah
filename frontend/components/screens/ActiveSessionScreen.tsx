"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ActiveSessionScreen() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Session Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-xl text-on-surface">Active Telehealth Session</h1>
          <p className="text-xs text-secondary font-medium">● Encrypted 1-on-1 Confidential Call</p>
        </div>
        <span className="px-4 py-1.5 rounded-full bg-primary-container/20 text-primary text-xs font-bold font-mono">
          00:14:32
        </span>
      </div>

      {/* Main Video Viewport */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 aspect-video shadow-2xl flex items-center justify-center border-4 border-surface-container-high">
        {!isVideoOff ? (
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-28 h-28 rounded-full bg-primary-container/30 border-4 border-white/20 flex items-center justify-center text-white text-4xl font-bold">
              SJ
            </div>
            <div>
              <h3 className="text-xl font-heading font-bold text-white">Dr. Sarah Jenkins</h3>
              <p className="text-xs text-purple-200">Clinical Psychologist & Mindfulness Specialist</p>
            </div>
          </div>
        ) : (
          <div className="text-white text-center space-y-2">
            <span className="material-symbols-outlined text-5xl opacity-40">videocam_off</span>
            <p className="text-xs text-slate-400">Camera is turned off</p>
          </div>
        )}

        {/* Self Camera Picture-in-Picture */}
        <div className="absolute bottom-4 right-4 w-36 h-28 rounded-2xl bg-slate-800 border-2 border-white/20 shadow-lg flex items-center justify-center overflow-hidden">
          <span className="material-symbols-outlined text-3xl text-slate-400">person</span>
          <span className="absolute bottom-2 left-2 text-[10px] font-semibold text-white/80">You</span>
        </div>
      </div>

      {/* Call Controls Bar */}
      <div className="p-4 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft flex items-center justify-center gap-6">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isMuted ? "bg-error text-white" : "bg-surface-container-low text-on-surface hover:bg-surface-container"
          }`}
        >
          <span className="material-symbols-outlined text-2xl">{isMuted ? "mic_off" : "mic"}</span>
        </button>

        <button
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isVideoOff ? "bg-error text-white" : "bg-surface-container-low text-on-surface hover:bg-surface-container"
          }`}
        >
          <span className="material-symbols-outlined text-2xl">{isVideoOff ? "videocam_off" : "videocam"}</span>
        </button>

        <button className="w-14 h-14 rounded-full bg-surface-container-low text-on-surface flex items-center justify-center hover:bg-surface-container">
          <span className="material-symbols-outlined text-2xl">chat</span>
        </button>

        <Link
          href="/professional-care"
          className="w-14 h-14 rounded-full bg-error text-white flex items-center justify-center shadow-lg hover:bg-error/90"
        >
          <span className="material-symbols-outlined text-2xl">call_end</span>
        </Link>
      </div>
    </div>
  );
}
