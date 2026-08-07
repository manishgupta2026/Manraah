"use client";

import React, { useState } from "react";
import { SessionFlag } from "@/backend/types";
import { flagSession } from "@/backend/queries/human-companion";

interface PostSessionFlagProps {
  sessionId?: string;
  onComplete: () => void;
}

export default function PostSessionFlag({ sessionId = "sess_demo", onComplete }: PostSessionFlagProps) {
  const [selectedFlag, setSelectedFlag] = useState<SessionFlag>("no_flag");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await flagSession(sessionId, selectedFlag);
    setSubmitted(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 text-center space-y-6 animate-fadeIn select-none">
      {!submitted ? (
        <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-6">
          <div className="w-16 h-16 rounded-full bg-peach/30 text-tertiary mx-auto flex items-center justify-center text-3xl font-bold">
            🛡️
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-heading font-bold text-on-surface">Post-Session Wrap-Up</h2>
            <p className="text-xs text-on-surface-variant">
              Classify session status for supervisor audit records.
            </p>
          </div>

          {/* Flag Options */}
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-on-surface">Supervisor Review Flag</label>
            
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSelectedFlag("no_flag")}
                className={`w-full p-3.5 rounded-2xl text-left border text-xs font-bold transition-all flex items-center justify-between ${
                  selectedFlag === "no_flag"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                    : "bg-surface-container-low border-surface-variant/30 text-on-surface"
                }`}
              >
                <span>✅ No Flag Needed (Routine Session)</span>
                {selectedFlag === "no_flag" && <span>✓</span>}
              </button>

              <button
                type="button"
                onClick={() => setSelectedFlag("needs_followup")}
                className={`w-full p-3.5 rounded-2xl text-left border text-xs font-bold transition-all flex items-center justify-between ${
                  selectedFlag === "needs_followup"
                    ? "bg-amber-50 border-amber-500 text-amber-800"
                    : "bg-surface-container-low border-surface-variant/30 text-on-surface"
                }`}
              >
                <span>⚠️ Needs Follow-Up (Check back tomorrow)</span>
                {selectedFlag === "needs_followup" && <span>✓</span>}
              </button>

              <button
                type="button"
                onClick={() => setSelectedFlag("possible_crisis")}
                className={`w-full p-3.5 rounded-2xl text-left border text-xs font-bold transition-all flex items-center justify-between ${
                  selectedFlag === "possible_crisis"
                    ? "bg-rose-50 border-rose-500 text-rose-800"
                    : "bg-surface-container-low border-surface-variant/30 text-on-surface"
                }`}
              >
                <span>🚨 Possible Crisis (Requires Supervisor Review)</span>
                {selectedFlag === "possible_crisis" && <span>✓</span>}
              </button>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-on-surface">Supervisor Audit Note</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional summary for quality assurance..."
              className="w-full p-3 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-purple text-white font-bold text-xs shadow-md transition-all scale-105 active:scale-95"
          >
            Submit Report & Complete →
          </button>
        </form>
      ) : (
        <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
          <span className="material-symbols-outlined text-5xl text-secondary animate-bounce block mx-auto">
            verified
          </span>
          <h3 className="text-xl font-heading font-bold text-on-surface">Audit Report Logged</h3>
          <p className="text-xs text-on-surface-variant">
            Session flag successfully saved. Returning to listener dashboard.
          </p>
        </div>
      )}
    </div>
  );
}
