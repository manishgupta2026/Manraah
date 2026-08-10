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
        const role = data.companion?.role || "admin";
        document.cookie = `manraah_companion_role=${role}; path=/; max-age=2592000; SameSite=Lax`;
        const targetUrl = role === "listener"
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-surface-container select-none">
      <div className="max-w-md w-full p-8 md:p-10 rounded-3xl bg-surface-container-lowest/90 backdrop-blur-md border border-surface-variant/40 shadow-card-lift space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-xs">
            <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
          </div>

          <span className="px-3.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-widest">
            OPERATIONS & CONTROL AUTH
          </span>

          <h1 className="text-2xl md:text-3xl font-heading font-bold text-on-surface">
            Manraah Admin Portal
          </h1>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Authorized portal authentication for peer listeners, supervisors, and executive administrators.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-bold text-center animate-fadeIn">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface">Admin Email</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-base text-on-surface-variant/60">
                mail
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@manraah.com"
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface">Portal Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-base text-on-surface-variant/60">
                lock
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-3.5 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-on-surface-variant/60 hover:text-on-surface"
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
            className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-purple text-white font-bold text-xs shadow-soft transition-all scale-105 active:scale-95 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              "Authenticating..."
            ) : (
              <>
                <span>Log In to Admin Workspace</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Roles Credentials */}
        <div className="pt-4 border-t border-surface-variant/20 space-y-2">
          <p className="text-[10px] font-extrabold text-on-surface-variant/80 text-center uppercase tracking-widest">
            DEMO CREDENTIALS SELECTOR
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => fillDemo("admin@manraah.com", "AdminPass123!")}
              className="p-2 rounded-xl bg-surface-container-low border border-surface-variant/20 text-[11px] font-bold text-primary hover:bg-primary-container/20 text-center transition-all"
            >
              ADMIN
            </button>
            <button
              onClick={() => fillDemo("supervisor@manraah.com", "SupervisorPass123!")}
              className="p-2 rounded-xl bg-surface-container-low border border-surface-variant/20 text-[11px] font-bold text-secondary hover:bg-mint/20 text-center transition-all"
            >
              SUPERVISOR
            </button>
            <button
              onClick={() => fillDemo("companion@manraah.com", "CompanionPass123!")}
              className="p-2 rounded-xl bg-surface-container-low border border-surface-variant/20 text-[11px] font-bold text-tertiary hover:bg-peach/30 text-center transition-all"
            >
              LISTENER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
