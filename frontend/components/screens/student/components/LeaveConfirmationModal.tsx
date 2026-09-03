"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudentDashboard } from "@/frontend/components/screens/student/context/StudentDashboardContext";

// --- Leave Confirmation Modal Component ---
export function LeaveConfirmationModal() {
  const { isLeaveModalOpen, setIsLeaveModalOpen } = useStudentDashboard();

  const session = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("manraah_auth_session") || "null") : null;
  const category = (session?.user?.selectedCategory || "student").toLowerCase().trim();
  const isWp = category === "working_professional" || category === "working-professional";

  return (
    <AnimatePresence>
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/35 backdrop-blur-[2px]">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="w-full max-w-sm rounded-[32px] bg-white dark:bg-[#132E3F] border border-slate-200 dark:border-slate-850 p-7 shadow-2xl text-center space-y-5"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-500 mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">logout</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-heading font-black text-slate-800 dark:text-slate-100">
                {isWp ? "Go Back?" : "Log Out?"}
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                {isWp ? "Do you really want to go back?" : "Do you really want to log out?"}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="flex-1 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 font-heading font-black text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const { signOut } = await import("@/backend/auth/client");
                  await signOut();
                  window.location.href = "/login";
                }}
                className="flex-1 py-3.5 rounded-full bg-[#D96C6C] hover:bg-red-600 text-white font-heading font-black text-xs transition-all cursor-pointer"
              >
                {isWp ? "Logout" : "Log Out"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
