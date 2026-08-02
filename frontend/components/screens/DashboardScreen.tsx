"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCategory, CATEGORIES } from "@/frontend/lib/context/CategoryContext";
import { MOCK_USER } from "@/frontend/lib/mock-data";
import { UserCategory } from "@/backend/types";

export default function DashboardScreen() {
  const { category, setCategory, categoryDetails } = useCategory();
  const [studentLayout, setStudentLayout] = useState<"layout1" | "layout2">("layout1");

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Category Welcome Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryDetails.badgeColor}`}>
              {categoryDetails.name} Dashboard
            </span>
            {category === "student" && (
              <button
                onClick={() => setStudentLayout(studentLayout === "layout1" ? "layout2" : "layout1")}
                className="text-xs text-primary underline hover:text-primary-purple font-medium"
              >
                Switch to {studentLayout === "layout1" ? "Layout 2" : "Layout 1"}
              </button>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-on-surface">
            Welcome Back, <span className="text-primary">{MOCK_USER.name}</span> 🌿
          </h1>
          <p className="text-sm text-on-surface-variant max-w-xl">
            {categoryDetails.description}
          </p>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-3 rounded-2xl bg-primary-container/20 border border-primary/20 text-center">
            <p className="text-xs text-on-surface-variant font-medium">Streak</p>
            <p className="text-lg font-bold text-primary">{MOCK_USER.streakDays} Days 🔥</p>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-mint/20 border border-secondary/20 text-center">
            <p className="text-xs text-on-surface-variant font-medium">Mindfulness</p>
            <p className="text-lg font-bold text-secondary">{MOCK_USER.mindfulnessMinutes} mins</p>
          </div>
        </div>
      </div>

      {/* Category Switching Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs font-semibold text-on-surface-variant/70 whitespace-nowrap">Switch View:</span>
        {(Object.keys(CATEGORIES) as UserCategory[]).map((catKey) => {
          const active = category === catKey;
          return (
            <button
              key={catKey}
              onClick={() => setCategory(catKey)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                active
                  ? "bg-primary text-white shadow-md scale-105"
                  : "bg-surface-container-lowest border border-surface-variant/30 text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {CATEGORIES[catKey].name}
            </button>
          );
        })}
      </div>

      {/* CONDITIONAL DASHBOARD RENDERING */}
      {category === "student" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">smart_toy</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-on-surface">AI Academic Companion</h3>
              <p className="text-xs text-on-surface-variant">Discuss study anxiety, exam pressure, or quick grounding exercises.</p>
              <Link
                href="/ai-chat"
                className="inline-block w-full py-2.5 rounded-full bg-primary text-white text-center font-semibold text-xs shadow-md hover:bg-primary-purple transition-all"
              >
                Chat with AI Companion →
              </Link>
            </div>

            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-pink/30 text-tertiary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">mood</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-on-surface">Daily Mind Check-in</h3>
              <p className="text-xs text-on-surface-variant">Log your energy levels and emotional state before study sessions.</p>
              <Link
                href="/checkin"
                className="inline-block w-full py-2.5 rounded-full bg-surface-container text-primary text-center font-semibold text-xs hover:bg-surface-container-high transition-all"
              >
                Log Today's Mood
              </Link>
            </div>

            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-mint/20 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">self_improvement</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-on-surface">Exam Stress Relief</h3>
              <p className="text-xs text-on-surface-variant">10-minute guided audio sessions for focus and clarity.</p>
              <Link
                href="/meditation"
                className="inline-block w-full py-2.5 rounded-full bg-secondary text-white text-center font-semibold text-xs shadow-md hover:bg-secondary/90 transition-all"
              >
                Start Meditation
              </Link>
            </div>
          </div>
        </div>
      )}

      {category === "working_professional" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">work_history</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-on-surface">Burnout Tracker</h3>
              <p className="text-xs text-on-surface-variant">Monitor workplace fatigue and schedule micro-breaks.</p>
              <Link href="/journey" className="inline-block w-full py-2.5 rounded-full bg-primary text-white text-center font-semibold text-xs shadow-md">
                View Work-Life Index
              </Link>
            </div>

            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-peach/30 text-tertiary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">medical_services</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-on-surface">Executive Therapy</h3>
              <p className="text-xs text-on-surface-variant">Book 1-on-1 confidential sessions with certified therapists.</p>
              <Link href="/professional-care" className="inline-block w-full py-2.5 rounded-full bg-surface-container text-primary text-center font-semibold text-xs">
                Find Therapist
              </Link>
            </div>

            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-pale-yellow/40 text-on-surface flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">bedtime</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-on-surface">Night Sleep Support</h3>
              <p className="text-xs text-on-surface-variant">Binaural rain & ocean soundscapes for restful sleep.</p>
              <Link href="/sleep" className="inline-block w-full py-2.5 rounded-full bg-surface-container text-on-surface text-center font-semibold text-xs">
                Play Sleep Audio
              </Link>
            </div>
          </div>
        </div>
      )}

      {category === "parent" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-peach/30 text-tertiary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">family_restroom</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-on-surface">Mindful Parenting Circle</h3>
              <p className="text-xs text-on-surface-variant">Connect with fellow parents sharing mindful patience tips.</p>
              <Link href="/community" className="inline-block w-full py-2.5 rounded-full bg-primary text-white text-center font-semibold text-xs shadow-md">
                Join Parent Community
              </Link>
            </div>

            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-pink/30 text-tertiary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">auto_stories</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-on-surface">Parenting Journal</h3>
              <p className="text-xs text-on-surface-variant">Log daily reflections, family wins, and gratitude moments.</p>
              <Link href="/journal" className="inline-block w-full py-2.5 rounded-full bg-surface-container text-primary text-center font-semibold text-xs">
                Open Journal
              </Link>
            </div>

            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-mint/20 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">spa</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-on-surface">5-Min Patience Breathing</h3>
              <p className="text-xs text-on-surface-variant">Quick grounding audio when parenting stress feels high.</p>
              <Link href="/meditation" className="inline-block w-full py-2.5 rounded-full bg-secondary text-white text-center font-semibold text-xs shadow-md">
                Start Quick Reset
              </Link>
            </div>
          </div>
        </div>
      )}

      {category === "senior_citizen" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-pale-yellow/40 text-on-surface flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">record_voice_over</span>
              </div>
              <h3 className="font-heading font-bold text-xl text-on-surface">Voice AI Listener</h3>
              <p className="text-sm text-on-surface-variant">Speak directly to your gentle AI companion anytime.</p>
              <Link href="/ai-chat" className="inline-block w-full py-3 rounded-full bg-primary text-white text-center font-bold text-sm shadow-md">
                Start Voice Companion
              </Link>
            </div>

            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-mint/20 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">nature_people</span>
              </div>
              <h3 className="font-heading font-bold text-xl text-on-surface">Gentle Daily Calm</h3>
              <p className="text-sm text-on-surface-variant">Calm audio tracks designed for restful mornings & peaceful evenings.</p>
              <Link href="/meditation" className="inline-block w-full py-3 rounded-full bg-secondary text-white text-center font-bold text-sm shadow-md">
                Listen to Daily Calm
              </Link>
            </div>

            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-peach/30 text-tertiary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">diversity_1</span>
              </div>
              <h3 className="font-heading font-bold text-xl text-on-surface">Senior Peer Group</h3>
              <p className="text-sm text-on-surface-variant">Share stories and connect with warm peer listeners.</p>
              <Link href="/community" className="inline-block w-full py-3 rounded-full bg-surface-container text-primary text-center font-bold text-sm">
                Open Senior Circle
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
