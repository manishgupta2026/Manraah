"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/frontend/lib/context/AuthContext";
import { EmergencyContact } from "@/backend/types";
import Link from "next/link";

interface CrisisSupportModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function CrisisSupportModal({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}: CrisisSupportModalProps) {
  const { user, isAuthenticated, updateUser } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"india" | "international" | "exercise">("india");

  // Emergency contact state
  const [guestContact, setGuestContact] = useState<EmergencyContact | null>(null);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactRelation, setContactRelation] = useState("Family");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Copy helpline state
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  // Breathing exercise state
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale" | "Rest">("Inhale");
  const [breathCount, setBreathCount] = useState(4);

  const isControlled = controlledIsOpen !== undefined;
  const isModalOpen = isControlled ? controlledIsOpen : internalIsOpen;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Global event listener to open crisis modal from anywhere (Authenticated only)
  useEffect(() => {
    const handleGlobalOpen = () => {
      if (!isAuthenticated && !user?.id) return;
      setInternalIsOpen(true);
    };
    window.addEventListener("open-crisis-modal", handleGlobalOpen);
    return () => window.removeEventListener("open-crisis-modal", handleGlobalOpen);
  }, [isAuthenticated, user?.id]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isModalOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isModalOpen]);

  // Load guest contact from localStorage if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("manraah_emergency_contact");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.name || parsed.phone)) {
            setGuestContact(parsed);
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }, [isModalOpen]);

  const activeContact: EmergencyContact | null =
    user?.emergencyContact?.phone
      ? user.emergencyContact
      : guestContact?.phone
      ? guestContact
      : null;

  const hasContact = Boolean(activeContact && activeContact.phone);

  // Sync inputs when modal opens or activeContact updates
  useEffect(() => {
    if (isModalOpen) {
      if (activeContact) {
        setContactName(activeContact.name || "");
        setContactPhone(activeContact.phone || "");
        setContactRelation(activeContact.relation || "Family");
        setIsEditingContact(false);
      } else {
        setContactName("");
        setContactPhone("");
        setContactRelation("Family");
        setIsEditingContact(true);
      }
      setSaveSuccess(false);
      setErrorMsg("");
    }
  }, [isModalOpen, activeContact]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  // Breathing exercise timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isBreathingActive && isModalOpen) {
      interval = setInterval(() => {
        setBreathCount((prev) => {
          if (prev > 1) {
            return prev - 1;
          }
          // Cycle phase
          setBreathPhase((currentPhase) => {
            if (currentPhase === "Inhale") return "Hold";
            if (currentPhase === "Hold") return "Exhale";
            if (currentPhase === "Exhale") return "Rest";
            return "Inhale";
          });
          return 4;
        });
      }, 1000);
    } else {
      setBreathCount(4);
      setBreathPhase("Inhale");
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBreathingActive, isModalOpen]);

  const handleClose = () => {
    if (controlledOnClose) {
      controlledOnClose();
    }
    setInternalIsOpen(false);
    setIsBreathingActive(false);
  };

  const handleCopyNumber = (num: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(num).then(() => {
        setCopiedNumber(num);
        setTimeout(() => setCopiedNumber(null), 2500);
      });
    } else {
      // Fallback
      setCopiedNumber(num);
      setTimeout(() => setCopiedNumber(null), 2500);
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmedName = contactName.trim();
    const trimmedPhone = contactPhone.trim();

    if (!trimmedName) {
      setErrorMsg("Please enter your emergency contact's name.");
      return;
    }
    if (!trimmedPhone || trimmedPhone.length < 5) {
      setErrorMsg("Please enter a valid phone number.");
      return;
    }

    setIsSaving(true);
    const contactObj: EmergencyContact = {
      name: trimmedName,
      phone: trimmedPhone,
      relation: contactRelation.trim() || "Family",
    };

    try {
      // 1. If logged in, update backend DB
      if (isAuthenticated && updateUser) {
        await updateUser({ emergencyContact: contactObj }).catch((err) => {
          console.warn("Backend emergency contact save warning:", err);
        });
      }

      // 2. Persist locally in all cases so it's instantly available
      if (typeof window !== "undefined") {
        localStorage.setItem("manraah_emergency_contact", JSON.stringify(contactObj));
      }
      setGuestContact(contactObj);
      setSaveSuccess(true);
      setIsEditingContact(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save emergency contact.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted || (!isAuthenticated && !user?.id)) return null;

  const modalMarkup = (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto select-text">
          {/* Dimmed Blurred Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
            aria-hidden="true"
          />

          {/* Modal Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-[#131916] border border-red-200/60 dark:border-[#1E2824] shadow-2xl overflow-hidden z-10 my-6 text-[#19332A] dark:text-[#F4FAF7]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="crisis-support-title"
          >
            {/* Top Crisis Banner Accent */}
            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 px-5 sm:px-6 py-4 text-white relative shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl font-bold animate-pulse text-white">
                      emergency
                    </span>
                  </div>
                  <div>
                    <h2
                      id="crisis-support-title"
                      className="text-base sm:text-lg font-heading font-extrabold tracking-tight leading-tight"
                    >
                      Crisis Support &amp; Safety Desk
                    </h2>
                    <p className="text-[11px] sm:text-xs text-white/90 font-medium leading-tight mt-0.5">
                      Immediate help is available 24/7. Confidential, free, and non-judgmental.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  aria-label="Close crisis support modal"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {/* Sub-Tabs: India Helplines | International | Grounding Exercise */}
              <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-white/20">
                <button
                  type="button"
                  onClick={() => setActiveTab("india")}
                  className={`px-3 py-1 rounded-full text-xs font-heading font-bold transition-all cursor-pointer ${
                    activeTab === "india"
                      ? "bg-white text-red-600 shadow-xs"
                      : "bg-white/15 text-white hover:bg-white/25"
                  }`}
                >
                  🇮🇳 India Helplines
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("international")}
                  className={`px-3 py-1 rounded-full text-xs font-heading font-bold transition-all cursor-pointer ${
                    activeTab === "international"
                      ? "bg-white text-red-600 shadow-xs"
                      : "bg-white/15 text-white hover:bg-white/25"
                  }`}
                >
                  🌍 International
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("exercise")}
                  className={`px-3 py-1 rounded-full text-xs font-heading font-bold transition-all cursor-pointer ${
                    activeTab === "exercise"
                      ? "bg-white text-red-600 shadow-xs"
                      : "bg-white/15 text-white hover:bg-white/25"
                  }`}
                >
                  🌿 Calming Pause
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Immediate Safety Alert Callout */}
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-3 text-red-900 dark:text-red-200">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-xl shrink-0 mt-0.5">
                  health_and_safety
                </span>
                <div className="text-xs font-semibold leading-relaxed flex-1">
                  <p>
                    If you or someone you know is in immediate life-threatening danger, please dial{" "}
                    <a href="tel:112" className="underline font-black text-red-700 dark:text-red-300">
                      112
                    </a>{" "}
                    (Police/Ambulance) or proceed to the nearest emergency hospital department.
                  </p>
                </div>
              </div>

              {/* TAB 1: INDIA HELPLINES & PERSONAL EMERGENCY CONTACT */}
              {activeTab === "india" && (
                <>
                  {/* Section 1: User's Trusted Emergency Contact */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-rose-500 text-lg">
                          contact_phone
                        </span>
                        <h3 className="text-sm font-heading font-bold text-[#19332A] dark:text-[#F4FAF7]">
                          Your Trusted Emergency Contact
                        </h3>
                      </div>

                      {hasContact && !isEditingContact && (
                        <button
                          type="button"
                          onClick={() => setIsEditingContact(true)}
                          className="text-xs font-heading font-semibold text-[#006B56] dark:text-[#D5E6E0] hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                          <span>Edit</span>
                        </button>
                      )}
                    </div>

                    {saveSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-emerald-600">
                          check_circle
                        </span>
                        <span>Emergency contact saved for 1-tap dialling!</span>
                      </div>
                    )}

                    {/* Display Saved Emergency Contact */}
                    {hasContact && !isEditingContact && (
                      <div className="p-4 rounded-2xl bg-[#F8FCFA] dark:bg-[#131916] border border-[#CBECE2] dark:border-[#1E2824] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-heading font-bold text-[#19332A] dark:text-[#F4FAF7]">
                              {activeContact?.name}
                            </span>
                            {activeContact?.relation && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-heading font-semibold bg-[#E6F4F0] dark:bg-white/5 text-[#006B56] dark:text-[#D5E6E0] border border-[#CBECE2] dark:border-[#1E2824]">
                                {activeContact.relation}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-mono font-bold text-[#4F685F] dark:text-[#9DB9B0]">
                            {activeContact?.phone}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyNumber(activeContact?.phone || "")}
                            className="px-3 py-2 rounded-xl bg-white dark:bg-[#131916] hover:bg-gray-50 dark:hover:bg-[#22302A] border border-[#CBECE2] dark:border-[#1E2824] text-xs font-bold text-[#4F685F] dark:text-[#9DB9B0] transition-colors cursor-pointer flex items-center gap-1.5"
                            title="Copy phone number"
                          >
                            <span className="material-symbols-outlined text-sm">
                              {copiedNumber === activeContact?.phone ? "check" : "content_copy"}
                            </span>
                            <span>{copiedNumber === activeContact?.phone ? "Copied" : "Copy"}</span>
                          </button>

                          <a
                            href={`tel:${activeContact?.phone}`}
                            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-heading font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">call</span>
                            <span>Call {activeContact?.name?.split(" ")[0]}</span>
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Emergency Contact Intake Form */}
                    {(!hasContact || isEditingContact) && (
                      <div className="p-4 rounded-2xl bg-[#F8FCFA] dark:bg-[#131916] border border-dashed border-red-300 dark:border-red-900/40 space-y-3">
                        <div className="space-y-0.5">
                          <p className="text-xs font-heading font-bold text-[#19332A] dark:text-[#F4FAF7]">
                            {hasContact
                              ? "Update Emergency Contact"
                              : "Add a Trusted Emergency Contact"}
                          </p>
                          <p className="text-[11px] text-[#4F685F] dark:text-[#9DB9B0] leading-relaxed">
                            Add someone you trust (partner, parent, friend). Reach them in 1 tap anytime during distress.
                          </p>
                        </div>

                        <form onSubmit={handleSaveContact} className="space-y-3 pt-1">
                          {errorMsg && (
                            <p className="text-xs text-red-500 font-semibold">{errorMsg}</p>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[11px] font-heading font-bold text-[#4F685F] dark:text-[#9DB9B0] mb-1">
                                Contact Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                                placeholder="e.g. Priya Sharma, Mom, Rahul"
                                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#131916] border border-[#CBECE2] dark:border-[#1E2824] focus:outline-hidden focus:ring-2 focus:ring-[#006B56] text-[#19332A] dark:text-[#F4FAF7] placeholder:text-gray-400 dark:placeholder:text-[#76968D]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-heading font-bold text-[#4F685F] dark:text-[#9DB9B0] mb-1">
                                Phone Number *
                              </label>
                              <input
                                type="tel"
                                required
                                value={contactPhone}
                                onChange={(e) => setContactPhone(e.target.value)}
                                placeholder="e.g. +91 98765 43210"
                                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#131916] border border-[#CBECE2] dark:border-[#1E2824] focus:outline-hidden focus:ring-2 focus:ring-[#006B56] text-[#19332A] dark:text-[#F4FAF7] placeholder:text-gray-400 dark:placeholder:text-[#76968D]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-heading font-bold text-[#4F685F] dark:text-[#9DB9B0] mb-1">
                              Relationship
                            </label>
                            <select
                              value={contactRelation}
                              onChange={(e) => setContactRelation(e.target.value)}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#131916] border border-[#CBECE2] dark:border-[#1E2824] focus:outline-hidden focus:ring-2 focus:ring-[#006B56] text-[#19332A] dark:text-[#F4FAF7] cursor-pointer"
                            >
                              <option value="Parent">Parent</option>
                              <option value="Partner / Spouse">Partner / Spouse</option>
                              <option value="Family">Family Member / Sibling</option>
                              <option value="Close Friend">Close Friend</option>
                              <option value="Doctor / Therapist">Doctor / Therapist</option>
                              <option value="Guardian">Guardian</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="submit"
                              disabled={isSaving}
                              className="px-4 py-2 rounded-xl bg-[#006B56] hover:bg-[#005B48] text-white text-xs font-heading font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                            >
                              <span className="material-symbols-outlined text-sm">
                                {isSaving ? "sync" : "save"}
                              </span>
                              <span>{isSaving ? "Saving..." : "Save Emergency Contact"}</span>
                            </button>

                            {hasContact && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsEditingContact(false);
                                  setErrorMsg("");
                                }}
                                className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#131916] dark:hover:bg-[#22302A] text-[#19332A] dark:text-[#E4E4E7] text-xs font-heading font-medium transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </form>
                      </div>
                    )}
                  </div>

                  {/* Section 2: Verified 24/7 National Helplines */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-red-500 text-lg">
                        support_agent
                      </span>
                      <h3 className="text-sm font-heading font-bold text-[#19332A] dark:text-[#F4FAF7]">
                        Verified 24/7 National Helplines (Free &amp; Confidential)
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Tele-MANAS */}
                      <div className="p-3.5 rounded-2xl bg-[#F8FCFA] dark:bg-[#131916] border border-[#CBECE2] dark:border-[#1E2824] flex flex-col justify-between gap-3 shadow-2xs">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                              Tele-MANAS (Govt. of India)
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-heading font-bold bg-[#E6F4F0] dark:bg-white/5 text-[#006B56] dark:text-[#D5E6E0]">
                              24/7 Free
                            </span>
                          </div>
                          <p className="text-[10.5px] text-[#4F685F] dark:text-[#9DB9B0] mt-1 leading-snug">
                            National Tele Mental Health Programme in 20+ Indian languages.
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyNumber("14416")}
                            className="p-2 rounded-xl bg-white dark:bg-[#131916] hover:bg-gray-50 dark:hover:bg-[#22302A] border border-[#CBECE2] dark:border-[#1E2824] text-xs font-bold text-[#4F685F] dark:text-[#9DB9B0] transition-colors cursor-pointer"
                            title="Copy 14416"
                          >
                            <span className="material-symbols-outlined text-sm">
                              {copiedNumber === "14416" ? "check" : "content_copy"}
                            </span>
                          </button>

                          <a
                            href="tel:14416"
                            className="flex-1 py-2 rounded-xl bg-[#006B56] hover:bg-[#005B48] text-white text-xs font-heading font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">call</span>
                            <span>Call 14416</span>
                          </a>
                        </div>
                      </div>

                      {/* National Emergency Services (112) */}
                      <div className="p-3.5 rounded-2xl bg-[#F8FCFA] dark:bg-[#131916] border border-[#CBECE2] dark:border-[#1E2824] flex flex-col justify-between gap-3 shadow-2xs">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                              National Emergency
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-heading font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">
                              Emergency 112
                            </span>
                          </div>
                          <p className="text-[10.5px] text-[#4F685F] dark:text-[#9DB9B0] mt-1 leading-snug">
                            Immediate police, ambulance, medical rescue dispatch across India.
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyNumber("112")}
                            className="p-2 rounded-xl bg-white dark:bg-[#131916] hover:bg-gray-50 dark:hover:bg-[#22302A] border border-[#CBECE2] dark:border-[#1E2824] text-xs font-bold text-[#4F685F] dark:text-[#9DB9B0] transition-colors cursor-pointer"
                            title="Copy 112"
                          >
                            <span className="material-symbols-outlined text-sm">
                              {copiedNumber === "112" ? "check" : "content_copy"}
                            </span>
                          </button>

                          <a
                            href="tel:112"
                            className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-heading font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">call</span>
                            <span>Call 112</span>
                          </a>
                        </div>
                      </div>

                      {/* KIRAN Helpline */}
                      <div className="p-3.5 rounded-2xl bg-[#F8FCFA] dark:bg-[#131916] border border-[#CBECE2] dark:border-[#1E2824] flex flex-col justify-between gap-3 shadow-2xs">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                              KIRAN Mental Health
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-heading font-bold bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                              Toll-Free
                            </span>
                          </div>
                          <p className="text-[10.5px] text-[#4F685F] dark:text-[#9DB9B0] mt-1 leading-snug">
                            Govt. 24/7 psychological first aid, anxiety &amp; depression relief.
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyNumber("18005990019")}
                            className="p-2 rounded-xl bg-white dark:bg-[#131916] hover:bg-gray-50 dark:hover:bg-[#22302A] border border-[#CBECE2] dark:border-[#1E2824] text-xs font-bold text-[#4F685F] dark:text-[#9DB9B0] transition-colors cursor-pointer"
                            title="Copy 1800-599-0019"
                          >
                            <span className="material-symbols-outlined text-sm">
                              {copiedNumber === "18005990019" ? "check" : "content_copy"}
                            </span>
                          </button>

                          <a
                            href="tel:18005990019"
                            className="flex-1 py-2 rounded-xl bg-[#006B56] hover:bg-[#005B48] text-white text-xs font-heading font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">call</span>
                            <span>1800-599-0019</span>
                          </a>
                        </div>
                      </div>

                      {/* Vandrevala Foundation */}
                      <div className="p-3.5 rounded-2xl bg-[#F8FCFA] dark:bg-[#131916] border border-[#CBECE2] dark:border-[#1E2824] flex flex-col justify-between gap-3 shadow-2xs">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                              Vandrevala Foundation
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-heading font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              Free Counsel
                            </span>
                          </div>
                          <p className="text-[10.5px] text-[#4F685F] dark:text-[#9DB9B0] mt-1 leading-snug">
                            Trained clinical psychologists &amp; crisis counselors standing by 24/7.
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyNumber("+919999666555")}
                            className="p-2 rounded-xl bg-white dark:bg-[#131916] hover:bg-gray-50 dark:hover:bg-[#22302A] border border-[#CBECE2] dark:border-[#1E2824] text-xs font-bold text-[#4F685F] dark:text-[#9DB9B0] transition-colors cursor-pointer"
                            title="Copy +91 9999 666 555"
                          >
                            <span className="material-symbols-outlined text-sm">
                              {copiedNumber === "+919999666555" ? "check" : "content_copy"}
                            </span>
                          </button>

                          <a
                            href="tel:+919999666555"
                            className="flex-1 py-2 rounded-xl bg-[#006B56] hover:bg-[#005B48] text-white text-xs font-heading font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">call</span>
                            <span>+91 9999 666 555</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: INTERNATIONAL HELPLINES */}
              {activeTab === "international" && (
                <div className="space-y-4">
                  <p className="text-xs text-[#4F685F] dark:text-[#9DB9B0] leading-relaxed">
                    If you are currently outside India, please contact these verified international crisis networks or dial your local emergency services (911 in North America, 999 in the UK, 000 in Australia).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* USA / Canada */}
                    <div className="p-3.5 rounded-2xl bg-[#F8FCFA] dark:bg-[#131916] border border-[#CBECE2] dark:border-[#1E2824] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                          🇺🇸 / 🇨🇦 USA &amp; Canada (988)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          24/7 Call/Text
                        </span>
                      </div>
                      <p className="text-[10.5px] text-[#4F685F] dark:text-[#9DB9B0]">
                        Suicide &amp; Crisis Lifeline. Dial or text 988. Free and confidential.
                      </p>
                      <a
                        href="tel:988"
                        className="w-full py-2 rounded-xl bg-[#006B56] hover:bg-[#005B48] text-white text-xs font-heading font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">call</span>
                        <span>Call 988</span>
                      </a>
                    </div>

                    {/* United Kingdom */}
                    <div className="p-3.5 rounded-2xl bg-[#F8FCFA] dark:bg-[#131916] border border-[#CBECE2] dark:border-[#1E2824] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                          🇬🇧 United Kingdom (111 / 116 123)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          24/7 NHS / Samaritans
                        </span>
                      </div>
                      <p className="text-[10.5px] text-[#4F685F] dark:text-[#9DB9B0]">
                        NHS Mental Health Services (111) or Samaritans (116 123).
                      </p>
                      <a
                        href="tel:116123"
                        className="w-full py-2 rounded-xl bg-[#006B56] hover:bg-[#005B48] text-white text-xs font-heading font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">call</span>
                        <span>Call 116 123</span>
                      </a>
                    </div>

                    {/* Australia */}
                    <div className="p-3.5 rounded-2xl bg-[#F8FCFA] dark:bg-[#131916] border border-[#CBECE2] dark:border-[#1E2824] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                          🇦🇺 Australia (13 11 14)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          24/7 Lifeline
                        </span>
                      </div>
                      <p className="text-[10.5px] text-[#4F685F] dark:text-[#9DB9B0]">
                        Lifeline Australia crisis support and suicide prevention services.
                      </p>
                      <a
                        href="tel:131114"
                        className="w-full py-2 rounded-xl bg-[#006B56] hover:bg-[#005B48] text-white text-xs font-heading font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">call</span>
                        <span>Call 13 11 14</span>
                      </a>
                    </div>

                    {/* Global Directory Link */}
                    <div className="p-3.5 rounded-2xl bg-[#F8FCFA] dark:bg-[#131916] border border-[#CBECE2] dark:border-[#1E2824] space-y-2 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                          🌐 Worldwide Directory
                        </span>
                        <p className="text-[10.5px] text-[#4F685F] dark:text-[#9DB9B0] mt-1">
                          Find free confidential crisis hotlines in over 130+ countries worldwide.
                        </p>
                      </div>
                      <a
                        href="https://findahelpline.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#22302A] dark:hover:bg-[#2d3f37] text-[#19332A] dark:text-[#F4FAF7] text-xs font-heading font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>Open FindAHelpline.com</span>
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CALMING BOX BREATHING EXERCISE */}
              {activeTab === "exercise" && (
                <div className="p-5 rounded-3xl bg-[#E6F4F0] dark:bg-[#131916] border border-[#CBECE2] dark:border-[#1E2824] flex flex-col items-center justify-center text-center space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-heading font-black text-[#004D3D] dark:text-[#F4FAF7]">
                      4-4-4 Grounding Nervous System Reset
                    </h4>
                    <p className="text-xs text-[#4F685F] dark:text-[#9DB9B0] max-w-sm">
                      Follow the rhythm to reduce heart rate and signal physical safety to your nervous system.
                    </p>
                  </div>

                  {/* Pulsing Breathing Circle */}
                  <div className="relative w-36 h-36 flex items-center justify-center my-2">
                    <motion.div
                      animate={{
                        scale:
                          isBreathingActive && breathPhase === "Inhale"
                            ? 1.25
                            : isBreathingActive && breathPhase === "Hold"
                            ? 1.25
                            : 0.9,
                      }}
                      transition={{ duration: 4, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full bg-[#006B56]/20 dark:bg-[#5FAF8A] dark:text-[#112F28]/20 blur-md"
                    />
                    <motion.div
                      animate={{
                        scale:
                          isBreathingActive && breathPhase === "Inhale"
                            ? 1.15
                            : isBreathingActive && breathPhase === "Hold"
                            ? 1.15
                            : 0.85,
                      }}
                      transition={{ duration: 4, ease: "easeInOut" }}
                      className="w-28 h-28 rounded-full bg-[#006B56] dark:bg-[#5FAF8A] dark:text-[#112F28] text-white flex flex-col items-center justify-center shadow-lg shadow-[#006B56]/25 select-none"
                    >
                      <span className="text-xs font-heading font-extrabold uppercase tracking-wider">
                        {isBreathingActive ? breathPhase : "Ready"}
                      </span>
                      <span className="text-2xl font-black mt-0.5">
                        {isBreathingActive ? breathCount : "4s"}
                      </span>
                    </motion.div>
                  </div>

                  {/* Instruction Step */}
                  <div className="text-xs font-semibold text-[#004D3D] dark:text-[#D5E6E0]">
                    {isBreathingActive && breathPhase === "Inhale" && "Breathe in slowly through your nose..."}
                    {isBreathingActive && breathPhase === "Hold" && "Gently hold your breath... relax your shoulders"}
                    {isBreathingActive && breathPhase === "Exhale" && "Exhale smoothly through your mouth..."}
                    {isBreathingActive && breathPhase === "Rest" && "Pause softly... ground both feet on the floor"}
                    {!isBreathingActive && "Press start below whenever you are ready."}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBreathingActive((prev) => !prev)}
                    className="px-6 py-2.5 rounded-full bg-[#006B56] hover:bg-[#005B48] text-white text-xs font-heading font-bold shadow-md shadow-[#006B56]/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">
                      {isBreathingActive ? "pause" : "play_arrow"}
                    </span>
                    <span>{isBreathingActive ? "Pause Exercise" : "Start 4-Second Breathing"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="py-3 px-5 bg-[#F4F9F6] dark:bg-[#131916] border-t border-[#CBECE2] dark:border-[#1E2824] flex items-center justify-between text-xs text-[#4F685F] dark:text-[#76968D]">
              <span className="font-semibold">Manraah 24/7 Crisis Support Desk</span>
              <Link
                href="/crisis"
                onClick={handleClose}
                className="font-bold text-[#006B56] dark:text-[#D5E6E0] hover:underline"
              >
                Full Crisis Page →
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalMarkup, document.body);
}
