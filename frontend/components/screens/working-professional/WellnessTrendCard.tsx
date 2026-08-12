"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface WellnessTrendCardProps {
  history?: any[];
}

const MOOD_SCORES: Record<string, number> = {
  amazing: 5,
  happy: 4.5,
  good: 4.5,
  calm: 4,
  okay: 3,
  drained: 2.5,
  low: 2,
  stressed: 2,
  exhausted: 1.5,
  overwhelmed: 1,
};

const MOOD_EMOJIS: Record<string, string> = {
  amazing: "😁",
  happy: "😊",
  good: "😊",
  calm: "🙂",
  okay: "😐",
  drained: "😐",
  low: "😔",
  stressed: "😟",
  exhausted: "🥱",
  overwhelmed: "😣",
};

export default function WellnessTrendCard({ history = [] }: WellnessTrendCardProps) {
  const router = useRouter();
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    label: string;
    mood: string;
    score: number;
    emoji: string;
  } | null>(null);

  // Take the 7 most recent checkins
  const validEntries = history && history.length > 0 ? history.slice(0, 7).reverse() : [];
  const hasEnoughData = validEntries.length >= 2;

  // Svg geometry
  const svgW = 400;
  const svgH = 120;
  const paddingX = 24;
  const paddingY = 20;

  const points = validEntries.map((item, idx) => {
    const d = new Date(item.created_at || Date.now());
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const label = days[d.getDay()];
    const moodStr = (item.mood || "Okay").toLowerCase();
    const score = MOOD_SCORES[moodStr] || 3;

    const denominator = Math.max(validEntries.length - 1, 1);
    const x = paddingX + idx * ((svgW - paddingX * 2) / denominator);
    const y = svgH - paddingY - ((score - 1) / 4) * (svgH - paddingY * 2);

    return {
      x,
      y,
      label,
      mood: item.mood || "Okay",
      score,
      emoji: MOOD_EMOJIS[moodStr] || "🌸",
    };
  });

  // Build bezier path
  let pathD = points.length > 0 ? `M ${points[0].x} ${points[0].y}` : "";
  for (let i = 0; i < points.length - 1; i++) {
    const cpX1 = points[i].x + (points[i + 1].x - points[i].x) / 2;
    const cpY1 = points[i].y;
    const cpX2 = points[i].x + (points[i + 1].x - points[i].x) / 2;
    const cpY2 = points[i + 1].y;
    pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i + 1].x} ${points[i + 1].y}`;
  }

  const fillD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${svgH - 8} L ${points[0].x} ${svgH - 8} Z`
      : "";

  return (
    <div className="rounded-[32px] bg-white/75 backdrop-blur-xl border border-purple-100/70 p-6 md:p-7 shadow-[0_8px_30px_rgba(95,78,165,0.04)] relative overflow-hidden flex flex-col justify-between">
      {/* Header */}
      <div className="space-y-1 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📈</span>
            <h3 className="text-base font-heading font-extrabold text-[#1D192B]">
              Your week, gently
            </h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F4EA5] bg-[#E6DEFF]/60 px-2.5 py-0.5 rounded-full border border-purple-200/50">
            7-Day Rhythm
          </span>
        </div>
        <p className="text-xs text-[#484551]/80 font-normal">
          Small changes are still changes.
        </p>
      </div>

      {/* Chart Area or Empty State */}
      <div className="py-4 relative z-10 min-h-[140px] flex items-center justify-center">
        {hasEnoughData ? (
          <div className="w-full relative select-none">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-28 overflow-visible">
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C6BC4" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#7C6BC4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Minimal dotted baseline */}
              <line
                x1={paddingX}
                y1={svgH - paddingY}
                x2={svgW - paddingX}
                y2={svgH - paddingY}
                stroke="#E6DEFF"
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              {/* Soft area fill */}
              <path d={fillD} fill="url(#trendGrad)" />

              {/* Smooth line */}
              <motion.path
                d={pathD}
                fill="none"
                stroke="#5F4EA5"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />

              {/* Data points */}
              {points.map((pt, idx) => (
                <g
                  key={idx}
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPoint?.label === pt.label ? 6 : 4}
                    fill={hoveredPoint?.label === pt.label ? "#5F4EA5" : "#7C6BC4"}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="transition-all duration-200"
                  />
                  <text
                    x={pt.x}
                    y={svgH - 4}
                    textAnchor="middle"
                    className="text-[9px] font-bold fill-[#797582]"
                  >
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>

            {/* Hover Tooltip */}
            <AnimatePresence>
              {hoveredPoint && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  style={{
                    position: "absolute",
                    left: `${(hoveredPoint.x / svgW) * 100}%`,
                    top: `${(hoveredPoint.y / svgH) * 100 - 35}%`,
                    transform: "translate(-50%, -100%)",
                  }}
                  className="bg-[#1D192B] text-white text-[10px] font-bold py-1 px-2.5 rounded-lg shadow-md pointer-events-none whitespace-nowrap z-20 flex items-center gap-1"
                >
                  <span>{hoveredPoint.emoji}</span>
                  <span>{hoveredPoint.mood}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* ================= Clean Empty State (NO fake data) ================= */
          <div className="p-6 rounded-2xl bg-[#FAF8FF] border border-purple-100/60 text-center space-y-2 w-full">
            <span className="text-2xl filter drop-shadow-xs">🌱</span>
            <p className="text-xs font-heading font-extrabold text-[#1D192B]">
              Your journey is just beginning.
            </p>
            <p className="text-[11px] text-[#797582] max-w-xs mx-auto leading-relaxed">
              Keep checking in daily. Your gentle wellness pattern will appear here over time.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 flex items-center justify-between border-t border-purple-100/60 relative z-10">
        <span className="text-[11px] text-[#797582] font-semibold">
          {validEntries.length} check-ins logged
        </span>
        <button
          onClick={() => router.push("/reports")}
          className="text-xs font-bold text-[#5F4EA5] hover:text-[#7C6BC4] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>View Trends & Insights</span>
          <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
