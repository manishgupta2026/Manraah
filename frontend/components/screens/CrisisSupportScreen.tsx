"use client";

import React, { useState } from "react";
import Link from "next/link";
import ScreenHeader from "@/frontend/components/ui/ScreenHeader";

export default function CrisisSupportScreen() {
  const [activeTab, setActiveTab] = useState<"helplines" | "grounding">("helplines");
  const [step54321, setStep54321] = useState<number>(5);

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      <ScreenHeader title="❤️ Crisis Support" showBackButton={true} fallbackRoute="/dashboard" />
      {/* Header */}
      <div className="p-8 rounded-3xl bg-error-container text-on-error-container shadow-md space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <span className="material-symbols-outlined text-lg">emergency</span>
          <span>Immediate 24/7 Crisis Support</span>
        </div>
        <h1 className="text-3xl font-heading font-bold">You Are Not Alone. We Are Here.</h1>
        <p className="text-sm opacity-90 max-w-xl">
          If you are experiencing an urgent mental health crisis or overwhelming panic, please reach out directly using these verified, confidential resources.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setActiveTab("helplines")}
          className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
            activeTab === "helplines" ? "bg-primary text-white shadow-md" : "bg-surface-container text-on-surface-variant"
          }`}
        >
          1. Verified Crisis Helplines
        </button>
        <button
          onClick={() => setActiveTab("grounding")}
          className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
            activeTab === "grounding" ? "bg-primary text-white shadow-md" : "bg-surface-container text-on-surface-variant"
          }`}
        >
          2. 5-4-3-2-1 Grounding Exercise
        </button>
      </div>

      {activeTab === "helplines" ? (
        <div className="space-y-4">
          {[
            { name: "KIRAN National Mental Health Helpline", number: "1800-599-0019", desc: "Toll-free 24/7 support across India" },
            { name: "Vandrevala Foundation Helpline", number: "+91 9999 666 555", desc: "24/7 free clinical counseling" },
            { name: "Tele-MANAS Government Helpline", number: "14416 / 1800-891-4416", desc: "Comprehensive mental health service" },
          ].map((h) => (
            <div key={h.name} className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-base text-on-surface">{h.name}</h3>
                <p className="text-xs text-on-surface-variant">{h.desc}</p>
                <p className="text-lg font-mono font-bold text-primary pt-1">{h.number}</p>
              </div>
              <a
                href={`tel:${h.number.replace(/\s+/g, "")}`}
                className="px-6 py-3 rounded-full bg-error text-white font-bold text-xs shadow-md hover:bg-error/90 transition-all"
              >
                Call Now
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-mint/20 text-secondary mx-auto flex items-center justify-center font-bold text-2xl">
            {step54321}
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-heading font-bold text-on-surface">
              {step54321 === 5 && "Acknowledge 5 things you can SEE around you."}
              {step54321 === 4 && "Acknowledge 4 things you can TOUCH around you."}
              {step54321 === 3 && "Acknowledge 3 things you can HEAR."}
              {step54321 === 2 && "Acknowledge 2 things you can SMELL."}
              {step54321 === 1 && "Acknowledge 1 thing you can TASTE."}
            </h3>
            <p className="text-xs text-on-surface-variant">Focus your senses gently to bring your mind back to the present moment.</p>
          </div>

          <button
            onClick={() => setStep54321(step54321 > 1 ? step54321 - 1 : 5)}
            className="px-8 py-3.5 rounded-full bg-primary text-white font-bold text-xs shadow-md hover:bg-primary-purple transition-all"
          >
            {step54321 > 1 ? "Next Sense Step →" : "Restart Grounding Exercise"}
          </button>
        </div>
      )}
    </div>
  );
}
