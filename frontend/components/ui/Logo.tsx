"use client";

import React from "react";

export interface LogoProps {
  className?: string;
  variant?: "default" | "white";
  size?: "sm" | "md" | "lg" | "xl" | "custom";
  alt?: string;
  priority?: boolean;
}

export default function Logo({
  className = "",
  variant = "default",
  size = "md",
  alt = "Manraah — Strong Minds",
  priority = false,
}: LogoProps) {
  const sizeClasses = {
    sm: "h-7 sm:h-8",
    md: "h-8 sm:h-9",
    lg: "h-10 sm:h-11 md:h-12",
    xl: "h-12 sm:h-14 md:h-16",
    custom: "",
  };

  const variantClasses = {
    default: "", // Default logo (#1B1615 dark wordmark & #C0BFBF brackets)
    white: "brightness-0 invert opacity-95", // Pure crisp white for dark backgrounds & footer
  };

  const chosenHeight = size !== "custom" ? (sizeClasses[size] || "h-9") : "";
  const chosenVariant = variantClasses[variant] || "";

  return (
    <img
      src="/logo/logo.svg"
      alt={alt}
      className={`w-auto object-contain select-none pointer-events-none transition-all ${chosenHeight} ${chosenVariant} ${className}`}
      loading={priority ? "eager" : "lazy"}
    />
  );
}
