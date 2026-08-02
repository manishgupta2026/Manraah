import React, { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "error";
  size?: "sm" | "md" | "lg";
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const base = "rounded-full font-semibold transition-all duration-200 inline-flex items-center justify-center gap-2";

  const sizeStyles = {
    sm: "px-4 py-1.5 text-xs",
    md: "px-6 py-2.5 text-xs font-bold shadow-md",
    lg: "px-8 py-3.5 text-sm font-bold shadow-lg scale-105",
  };

  const variantStyles = {
    primary: "bg-primary text-white hover:bg-primary-purple",
    secondary: "bg-secondary text-white hover:bg-secondary/90",
    ghost: "bg-surface-container-low text-on-surface-variant hover:bg-surface-container",
    error: "bg-error text-white hover:bg-error/90",
  };

  return (
    <button
      className={`${base} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
