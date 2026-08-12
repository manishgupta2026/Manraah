"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function WellnessToolsSection() {
  const router = useRouter();

  const TOOLS = [
    {
      id: "workload",
      title: "Workload Check",
      desc: "How heavy has work felt lately?",
      icon: "💼",
      iconBg: "bg-purple-100/70 dark:bg-purple-900/30 text-[#6351A5] dark:text-purple-300",
      cta: "Check in →",
      ctaColor: "text-[#6351A5] dark:text-purple-300",
      href: "/checkin",
    },
    {
      id: "career",
      title: "Career & Balance",
      desc: "Make space for what matters outside work.",
      icon: "🧭",
      iconBg: "bg-emerald-100/70 dark:bg-emerald-900/30 text-[#1F7A65] dark:text-emerald-300",
      cta: "Reflect →",
      ctaColor: "text-[#1F7A65] dark:text-emerald-300",
      href: "/journal",
    },
    {
      id: "sleep",
      title: "Sleep & Recovery",
      desc: "Give your mind permission to switch off.",
      icon: "🌙",
      iconBg: "bg-indigo-100/70 dark:bg-indigo-900/30 text-[#7C6BC4] dark:text-indigo-300",
      cta: "Wind down →",
      ctaColor: "text-[#7C6BC4] dark:text-indigo-300",
      href: "/sleep",
    },
    {
      id: "mindful",
      title: "Mindful Breaks",
      desc: "Quick resets for busy days.",
      icon: "☕",
      iconBg: "bg-amber-100/70 dark:bg-amber-900/30 text-[#B45309] dark:text-amber-300",
      cta: "Take a break →",
      ctaColor: "text-[#B45309] dark:text-amber-300",
      href: "/meditation",
    },
  ];

  return (
    <div className="rounded-[32px] bg-white/90 dark:bg-[#1E1933]/90 backdrop-blur-xl border border-purple-100/60 dark:border-purple-500/20 p-7 shadow-[0_8px_30px_rgba(95,78,165,0.03)] space-y-4">
      {/* Header */}
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-base text-[#1F7A65] dark:text-emerald-400">🌿</span>
          <h3 className="text-base font-heading font-extrabold text-[#231E39] dark:text-white">
            Wellness Tools for Your Journey
          </h3>
        </div>
        <p className="text-xs text-[#746F89] dark:text-purple-200/70 font-normal">
          Pick what you need, when you need it.
        </p>
      </div>

      {/* 4 Compact Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
        {TOOLS.map((t) => (
          <motion.div
            key={t.id}
            whileHover={{ y: -3 }}
            onClick={() => router.push(t.href)}
            className="p-4 rounded-2xl bg-[#FAF8FE] dark:bg-white/5 border border-purple-100/60 dark:border-white/5 hover:border-purple-200 hover:shadow-2xs transition-all cursor-pointer flex flex-col justify-between min-h-[145px] space-y-3 group"
          >
            <div className="space-y-2">
              <div className={`w-8 h-8 rounded-xl ${t.iconBg} flex items-center justify-center text-sm shadow-2xs group-hover:scale-105 transition-transform`}>
                {t.icon}
              </div>

              <div className="space-y-0.5">
                <h4 className="text-xs font-heading font-extrabold text-[#231E39] dark:text-white group-hover:text-[#6351A5] transition-colors">
                  {t.title}
                </h4>
                <p className="text-[11px] text-[#746F89] dark:text-purple-200/70 font-normal leading-snug line-clamp-2">
                  {t.desc}
                </p>
              </div>
            </div>

            <div className={`text-[11px] font-heading font-bold ${t.ctaColor} flex items-center gap-1 group-hover:translate-x-0.5 transition-transform`}>
              <span>{t.cta}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
