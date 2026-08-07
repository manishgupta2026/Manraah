"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getClientSession, signOut } from "@/backend/auth/client";
import { AuthSession } from "@/backend/types";
import { getInitials, getPastelBgColor, getPastelTextColor } from "@/frontend/lib/avatar-helper";

export default function SettingsPrivacyScreen() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Profile settings states
  const [sanctuaryName, setSanctuaryName] = useState("");
  const [category, setCategory] = useState("student");
  const [avatar, setAvatar] = useState("");
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Privacy toggles
  const [dataSharing, setDataSharing] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const s = getClientSession();
    setSession(s);
    if (s && s.user) {
      setSanctuaryName(s.user.sanctuaryName || s.user.name || "");
      setCategory(s.user.selectedCategory || "student");
      setAvatar(s.user.avatar || "");
    }
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      setErrorMsg("Image file size must be less than 1.5MB for local storage.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatar(reader.result);
        setErrorMsg(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetAvatar = () => {
    setAvatar("/images/user_avatar.jpg");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !session.user) return;
    if (!sanctuaryName.trim()) {
      setErrorMsg("Sanctuary Name cannot be empty.");
      return;
    }

    setUpdating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          sanctuaryName: sanctuaryName.trim(),
          category,
          avatar
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile settings.");
      }

      // Update active local session values
      const updatedSession: AuthSession = {
        ...session,
        user: {
          ...session.user,
          name: data.user.name,
          sanctuaryName: data.user.sanctuaryName,
          selectedCategory: data.user.selectedCategory,
          avatar: data.user.avatar
        }
      };

      localStorage.setItem("manraah_auth_session", JSON.stringify(updatedSession));
      document.cookie = `manraah_session=${JSON.stringify(updatedSession)}; path=/; max-age=2592000`;
      setSession(updatedSession);
      setSuccessMsg("Sanctuary Profile updated successfully! 🌿");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error("[Profile Save Error]:", err);
      setErrorMsg(err.message || "Failed to save profile. Please try a different name.");
    } finally {
      setUpdating(false);
    }
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
  const isCustomAvatar = avatar && avatar.startsWith("data:image/");
  
  const initials = getInitials(sanctuaryName);
  const pastelBg = getPastelBgColor(sanctuaryName);
  const pastelText = getPastelTextColor(sanctuaryName);

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft flex items-center justify-between gap-6">
        <div className="space-y-3">
          <span className="px-4 py-1.5 rounded-full bg-primary-container/20 text-primary text-xs font-semibold uppercase tracking-wider">
            Account & Confidentiality
          </span>
          <h1 className="text-3xl font-heading font-bold text-on-surface">Settings & Privacy Controls</h1>
          <p className="text-sm text-on-surface-variant max-w-xl">
            Manage your personal profile, notification triggers, and data encryption preferences.
          </p>
        </div>
        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="px-6 py-3 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/20 text-xs font-bold transition-all shrink-0 self-start"
          >
            Log Out
          </button>
        )}
      </div>

      {isLoggedIn ? (
        <>
          {/* Notifications and messages */}
          {successMsg && (
            <div className="p-4 text-sm font-semibold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-fadeIn flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="p-4 text-sm font-semibold text-red-600 bg-red-500/10 border border-red-500/20 rounded-2xl animate-fadeIn flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {errorMsg}
            </div>
          )}

          {/* Profile Edit Card */}
          <form onSubmit={handleSaveProfile} className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-6">
            <h3 className="font-heading font-bold text-xl text-on-surface pb-3 border-b border-surface-variant/30">
              Sanctuary Identity
            </h3>

            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 py-4">
              {isCustomAvatar ? (
                <img
                  src={avatar}
                  alt="Custom Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 shadow-md"
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center font-bold text-3xl border-4 border-primary/20 shadow-md transition-all duration-300"
                  style={{ backgroundColor: pastelBg, color: pastelText }}
                >
                  {initials}
                </div>
              )}

              <div className="space-y-3 text-center sm:text-left">
                <h4 className="font-heading font-bold text-sm text-on-surface">Your Calming Profile Avatar</h4>
                <p className="text-xs text-on-surface-variant max-w-sm">
                  Upload a peaceful custom photo, or use the generated pastel initials avatar which refreshes automatically based on your Sanctuary Name.
                </p>
                
                <div className="flex flex-wrap justify-center sm:justify-start gap-2.5">
                  <label className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary-purple cursor-pointer transition-all">
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                  </label>
                  {avatar !== "/images/user_avatar.jpg" && avatar !== "" && (
                    <button
                      type="button"
                      onClick={handleResetAvatar}
                      className="px-4 py-2 rounded-xl bg-surface-container border border-surface-variant/40 text-on-surface-variant text-xs font-bold hover:bg-surface-container-high transition-all"
                    >
                      Use Default Pastel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Input fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-heading font-bold text-on-surface">Sanctuary Name</label>
                <input
                  type="text"
                  required
                  value={sanctuaryName}
                  onChange={(e) => setSanctuaryName(e.target.value)}
                  placeholder="e.g. Gentle Bloom"
                  className="w-full p-3.5 rounded-2xl bg-surface-container-low border border-surface-variant/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold text-on-surface"
                />
                <p className="text-[10px] text-on-surface-variant/65 leading-relaxed mt-1">
                  Publicly displayed across forums and dashboards. You can change this anytime.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-heading font-bold text-on-surface">
                  Email Address <span className="text-[10px] text-emerald-600 font-semibold ml-1.5">🔒 CONFIDENTIAL</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={session.user?.email || ""}
                    className="w-full p-3.5 rounded-2xl bg-surface-container-low/50 border border-surface-variant/20 text-sm text-on-surface-variant/60 font-medium select-none"
                  />
                </div>
                <p className="text-[10px] text-on-surface-variant/65 leading-relaxed mt-1">
                  Only used for private login verification. Never shared with anyone in the Sanctuary.
                </p>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-heading font-bold text-on-surface">Sanctuary Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-surface-container-low border border-surface-variant/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold text-on-surface"
                >
                  <option value="student">Student (Academic stress reduction)</option>
                  <option value="young_pro">Young Professional (Career building & balance)</option>
                  <option value="working_professional">Working Professional (Work-life harmony)</option>
                  <option value="parent">Parent (Mindful parenting & patience)</option>
                  <option value="couple">Couple (Nurturing shared life)</option>
                  <option value="family">Family (Household well-being)</option>
                  <option value="women">Women (Demographic-focused wellness)</option>
                  <option value="men">Men (Focused mental health sanctuary)</option>
                  <option value="senior_citizen">Senior Citizen (Gentle vitality & calm)</option>
                </select>
                <p className="text-[10px] text-on-surface-variant/65 leading-relaxed mt-1">
                  Tailors your dashboard content and meditations based on your focus.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={updating}
                className="px-8 py-4 rounded-full bg-primary hover:bg-primary-purple text-white text-xs font-bold shadow-md transition-all scale-102 hover:scale-105 active:scale-98"
              >
                {updating ? "Saving Changes..." : "Save Sanctuary Profile →"}
              </button>
            </div>
          </form>

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

