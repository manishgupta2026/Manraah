"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@manraah.com");
  const [password, setPassword] = useState("AdminPass123!");
  const [showPassword, setShowPassword] = useState(false);
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
        const role = (data.companion?.role || "admin").toLowerCase();
        document.cookie = `manraah_companion_role=${role}; path=/; max-age=2592000; SameSite=Lax`;
        const targetUrl =
          role === "listener"
            ? "/listener/human-companion"
            : "/admin/dashboard";
        window.location.href = targetUrl;
      } else {
        setError(data.error || "Authentication failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Network error. Could not connect to Admin Portal authentication.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAF9FC] text-slate-900 select-none antialiased">
      <div className="max-w-md w-full p-8 sm:p-10 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto">
            <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
          </div>

          <div className="pt-1">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-wider uppercase">
              Operations & Control
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
            Manraah Admin Portal
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            Secure authentication for platform administrators, clinical supervisors, and companion peer listeners.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold text-center animate-fadeIn">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Admin Email</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-base text-slate-400">
                mail
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@manraah.com"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Portal Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-base text-slate-400">
                lock
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full pl-9 pr-9 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-base">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-xs transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Admin Workspace</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick Switcher */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
            Quick Fill Demo Accounts (Neon DB)
          </p>
          <div className="grid grid-cols-2 gap-2 text-left">
            <button
              type="button"
              onClick={() => fillDemo("admin@manraah.com", "AdminPass123!")}
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
            >
              <span className="block text-[11px] font-bold text-slate-900">Executive Admin</span>
              <span className="block text-[10px] text-slate-400 font-mono truncate">admin@manraah.com</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemo("listener@manraah.com", "CompanionPass123!")}
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
            >
              <span className="block text-[11px] font-bold text-slate-900">Peer Listener</span>
              <span className="block text-[10px] text-slate-400 font-mono truncate">listener@manraah.com</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
