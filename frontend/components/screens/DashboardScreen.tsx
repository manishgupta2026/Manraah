"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getClientSession } from "@/backend/auth/client";
import { getDashboardSummaryAction } from "@/backend/auth/actions";
import { getWellnessMessage } from "@/frontend/lib/assessment/wellness";

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const session = getClientSession();
        if (session.user) {
          const summary = await getDashboardSummaryAction(session.user.id);
          setData(summary);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">spa</span>
        <p className="text-sm text-on-surface-variant font-medium">Entering your sanctuary dashboard...</p>
      </div>
    );
  }

  const name = data?.name || "Member";
  const category = data?.category || "student";
  const score = data?.totalScore || 30;
  const percentage = data?.percentage || 60;
  const level = data?.wellnessLevel || "Stable";
  const welcomeMessage = getWellnessMessage(level);

  // Map category code to human readable name
  const getCategoryName = (cat: string) => {
    const map: Record<string, string> = {
      student: "Student",
      young_pro: "Young Professional",
      working_professional: "Working Professional",
      parent: "Parent",
      couple: "Couple",
      family: "Family",
      women: "Women",
      men: "Men",
      senior_citizen: "Senior Citizen",
    };
    return map[cat] || cat;
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Category Welcome Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-[-50%] right-[-10%] w-[200px] h-[200px] rounded-full bg-primary-container blur-[60px] opacity-20 pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-container/20 text-primary border border-primary/10">
              {getCategoryName(category)} Focus
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-on-surface">
            Welcome back, <span className="text-primary">{name}</span> 👋
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Your personal sanctuary is ready. Take a deep breath and explore your dashboard metrics.
          </p>
        </div>
      </div>

      {/* Wellness Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-2">
            <h3 className="font-heading font-bold text-lg text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">analytics</span>
              Wellness Assessment Score
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Based on your initial 10-question assessment, your stability metrics are visualized here.
            </p>
          </div>

          <div className="py-4 flex items-center gap-6">
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Circular score ring using SVG */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="rgba(0,0,0,0.05)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#7C6BC4"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold text-primary">{score}</span>
                <span className="text-[10px] text-on-surface-variant font-medium">/ 50</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-on-surface-variant font-medium">Wellness Level</p>
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-bold bg-primary text-white shadow-sm">
                {level}
              </span>
              <p className="text-[11px] text-on-surface-variant/70 font-semibold">{percentage}% Serenity Index</p>
            </div>
          </div>
        </div>

        {/* Welcome / Encouragement Message Card */}
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-heading font-bold text-lg text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">spa</span>
              Daily Sanctuary Advice
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Your personalized wellness recommendation based on your current state.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-variant/20">
            <p className="text-sm text-on-surface leading-relaxed font-medium">
              {welcomeMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
