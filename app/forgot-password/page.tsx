"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FormInput } from "@/frontend/components/ui/FormInput";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-[#09090b] text-on-surface dark:text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-12 select-none relative">
      <div className="max-w-md w-full mx-auto">
        <div className="p-8 sm:p-10 rounded-[32px] bg-surface-container-lowest dark:bg-[#121214] border border-surface-variant/30 dark:border-[#27272a] shadow-card-lift space-y-6 text-center">
          
          {/* Header */}
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-[#18181b] text-primary dark:text-zinc-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <span className="material-symbols-outlined text-2xl font-bold">lock_reset</span>
            </div>
            <h2 className="text-2xl font-heading font-extrabold text-on-surface dark:text-white">
              Account Recovery
            </h2>
            <p className="text-xs text-on-surface-variant dark:text-[#A1A1AA] leading-relaxed">
              Enter your registered email address and we&apos;ll send you a secure password reset link.
            </p>
          </div>

          {sent ? (
            <div className="py-6 space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-[#18181b] border border-emerald-500/20 dark:border-[#27272a] text-xs font-semibold text-emerald-700 dark:text-zinc-200 flex items-start gap-2.5 text-left">
                <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">check_circle</span>
                <span className="leading-relaxed">
                  We&apos;ve sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
                </span>
              </div>

              <Link
                href="/login"
                className="w-full py-3.5 rounded-full bg-primary hover:bg-primary-purple text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black dark:hover:text-black font-heading font-bold text-xs shadow-md transition-all inline-block cursor-pointer"
              >
                Return to Log In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <FormInput
                label="Email Address"
                type="email"
                required
                icon="mail"
                placeholder="aanya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-primary hover:bg-primary-purple text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black dark:hover:text-black font-heading font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Sending Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-surface-variant/20 dark:border-[#27272a]">
            <p className="text-xs text-on-surface-variant dark:text-[#A1A1AA] font-normal">
              Remember your password?{" "}
              <Link href="/login" className="font-heading font-bold text-primary dark:text-zinc-200 hover:underline">
                Log In
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
