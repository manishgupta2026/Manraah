"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function CompanionLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/companion/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.isAuthenticated) {
        router.push("/companion/dashboard");
      } else {
        setError(data.error || "Login failed. Please check your credentials.");
      }
    } catch (err: any) {
      console.error("Companion login error:", err);
      setError("Network error. Could not connect to portal authentication.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-surface-container select-none">
      <div className="max-w-md w-full p-8 md:p-10 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-soft-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            Segregated Portal Auth
          </span>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-on-surface">
            Companion & Admin Portal
          </h1>
          <p className="text-xs text-on-surface-variant">
            Independent authentication for human companions, supervisors, and administrators.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-bold text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface">Companion Work Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="companion@manraah.com"
              className="w-full p-3.5 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface">Portal Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              className="w-full p-3.5 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-purple text-white font-bold text-xs shadow-md transition-all scale-105 active:scale-95 mt-2"
          >
            {loading ? "Authenticating..." : "Log In to Companion Portal →"}
          </button>
        </form>

        {/* Demo Credentials Quick Selector */}
        <div className="pt-4 border-t border-surface-variant/20 space-y-2">
          <p className="text-[11px] font-bold text-on-surface-variant/80 text-center uppercase tracking-wider">
            Demo Portal Credentials (Role-Based)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => fillDemo("companion@manraah.com", "CompanionPass123!")}
              className="p-2 rounded-xl bg-surface-container-low border border-surface-variant/20 text-[11px] font-semibold text-primary hover:bg-primary-container/20 text-center"
            >
              COMPANION
            </button>
            <button
              onClick={() => fillDemo("supervisor@manraah.com", "SupervisorPass123!")}
              className="p-2 rounded-xl bg-surface-container-low border border-surface-variant/20 text-[11px] font-semibold text-secondary hover:bg-mint/20 text-center"
            >
              SUPERVISOR
            </button>
            <button
              onClick={() => fillDemo("admin@manraah.com", "AdminPass123!")}
              className="p-2 rounded-xl bg-surface-container-low border border-surface-variant/20 text-[11px] font-semibold text-tertiary hover:bg-peach/30 text-center"
            >
              ADMIN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
