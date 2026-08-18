"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface YourWeekGentlyCardProps {
  history?: any[];
}

export default function YourWeekGentlyCard({ history = [] }: YourWeekGentlyCardProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>("Wellness");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Default clean 7-day pattern if user is starting out, or map actual history
  const defaultDays = [
    { day: "Sat", val: 35 },
    { day: "Sun", val: 48 },
    { day: "Mon", val: 62 },
    { day: "Tue", val: 54 },
    { day: "Wed", val: 76 },
    { day: "Thu", val: 70 },
    { day: "Today", val: 78 },
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
  const svgW = 520;
  const svgH = 140;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 15;
  const padBottom = 25;

  const points = dataPoints.map((pt, idx) => {
    const denom = Math.max(dataPoints.length - 1, 1);
    const x = padLeft + idx * ((svgW - padLeft - padRight) / denom);
    const y = padTop + (1 - pt.val / 100) * (svgH - padTop - padBottom);
    return { ...pt, x, y };
  });

  // Bezier Path
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
    <div className="rounded-[28px] bg-white/85 backdrop-blur-xl border border-[#E6DEFF]/80 p-6 shadow-[0_6px_24px_rgba(95,78,165,0.03)] flex flex-col justify-between min-h-[260px] space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-[#5F4EA5]">insights</span>
            <h3 className="text-base font-heading font-extrabold text-[#1D192B]">
              Your week, gently
            </h3>
          </div>
          <p className="text-xs text-[#797582] font-normal">
            Small changes are still changes.
          </p>
        </div>

        {/* Metric Selector Pill */}
        <div className="relative">
          <button
            type="button"
            className="px-3.5 py-1 rounded-full bg-[#FAF8FF] border border-purple-200/80 text-xs font-heading font-bold text-[#5F4EA5] flex items-center gap-1.5 shadow-2xs cursor-pointer hover:bg-purple-50"
          >
            <span>{selectedMetric}</span>
            <span className="material-symbols-outlined text-xs">expand_more</span>
          </button>
        </div>
      </div>

      {/* SVG Chart Area with Y-axis */}
      <div className="w-full relative select-none pt-2">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-32 overflow-visible">
          <defs>
            <linearGradient id="weekPurpleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C6BC4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#7C6BC4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Dotted horizontal guideline */}
          <line
            x1={padLeft}
            y1={padTop + (svgH - padTop - padBottom) / 2}
            x2={svgW - padRight}
            y2={padTop + (svgH - padTop - padBottom) / 2}
            stroke="#F2EBFF"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Y Axis Labels on Left */}
          <text x="10" y={padTop + 4} className="text-[8px] font-bold fill-[#9E9AA7]">100</text>
          <text x="10" y={padTop + (svgH - padTop - padBottom) * 0.25 + 4} className="text-[8px] font-bold fill-[#9E9AA7]">75</text>
          <text x="10" y={padTop + (svgH - padTop - padBottom) * 0.5 + 4} className="text-[8px] font-bold fill-[#9E9AA7]">50</text>
          <text x="10" y={padTop + (svgH - padTop - padBottom) * 0.75 + 4} className="text-[8px] font-bold fill-[#9E9AA7]">25</text>
          <text x="15" y={svgH - padBottom + 2} className="text-[8px] font-bold fill-[#9E9AA7]">0</text>

          {/* Area Fill */}
          <path d={fillD} fill="url(#weekPurpleGrad)" />

          {/* Smooth Bezier Line */}
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
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIdx === idx ? 5.5 : 3.5}
                fill={hoveredIdx === idx ? "#5F4EA5" : "#7C6BC4"}
                stroke="#FFFFFF"
                strokeWidth="2"
                className="transition-all duration-150"
              />
              <text
                x={pt.x}
                y={svgH - 6}
                textAnchor="middle"
                className={`text-[9px] font-heading ${
                  pt.day === "Today" ? "font-black fill-[#5F4EA5]" : "font-bold fill-[#797582]"
                }`}
              >
                {pt.day}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        <AnimatePresence>
          {hoveredIdx !== null && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                left: `${(points[hoveredIdx].x / svgW) * 100}%`,
                top: `${(points[hoveredIdx].y / svgH) * 100 - 30}%`,
                transform: "translate(-50%, -100%)",
              }}
              className="bg-[#1D192B] text-white text-[10px] font-bold py-1 px-2.5 rounded-lg shadow-md pointer-events-none whitespace-nowrap z-20"
            >
              Score: {points[hoveredIdx].val}%
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
