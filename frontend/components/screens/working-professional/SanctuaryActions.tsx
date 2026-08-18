"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SanctuaryActions() {
  const router = useRouter();

  const ACTIONS = [
    {
      label: "Continue Journal",
      desc: "Release reflections into encrypted space",
      icon: "auto_stories",
      href: "/journal",
      color: "bg-purple-50 text-[#5F4EA5] border-purple-100",
    },
    {
      label: "Resume Meditation",
      desc: "Gentle mindfulness audio for calm focus",
      icon: "self_improvement",
      href: "/meditation",
      color: "bg-emerald-50 text-[#006B56] border-emerald-100",
    },
    {
      label: "Explore a Resource",
      desc: "Evidence-backed guides on burnout & balance",
      icon: "menu_book",
      href: "/resources",
      color: "bg-indigo-50 text-[#7C6BC4] border-indigo-100",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
      className="space-y-3"
    >
      <div className="space-y-0.5">
        <h3 className="text-base sm:text-lg font-heading font-black text-[#1D192B]">
          Your Sanctuary
        </h3>
        <p className="text-xs text-[#797582] font-normal">
          Continue your personal wellness journey whenever you feel ready.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {ACTIONS.map((act) => (
          <motion.div
            key={act.label}
            whileHover={{ y: -3 }}
            onClick={() => router.push(act.href)}
            className="p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-[#E6DEFF]/80 flex items-center justify-between shadow-xs hover:shadow-md hover:border-[#7C6BC4]/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-10 h-10 rounded-xl ${act.color} border flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform`}>
                <span className="material-symbols-outlined text-lg">{act.icon}</span>
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-heading font-black text-[#1D192B] group-hover:text-[#5F4EA5] transition-colors">
                  {act.label}
                </h4>
                <p className="text-[11px] text-[#797582] font-normal line-clamp-1">
                  {act.desc}
                </p>
              </div>
            </div>

            <span className="material-symbols-outlined text-sm text-[#797582] group-hover:text-[#5F4EA5] group-hover:translate-x-1 transition-all">
              arrow_forward
            </span>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
