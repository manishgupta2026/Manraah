"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getClientSession, signOut } from "@/backend/auth/client";
import { AuthSession } from "@/backend/types";
import { getInitials, getPastelBgColor, getPastelTextColor } from "@/frontend/lib/avatar-helper";
import ScreenHeader from "@/frontend/components/ui/ScreenHeader";

const MOCK_TAKEN_USERNAMES = ["elena", "parent", "mama", "papa", "user", "admin", "mom", "dad", "parent123", "kartik"];

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

  // Parent Privacy Settings
  const [username, setUsername] = useState("CalmParent-3804");
  const [tempUsername, setTempUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "available" | "taken">("idle");
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);

  useEffect(() => {
    const s = getClientSession();
    setSession(s);
    if (s && s.user) {
      setSanctuaryName(s.user.sanctuaryName || s.user.name || "");
      setCategory(s.user.selectedCategory || "student");
      setAvatar(s.user.avatar || "");

      // Dynamic database fetch to ensure Settings UI reflects exact login/signup values
      fetch(`/api/profile?userId=${s.user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setSanctuaryName(data.sanctuaryName || data.name || "");
            setCategory(data.category || "student");
            setAvatar(data.avatar || "");

            // Sync updated profile state back to local storage session
            const updated = {
              ...s,
              user: {
                ...s.user,
                name: data.sanctuaryName || data.name,
                sanctuaryName: data.sanctuaryName || data.name,
                selectedCategory: data.category,
                avatar: data.avatar,
              },
            } as AuthSession;
            localStorage.setItem("manraah_auth_session", JSON.stringify(updated));
            setSession(updated);
          }
        })
        .catch((err) => console.error("Error loading user profile:", err));
    }

    const isCoupleVal = (s?.user?.selectedCategory === "couple" || s?.user?.selectedCategory === "couples");
    const key = isCoupleVal ? "couple_username" : "parent_username";
    const defaultVal = isCoupleVal ? "RomanticSparrow" : "CalmParent-3804";
    const storedUsername = localStorage.getItem(key) || defaultVal;
    setUsername(storedUsername);
    setTempUsername(storedUsername);

    const storedShowPhone = localStorage.getItem("parent_show_phone") === "true";
    setShowPhoneNumber(storedShowPhone);

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

  // Check Username Availability
  const checkUsernameAvailability = () => {
    const cleanName = tempUsername.trim().toLowerCase();
    if (!cleanName) return;

    if (MOCK_TAKEN_USERNAMES.includes(cleanName)) {
      setUsernameStatus("taken");
      const suggestionBase = tempUsername.trim().replace(/\s+/g, "");
      const suggestions = [
        `${suggestionBase}-${Math.floor(10 + Math.random() * 90)}`,
        `Mindful${suggestionBase}`,
        `Calm${suggestionBase}-${Math.floor(100 + Math.random() * 900)}`
      ];
      setUsernameSuggestions(suggestions);
    } else {
      setUsernameStatus("available");
      setUsernameSuggestions([]);
    }
  };

  const getUsernameKey = () => {
    const isCouple = category === "couple" || category === "couples";
    return isCouple ? "couple_username" : "parent_username";
  };

  const saveCustomUsername = async () => {
    if (usernameStatus !== "available" || !tempUsername.trim()) return;
    const newName = tempUsername.trim();
    setUsername(newName);
    localStorage.setItem(getUsernameKey(), newName);
    setUsernameStatus("idle");

    // Sync to active session and database profile if logged in
    if (session && session.user) {
      const updatedSession = {
        ...session,
        user: {
          ...session.user,
          name: newName,
          sanctuaryName: newName,
        }
      };
      localStorage.setItem("manraah_auth_session", JSON.stringify(updatedSession));
      document.cookie = `manraah_session=${JSON.stringify(updatedSession)}; path=/; max-age=2592000`;
      setSession(updatedSession);

      try {
        await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session.user.id,
            sanctuaryName: newName,
            category: session.user.selectedCategory || category,
            avatar: session.user.avatar || avatar
          })
        });
      } catch (err) {
        console.error("[Confidential Username DB Sync Error]:", err);
      }
    }

    alert("✅ Username updated successfully!");
  };

  const handleSuggestionClick = (name: string) => {
    setTempUsername(name);
    setUsernameStatus("available");
    setUsernameSuggestions([]);
  };

  const handleTogglePhoneNumber = (checked: boolean) => {
    setShowPhoneNumber(checked);
    localStorage.setItem("parent_show_phone", checked ? "true" : "false");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <ScreenHeader title="⚙️ Settings" showBackButton={true} fallbackRoute="/dashboard" />
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
    <div className="max-w-3xl mx-auto py-6 space-y-8 px-4 sm:px-6">
      <ScreenHeader title="⚙️ Settings" showBackButton={true} fallbackRoute="/dashboard" />
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
                  className="w-full p-3.5 rounded-2xl bg-surface-container-low border border-surface-variant/40 text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  <option value="student">🎓 Student (Academic stress reduction)</option>
                  <option value="working_professional">👔 Working Professional (Work-life harmony)</option>
                  <option value="parent">🍼 Parent (Mindful parenting & patience)</option>
                  <option value="couple">💖 Couple (Nurturing shared life)</option>
                  <option value="other">✨ Other (Personalized holistic wellness)</option>
                </select>
                <p className="text-[10px] text-on-surface-variant/65 leading-relaxed mt-1">
                  Modify your sanctuary journey style. Saving updates your active dashboard instantly.
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

            {/* Username Customization Selector */}
            <div className="p-6 rounded-2xl bg-surface-container-low border border-surface-variant/30 space-y-4">
              <div>
                <h4 className="font-heading font-bold text-sm text-on-surface">Confidential Username</h4>
                <p className="text-xs text-on-surface-variant">Choose a unique anonymous username displayed on your dashboard greeting.</p>
              </div>

              {/* Username Input and Check */}
              <div className="space-y-3 max-w-md">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempUsername}
                    onChange={(e) => {
                      setTempUsername(e.target.value);
                      setUsernameStatus("idle");
                    }}
                    placeholder="Enter anonymous username..."
                    className="flex-1 text-xs px-3 py-2 bg-white border border-surface-variant/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/40"
                  />
                  <button
                    onClick={checkUsernameAvailability}
                    className="px-4 py-2 bg-secondary text-white rounded-lg text-xs font-bold active:scale-95 transition-transform"
                  >
                    Check
                  </button>
                </div>

                {/* Status Indicator */}
                {usernameStatus === "available" && (
                  <div className="flex items-center justify-between bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    <span className="text-xs text-emerald-800 font-bold">✅ Username available!</span>
                    <button
                      onClick={saveCustomUsername}
                      className="px-4 py-1.5 bg-primary text-white rounded-full text-xs font-bold active:scale-95 transition-transform"
                    >
                      Save Username
                    </button>
                  </div>
                )}

                {usernameStatus === "taken" && (
                  <div className="bg-rose-50 p-3 rounded-lg border border-rose-200 space-y-2">
                    <span className="text-xs text-rose-800 font-bold block">❌ This username is already taken.</span>
                    <div className="space-y-1">
                      <span className="text-[10px] text-on-surface-variant font-bold block">Suggestions:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {usernameSuggestions.map((sug) => (
                          <button
                            key={sug}
                            onClick={() => handleSuggestionClick(sug)}
                            className="px-2 py-0.5 rounded bg-white hover:bg-surface-container text-[10px] border border-surface-variant/20 text-on-surface font-semibold"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Display Phone Toggle Switch */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low border border-surface-variant/30">
              <div>
                <h4 className="font-heading font-bold text-sm text-on-surface">Show Phone Number on Dashboard</h4>
                <p className="text-xs text-on-surface-variant">Toggle whether your registered phone number (+91 ••••• ••982) is displayed in the header.</p>
              </div>
              <input
                type="checkbox"
                checked={showPhoneNumber}
                onChange={(e) => handleTogglePhoneNumber(e.target.checked)}
                className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
              />
            </div>

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
                className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
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
                className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
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
