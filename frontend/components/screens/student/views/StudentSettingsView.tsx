"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudentDashboard } from "@/frontend/components/screens/student/context/StudentDashboardContext";
import { renderAvatar } from "@/frontend/components/screens/student/components/StudentSidebar";

export function StudentSettingsContent() {
  const {
    user,
    profileName, setProfileName,
    profileAvatar, setProfileAvatar,
    handleUpdateProfileSubmit,
    isDarkMode, toggleTheme,
    triggerToast
  } = useStudentDashboard();

  const [notificationsAlert, setNotificationsAlert] = useState(true);
  const [dataVisibility, setDataVisibility] = useState("Private");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch("/api/profile", {
        method: "DELETE",
      });
      if (res.ok) {
        triggerToast("Account deleted successfully.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        alert("Failed to delete account. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred deleting account.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left animate-fadeIn">
      <div>
        <h2 className="text-2xl font-heading font-black text-[#100E26] dark:text-slate-100">Settings & Privacy</h2>
        <p className="text-xs font-semibold text-slate-400 mt-1">Manage your profile, display preferences, and account privacy options.</p>
      </div>

      {/* Profile Card Section */}
      <div className="p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
        <h3 className="font-heading font-black text-xs text-[#100E26] dark:text-slate-100 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 pb-2">
          Profile Information
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-20 h-20">
            {renderAvatar(user, "w-20 h-20 text-xl")}
            <label className="absolute bottom-0 right-0 w-6.5 h-6.5 rounded-full bg-[#5F4EA5] border-2 border-white flex items-center justify-center text-white cursor-pointer hover:bg-[#100E26] transition-colors">
              <span className="material-symbols-outlined text-[13px] font-bold">edit</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setProfileAvatar(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>

          <form onSubmit={handleUpdateProfileSubmit} className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Display Name</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-150/60 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-850 dark:text-slate-200 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Email Address (Read-only)</label>
              <input
                type="text"
                disabled
                value={user?.email || ""}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500 font-bold cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Category Lock (Read-only)</label>
              <input
                type="text"
                disabled
                value={user?.selectedCategory === "working-professional" || user?.selectedCategory === "working_professional" ? "Working Professional" : "Student"}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500 font-bold cursor-not-allowed"
              />
            </div>

            <div className="flex items-end pt-2 sm:pt-0">
              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-[#5F4EA5] hover:bg-[#100E26] text-white text-xs font-bold shadow-md transition-all text-center cursor-pointer"
              >
                Update Profile Info
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
        <h3 className="font-heading font-black text-xs text-[#100E26] dark:text-slate-100 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 pb-2">
          Theme & Preferences
        </h3>

        <div className="space-y-4">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100">Portal Dark Mode</h4>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">Toggle system color theme for midnight browsing comfort.</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                isDarkMode ? "bg-[#5F4EA5]" : "bg-slate-200"
              }`}
            >
              <div className={`w-5.5 h-5.5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${
                isDarkMode ? "left-6" : "left-0.5"
              }`} />
            </button>
          </div>

          {/* Notifications Alert Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/40">
            <div>
              <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100">Daily Reminders & Alerts</h4>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">Get desktop toast reminder alerts when study planner tasks are due.</p>
            </div>
            <button
              onClick={() => {
                setNotificationsAlert(!notificationsAlert);
                triggerToast(notificationsAlert ? "Alerts disabled." : "Alerts enabled.");
              }}
              className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                notificationsAlert ? "bg-[#5F4EA5]" : "bg-slate-200"
              }`}
            >
              <div className={`w-5.5 h-5.5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${
                notificationsAlert ? "left-6" : "left-0.5"
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Section */}
      <div className="p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
        <h3 className="font-heading font-black text-xs text-[#100E26] dark:text-slate-100 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 pb-2">
          Sanctuary Privacy Visibility
        </h3>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100 font-heading">Forum Visibility Options</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Select how your credentials appear to other students in community chats.</p>
            </div>
            <select
              value={dataVisibility}
              onChange={(e) => {
                setDataVisibility(e.target.value);
                triggerToast(`Privacy updated to ${e.target.value}`);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-150/60 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-350 focus:outline-none"
            >
              <option value="Anonymous">Anonymous (Initials only)</option>
              <option value="Private">Fully Private (Invisible)</option>
              <option value="Visible">Visible (Show sanctuary name)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-red-200/20 dark:border-red-950/20 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
        <h3 className="font-heading font-black text-xs text-red-500 uppercase tracking-widest border-b border-red-50 dark:border-red-950/10 pb-2">
          Danger Zone
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100">Delete Sanctuary Account</h4>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">Permanently delete your wellbeing files, credentials, and settings logs.</p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-5 py-3 rounded-2xl bg-[#D96C6C] hover:bg-red-650 text-white font-heading font-black text-[10px] uppercase tracking-wider transition-all shadow-2xs cursor-pointer animate-pulse"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[3px]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-sm rounded-[32px] bg-white dark:bg-[#132E3F] border border-red-200 dark:border-red-950/40 p-7 shadow-2xl text-center space-y-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-500 mx-auto flex items-center justify-center select-none">
                <span className="material-symbols-outlined text-2xl font-bold">warning</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-heading font-black text-red-500">Delete Sanctuary Permanently?</h3>
                <p className="text-xs font-semibold text-slate-550 dark:text-slate-400 leading-relaxed">
                  This action is irreversible. All of your wellness records, tasks, journal logs, and credentials will be deleted forever.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-heading font-black text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 py-3.5 rounded-full bg-red-500 hover:bg-red-650 text-white font-heading font-black text-xs transition-all cursor-pointer"
                >
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
