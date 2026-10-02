"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/frontend/lib/context/AuthContext";
import { useWellness } from "@/frontend/lib/context/WellnessContext";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { useWellnessScore } from "@/frontend/lib/context/WellnessScoreContext";
import { changePassword } from "@/backend/auth/client";
import UserAvatar from "@/frontend/components/ui/UserAvatar";

const CATEGORY_OPTIONS = [
  { id: "student", label: "Student", desc: "Academic stress, exam focus & campus life", icon: "🎓" },
  { id: "parent", label: "Parent", desc: "Family balance, parenting stress & resilience", icon: "👨‍👩‍👧" },
  { id: "working-professional", label: "Working Professional", desc: "Workplace burnout, career growth & balance", icon: "💼" },
  { id: "couple", label: "Couple", desc: "Relationship dynamics & communication", icon: "❤️" },
  { id: "other", label: "General Wellness", desc: "Mindfulness, sleep & everyday calm", icon: "🌿" },
];

const FOCUS_AREAS_OPTIONS = [
  "Anxiety & Stress Management",
  "Emotional Well-being",
  "Work-Life Balance",
  "Sleep & Deep Rest",
  "Mindful Focus & Clarity",
  "Healthy Communication",
  "Self-Compassion & Confidence",
];

export default function ProfileView() {
  const router = useRouter();
  const { user, isAuthenticated, loading, updateUser, logout } = useAuth();
  const { currentStreak, refetchWellnessData } = useWellness();
  const { setCategory } = useCategory();
  const { triggerProfilePrompt } = useWellnessScore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([
    "Anxiety & Stress Management",
    "Emotional Well-being",
    "Work-Life Balance",
  ]);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("student");
  const [editAvatar, setEditAvatar] = useState("/images/user_avatar.jpg");
  const [editFocusAreas, setEditFocusAreas] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Change Password Modal State
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<string | null>(null);

  // Authenticated User values (authoritative from user object)
  const userName = user?.name || user?.sanctuaryName || "";
  const userEmail = user?.email || "";
  const userCategory = (user?.selectedCategory || "student").toLowerCase();
  const userAvatar = user?.profileImage || user?.avatar || "";

  const openEditModal = () => {
    setEditName(user?.name || user?.sanctuaryName || "");
    setEditCategory(userCategory);
    setEditAvatar(userAvatar || "/images/user_avatar.jpg");
    setEditFocusAreas([...selectedFocusAreas]);
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);
    setIsEditModalOpen(true);
  };

  const handleToggleFocusArea = (area: string) => {
    setEditFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSaveErrorMsg("Please select an image file (PNG, JPG, JPEG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSaveErrorMsg("Image size should be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setEditAvatar(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setSaveErrorMsg("Please provide your name.");
      return;
    }

    setIsSaving(true);
    setSaveErrorMsg(null);

    try {
      await updateUser({
        name: editName.trim(),
        sanctuaryName: editName.trim(),
        selectedCategory: editCategory as any,
        avatar: editAvatar,
        profileImage: editAvatar,
      });

      setSelectedFocusAreas(editFocusAreas);
      setCategory(editCategory as any);

      // Sync wellness context
      await refetchWellnessData();

      setSaveSuccessMsg("Profile updated successfully!");
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSaveSuccessMsg(null);
        triggerProfilePrompt(editCategory);
      }, 500);
    } catch (err: any) {
      setSaveErrorMsg(err.message || "Unable to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };


  const openChangePasswordModal = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setChangePasswordError(null);
    setChangePasswordSuccess(null);
    setIsChangePasswordModalOpen(true);
  };

  const closeChangePasswordModal = () => {
    if (isChangingPassword) return;
    setIsChangePasswordModalOpen(false);
    setChangePasswordError(null);
    setChangePasswordSuccess(null);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError(null);
    setChangePasswordSuccess(null);

    if (!currentPassword) {
      setChangePasswordError("Current password is required.");
      return;
    }

    if (!newPassword) {
      setChangePasswordError("New password is required.");
      return;
    }

    if (newPassword.length < 6) {
      setChangePasswordError("Password must be at least 6 characters long.");
      return;
    }

    if (!confirmPassword) {
      setChangePasswordError("Confirm password is required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangePasswordError("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);

    try {
      const res = await changePassword(currentPassword, newPassword, confirmPassword);
      setChangePasswordSuccess(res.message || "Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setIsChangePasswordModalOpen(false);
        setChangePasswordSuccess(null);
      }, 1500);
    } catch (err: any) {
      setChangePasswordError(err.message || "Failed to change password. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatCategoryLabel = (cat: string) => {
    if (cat.includes("work") || cat.includes("young_pro")) return "Working Professional";
    if (cat.includes("parent")) return "Parent";
    if (cat.includes("couple")) return "Couple";
    if (cat.includes("other")) return "General Wellness";
    return "Student";
  };

  // 1. Loading Skeleton: While session/user data is still resolving, show explicit skeleton to prevent demo fallback flash
  if (loading && !user) {
    return (
      <div className="w-full min-w-0 flex flex-col gap-6 animate-pulse">
        <div className="w-full bg-white dark:bg-[#0B3029] rounded-3xl p-6 sm:p-7 border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] shadow-2xs">
          <div className="flex items-center gap-5">
            <div className="w-[76px] h-[76px] rounded-full bg-slate-200 dark:bg-[#0E3931]" />
            <div className="space-y-2.5 flex-1">
              <div className="h-6 w-48 bg-slate-200 dark:bg-[#0E3931] rounded-md" />
              <div className="h-3.5 w-32 bg-slate-200 dark:bg-[#0E3931] rounded-md" />
            </div>
          </div>
        </div>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-white dark:bg-[#0B3029] rounded-3xl p-6 border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)]" />
          <div className="h-48 bg-white dark:bg-[#0B3029] rounded-3xl p-6 border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)]" />
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State: If user is not authenticated after load completes
  if (!user && !loading) {
    return (
      <div className="w-full bg-white dark:bg-[#0B3029] rounded-3xl p-8 border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] text-center space-y-4 shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-[#EAF6F0] dark:bg-[rgba(0,168,137,0.15)] text-[#006C56] dark:text-[#73D8C4] flex items-center justify-center mx-auto text-xl font-bold">
          🔒
        </div>
        <h2 className="text-lg font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
          Authentication Required
        </h2>
        <p className="text-xs text-[#5A756C] dark:text-[#9DB9B0] max-w-sm mx-auto">
          Please sign in to view and manage your confidential wellness profile.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="px-5 py-2 rounded-full bg-[#004D3D] dark:bg-[#008F78] hover:bg-[#003B2E] dark:hover:bg-[#00A889] text-white text-xs font-bold shadow-md cursor-pointer transition-transform active:scale-95"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 flex flex-col gap-6">
      {/* ===================================================================== */}
      {/* 1. TOP PROFILE HEADER CARD                                            */}
      {/* ===================================================================== */}
      <div className="w-full bg-white dark:bg-[#0B3029] rounded-3xl p-6 sm:p-7 border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] shadow-2xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left Group: Profile Image + Profile Information Column */}
          <div className="flex items-center gap-4 sm:gap-5 min-w-0 flex-1">
            {/* 1. Fixed Area Profile Image (76px x 76px, circular, no shrink) */}
            <div className="relative shrink-0 w-[76px] h-[76px] min-w-[76px] min-h-[76px] max-w-[76px] max-h-[76px]">
              <UserAvatar
                user={user}
                sizeClass="w-[76px] h-[76px] min-w-[76px] min-h-[76px] max-w-[76px] max-h-[76px] text-2xl"
                className="w-[76px] h-[76px] rounded-full object-cover border-2 border-white dark:border-[#0E3931] shadow-sm shrink-0"
              />
              <div
                className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#006C56] dark:bg-[#008F78] border-2 border-white dark:border-[#0B3029] flex items-center justify-center text-[9px] text-white font-black shadow-xs pointer-events-none"
                title="Verified Sanctuary Member"
              >
                ✓
              </div>
            </div>

            {/* 2. Profile Information Column */}
            <div className="flex flex-col justify-center min-w-0 flex-1 space-y-1">
              {/* Row 1: Name + Category Badge */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight break-words" suppressHydrationWarning>
                  {userName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EAF6F0] dark:bg-[rgba(0,168,137,0.15)] text-[#006C56] dark:text-[#73D8C4] border border-[#D5E8DF] dark:border-[rgba(0,168,137,0.30)] text-[10.5px] font-extrabold whitespace-nowrap" suppressHydrationWarning>
                  {formatCategoryLabel(userCategory)}
                </span>
              </div>

              {/* Row 2: Subtitle */}
              <p className="text-xs text-[#5A756C] dark:text-[#9DB9B0] font-medium leading-normal">
                Your wellness journey with Manraah
              </p>

              {/* Row 3: Meta Info (Streak + Privacy) */}
              <div className="flex items-center gap-3 text-[11px] font-medium text-[#789389] dark:text-[#76968D] pt-0.5 flex-wrap">
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <span>🔥</span>
                  <strong className="text-[#19332A] dark:text-[#F4FAF7] font-bold">Day {currentStreak}</strong> Streak
                </span>
                <span className="text-slate-300 dark:text-[#76968D]/40">•</span>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <span>🔒</span>
                  <span>Confidential Account</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Edit Profile Button */}
          <button
            onClick={openEditModal}
            type="button"
            className="self-start md:self-center min-w-[140px] px-5 sm:px-6 py-2.5 rounded-full bg-[#004D3D] dark:bg-[#008F78] text-white text-xs font-heading font-bold shadow-md shadow-[#004D3D]/15 dark:shadow-[#008F78]/15 flex items-center justify-center gap-2 cursor-pointer shrink-0 whitespace-nowrap select-none"
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. TWO EQUAL-WIDTH CARDS: PERSONAL INFO + WELLNESS PREFERENCES        */}
      {/* ===================================================================== */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Card A: Personal Information */}
        <div className="bg-white dark:bg-[#0B3029] rounded-3xl p-6 border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] shadow-2xs flex flex-col justify-between space-y-5 transition-colors h-full">
          <div>
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0F5F2] dark:border-[rgba(150,210,195,0.12)]">
              <div className="w-7.5 h-7.5 rounded-xl bg-[#EAF6F0] dark:bg-[#0E3931] text-[#006C56] dark:text-[#00A889] flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                Personal Information
              </h3>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <div>
                <p className="text-[10px] font-extrabold text-[#789389] dark:text-[#76968D] tracking-wider">
                  Full Name
                </p>
                <p className="text-xs sm:text-[13px] font-bold text-[#19332A] dark:text-[#F4FAF7] mt-1" suppressHydrationWarning>
                  {userName}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-[#789389] dark:text-[#76968D] tracking-wider">
                  Email Address
                </p>
                <p className="text-xs sm:text-[13px] font-bold text-[#19332A] dark:text-[#F4FAF7] mt-1" suppressHydrationWarning>
                  {userEmail}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card B: Wellness Preferences */}
        <div className="bg-white dark:bg-[#0B3029] rounded-3xl p-6 border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] shadow-2xs flex flex-col justify-between space-y-5 transition-colors h-full">
          <div>
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0F5F2] dark:border-[rgba(150,210,195,0.12)]">
              <div className="w-7.5 h-7.5 rounded-xl bg-[#EAF6F0] dark:bg-[#0E3931] text-[#006C56] dark:text-[#00A889] flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                Wellness Preferences
              </h3>
            </div>

            <div className="space-y-4.5 pt-4 text-xs">
              <div>
                <p className="text-[10px] font-extrabold text-[#789389] dark:text-[#76968D] tracking-wider">
                  Primary Category
                </p>
                <p className="text-xs sm:text-[13px] font-bold text-[#19332A] dark:text-[#F4FAF7] mt-1">
                  {formatCategoryLabel(userCategory)}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-[#789389] dark:text-[#76968D] tracking-wider mb-1.5">
                  Preferred Focus Areas
                </p>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {selectedFocusAreas.map((area) => (
                    <span
                      key={area}
                      className="text-[9.5px] font-bold px-2.5 py-1 rounded-full bg-[#EAF6F0] text-[#006C56] dark:bg-[rgba(0,168,137,0.15)] dark:text-[#73D8C4] border border-[#D5E8DF] dark:border-[rgba(0,168,137,0.30)]"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-[#789389] dark:text-[#76968D] tracking-wider">
                  Current Wellness Goal
                </p>
                <p className="text-xs font-medium text-[#4E685F] dark:text-[#9DB9B0] mt-1 leading-relaxed">
                  Maintaining daily reflection consistency &amp; stress reduction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. ACCOUNT & SECURITY SECTION                                         */}
      {/* ===================================================================== */}
      <div className="w-full bg-white dark:bg-[#0B3029] rounded-3xl p-6 border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] shadow-2xs space-y-5 transition-colors">
        {/* Section Header & Log Out Button */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F5F2] dark:border-[rgba(150,210,195,0.12)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7.5 h-7.5 rounded-xl bg-[#EAF6F0] dark:bg-[#0E3931] text-[#006C56] dark:text-[#00A889] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
                Account &amp; Security
              </h3>
              <p className="text-[10px] text-[#789389] dark:text-[#76968D] font-medium leading-tight mt-0.5">
                Manage your session, password, and privacy controls
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            type="button"
            className="px-4 py-2 rounded-full border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>{isLoggingOut ? "Signing Out..." : "Log Out"}</span>
          </button>
        </div>

        {/* Security / Password Management Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FCFA] dark:bg-[#082821] border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#EAF6F0] dark:bg-[#0E3931] text-[#006C56] dark:text-[#00A889] flex items-center justify-center shrink-0 mt-0.5 border border-[#D5E8DF] dark:border-[rgba(150,210,195,0.12)]">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                Security
              </h4>
              <p className="text-[11px] text-[#5A756C] dark:text-[#9DB9B0] mt-0.5 leading-relaxed">
                Manage your account password and security.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openChangePasswordModal}
            className="min-w-[165px] px-5 sm:px-6 py-2.5 rounded-full bg-[#004D3D] dark:bg-[#008F78] text-white text-xs font-heading font-bold shadow-md shadow-[#004D3D]/15 dark:shadow-[#008F78]/15 flex items-center justify-center gap-2 cursor-pointer shrink-0 whitespace-nowrap select-none"
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span>Change Password</span>
          </button>
        </div>

        {/* Full-width Privacy Notice Card */}
        <div className="p-4 sm:p-4.5 rounded-2xl bg-[#F0F9F5] dark:bg-[#0E3931] border border-[#D6EFE2] dark:border-[rgba(150,210,195,0.12)] flex items-start gap-3.5">
          <span className="text-lg leading-none mt-0.5 shrink-0">🔒</span>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-[#006C56] dark:text-[#73D8C4]">
              100% Confidential &amp; Protected
            </p>
            <p className="text-[11px] text-[#4E685F] dark:text-[#9DB9B0] leading-relaxed">
              Your check-ins, mood logs, and personal details are encrypted and securely associated with your authenticated account.
            </p>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. EDIT PROFILE MODAL DIALOG                                          */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-xs"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0B3029] rounded-3xl p-6 sm:p-7 border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.15)] shadow-xl z-10 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#EBF0EC] dark:border-[rgba(150,210,195,0.12)]">
                <h3 className="text-lg font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                  Edit Profile
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#0E3931] flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-[#9DB9B0] dark:hover:text-[#F4FAF7] transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {saveErrorMsg && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold">
                  {saveErrorMsg}
                </div>
              )}

              {saveSuccessMsg && (
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold">
                  {saveSuccessMsg}
                </div>
              )}

              <form onSubmit={handleSaveChanges} className="space-y-4 text-xs">
                {/* Profile Photo Upload / Edit */}
                <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#F8FCFA] dark:bg-[#082821] border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)]">
                  <UserAvatar
                    avatar={editAvatar}
                    name={editName}
                    sizeClass="w-14 h-14 text-base"
                    className="border-2 border-white dark:border-[#0B3029] shadow-xs"
                  />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <p className="font-bold text-[#19332A] dark:text-[#F4FAF7] text-xs">Profile Picture</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-full bg-[#004D3D] hover:bg-[#003B2E] dark:bg-[#008F78] dark:hover:bg-[#00A889] text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        Upload Photo
                      </button>
                      {editAvatar !== "/images/user_avatar.jpg" && (
                        <button
                          type="button"
                          onClick={() => setEditAvatar("/images/user_avatar.jpg")}
                          className="px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-[rgba(150,210,195,0.16)] text-slate-600 dark:text-[#9DB9B0] hover:bg-slate-100 dark:hover:bg-[#0E3931] text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Reset Default
                        </button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Name Input */}
                <div className="space-y-1">
                  <label className="font-bold text-[#19332A] dark:text-[#F4FAF7]">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[rgba(150,210,195,0.16)] bg-white dark:bg-[#082821] text-[#19332A] dark:text-[#F4FAF7] placeholder:text-[#789990] focus:outline-none focus:ring-2 focus:ring-[#006C56] dark:focus:ring-[#00A889] font-medium"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="font-bold text-[#19332A] dark:text-[#F4FAF7]">
                    Wellness Category
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CATEGORY_OPTIONS.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setEditCategory(cat.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          editCategory === cat.id
                            ? "border-[#006C56] bg-[#EAF6F0] dark:bg-[rgba(0,168,137,0.15)] dark:border-[#00A889]"
                            : "border-slate-200 dark:border-[rgba(150,210,195,0.12)] bg-white dark:bg-[#0E3931] hover:bg-slate-50 dark:hover:bg-[#12463C]"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-[#19332A] dark:text-[#F4FAF7]">
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </div>
                        <p className="text-[10px] text-[#789389] dark:text-[#76968D] mt-0.5 leading-tight">
                          {cat.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Focus Areas */}
                <div className="space-y-1.5 pt-1">
                  <label className="font-bold text-[#19332A] dark:text-[#F4FAF7]">
                    Focus Areas
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {FOCUS_AREAS_OPTIONS.map((area) => {
                      const isSelected = editFocusAreas.includes(area);
                      return (
                        <button
                          key={area}
                          type="button"
                          onClick={() => handleToggleFocusArea(area)}
                          className={`px-3 py-1 rounded-full text-[10.5px] font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#004D3D] text-white border-[#004D3D] dark:bg-[#008F78] dark:border-[#008F78]"
                              : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-[#082821] dark:text-[#9DB9B0] dark:border-[rgba(150,210,195,0.12)]"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {area}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Security Section Shortcut inside Edit Modal */}
                <div className="p-3.5 rounded-2xl bg-[#F8FCFA] dark:bg-[#082821] border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#19332A] dark:text-[#F4FAF7] text-xs">Security</p>
                    <p className="text-[11px] text-[#5A756C] dark:text-[#9DB9B0]">Manage your account password and security.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      openChangePasswordModal();
                    }}
                    className="px-3.5 py-1.5 rounded-full border border-[#006C56] dark:border-[#00A889] text-[#006C56] dark:text-[#73D8C4] hover:bg-[#EAF6F0] dark:hover:bg-[rgba(0,168,137,0.15)] text-[11px] font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Change Password
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EBF0EC] dark:border-[rgba(150,210,195,0.12)]">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-full border border-slate-200 dark:border-[rgba(150,210,195,0.16)] text-slate-600 dark:text-[#9DB9B0] hover:bg-slate-100 dark:hover:bg-[#0E3931] font-bold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-full bg-[#004D3D] hover:bg-[#003B2E] dark:bg-[#008F78] dark:hover:bg-[#00A889] text-white font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* 5. CHANGE PASSWORD MODAL DIALOG                                       */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {isChangePasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeChangePasswordModal}
              className="absolute inset-0 bg-black/75 backdrop-blur-xs"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white dark:bg-[#0B3029] rounded-3xl p-6 sm:p-7 border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.15)] shadow-xl z-10 space-y-5"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#EBF0EC] dark:border-[rgba(150,210,195,0.12)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#EAF6F0] dark:bg-[#0E3931] text-[#006C56] dark:text-[#00A889] flex items-center justify-center shrink-0 border border-[#D5E8DF] dark:border-[rgba(150,210,195,0.12)]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
                      Change Password
                    </h3>
                    <p className="text-[11px] text-[#5A756C] dark:text-[#9DB9B0] font-medium leading-tight">
                      Update your password to keep your account secure
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeChangePasswordModal}
                  disabled={isChangingPassword}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#0E3931] flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-[#9DB9B0] dark:hover:text-[#F4FAF7] transition-colors cursor-pointer disabled:opacity-50"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              {changePasswordError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base shrink-0">error</span>
                  <span>{changePasswordError}</span>
                </div>
              )}

              {changePasswordSuccess && (
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base shrink-0">check_circle</span>
                  <span>{changePasswordSuccess}</span>
                </div>
              )}

              <form onSubmit={handleChangePasswordSubmit} className="space-y-4 text-xs">
                {/* Current Password Field */}
                <div className="space-y-1">
                  <label className="block font-bold text-[#19332A] dark:text-[#F4FAF7]">
                    Current Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      disabled={isChangingPassword}
                      className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-[rgba(150,210,195,0.16)] bg-white dark:bg-[#082821] text-[#19332A] dark:text-[#F4FAF7] placeholder:text-[#789990] focus:outline-none focus:ring-2 focus:ring-[#006C56] dark:focus:ring-[#00A889] font-medium"
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 dark:text-[#789990] dark:hover:text-[#F4FAF7] transition-colors p-1"
                      aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                    >
                      <span className="material-symbols-outlined text-lg select-none">
                        {showCurrentPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* New Password Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-[#19332A] dark:text-[#F4FAF7]">
                      New Password
                    </label>
                    <span className="text-[10.5px] text-[#789389] dark:text-[#76968D]">
                      Min. 6 characters
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      disabled={isChangingPassword}
                      className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-[rgba(150,210,195,0.16)] bg-white dark:bg-[#082821] text-[#19332A] dark:text-[#F4FAF7] placeholder:text-[#789990] focus:outline-none focus:ring-2 focus:ring-[#006C56] dark:focus:ring-[#00A889] font-medium"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 dark:text-[#789990] dark:hover:text-[#F4FAF7] transition-colors p-1"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      <span className="material-symbols-outlined text-lg select-none">
                        {showNewPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Confirm New Password Field */}
                <div className="space-y-1">
                  <label className="block font-bold text-[#19332A] dark:text-[#F4FAF7]">
                    Confirm New Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      disabled={isChangingPassword}
                      className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-[rgba(150,210,195,0.16)] bg-white dark:bg-[#082821] text-[#19332A] dark:text-[#F4FAF7] placeholder:text-[#789990] focus:outline-none focus:ring-2 focus:ring-[#006C56] dark:focus:ring-[#00A889] font-medium"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 dark:text-[#789990] dark:hover:text-[#F4FAF7] transition-colors p-1"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      <span className="material-symbols-outlined text-lg select-none">
                        {showConfirmPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBF0EC] dark:border-[rgba(150,210,195,0.12)]">
                  <button
                    type="button"
                    onClick={closeChangePasswordModal}
                    disabled={isChangingPassword}
                    className="px-4 py-2 rounded-full border border-slate-200 dark:border-[rgba(150,210,195,0.16)] text-slate-600 dark:text-[#9DB9B0] hover:bg-slate-100 dark:hover:bg-[#0E3931] font-bold cursor-pointer transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="px-5 py-2 rounded-full bg-[#004D3D] hover:bg-[#003B2E] dark:bg-[#008F78] dark:hover:bg-[#00A889] text-white font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isChangingPassword ? "Changing Password..." : "Change Password"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
