"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getClientSession, signOut } from "@/backend/auth/client";
import { AuthSession } from "@/backend/types";

export default function SettingsPrivacyScreen() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const s = getClientSession();
    setSession(s);
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">spa</span>
        <p className="text-sm text-on-surface-variant font-medium">Loading settings...</p>
      </div>
    );
  }

  const isLoggedIn = session && session.isAuthenticated && session.user;

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-3">
        <span className="px-4 py-1.5 rounded-full bg-primary-container/20 text-primary text-xs font-semibold uppercase tracking-wider">
          Account & Confidentiality
        </span>
        <h1 className="text-3xl font-heading font-bold text-on-surface">Settings & Privacy Controls</h1>
        <p className="text-sm text-on-surface-variant max-w-xl">
          Manage your personal profile, notification triggers, and data encryption preferences.
        </p>
      </div>

      {isLoggedIn ? (
        <>
          {/* User Profile Card */}
          <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-primary-container/20 border-4 border-primary/20 flex items-center justify-center font-bold text-primary text-2xl">
                {session.user?.name ? session.user.name.slice(0, 2).toUpperCase() : "ME"}
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-xl text-on-surface">{session.user?.name}</h3>
                <p className="text-xs text-on-surface-variant">{session.user?.email}</p>
                <span className="inline-block px-3 py-1 rounded-full bg-mint/20 text-secondary text-xs font-semibold mt-2">
                  Sanctuary Member • {session.user?.streakDays || 1} Day Streak
                </span>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-6 py-3 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/20 text-sm font-bold transition-all"
            >
              Log Out
            </button>
          </div>

          {/* Privacy Toggles */}
          <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-6">
            <h3 className="font-heading font-bold text-xl text-on-surface">Privacy & Security</h3>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low border border-surface-variant/30">
              <div>
                <h4 className="font-heading font-bold text-sm text-on-surface">End-to-End Log Encryption</h4>
                <p className="text-xs text-on-surface-variant">Your check-ins and journal entries are encrypted client-side.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-mint/20 text-secondary text-xs font-bold">Enabled</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low border border-surface-variant/30">
              <div>
                <h4 className="font-heading font-bold text-sm text-on-surface">Daily Mindful Notifications</h4>
                <p className="text-xs text-on-surface-variant">Receive gentle reminders for morning check-ins and evening sleep audio.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low border border-surface-variant/30">
              <div>
                <h4 className="font-heading font-bold text-sm text-on-surface">Anonymous Research Data Sharing</h4>
                <p className="text-xs text-on-surface-variant">Opt-in to help improve mental health research without revealing identity.</p>
              </div>
              <input
                type="checkbox"
                checked={dataSharing}
                onChange={(e) => setDataSharing(e.target.checked)}
                className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer"
              />
            </div>
          </div>
        </>
      ) : (
        /* Login state card if unauthenticated */
        <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-primary-container/20 border border-primary/20 flex items-center justify-center mx-auto text-primary">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>
          <div className="space-y-2">
            <h3 className="font-heading font-bold text-xl text-on-surface">Sign In Required</h3>
            <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
              Please log in to manage your account details and confidentiality preferences.
            </p>
          </div>
          <button
            onClick={handleLogin}
            className="px-10 py-4 rounded-full bg-primary hover:bg-primary-purple text-white text-sm font-bold shadow-md transition-all scale-102 active:scale-98"
          >
            Log In to Sanctuary
          </button>
        </div>
      )}
    </div>
  );
}

