"use client";

import React from "react";
import Link from "next/link";

export default function HumanCompanionStub() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-8">
      <div className="w-24 h-24 rounded-full bg-peach/30 text-tertiary mx-auto flex items-center justify-center border-4 border-peach/50 shadow-soft">
        <span className="material-symbols-outlined text-5xl">record_voice_over</span>
      </div>

      <div className="space-y-3">
        <span className="px-4 py-1.5 rounded-full bg-peach/30 text-tertiary text-xs font-semibold uppercase tracking-wider">
          Feature Coming Soon
        </span>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-on-surface">Human Companion Network</h1>
        <p className="text-body-md text-on-surface-variant max-w-lg mx-auto leading-relaxed">
          The Human Companion network connects you with trained, empathetic peer listeners for non-clinical, 1-on-1 human conversations.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft max-w-xl mx-auto text-left space-y-4">
        <div className="flex items-center gap-3 text-primary font-bold text-sm">
          <span className="material-symbols-outlined text-xl">stars</span>
          <span>Peer Listeners vs. Professional Care</span>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Unlike paid clinical psychologists on our Professional Care directory, Human Companions are compassionate peer listeners trained in active listening and empathetic dialogue.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
        <Link
          href="/ai-chat"
          className="px-8 py-3.5 rounded-full bg-primary text-white font-bold text-xs shadow-md hover:bg-primary-purple transition-all"
        >
          Chat with AI Companion
        </Link>
        <Link
          href="/professional-care"
          className="px-8 py-3.5 rounded-full bg-surface-container text-primary font-bold text-xs hover:bg-surface-container-high transition-all"
        >
          Find Professional Therapist
        </Link>
      </div>
    </div>
  );
}
