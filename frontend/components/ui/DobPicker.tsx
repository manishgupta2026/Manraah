"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DobPickerProps {
  label?: string;
  sublabel?: string;
  value?: string; // YYYY-MM-DD
  onChange: (formattedDate: string) => void;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Single Wheel Column Component using Native CSS Scroll Snapping
interface WheelColumnProps<T> {
  items: T[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  formatItem: (item: T) => string;
}

function WheelColumn<T>({ items, selectedIndex, onSelect, formatItem }: WheelColumnProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  // Sync scroll position smoothly when selectedIndex changes
  useEffect(() => {
    if (containerRef.current && !isScrolling.current) {
      const targetScrollTop = selectedIndex * 40;
      if (Math.abs(containerRef.current.scrollTop - targetScrollTop) > 2) {
        containerRef.current.scrollTo({ top: targetScrollTop, behavior: "smooth" });
      }
    }
  }, [selectedIndex]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    isScrolling.current = true;

    const scrollTop = containerRef.current.scrollTop;
    const index = Math.min(
      Math.max(0, Math.round(scrollTop / 40)),
      items.length - 1
    );

    if (index !== selectedIndex) {
      onSelect(index);
    }

    clearTimeout((containerRef.current as any)._scrollTimer);
    (containerRef.current as any)._scrollTimer = setTimeout(() => {
      isScrolling.current = false;
    }, 150);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="relative h-[200px] overflow-y-auto snap-y snap-mandatory select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-[80px]"
    >
      {items.map((item, idx) => {
        const distance = Math.abs(idx - selectedIndex);

        let styleClass = "opacity-25 scale-90 text-on-surface-variant/70 font-medium";
        if (distance === 0) {
          styleClass = "opacity-100 font-extrabold text-lg scale-110 text-on-surface";
        } else if (distance === 1) {
          styleClass = "opacity-60 text-sm font-semibold text-on-surface-variant";
        }

        return (
          <div
            key={idx}
            onClick={() => {
              onSelect(idx);
              if (containerRef.current) {
                containerRef.current.scrollTo({ top: idx * 40, behavior: "smooth" });
              }
            }}
            className={`h-[40px] flex items-center justify-center snap-center transition-all duration-150 cursor-pointer ${styleClass}`}
          >
            {formatItem(item)}
          </div>
        );
      })}
    </div>
  );
}

export function DobPicker({
  label = "Date of Birth",
  sublabel,
  value = "",
  onChange,
}: DobPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Parse initial value or default to 1998-06-24
  const initialYear = value ? parseInt(value.split("-")[0], 10) : 1998;
  const initialMonth = value ? parseInt(value.split("-")[1], 10) - 1 : 5; // Jun
  const initialDay = value ? parseInt(value.split("-")[2], 10) : 24;

  const [tempYear, setTempYear] = useState(initialYear);
  const [tempMonth, setTempMonth] = useState(initialMonth);
  const [tempDay, setTempDay] = useState(initialDay);

  const [computedAge, setComputedAge] = useState<number | null>(null);

  // Generate Year options (1930 to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1930 + 1 }, (_, i) => currentYear - i);

  // Calculate max days for selected month & year
  const getDaysInMonth = (mIdx: number, y: number) => {
    return new Date(y, mIdx + 1, 0).getDate();
  };

  const maxDays = getDaysInMonth(tempMonth, tempYear);
  const days = Array.from({ length: maxDays }, (_, i) => i + 1);

  // Ensure selected day is within range when month/year changes
  useEffect(() => {
    if (tempDay > maxDays) {
      setTempDay(maxDays);
    }
  }, [maxDays, tempDay]);

  // Calculate live age display when value changes
  useEffect(() => {
    if (value) {
      const parts = value.split("-");
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);

        const birth = new Date(y, m, d);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        setComputedAge(age >= 0 ? age : null);
      }
    } else {
      setComputedAge(null);
    }
  }, [value]);

  const handleConfirm = () => {
    const formattedMonth = (tempMonth + 1).toString().padStart(2, "0");
    const formattedDay = tempDay.toString().padStart(2, "0");
    const formattedDate = `${tempYear}-${formattedMonth}-${formattedDay}`;
    
    onChange(formattedDate);
    setIsOpen(false);
  };

  const formatDisplayValue = () => {
    if (!value) return null;
    const parts = value.split("-");
    if (parts.length !== 3) return null;
    const y = parts[0];
    const mIdx = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    return `${d} ${MONTH_NAMES[mIdx]} ${y}`;
  };

  const selectedYearIdx = years.indexOf(tempYear) !== -1 ? years.indexOf(tempYear) : 0;
  const selectedDayIdx = tempDay - 1 < days.length ? tempDay - 1 : days.length - 1;

  return (
    <div className="space-y-1.5 text-left w-full">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-heading font-bold text-on-surface">
          <span>{label}</span>
        </label>
        <div className="flex items-center gap-2">
          {computedAge !== null && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold bg-primary/10 text-primary border border-primary/20 animate-fadeIn">
              ✨ {computedAge} years old
            </span>
          )}
          {sublabel && (
            <span className="text-[11px] text-on-surface-variant/70 font-medium">
              {sublabel}
            </span>
          )}
        </div>
      </div>

      {/* Input Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full p-3.5 pl-4 pr-10 rounded-2xl bg-surface-container-low border border-surface-variant/40 hover:border-primary/40 hover:bg-surface-container-lowest text-sm font-semibold text-on-surface transition-all flex items-center justify-between outline-none cursor-pointer shadow-xs"
      >

        {formatDisplayValue() ? (
          <span className="font-bold text-on-surface flex items-center gap-2">
            <span>{formatDisplayValue()}</span>
          </span>
        ) : (
          <span className="text-on-surface-variant/50 font-medium">Set Date of Birth</span>
        )}

        <span className="material-symbols-outlined text-xl text-primary pointer-events-none">
          edit_calendar
        </span>
      </button>

      {/* iOS Wheel Date Picker Modal Dialog */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Modal Content Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              className="relative z-10 w-full max-w-xs rounded-[32px] bg-surface-container-lowest border border-surface-variant/30 shadow-2xl p-6 space-y-5 text-center select-none"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-surface-variant/20">
                <div className="w-6" />
                <h3 className="font-heading font-extrabold text-sm text-on-surface tracking-wider uppercase">
                  SET BIRTHDAY
                </h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-lg font-bold">close</span>
                </button>
              </div>

              {/* Wheel Picker Container */}
              <div className="relative h-[200px] overflow-hidden my-2">
                {/* Center Highlight Bar (Exact 40px height, centered at y=80px) */}
                <div className="absolute left-1 right-1 top-[80px] h-[40px] bg-primary/10 rounded-2xl border border-primary/25 pointer-events-none z-0" />

                {/* 3 Wheel Columns: Year | Month | Day */}
                <div className="grid grid-cols-3 gap-1 relative z-10 h-full">
                  {/* YEAR COLUMN */}
                  <WheelColumn
                    items={years}
                    selectedIndex={selectedYearIdx}
                    onSelect={(idx) => setTempYear(years[idx])}
                    formatItem={(y) => y.toString()}
                  />

                  {/* MONTH COLUMN */}
                  <WheelColumn
                    items={MONTH_NAMES}
                    selectedIndex={tempMonth}
                    onSelect={(idx) => setTempMonth(idx)}
                    formatItem={(m) => m}
                  />

                  {/* DAY COLUMN */}
                  <WheelColumn
                    items={days}
                    selectedIndex={selectedDayIdx}
                    onSelect={(idx) => setTempDay(days[idx])}
                    formatItem={(d) => (d < 10 ? `0${d}` : d.toString())}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full py-4 rounded-2xl bg-on-surface hover:bg-primary text-white font-heading font-extrabold text-xs tracking-wider uppercase shadow-md hover:shadow-lg transition-all"
              >
                CONFIRM BIRTHDAY
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
