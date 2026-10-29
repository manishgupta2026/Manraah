"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import CrisisSupportModal from "@/frontend/components/crisis/CrisisSupportModal";
import { useAuth } from "@/frontend/lib/context/AuthContext";

export default function CrisisPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated && !user?.id) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading || (!isAuthenticated && !user?.id)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const handleCopy = (num: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(num).then(() => {
        setCopiedNumber(num);
        setTimeout(() => setCopiedNumber(null), 2500);
      });
    } else {
      setCopiedNumber(num);
      setTimeout(() => setCopiedNumber(null), 2500);
    }
  };

  const handleOpenGlobalModal = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-crisis-modal"));
    }
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FBFDFB] dark:bg-[#09090b] text-[#19332A] dark:text-white py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Urgent Emergency Callout */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-3xl font-bold animate-pulse text-white">
                  emergency
                </span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-heading font-black tracking-tight leading-tight">
                  Immediate 24/7 Crisis &amp; Safety Support
                </h1>
                <p className="text-xs sm:text-sm text-white/95 font-medium mt-1">
                  You are not alone. Free, confidential, and professional help is standing by right now.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenGlobalModal}
              className="px-5 py-2.5 rounded-2xl bg-white text-red-700 hover:bg-rose-50 text-xs sm:text-sm font-heading font-black shadow-md transition-all shrink-0 cursor-pointer flex items-center justify-center gap-2 self-start sm:self-auto"
            >
              <span>Open Crisis Safety Desk</span>
              <span>→</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-black/20 backdrop-blur-xs border border-white/20 text-xs sm:text-sm leading-relaxed">
            <strong>Immediate Danger?</strong> If you or someone you know is in immediate life-threatening physical danger or medical distress, please dial <a href="tel:112" className="underline font-black text-white hover:text-amber-200">112</a> (National Emergency Dispatch in India) or proceed to the nearest hospital casualty emergency room right away.
          </div>
        </div>

        {/* Primary Helplines Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-heading font-black text-[#19332A] dark:text-white">
              Verified 24/7 Helplines in India
            </h2>
            <span className="text-xs text-[#4F685F] dark:text-[#A1A1AA] font-semibold">
              Toll-Free &amp; Completely Confidential
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tele-MANAS */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#121214] border border-[#CBECE2] dark:border-[#27272a] shadow-sm flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-heading font-black text-[#19332A] dark:text-white">
                    Tele-MANAS
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E6F4F0] dark:bg-white/5 text-[#006B56] dark:text-zinc-200">
                    Govt. of India • 24/7
                  </span>
                </div>
                <p className="text-xs text-[#4F685F] dark:text-[#A1A1AA] leading-relaxed">
                  The National Tele Mental Health Programme of India providing round-the-clock free mental health support in over 20 regional languages.
                </p>
                <div className="text-sm font-mono font-black text-[#006B56] dark:text-zinc-200">
                  14416 / 1800-891-4416
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <a
                  href="tel:14416"
                  className="flex-1 py-2.5 rounded-xl bg-[#006B56] hover:bg-[#005B48] text-white text-xs font-heading font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">call</span>
                  <span>Call 14416</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy("14416")}
                  className="px-3.5 py-2.5 rounded-xl bg-[#F8FCFA] dark:bg-[#18181b] hover:bg-gray-100 dark:hover:bg-[#27272a] border border-[#CBECE2] dark:border-[#27272a] text-xs font-bold text-[#4F685F] dark:text-[#A1A1AA] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">
                    {copiedNumber === "14416" ? "check" : "content_copy"}
                  </span>
                  <span>{copiedNumber === "14416" ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* National Emergency 112 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#121214] border border-red-200 dark:border-red-900/40 shadow-sm flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-heading font-black text-[#19332A] dark:text-white">
                    National Emergency Dispatch
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">
                    Emergency 112
                  </span>
                </div>
                <p className="text-xs text-[#4F685F] dark:text-[#A1A1AA] leading-relaxed">
                  Single emergency number for police assistance, medical ambulance dispatch, and fire rescue across all states and Union Territories in India.
                </p>
                <div className="text-sm font-mono font-black text-red-600 dark:text-red-400">
                  112
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <a
                  href="tel:112"
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-heading font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">call</span>
                  <span>Call 112</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy("112")}
                  className="px-3.5 py-2.5 rounded-xl bg-[#F8FCFA] dark:bg-[#18181b] hover:bg-gray-100 dark:hover:bg-[#27272a] border border-[#CBECE2] dark:border-[#27272a] text-xs font-bold text-[#4F685F] dark:text-[#A1A1AA] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">
                    {copiedNumber === "112" ? "check" : "content_copy"}
                  </span>
                  <span>{copiedNumber === "112" ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* KIRAN Helpline */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#121214] border border-[#CBECE2] dark:border-[#27272a] shadow-sm flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-heading font-black text-[#19332A] dark:text-white">
                    KIRAN Mental Health Helpline
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E6F4F0] dark:bg-[rgba(95,175,138,0.15)] text-[#006B56] dark:text-[#5FAF8A]">
                    24/7 Toll-Free
                  </span>
                </div>
                <p className="text-xs text-[#4F685F] dark:text-[#A1A1AA] leading-relaxed">
                  Operated by Ministry of Social Justice and Empowerment for psychological first aid, distress management, and mental health rehabilitation.
                </p>
                <div className="text-sm font-mono font-black text-[#006B56] dark:text-zinc-200">
                  1800-599-0019
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <a
                  href="tel:18005990019"
                  className="flex-1 py-2.5 rounded-xl bg-[#006B56] hover:bg-[#005B48] text-white text-xs font-heading font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">call</span>
                  <span>Call 1800-599-0019</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy("18005990019")}
                  className="px-3.5 py-2.5 rounded-xl bg-[#F8FCFA] dark:bg-[#18181b] hover:bg-gray-100 dark:hover:bg-[#27272a] border border-[#CBECE2] dark:border-[#27272a] text-xs font-bold text-[#4F685F] dark:text-[#A1A1AA] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">
                    {copiedNumber === "18005990019" ? "check" : "content_copy"}
                  </span>
                  <span>{copiedNumber === "18005990019" ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Vandrevala Foundation */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#121214] border border-[#CBECE2] dark:border-[#27272a] shadow-sm flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-heading font-black text-[#19332A] dark:text-white">
                    Vandrevala Foundation
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EDF6F2] dark:bg-[rgba(95,175,138,0.15)] text-[#006B56] dark:text-[#5FAF8A]">
                    Free Counseling
                  </span>
                </div>
                <p className="text-xs text-[#4F685F] dark:text-[#A1A1AA] leading-relaxed">
                  24/7 free mental health counseling by trained clinical psychologists for depression, relationship strain, anxiety, and suicide prevention.
                </p>
                <div className="text-sm font-mono font-black text-[#006B56] dark:text-zinc-200">
                  +91 9999 666 555
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <a
                  href="tel:+919999666555"
                  className="flex-1 py-2.5 rounded-xl bg-[#006B56] hover:bg-[#005B48] text-white text-xs font-heading font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">call</span>
                  <span>Call +91 9999 666 555</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy("+919999666555")}
                  className="px-3.5 py-2.5 rounded-xl bg-[#F8FCFA] dark:bg-[#18181b] hover:bg-gray-100 dark:hover:bg-[#27272a] border border-[#CBECE2] dark:border-[#27272a] text-xs font-bold text-[#4F685F] dark:text-[#A1A1AA] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">
                    {copiedNumber === "+919999666555" ? "check" : "content_copy"}
                  </span>
                  <span>{copiedNumber === "+919999666555" ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* International Hotlines */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121214] border border-[#CBECE2] dark:border-[#27272a] shadow-sm space-y-4">
          <h2 className="text-lg font-heading font-black text-[#19332A] dark:text-white">
            International Crisis Resources
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#F8FCFA] dark:bg-[#18181b] border border-[#CBECE2] dark:border-[#27272a] space-y-1">
              <p className="font-bold text-[#19332A] dark:text-white">🇺🇸 / 🇨🇦 USA &amp; Canada</p>
              <p className="text-[#4F685F] dark:text-[#A1A1AA]">Dial or text <strong>988</strong></p>
              <a href="tel:988" className="inline-block pt-1 text-[#006B56] dark:text-zinc-200 font-bold hover:underline">
                Call 988 →
              </a>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F8FCFA] dark:bg-[#18181b] border border-[#CBECE2] dark:border-[#27272a] space-y-1">
              <p className="font-bold text-[#19332A] dark:text-white">🇬🇧 United Kingdom</p>
              <p className="text-[#4F685F] dark:text-[#A1A1AA]">Dial <strong>111</strong> or Samaritans <strong>116 123</strong></p>
              <a href="tel:116123" className="inline-block pt-1 text-[#006B56] dark:text-zinc-200 font-bold hover:underline">
                Call 116 123 →
              </a>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F8FCFA] dark:bg-[#18181b] border border-[#CBECE2] dark:border-[#27272a] space-y-1">
              <p className="font-bold text-[#19332A] dark:text-white">🇦🇺 Australia</p>
              <p className="text-[#4F685F] dark:text-[#A1A1AA]">Lifeline: <strong>13 11 14</strong></p>
              <a href="tel:131114" className="inline-block pt-1 text-[#006B56] dark:text-zinc-200 font-bold hover:underline">
                Call 13 11 14 →
              </a>
            </div>
          </div>
          <p className="text-xs text-[#4F685F] dark:text-[#A1A1AA] pt-1">
            For hotlines in all other countries, visit the global directory at{" "}
            <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="underline font-bold text-[#006B56] dark:text-zinc-200">
              findahelpline.com
            </a>.
          </p>
        </div>

        {/* Back Link */}
        <div className="flex items-center justify-between text-xs pt-4">
          <Link href="/dashboard" className="text-[#006B56] dark:text-zinc-200 font-bold hover:underline flex items-center gap-1">
            <span>←</span>
            <span>Return to Dashboard</span>
          </Link>
          <Link href="/" className="text-[#4F685F] dark:text-[#A1A1AA] hover:underline">
            Home
          </Link>
        </div>
      </div>

      {/* Global Interactive Modal */}
      <CrisisSupportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
