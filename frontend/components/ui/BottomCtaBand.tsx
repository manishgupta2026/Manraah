import React from "react";
import Link from "next/link";

interface BottomCtaBandProps {
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  className?: string;
}

export default function BottomCtaBand({
  title,
  description,
  buttonText,
  buttonHref,
  className = "",
}: BottomCtaBandProps) {
  return (
    <section className={`w-full py-10 sm:py-14 px-4 sm:px-6 bg-surface ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="p-6 sm:p-10 lg:p-14 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#4A388E] via-[#5F4EA5] to-[#3B2C78] text-white text-center space-y-5 sm:space-y-6 shadow-2xl relative overflow-hidden">
          {/* Atmospheric Glow Blobs for Depth */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[260px] bg-primary-purple/30 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-mint/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-pink/20 rounded-full blur-3xl pointer-events-none" />

          {/* Faint Brand Emblem Motif in Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.05] text-white overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-[420px] h-[420px] fill-current">
              <path d="M50 15 C40 30, 45 60, 50 85 C55 60, 60 30, 50 15 Z" />
              <path d="M50 35 C30 45, 30 65, 50 85 C70 65, 70 45, 50 35 Z" opacity="0.75" />
              <path d="M50 50 C20 55, 15 70, 50 85 C85 70, 80 55, 50 50 Z" opacity="0.5" />
            </svg>
          </div>

          <div className="max-w-2xl mx-auto space-y-4 relative z-10 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black tracking-tight leading-snug">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal">
              {description}
            </p>

            <div className="pt-2 flex justify-center">
              <Link
                href={buttonHref}
                className="px-8 sm:px-9 py-3.5 sm:py-4 rounded-full bg-white text-primary hover:bg-surface-container-low font-heading font-bold text-sm shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{buttonText}</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
