"use client";

import React from "react";
import { CustomSelect, CustomSelectOption } from "./CustomSelect";

interface GenderSelectProps {
  label?: string;
  sublabel?: string;
  value: string;
  onChange: (gender: string) => void;
  customValue?: string;
  onCustomChange?: (customGender: string) => void;
  error?: string;
}

const GENDER_OPTIONS: CustomSelectOption[] = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Custom", label: "Custom" },
  { value: "Prefer not to Say", label: "Prefer not to Say" },
];

export function GenderSelect({
  label = "Gender Identity",
  sublabel,
  value,
  onChange,
  customValue = "",
  onCustomChange,
  error,
}: GenderSelectProps) {
  const isCustomSelected = value === "Custom";

  return (
    <div className="space-y-2.5 w-full text-left">
      <CustomSelect
        label={label}
        sublabel={sublabel}
        placeholder="Select gender identity"
        options={GENDER_OPTIONS}
        value={value}
        onChange={onChange}
        error={!isCustomSelected ? error : undefined}
      />

      {isCustomSelected && (
        <div className="space-y-1.5 animate-fadeIn">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Enter your gender"
              value={customValue}
              onChange={(e) => onCustomChange?.(e.target.value)}
              className={`w-full p-3.5 pl-4 pr-4 rounded-2xl bg-surface-container-low border ${
                error
                  ? "border-red-400 focus:ring-2 focus:ring-red-400/30"
                  : "border-surface-variant/40 focus:ring-2 focus:ring-primary/40 focus:border-primary/50"
              } text-sm font-medium text-on-surface placeholder:text-on-surface-variant/40 transition-all outline-none`}
            />
          </div>
          {error && (
            <p className="text-xs text-red-500 font-semibold flex items-center gap-1.5 mt-1 animate-fadeIn">
              <span className="material-symbols-outlined text-sm font-bold">error</span>
              <span>{error}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
