"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RecentRhythmCardProps {
  history?: any[];
}

export default function RecentRhythmCard({ history = [] }: RecentRhythmCardProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>("Wellness");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(6); // Default active on "Today"

  const defaultDays = [
    { day: "Sat", val: 40 },
    { day: "Sun", val: 52 },
    { day: "Mon", val: 65 },
    { day: "Tue", val: 58 },
    { day: "Wed", val: 74 },
    { day: "Thu", val: 70 },
    { day: "Today", val: 76 },
  ];

  const dataPoints = history && history.length >= 2
    ? history.slice(0, 7).reverse().map((item: any, idx: number) => {
        const d = new Date(item.created_at || Date.now());
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayLabel = idx === history.length - 1 ? "Today" : days[d.getDay()];
        const score = Number(item.score || item.energy_level || 3) * 16;
        return { day: dayLabel, val: Math.min(100, Math.max(20, score)) };
      })
    : defaultDays;

  // SVG Geometry
  const svgW = 460;
  const svgH = 130;
  const padLeft = 32;
  const padRight = 16;
  const padTop = 16;
  const padBottom = 24;

  const points = dataPoints.map((pt, idx) => {
    const denom = Math.max(dataPoints.length - 1, 1);
    const x = padLeft + idx * ((svgW - padLeft - padRight) / denom);
    const y = padTop + (1 - pt.val / 100) * (svgH - padTop - padBottom);
    return { ...pt, x, y };
  });

  // Smooth Bezier Curve
  let pathD = points.length > 0 ? `M ${points[0].x} ${points[0].y}` : "";
  for (let i = 0; i < points.length - 1; i++) {
    const cpX1 = points[i].x + (points[i + 1].x - points[i].x) / 2;
    const cpY1 = points[i].y;
    const cpX2 = points[i].x + (points[i + 1].x - points[i].x) / 2;
    const cpY2 = points[i + 1].y;
    pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i + 1].x} ${points[i + 1].y}`;
  }

  const fillD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${svgH - padBottom} L ${points[0].x} ${svgH - padBottom} Z`
    : "";

  return (
    <div className="rounded-[28px] bg-white/85 dark:bg-[#1E1933]/90 backdrop-blur-xl border border-[#E6DEFF]/80 dark:border-purple-500/20 p-6 shadow-[0_6px_24px_rgba(95,78,165,0.03)] flex flex-col justify-between min-h-[280px] space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <h3 className="text-base font-heading font-extrabold text-[#1D192B] dark:text-white">
            Your recent rhythm
          </h3>
          <p className="text-xs text-[#797582] dark:text-purple-200/70 font-normal">
            Small changes are still changes.
          </p>
        </div>

        {/* Metric Selector Pill */}
        <div className="relative">
          <button
            type="button"
            className="px-3 py-1 rounded-full bg-[#FAF8FF] dark:bg-white/10 border border-purple-200/80 dark:border-white/15 text-xs font-heading font-bold text-[#5F4EA5] dark:text-purple-200 flex items-center gap-1 shadow-2xs"
          >
            <span>{selectedMetric}</span>
            <span className="material-symbols-outlined text-xs">expand_more</span>
          </button>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="w-full relative select-none pt-1">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-32 overflow-visible">
          <defs>
            <linearGradient id="rhythmGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C6BC4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#7C6BC4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Dotted guideline */}
          <line
            x1={padLeft}
            y1={padTop + (svgH - padTop - padBottom) / 2}
            x2={svgW - padRight}
            y2={padTop + (svgH - padTop - padBottom) / 2}
            stroke="#F2EBFF"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="dark:stroke-white/10"
          />

          {/* Fill */}
          <path d={fillD} fill="url(#rhythmGrad)" />

          {/* Smooth Line */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="#7C6BC4"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />

          {/* Data Points */}
          {points.map((pt, idx) => (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              className="cursor-pointer"
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIdx === idx ? 5 : 3}
                fill={hoveredIdx === idx ? "#5F4EA5" : "#7C6BC4"}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <text
                x={pt.x}
                y={svgH - 6}
                textAnchor="middle"
                className={`text-[9px] font-heading ${
                  pt.day === "Today" ? "font-black fill-[#5F4EA5] dark:fill-purple-300" : "font-bold fill-[#797582] dark:fill-purple-200/60"
                }`}
              >
                {pt.day}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Pill Badge Tooltip */}
        <AnimatePresence>
          {hoveredIdx !== null && (
            <motion.div
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                left: `${(points[hoveredIdx].x / svgW) * 100}%`,
                top: `${(points[hoveredIdx].y / svgH) * 100 - 32}%`,
                transform: "translate(-50%, -100%)",
              }}
              className="bg-[#2D244F] text-white text-[10px] font-heading font-bold py-1 px-2.5 rounded-full shadow-md pointer-events-none whitespace-nowrap z-20 border border-purple-400/40"
            >
              Feeling steadier: {points[hoveredIdx].val}/100
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
