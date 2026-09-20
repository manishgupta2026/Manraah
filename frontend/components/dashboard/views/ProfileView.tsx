"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/frontend/lib/context/AuthContext";
import { useWellness } from "@/frontend/lib/context/WellnessContext";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
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
  const { user, updateUser, logout } = useAuth();
  const { currentStreak, refetchWellnessData } = useWellness();
  const { setCategory } = useCategory();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([
    "Anxiety & Stress Management",
    "Emotional Well-being",
    "Work-Life Balance",
  ]);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("parent");
  const [editAvatar, setEditAvatar] = useState("/images/user_avatar.jpg");
  const [editFocusAreas, setEditFocusAreas] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const userName = user?.sanctuaryName || user?.name || "Sanctuary Member";
  const userEmail = user?.email || "member@manraah.com";
  const userCategory = (user?.selectedCategory || "parent").toLowerCase();
  const userAvatar = user?.profileImage || user?.avatar || "/images/user_avatar.jpg";

  const openEditModal = () => {
    setEditName(userName);
    setEditCategory(userCategory);
    setEditAvatar(userAvatar);
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
        sanctuaryName: editName.trim(),
        name: editName.trim(),
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
      }, 800);
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
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
      router.push("/login");
    }
  };

  const formatCategoryLabel = (cat: string) => {
    if (cat.includes("work") || cat.includes("young_pro")) return "Working Professional";
    if (cat.includes("parent")) return "Parent";
    if (cat.includes("couple")) return "Couple";
    if (cat.includes("other")) return "General Wellness";
    return "Student";
  };

  return (
    <div className="w-full min-w-0 flex flex-col gap-6">
      {/* ===================================================================== */}
      {/* 1. TOP PROFILE HEADER CARD                                            */}
      {/* ===================================================================== */}
      <div className="w-full bg-white dark:bg-[#102F27] rounded-3xl p-6 sm:p-7 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left Group: Profile Image + Profile Information Column */}
          <div className="flex items-center gap-4 sm:gap-5 min-w-0 flex-1">
            {/* 1. Fixed Area Profile Image (76px x 76px, circular, no shrink) */}
            <div className="relative shrink-0 w-[76px] h-[76px] min-w-[76px] min-h-[76px] max-w-[76px] max-h-[76px]">
              <UserAvatar
                user={user}
                sizeClass="w-[76px] h-[76px] min-w-[76px] min-h-[76px] max-w-[76px] max-h-[76px] text-2xl"
                className="w-[76px] h-[76px] rounded-full object-cover border-2 border-white dark:border-[#14382F] shadow-sm shrink-0"
              />
              <div
                className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#006C56] dark:bg-[#00A982] border-2 border-white dark:border-[#102F27] flex items-center justify-center text-[9px] text-white dark:text-[#071C17] font-black shadow-xs pointer-events-none"
                title="Verified Sanctuary Member"
              >
                ✓
              </div>
            </div>

            {/* 2. Profile Information Column */}
            <div className="flex flex-col justify-center min-w-0 flex-1 space-y-1">
              {/* Row 1: Name + Category Badge */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight break-words">
                  {userName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] text-[10.5px] font-extrabold whitespace-nowrap">
                  {formatCategoryLabel(userCategory)}
                </span>
              </div>

              {/* Row 2: Subtitle */}
              <p className="text-xs text-[#5A756C] dark:text-[#A9C5BC] font-medium leading-normal">
                Your wellness journey with Manraah
              </p>

              {/* Row 3: Meta Info (Streak + Privacy) */}
              <div className="flex items-center gap-3 text-[11px] font-medium text-[#789389] dark:text-[#78958C] pt-0.5 flex-wrap">
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <span>🔥</span>
                  <strong className="text-[#19332A] dark:text-[#F4FAF7] font-bold">Day {currentStreak}</strong> Streak
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
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
            className="self-start md:self-center px-4.5 py-2.5 rounded-full bg-[#004D3D] hover:bg-[#003B2E] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] text-xs font-bold shadow-md shadow-[#004D3D]/15 dark:shadow-[#00A982]/15 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
        <div className="bg-white dark:bg-[#102F27] rounded-3xl p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs flex flex-col justify-between space-y-5 transition-colors h-full">
          <div>
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0F5F2] dark:border-[#23483E]">
              <div className="w-7.5 h-7.5 rounded-xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                Personal Information
              </h3>
            </div>

            <div className="space-y-4.5 pt-4 text-xs">
              <div>
                <p className="text-[10px] font-extrabold text-[#789389] dark:text-[#78958C] uppercase tracking-wider">
                  Full Name
                </p>
                <p className="text-xs sm:text-[13px] font-bold text-[#19332A] dark:text-[#F4FAF7] mt-1">
                  {userName}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-[#789389] dark:text-[#78958C] uppercase tracking-wider">
                  Email Address
                </p>
                <p className="text-xs sm:text-[13px] font-bold text-[#19332A] dark:text-[#F4FAF7] mt-1">
                  {userEmail}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-[#789389] dark:text-[#78958C] uppercase tracking-wider">
                  Account Type
                </p>
                <p className="text-xs sm:text-[13px] font-bold text-[#006C56] dark:text-[#00A982] mt-1">
                  Personal Sanctuary Member (Active)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card B: Wellness Preferences */}
        <div className="bg-white dark:bg-[#102F27] rounded-3xl p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs flex flex-col justify-between space-y-5 transition-colors h-full">
          <div>
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0F5F2] dark:border-[#23483E]">
              <div className="w-7.5 h-7.5 rounded-xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center shrink-0">
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
                <p className="text-[10px] font-extrabold text-[#789389] dark:text-[#78958C] uppercase tracking-wider">
                  Primary Category
                </p>
                <p className="text-xs sm:text-[13px] font-bold text-[#19332A] dark:text-[#F4FAF7] mt-1">
                  {formatCategoryLabel(userCategory)}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-[#789389] dark:text-[#78958C] uppercase tracking-wider mb-1.5">
                  Preferred Focus Areas
                </p>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {selectedFocusAreas.map((area) => (
                    <span
                      key={area}
                      className="text-[9.5px] font-bold px-2.5 py-1 rounded-full bg-[#EAF6F0] text-[#006C56] dark:bg-[#14382F] dark:text-[#88F7D6] dark:border dark:border-[#23483E]"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-[#789389] dark:text-[#78958C] uppercase tracking-wider">
                  Current Wellness Goal
                </p>
                <p className="text-xs font-medium text-[#4E685F] dark:text-[#A9C5BC] mt-1 leading-relaxed">
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
      <div className="w-full bg-white dark:bg-[#102F27] rounded-3xl p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-5 transition-colors">
        {/* Section Header & Log Out Button */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F5F2] dark:border-[#23483E]">
          <div className="flex items-center gap-2.5">
            <div className="w-7.5 h-7.5 rounded-xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
                Account &amp; Security
              </h3>
              <p className="text-[10px] text-[#789389] dark:text-[#78958C] font-medium leading-tight mt-0.5">
                Manage your session and privacy controls
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

        {/* Full-width Privacy Notice Card */}
        <div className="p-4 sm:p-4.5 rounded-2xl bg-[#F0F9F5] dark:bg-[#14382F] border border-[#D6EFE2] dark:border-[#23483E] flex items-start gap-3.5">
          <span className="text-lg leading-none mt-0.5 shrink-0">🔒</span>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-[#006C56] dark:text-[#00A982]">
              100% Confidential &amp; Protected
            </p>
            <p className="text-[11px] text-[#4E685F] dark:text-[#A9C5BC] leading-relaxed">
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
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#102F27] rounded-3xl p-6 sm:p-7 border border-[#E2ECE6] dark:border-[#23483E] shadow-xl z-10 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#EBF0EC] dark:border-[#23483E]">
                <h3 className="text-lg font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                  Edit Profile
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#14382F] flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
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
                <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#F8FCFA] dark:bg-[#14382F]/70 border border-[#E2ECE6] dark:border-[#23483E]">
                  <UserAvatar
                    avatar={editAvatar}
                    name={editName}
                    sizeClass="w-14 h-14 text-base"
                    className="border-2 border-white dark:border-[#102F27] shadow-xs"
                  />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <p className="font-bold text-[#19332A] dark:text-[#F4FAF7] text-xs">Profile Picture</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-full bg-[#004D3D] hover:bg-[#003B2E] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        Upload Photo
                      </button>
                      {editAvatar !== "/images/user_avatar.jpg" && (
                        <button
                          type="button"
                          onClick={() => setEditAvatar("/images/user_avatar.jpg")}
                          className="px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-[#23483E] text-slate-600 dark:text-[#A9C5BC] hover:bg-slate-100 dark:hover:bg-white/5 text-[11px] font-semibold transition-colors cursor-pointer"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#23483E] bg-white dark:bg-[#14382F] text-[#19332A] dark:text-[#F4FAF7] focus:outline-none focus:ring-2 focus:ring-[#006C56] font-medium"
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
                            ? "border-[#006C56] bg-[#EAF6F0] dark:bg-[#14382F] dark:border-[#00A982]"
                            : "border-slate-200 dark:border-[#23483E] hover:bg-slate-50 dark:hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-[#19332A] dark:text-[#F4FAF7]">
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </div>
                        <p className="text-[10px] text-[#789389] dark:text-[#78958C] mt-0.5 leading-tight">
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
                              ? "bg-[#004D3D] text-white border-[#004D3D] dark:bg-[#00A982] dark:text-[#071C17] dark:border-[#00A982]"
                              : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-[#14382F] dark:text-[#A9C5BC] dark:border-[#23483E]"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {area}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EBF0EC] dark:border-[#23483E]">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-full border border-slate-200 dark:border-[#23483E] text-slate-600 dark:text-[#A9C5BC] hover:bg-slate-100 dark:hover:bg-white/5 font-bold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-full bg-[#004D3D] hover:bg-[#003B2E] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
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
