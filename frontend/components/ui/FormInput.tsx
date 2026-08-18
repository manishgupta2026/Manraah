"use client";

import React, { InputHTMLAttributes, useState } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  sublabel?: string;
  error?: string;
  icon?: string;
  isPassword?: boolean;
}

export function FormInput({
  label,
  sublabel,
  error,
  icon,
  isPassword = false,
  className = "",
  type = "text",
  ...props
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-1.5 text-left w-full">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-heading font-bold text-on-surface">
          {label}
        </label>
        {sublabel && (
          <span className="text-[11px] text-on-surface-variant/70 font-medium">
            {sublabel}
          </span>
        )}
      </div>

      <div className="relative flex items-center">
        {icon && (
          <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant/60 text-xl pointer-events-none select-none">
            {icon}
          </span>
        )}

        <input
          type={inputType}
          className={`w-full p-3.5 ${
            icon ? "pl-11" : "pl-4"
          } ${isPassword ? "pr-11" : "pr-4"} rounded-2xl bg-surface-container-low border ${
            error
              ? "border-red-400 focus:ring-2 focus:ring-red-400/30"
              : "border-surface-variant/40 focus:ring-2 focus:ring-primary/40 focus:border-primary/50"
          } text-sm font-medium text-on-surface placeholder:text-on-surface-variant/40 transition-all outline-none ${className}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-on-surface-variant/70 hover:text-primary transition-colors p-1 rounded-lg focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <span className="material-symbols-outlined text-xl select-none">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 font-semibold flex items-center gap-1.5 mt-1 animate-fadeIn">
          <span className="material-symbols-outlined text-sm font-bold">error</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
