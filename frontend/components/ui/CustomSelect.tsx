"use client";

import React, { useState, useRef, useEffect } from "react";

export interface CustomSelectOption {
  value: string;
  label: string;
  emoji?: string;
  sublabel?: string;
}

interface CustomSelectProps {
  label?: string;
  sublabel?: string;
  icon?: string;
  placeholder?: string;
  options: CustomSelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

export function CustomSelect({
  label,
  sublabel,
  icon,
  placeholder = "Select option",
  options,
  value,
  onChange,
  error,
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative text-left w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-heading font-bold text-on-surface flex items-center gap-1.5">
            {icon && (
              <span className="material-symbols-outlined text-sm text-primary">
                {icon}
              </span>
            )}
            <span>{label}</span>
          </label>
          {sublabel && (
            <span className="text-[11px] text-on-surface-variant/70 font-medium">
              {sublabel}
            </span>
          )}
        </div>
      )}

      {/* Select Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3.5 ${icon ? "pl-11" : "pl-4"} pr-10 rounded-2xl bg-surface-container-low border ${
          error
            ? "border-red-400"
            : isOpen
            ? "border-primary ring-2 ring-primary/20 bg-surface-container-lowest"
            : "border-surface-variant/40 hover:border-primary/40"
        } text-sm font-medium text-on-surface transition-all flex items-center justify-between outline-none cursor-pointer`}
      >
        {/* Left Icon */}
        {icon && (
          <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant/60 text-xl pointer-events-none select-none">
            {icon}
          </span>
        )}

        {/* Selected Label or Placeholder */}
        <span className="truncate flex items-center gap-2">
          {selectedOption ? (
            <>
              {selectedOption.emoji && (
                <span className="text-base select-none">{selectedOption.emoji}</span>
              )}
              <span className="font-semibold text-on-surface">{selectedOption.label}</span>
            </>
          ) : (
            <span className="text-on-surface-variant/50">{placeholder}</span>
          )}
        </span>

        {/* Arrow Chevron */}
        <span
          className={`material-symbols-outlined text-xl text-on-surface-variant/60 transition-transform duration-200 pointer-events-none ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Floating Custom Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-56 overflow-y-auto rounded-2xl bg-surface-container-lowest border border-surface-variant/30 shadow-card-lift p-1.5 backdrop-blur-md space-y-0.5 animate-fadeIn [scrollbar-width:thin]">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-heading font-semibold flex items-center justify-between transition-colors ${
                  isSelected
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-on-surface hover:bg-surface-container/60 hover:text-primary"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {opt.emoji && <span className="text-sm select-none">{opt.emoji}</span>}
                  <span>{opt.label}</span>
                </div>
                {isSelected && (
                  <span className="material-symbols-outlined text-sm text-primary font-bold">
                    check
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 font-semibold flex items-center gap-1.5 mt-1 animate-fadeIn">
          <span className="material-symbols-outlined text-sm font-bold">error</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
