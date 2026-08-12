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
      href: "/checkin",
      gradient: "from-[#FBF8FE] via-[#F5EEFD] to-[#EBE2FB]",
      accent: "#5F4EA5",
      svgGraphic: (
        <svg viewBox="0 0 120 70" className="w-full h-full">
          {/* Desk surface */}
          <rect x="10" y="52" width="100" height="4" rx="2" fill="#E6DEFF" />
          {/* Laptop */}
          <rect x="35" y="24" width="48" height="28" rx="3" fill="#5F4EA5" opacity="0.85" />
          <rect x="38" y="27" width="42" height="22" rx="2" fill="#FAF8FF" />
          <polygon points="30,52 88,52 82,56 36,56" fill="#7C6BC4" />
          {/* Post-it notes */}
          <rect x="20" y="32" width="10" height="10" rx="1" fill="#FEF08A" transform="rotate(-6 20 32)" />
          <rect x="90" y="30" width="11" height="11" rx="1" fill="#88F7D6" transform="rotate(8 90 30)" />
        </svg>
      ),
    },
    {
      id: "career",
      title: "Career & Balance",
      desc: "Make space for what matters outside work.",
      icon: "🧭",
      href: "/journal",
      gradient: "from-[#F8FCFA] via-[#EEF9F5] to-[#E0F4EE]",
      accent: "#006B56",
      svgGraphic: (
        <svg viewBox="0 0 120 70" className="w-full h-full">
          {/* Mountain sunrise */}
          <circle cx="60" cy="38" r="16" fill="#FED7AA" opacity="0.8" />
          <polygon points="15,58 50,22 85,58" fill="#5FCFB0" opacity="0.7" />
          <polygon points="45,58 75,30 105,58" fill="#006B56" opacity="0.85" />
          {/* Plant */}
          <path d="M 22 58 C 22 45, 30 46, 32 40 C 32 50, 26 55, 22 58 Z" fill="#006B56" />
        </svg>
      ),
    },
    {
      id: "sleep",
      title: "Sleep & Recovery",
      desc: "Give your mind permission to switch off.",
      icon: "🌙",
      href: "/sleep",
      gradient: "from-[#F9F8FE] via-[#F0EEFC] to-[#E3E0F8]",
      accent: "#7C6BC4",
      svgGraphic: (
        <svg viewBox="0 0 120 70" className="w-full h-full">
          {/* Bed & warm lamp */}
          <rect x="15" y="44" width="70" height="14" rx="4" fill="#5F4EA5" opacity="0.8" />
          <rect x="20" y="38" width="22" height="10" rx="3" fill="#FAF8FF" />
          <rect x="46" y="38" width="22" height="10" rx="3" fill="#FAF8FF" />
          {/* Lamp */}
          <circle cx="95" cy="34" r="10" fill="#FEF08A" opacity="0.6" />
          <polygon points="90,36 100,36 103,44 87,44" fill="#F59E0B" />
          <rect x="94" y="44" width="2" height="14" fill="#7C6BC4" />
        </svg>
      ),
    },
    {
      id: "mindful",
      title: "Mindful Breaks",
      desc: "Quick resets for busy days.",
      icon: "☕",
      href: "/meditation",
      gradient: "from-[#FDF9F6] via-[#FAF1EB] to-[#F5E5DC]",
      accent: "#D97706",
      svgGraphic: (
        <svg viewBox="0 0 120 70" className="w-full h-full">
          {/* Warm cup with steam */}
          <rect x="40" y="36" width="34" height="22" rx="4" fill="#D97706" opacity="0.85" />
          <path d="M 74 42 C 82 42, 82 52, 74 52" fill="none" stroke="#D97706" strokeWidth="3" />
          <ellipse cx="57" cy="59" rx="24" ry="3" fill="#FDE68A" />
          {/* Steam */}
          <path d="M 48 30 C 46 22, 52 18, 50 12" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <path d="M 58 30 C 56 22, 62 18, 60 12" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        </svg>
      ),
    },
  ];

  return (
    <section className="space-y-3.5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-base sm:text-lg font-heading font-black text-[#1D192B] dark:text-white">
            Wellness Tools for Your Journey
          </h3>
          <p className="text-xs text-[#797582] dark:text-purple-200/70 font-normal">
            Pick what you need, when you need it.
          </p>
        </div>

        <button
          onClick={() => router.push("/resources")}
          className="text-xs font-heading font-bold text-[#5F4EA5] dark:text-purple-300 hover:text-[#7C6BC4] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>View All</span>
          <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </button>
      </div>

      {/* 4 Responsive Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TOOLS.map((t) => (
          <motion.div
            key={t.id}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={() => router.push(t.href)}
            className={`group relative rounded-[26px] bg-gradient-to-b ${t.gradient} dark:bg-white/5 border border-[#E6DEFF]/80 dark:border-white/10 p-5 shadow-[0_4px_20px_rgba(95,78,165,0.03)] hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[220px] overflow-hidden`}
          >
            {/* Top: Icon + Title + Desc */}
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xl">{t.icon}</span>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-heading font-extrabold text-[#1D192B] dark:text-white group-hover:text-[#5F4EA5] transition-colors">
                  {t.title}
                </h4>
                <p className="text-[11px] text-[#484551] dark:text-purple-200/80 font-normal leading-relaxed line-clamp-2">
                  {t.desc}
                </p>
              </div>
            </div>

            {/* Bottom Graphic & Circular Arrow */}
            <div className="relative pt-3 flex items-end justify-between">
              {/* Illustrated SVG Graphic */}
              <div className="w-24 h-14 pointer-events-none select-none opacity-85 group-hover:scale-105 transition-transform">
                {t.svgGraphic}
              </div>

              {/* Arrow Circle */}
              <div className="w-8 h-8 rounded-full bg-white dark:bg-white/15 border border-purple-100 dark:border-white/10 flex items-center justify-center text-[#5F4EA5] dark:text-white shadow-2xs group-hover:bg-[#5F4EA5] group-hover:text-white group-hover:translate-x-0.5 transition-all">
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
