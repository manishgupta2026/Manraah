"use client";

import React from "react";
import Link from "next/link";
import ScreenHeader from "@/frontend/components/ui/ScreenHeader";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { getCategoryPersonalization } from "@/frontend/lib/mock-data";
import { getClientSession } from "@/backend/auth/client";

export default function HumanCompanionStub() {
  const { category } = useCategory();
  const session = getClientSession();
  const resolvedCategory = session?.user?.selectedCategory || category;
  const p = getCategoryPersonalization(resolvedCategory);
  const contextTag = p.contextTag;
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-8 animate-fadeIn">
      <div className="w-24 h-24 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center border-4 border-emerald-500/30 shadow-soft">
        <span className="material-symbols-outlined text-5xl">record_voice_over</span>
      </div>

      <div className="space-y-3">
        <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-700 text-xs font-bold uppercase tracking-wider">
          ● 100% Anonymous Real-Time Network Live
        </span>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-on-surface">Human Companion Sanctuary</h1>
        <p className="text-body-md text-on-surface-variant max-w-lg mx-auto leading-relaxed">
          Connect anonymously with trained, empathetic peer listeners for non-clinical 1-on-1 text chat and WebRTC voice calls.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft max-w-xl mx-auto text-left space-y-4">
        <div className="flex items-center gap-3 text-primary font-bold text-sm">
          <span className="material-symbols-outlined text-xl">shield_lock</span>
          <span>Complete Anonymity & Identity Masking</span>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          You are assigned an anonymous alias (e.g. <span className="font-bold text-primary">Anonymous User #104</span>). No names, emails, or personal identifiers are ever shared with peer listeners or exposed over WebSockets.
        </p>
        {contextTag && (
          <div className="mt-3 p-3 rounded-2xl bg-mint/10 border border-secondary/20">
            <p className="text-xs text-secondary font-semibold">
              🎤 Your session context tag: <span className="font-bold text-on-surface">"{contextTag}"</span>
            </p>
            <p className="text-[10px] text-on-surface-variant mt-1">
              This optional tag helps listeners understand your situation. You can choose not to share it — your anonymity is fully protected either way.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
        <Link
          href="/call"
          className="px-8 py-4 rounded-full bg-primary hover:bg-primary-purple text-white font-bold text-xs shadow-md transition-all scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-base">forum</span>
          Connect to Anonymous Companion →
        </Link>
        <Link
          href="/companion/login"
          className="px-8 py-4 rounded-full bg-surface-container text-on-surface font-bold text-xs hover:bg-surface-container-high transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-base">badge</span>
          Companion / Admin Portal Login
        </Link>
      </div>
    </div>
  );
}
