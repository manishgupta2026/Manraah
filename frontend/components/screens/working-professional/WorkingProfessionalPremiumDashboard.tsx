"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getInitials, getPastelBgColor, getPastelTextColor } from "@/frontend/lib/avatar-helper";

interface WorkingProfessionalPremiumDashboardProps {
  sanctuaryName: string;
  streakDays: number;
  onOpenReset: () => void;
  onOpenAI: () => void;
  todayMood?: string | null;
  stress?: string | null;
  energy?: number | null;
  score: number;
  level: string;
  history: any[];
  onOpenCalculator: () => void;
}

export default function WorkingProfessionalPremiumDashboard({
  sanctuaryName,
  streakDays,
  onOpenReset,
  onOpenAI,
  todayMood,
  stress,
  energy,
  score,
  level,
  history = [],
  onOpenCalculator,
}: WorkingProfessionalPremiumDashboardProps) {
  const [currentTab, setCurrentTab] = useState<"monthly" | "daily">("monthly");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Format dates for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const currentMonthName = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();
  const todayDayNum = currentDate.getDate();

  // Generate calendar days for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days = [];
    
    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: prevMonthTotalDays - i,
        isCurrentMonth: false,
        key: `prev-${i}`
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        key: `curr-${i}`
      });
    }

    // Next month padding to complete grid
    const totalGridCells = 35; // 5 weeks
    const remainingCells = totalGridCells - days.length;
    for (let i = 1; i <= (remainingCells > 0 ? remainingCells : 7); i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        key: `next-${i}`
      });
    }

    return days.slice(0, 35);
  };

  const calendarDays = getCalendarDays();

  // Mood history data extraction for chart (last 6 checkins)
  const getRecentMoodHistory = () => {
    const rawHistory = [...history].slice(0, 6).reverse();
    // Fill up with mock data if not enough history
    const defaultData = [
      { month: "Jul", value: 3 },
      { month: "Aug", value: 4 },
      { month: "Sep", value: 2 },
      { month: "Oct", value: 5 },
      { month: "Nov", value: 4 },
      { month: "Dec", value: 4 }
    ];

    if (rawHistory.length === 0) return defaultData;

    const monthShorts = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    return rawHistory.map((h, i) => {
      const dateObj = new Date(h.date || h.createdAt || new Date());
      let moodScore = 3;
      const m = (h.mood || "").toLowerCase().trim();
      if (m === "amazing" || m === "good") moodScore = 5;
      else if (m === "happy" || m === "calm") moodScore = 4;
      else if (m === "okay" || m === "neutral") moodScore = 3;
      else if (m === "drained" || m === "tired") moodScore = 2;
      else if (m === "stressed" || m === "overwhelmed") moodScore = 1.5;

      return {
        month: monthShorts[dateObj.getMonth()],
        value: moodScore
      };
    });
  };

  const chartData = getRecentMoodHistory();

  // Background / Color config of the dashboard mockup
  const darkSidebarColor = "#0D120E"; // Deep charcoal/black

  return (
    <div className="w-full bg-[#E8ECE9] dark:bg-[#121815] rounded-[36px] overflow-hidden shadow-xl border border-emerald-900/5 dark:border-emerald-500/10 p-3 sm:p-5 text-[#0F3822] dark:text-[#E3EAE5] transition-colors duration-300">
      <div className="flex flex-col lg:flex-row gap-5">
        
        {/* PANEL 1: LEFT VERTICAL DARK SIDEBAR RIBBON */}
        <div 
          className="hidden md:flex lg:flex flex-row lg:flex-col justify-between items-center w-full lg:w-[68px] rounded-[24px] py-6 px-3 shrink-0 shadow-md"
          style={{ backgroundColor: darkSidebarColor }}
        >
          {/* Logo */}
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4V20M4 12H20" stroke="#FF9F43" strokeWidth="3" strokeLinecap="round"/>
              <path d="M12 12L4 4M12 12L20 20" stroke="#85AF84" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-row lg:flex-col gap-6 my-4 lg:my-0">
            <button className="text-white/40 hover:text-white transition-colors p-2 text-xs flex flex-col items-center gap-1 group">
              <span className="material-symbols-outlined text-[22px] text-[#85AF84] group-hover:scale-105 transition-transform">grid_view</span>
              <span className="text-[9px] text-[#85AF84] font-bold">Dashboard</span>
            </button>
            <button className="text-white/40 hover:text-[#85AF84] transition-colors p-2 text-xs flex flex-col items-center gap-1 group">
              <span className="material-symbols-outlined text-[22px] group-hover:scale-105 transition-transform">calendar_today</span>
            </button>
            <button className="text-white/40 hover:text-[#85AF84] transition-colors p-2 text-xs flex flex-col items-center gap-1 group">
              <span className="material-symbols-outlined text-[22px] group-hover:scale-105 transition-transform">assignment</span>
            </button>
            <button className="text-white/40 hover:text-[#85AF84] transition-colors p-2 text-xs flex flex-col items-center gap-1 group">
              <span className="material-symbols-outlined text-[22px] group-hover:scale-105 transition-transform">hub</span>
            </button>
            <button className="text-white/40 hover:text-[#85AF84] transition-colors p-2 text-xs flex flex-col items-center gap-1 group">
              <span className="material-symbols-outlined text-[22px] group-hover:scale-105 transition-transform">settings</span>
            </button>
          </div>

          {/* Bottom actions */}
          <div className="flex flex-row lg:flex-col gap-5">
            <button className="text-white/40 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">help</span>
            </button>
            <button className="text-white/40 hover:text-red-400 transition-colors">
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>

        {/* PANEL 2: "CHECK YOUR CONDITION" CARD (Sage Green Inner Panel) */}
        <div className="w-full lg:w-[250px] bg-[#E3EAE5] dark:bg-[#1A231E] rounded-[28px] p-6 flex flex-col justify-between items-center relative overflow-hidden shrink-0 border border-emerald-950/5 dark:border-white/5">
          {/* Hanging Botanical Plants Decoration */}
          <div className="absolute top-0 right-4 w-12 h-16 pointer-events-none opacity-80">
            <svg width="48" height="64" viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 0V20" stroke="#5F8C5E" strokeWidth="1.5" strokeDasharray="2 2"/>
              <path d="M12 5V12" stroke="#5F8C5E" strokeWidth="1" strokeDasharray="2 2"/>
              <path d="M36 3V16" stroke="#5F8C5E" strokeWidth="1" strokeDasharray="2 2"/>
              {/* Vines and leaves */}
              <path d="M24 20C21.5 24 24 28 22 32C20 36 21 40 23 44" stroke="#5F8C5E" strokeWidth="1.5"/>
              <path d="M12 12C9 14 11 18 10 20C9 22 10 24 11 26" stroke="#5F8C5E" strokeWidth="1"/>
              {/* Leaf paths */}
              <path d="M22 23C20 22 17 23 18 25C19 27 22 25 22 23Z" fill="#85AF84"/>
              <path d="M24 28C26 27 29 28 28 30C27 32 24 30 24 28Z" fill="#5F8C5E"/>
              <path d="M21 34C19 33 16 34 17 36C18 38 21 36 21 34Z" fill="#85AF84"/>
              <path d="M23 41C25 40 28 41 27 43C26 45 23 43 23 41Z" fill="#5F8C5E"/>
            </svg>
          </div>

          <div className="text-center w-full flex flex-col items-center">
            {/* Dynamic Profile Avatar */}
            <div className="w-16 h-16 rounded-full flex items-center justify-center font-heading font-bold text-lg border border-[#85AF84]/30 shadow-md mb-4 shrink-0 relative overflow-hidden transition-all duration-300">
              <div 
                className="absolute inset-0 flex items-center justify-center text-white" 
                style={{ backgroundColor: getPastelBgColor(sanctuaryName) }}
              >
                {getInitials(sanctuaryName)}
              </div>
            </div>
            
            <h3 className="font-heading font-extrabold text-[16px] text-[#0F3822] dark:text-emerald-300 leading-snug">
              Check your condition
            </h3>
            <p className="text-[11px] text-[#5C6B61] dark:text-emerald-200/60 mt-1 max-w-[170px] mx-auto">
              Check your every situation and your activities
            </p>
            
            {/* Check It Now Action */}
            <button
              onClick={onOpenReset}
              className="mt-5 w-full max-w-[180px] py-2.5 rounded-full bg-[#85AF84] hover:bg-[#749E73] text-white font-heading font-bold text-xs shadow-md shadow-emerald-950/10 hover:shadow-lg transition-all transform hover:-translate-y-[1px] active:translate-y-0 cursor-pointer"
            >
              Check It Now
            </button>
          </div>

          {/* Consultation / Decompression Vector Illustration */}
          <div className="w-full mt-6 flex justify-center items-end select-none">
            <svg width="180" height="150" viewBox="0 0 180 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="max-w-full">
              {/* Table / Desk */}
              <path d="M10 135H170" stroke="#A8BAAF" strokeWidth="3" strokeLinecap="round"/>
              <rect x="25" y="115" width="20" height="20" rx="3" fill="#D3E0D8" stroke="#A8BAAF" strokeWidth="1.5"/>
              
              {/* Doctor / Companion (Left) */}
              <circle cx="50" cy="50" r="10" fill="#E2C1A8"/>
              <path d="M50 40C46 40 43 43 43 47C43 49 46 51 50 51C54 51 57 49 57 47C57 43 54 40 50 40Z" fill="#4B3B32"/>
              <path d="M35 85C35 70 40 60 50 60C60 60 65 70 65 85H35Z" fill="#F1F6F3" stroke="#A8BAAF" strokeWidth="1.5"/>
              <path d="M48 60V75M40 68H52" stroke="#5F8C5E" strokeWidth="1.5" strokeLinecap="round"/>
              
              {/* Stethoscope */}
              <path d="M52 68C60 68 70 78 80 82C90 85 100 85 110 82" stroke="#4B3B32" strokeWidth="1.5" strokeDasharray="2 2"/>

              {/* Patient (Right) */}
              <circle cx="120" cy="55" r="10" fill="#D1A78B"/>
              <path d="M120 45C115 45 112 48 112 52C112 54 115 56 120 56C125 56 128 54 128 52C128 48 125 45 120 45Z" fill="#2E3A59"/>
              <path d="M105 90C105 75 110 65 120 65C130 65 135 75 135 90H105Z" fill="#EE9A5F"/>

              {/* Chair */}
              <path d="M115 90V135M125 90V135" stroke="#A8BAAF" strokeWidth="2"/>
              <path d="M100 90H140" stroke="#A8BAAF" strokeWidth="3" strokeLinecap="round"/>
              <path d="M135 75V110" stroke="#A8BAAF" strokeWidth="2"/>
              
              {/* Plant (Bottom Right) */}
              <path d="M150 135C150 115 160 100 165 95C170 100 175 115 175 135H150Z" fill="#85AF84" opacity="0.6"/>
              <path d="M158 135C158 120 166 108 170 103C174 108 178 120 178 135H158Z" fill="#5F8C5E" opacity="0.8"/>
            </svg>
          </div>
        </div>

        {/* PANEL 3: MIDDLE WORKSPACE (Main Activities, Dynamic Data) */}
        <div className="flex-1 flex flex-col justify-between gap-5">
          {/* Header row */}
          <div className="flex justify-between items-center bg-white dark:bg-[#1C2520] rounded-[24px] px-6 py-4 border border-emerald-950/5 dark:border-white/5 shadow-xs">
            <div>
              <h2 className="font-heading font-extrabold text-[20px] text-[#0F3822] dark:text-[#E3EAE5] leading-tight">
                Hi, {sanctuaryName}.
              </h2>
              <p className="text-[11px] text-[#5C6B61] dark:text-emerald-200/60 font-medium">Let's track your health daily!</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Mock Search */}
              <div className="w-8 h-8 rounded-full bg-[#F1F5F2] dark:bg-white/5 flex items-center justify-center cursor-pointer hover:bg-emerald-900/5 dark:hover:bg-white/10 transition-all">
                <span className="material-symbols-outlined text-[18px] text-[#5C6B61] dark:text-[#9CAAA0]">search</span>
              </div>
              {/* Notifications bell */}
              <div className="w-8 h-8 rounded-full bg-[#F1F5F2] dark:bg-white/5 flex items-center justify-center cursor-pointer hover:bg-emerald-900/5 dark:hover:bg-white/10 transition-all relative">
                <span className="material-symbols-outlined text-[18px] text-[#5C6B61] dark:text-[#9CAAA0]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 border border-white dark:border-[#1C2520]" />
              </div>
              {/* Profile Shortcut */}
              <div className="w-8 h-8 rounded-full bg-emerald-700/20 border border-[#85AF84]/30 flex items-center justify-center font-heading font-extrabold text-[10px] text-[#0F3822] dark:text-emerald-300">
                {getInitials(sanctuaryName)}
              </div>
            </div>
          </div>

          {/* Nature Session / Upcoming appointment */}
          <div className="bg-white dark:bg-[#1C2520] rounded-[28px] p-5 flex flex-col md:flex-row gap-5 items-stretch border border-emerald-950/5 dark:border-white/5 shadow-xs">
            {/* Visual Nature Card Illustration */}
            <div className="w-full md:w-[150px] h-[100px] md:h-auto rounded-[20px] bg-gradient-to-tr from-[#97B896] to-[#CBDBCD] flex items-center justify-center relative overflow-hidden shrink-0">
              <svg width="100%" height="100%" viewBox="0 0 150 100" preserveAspectRatio="none" className="absolute inset-0">
                <path d="M-10 100 L30 50 L80 100 Z" fill="#7FA97E" opacity="0.6"/>
                <path d="M40 100 L90 40 L160 100 Z" fill="#5F8C5E" opacity="0.8"/>
                <circle cx="110" cy="30" r="14" fill="#FFEAA7" opacity="0.9"/>
                <path d="M-10 85 C30 80, 80 90, 160 85 L160 100 L-10 100 Z" fill="#85AF84"/>
              </svg>
              <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-xs rounded-xl p-1.5 text-center shadow-xs">
                <p className="text-[9px] font-heading font-bold text-[#0F3822]">Manraah Sanctuary</p>
                <p className="text-[7px] text-[#5C6B61]">Virtual Care Center</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-between gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-heading font-extrabold text-[13px] text-[#0F3822] dark:text-emerald-300">Sanctuary Reset Retreat</h4>
                  <p className="text-[10px] text-[#5C6B61] dark:text-emerald-200/50 mt-0.5">Online • Global Sanctuary</p>
                </div>
                
                {/* Doctor Avatar + Name */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#FAF8FE] border border-purple-200/50 flex items-center justify-center overflow-hidden shrink-0">
                    <span className="material-symbols-outlined text-[16px] text-[#6351A5]">psychology</span>
                  </div>
                  <div className="text-left leading-none">
                    <p className="text-[10px] font-heading font-bold text-[#0F3822] dark:text-emerald-300">AI Companion</p>
                    <p className="text-[8px] text-[#5C6B61] dark:text-[#9CAAA0]">Personal Guide</p>
                  </div>
                </div>
              </div>

              {/* Date & Time Pills + Action Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#F1F5F2] dark:border-white/5">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-[#F1F5F2] dark:bg-white/5 px-2.5 py-1 rounded-full text-[10px] text-[#5C6B61] dark:text-[#9CAAA0] font-medium">
                    <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                    <span>19 Aug 2026</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#F1F5F2] dark:bg-white/5 px-2.5 py-1 rounded-full text-[10px] text-[#5C6B61] dark:text-[#9CAAA0] font-medium">
                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                    <span>Anytime</span>
                  </div>
                </div>

                <button
                  onClick={onOpenAI}
                  className="px-4 py-1.5 rounded-full bg-[#85AF84] hover:bg-[#749E73] text-white font-heading font-bold text-[10px] shadow-xs cursor-pointer flex items-center gap-1 hover:translate-x-[2px] transition-all"
                >
                  <span>Chat Companion</span>
                  <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          {/* Activities Row: Bar Chart & Daily Progress circle */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Chart (8 cols) */}
            <div className="md:col-span-8 bg-white dark:bg-[#1C2520] rounded-[28px] p-5 flex flex-col justify-between border border-emerald-950/5 dark:border-white/5 shadow-xs">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-heading font-extrabold text-[13px] text-[#0F3822] dark:text-emerald-300">Patient activities</h4>
                  <p className="text-[9px] text-[#5C6B61] dark:text-emerald-200/50">Mood & Decompression Levels</p>
                </div>
                {/* Month Dropdown Selector */}
                <div className="flex items-center gap-1 bg-[#F1F5F2] dark:bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-[#5C6B61] dark:text-[#9CAAA0] cursor-pointer hover:bg-emerald-900/5 transition-all">
                  <span className="material-symbols-outlined text-[12px]">calendar_month</span>
                  <span>Month</span>
                  <span className="material-symbols-outlined text-[12px] ml-0.5">expand_more</span>
                </div>
              </div>

              {/* Bar Chart Rendering */}
              <div className="h-32 flex items-end justify-between gap-2 pt-6 px-2">
                {chartData.map((item, idx) => {
                  const pct = Math.max(15, (item.value / 5) * 100);
                  const isHighlighted = idx === chartData.length - 1;
                  
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <div className="w-full relative group flex justify-center items-end h-full">
                        <div className="absolute bottom-full mb-1 bg-[#0F3822] text-white text-[8px] px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                          Mood: {item.value}/5
                        </div>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${pct}%` }}
                          transition={{ type: "spring", stiffness: 80, damping: 15, delay: idx * 0.05 }}
                          className={`w-full max-w-[20px] rounded-t-full transition-all duration-300 ${
                            isHighlighted 
                              ? "bg-[#85AF84] shadow-md shadow-emerald-500/20" 
                              : "bg-[#85AF84]/25 dark:bg-[#85AF84]/15 group-hover:bg-[#85AF84]/40"
                          }`}
                        />
                      </div>
                      <span className="text-[9px] text-[#5C6B61] dark:text-[#9CAAA0] font-bold">{item.month}</span>
                    </div>
                  );
                })}
              </div>

              {/* Good Conditions Status click banner */}
              <button 
                onClick={onOpenCalculator}
                className="mt-4 flex items-center justify-between bg-[#F1F5F2] dark:bg-white/5 hover:bg-[#85AF84]/10 dark:hover:bg-[#85AF84]/15 px-4 py-2.5 rounded-2xl border border-emerald-900/5 dark:border-white/5 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[16px] text-[#85AF84] bg-white dark:bg-white/5 p-1 rounded-lg">favorite</span>
                  <div className="leading-none">
                    <p className="text-[10px] font-heading font-extrabold text-[#0F3822] dark:text-emerald-300">Good conditions</p>
                    <p className="text-[8px] text-[#5C6B61] dark:text-emerald-200/50 mt-0.5">Anxiety & wellness level: {level}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[14px] text-[#85AF84] group-hover:translate-x-[2px] transition-transform">arrow_forward_ios</span>
              </button>
            </div>

            {/* Daily progress (4 cols) */}
            <div className="md:col-span-4 bg-white dark:bg-[#1C2520] rounded-[28px] p-5 flex flex-col justify-between items-center text-center border border-emerald-950/5 dark:border-white/5 shadow-xs">
              <div className="w-full text-left">
                <h4 className="font-heading font-extrabold text-[13px] text-[#0F3822] dark:text-emerald-300">Daily progress</h4>
                <p className="text-[9px] text-[#5C6B61] dark:text-emerald-200/50">Mental wellness progress</p>
              </div>

              {/* Circular progress bar */}
              <div className="relative w-28 h-28 my-3 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#F1F5F2"
                    className="dark:stroke-white/5"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#85AF84"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={251.2}
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * score) / 100 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                  <span className="font-heading font-black text-[22px] text-[#0F3822] dark:text-emerald-300">{score}%</span>
                </div>
              </div>

              <p className="text-[10px] text-[#5C6B61] dark:text-emerald-200/60 max-w-[130px] leading-tight">
                Keep improving the quality of your health
              </p>
            </div>
          </div>
        </div>

        {/* PANEL 4: RIGHT SCHEDULE & CALENDAR (List of appointments) */}
        <div className="w-full lg:w-[280px] bg-white dark:bg-[#1C2520] rounded-[28px] p-5 flex flex-col gap-4 border border-emerald-950/5 dark:border-white/5 shadow-xs shrink-0">
          <div className="flex justify-between items-center">
            <h4 className="font-heading font-extrabold text-[13px] text-[#0F3822] dark:text-emerald-300">List of appointments</h4>
            <span className="material-symbols-outlined text-[16px] text-[#5C6B61]">event_note</span>
          </div>

          {/* Tabs: Monthly / Daily */}
          <div className="flex bg-[#F1F5F2] dark:bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => setCurrentTab("monthly")}
              className={`flex-1 py-1 text-center font-heading font-bold text-[10px] rounded-lg transition-all cursor-pointer ${
                currentTab === "monthly"
                  ? "bg-white dark:bg-[#2A352F] text-[#0F3822] dark:text-emerald-300 shadow-xs"
                  : "text-[#5C6B61] dark:text-[#9CAAA0] hover:text-[#0F3822]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setCurrentTab("daily")}
              className={`flex-1 py-1 text-center font-heading font-bold text-[10px] rounded-lg transition-all cursor-pointer ${
                currentTab === "daily"
                  ? "bg-white dark:bg-[#2A352F] text-[#0F3822] dark:text-emerald-300 shadow-xs"
                  : "text-[#5C6B61] dark:text-[#9CAAA0] hover:text-[#0F3822]"
              }`}
            >
              Daily
            </button>
          </div>

          {/* Calendar Widget View */}
          <div className="w-full bg-[#FAFBFB] dark:bg-white/[0.02] border border-[#F1F5F2] dark:border-white/5 rounded-2xl p-3">
            {/* Header: Month name */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] font-heading font-extrabold text-[#0F3822] dark:text-emerald-300">
                {currentMonthName} {currentYear}
              </span>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                  className="w-4 h-4 rounded-full bg-[#F1F5F2] dark:bg-white/5 flex items-center justify-center hover:bg-emerald-900/5 transition-all"
                >
                  <span className="material-symbols-outlined text-[10px] text-[#5C6B61]">chevron_left</span>
                </button>
                <button 
                  onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                  className="w-4 h-4 rounded-full bg-[#F1F5F2] dark:bg-white/5 flex items-center justify-center hover:bg-emerald-900/5 transition-all"
                >
                  <span className="material-symbols-outlined text-[10px] text-[#5C6B61]">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <span key={i} className="text-[9px] text-[#A8BAAF] font-bold select-none">{d}</span>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {calendarDays.map((cell) => {
                const isToday = cell.isCurrentMonth && cell.day === todayDayNum;
                const isActive = cell.isCurrentMonth && [2, 6, 12, 18, 19].includes(cell.day);
                
                return (
                  <div
                    key={cell.key}
                    className={`h-6 w-full flex items-center justify-center text-[10px] font-bold rounded-lg relative cursor-pointer select-none transition-all ${
                      cell.isCurrentMonth
                        ? isToday
                          ? "bg-orange-500 text-white shadow-xs"
                          : "text-[#0F3822] dark:text-[#E3EAE5]"
                        : "text-[#A8BAAF]/40"
                    }`}
                  >
                    <span>{cell.day}</span>
                    {isActive && !isToday && (
                      <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#85AF84]" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schedule list items */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between bg-[#F1F5F2]/60 dark:bg-white/5 p-2.5 rounded-xl border border-emerald-900/5 dark:border-white/5 hover:translate-x-[2px] transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#85AF84]" />
                <div className="text-left leading-none">
                  <p className="text-[10.5px] font-heading font-extrabold text-[#0F3822] dark:text-emerald-300">Manage stress</p>
                  <p className="text-[8.5px] text-[#5C6B61] dark:text-emerald-200/50 mt-1">10:00pm - 12:00 pm</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[14px] text-[#5C6B61] group-hover:translate-x-[2px] transition-transform">chevron_right</span>
            </div>

            <div className="flex items-center justify-between bg-orange-50/50 dark:bg-orange-950/10 p-2.5 rounded-xl border border-orange-100 dark:border-orange-500/10 hover:translate-x-[2px] transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                <div className="text-left leading-none">
                  <p className="text-[10.5px] font-heading font-extrabold text-[#0F3822] dark:text-emerald-300">Decompression reset</p>
                  <p className="text-[8.5px] text-[#5C6B61] dark:text-emerald-200/50 mt-1">09:00am - 10:00 am</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[14px] text-orange-400 group-hover:translate-x-[2px] transition-transform">chevron_right</span>
            </div>

            <button 
              onClick={onOpenReset}
              className="w-full text-center py-2 text-[10px] font-heading font-bold text-[#85AF84] hover:text-[#749E73] flex items-center justify-center gap-1 hover:translate-x-[2px] transition-all cursor-pointer"
            >
              <span>See More Schedule</span>
              <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
