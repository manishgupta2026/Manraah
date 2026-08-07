"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useHeader } from "@/frontend/lib/context/HeaderContext";

export default function DynamicHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { headerConfig } = useHeader();

  // Smart back navigation using session storage stack
  const handleBack = () => {
    if (headerConfig?.onBack) {
      headerConfig.onBack();
      return;
    }

    if (typeof window === "undefined") return;

    let stack: string[] = [];
    try {
      stack = JSON.parse(sessionStorage.getItem("manraah_history") || "[]");
    } catch (e) {}

    if (stack.length > 1) {
      // Pop the current route
      stack.pop();
      sessionStorage.setItem("manraah_history", JSON.stringify(stack));
      router.back();
    } else {
      // Intelligently fallback based on route patterns
      if (headerConfig?.fallbackRoute) {
        router.push(headerConfig.fallbackRoute);
      } else {
        // Safe default fallback paths
        if (pathname === "/dashboard") {
          router.push("/");
        } else if (pathname === "/category-selection") {
          router.push("/");
        } else if (pathname === "/assessment") {
          router.push("/category-selection");
        } else if (pathname === "/wellness-score") {
          router.push("/assessment");
        } else if (pathname && pathname.startsWith("/professional-care/")) {
          router.push("/professional-care");
        } else {
          router.push("/dashboard");
        }
      }
    }
  };

  // Push current page to stack on path changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    let stack: string[] = [];
    try {
      stack = JSON.parse(sessionStorage.getItem("manraah_history") || "[]");
    } catch (e) {}

    const currentPath = window.location.pathname;

    // Check if back navigation occurred
    if (stack[stack.length - 2] === currentPath) {
      stack.pop();
    } else if (stack[stack.length - 1] !== currentPath) {
      stack.push(currentPath);
    }
    sessionStorage.setItem("manraah_history", JSON.stringify(stack));
  }, [pathname]);

  if (!headerConfig) return null;

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-40 w-full bg-surface/75 backdrop-blur-xl border-b border-surface-variant/40 px-4 md:px-6 py-2.5 flex items-center justify-between shadow-[0_4px_30px_rgba(124,107,196,0.02)] shrink-0"
    >
      {/* Left side: Back Button container */}
      <div className="flex-1 flex items-center justify-start min-w-[48px]">
        {headerConfig.showBackButton && (
          <motion.button
            type="button"
            onClick={handleBack}
            aria-label="Go Back"
            className="w-12 h-12 rounded-full bg-white/45 hover:bg-primary/10 border border-[#7C6BC4]/20 backdrop-blur-md text-primary flex items-center justify-center shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            initial={{ x: -16, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            whileHover={{ y: -1.5, scale: 1.03, boxShadow: "0 4px 14px rgba(124, 107, 196, 0.16)" }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <span className="material-symbols-outlined text-2xl font-bold select-none pointer-events-none">chevron_left</span>
          </motion.button>
        )}
      </div>

      {/* Center: Title container */}
      <div className="flex-none px-4 max-w-[55%] md:max-w-[65%]">
        <AnimatePresence mode="wait">
          <motion.div
            key={headerConfig.title}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <h1 className="text-sm md:text-base font-heading font-black text-on-surface truncate max-w-full tracking-wide">
              {headerConfig.title}
            </h1>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right side: Actions container */}
      <div className="flex-1 flex items-center justify-end min-w-[48px]">
        {headerConfig.action ? (
          <motion.button
            type="button"
            onClick={headerConfig.action.onClick}
            disabled={headerConfig.action.disabled}
            className={`px-4.5 py-2 rounded-full font-heading font-bold text-xs shadow-soft-xs transition-all ${
              headerConfig.action.disabled
                ? "bg-surface-variant/40 text-on-surface-variant/40 cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary-purple active:scale-95"
            }`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            {headerConfig.action.label}
          </motion.button>
        ) : (
          /* Mobile Drawer Trigger falls back if no actions are defined */
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-mobile-drawer"))}
            className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-primary/80 hover:bg-[#7C6BC4]/10 transition-colors"
            aria-label="Open menu drawer"
          >
            <span className="material-symbols-outlined text-2xl font-normal select-none pointer-events-none">menu</span>
          </button>
        )}
      </div>
    </motion.header>
  );
}
