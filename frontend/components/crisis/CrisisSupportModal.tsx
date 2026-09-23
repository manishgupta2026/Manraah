"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/frontend/lib/context/AuthContext";
import { EmergencyContact } from "@/backend/types";
import Link from "next/link";

interface CrisisSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CrisisSupportModal({ isOpen, onClose }: CrisisSupportModalProps) {
  const { user, isAuthenticated, updateUser } = useAuth();

  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactRelation, setContactRelation] = useState("Family");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const currentContact: EmergencyContact | null = user?.emergencyContact || null;
  const hasContact = Boolean(currentContact && currentContact.phone);

  // Sync state when modal opens or user updates
  useEffect(() => {
    if (isOpen) {
      if (currentContact) {
        setContactName(currentContact.name || "");
        setContactPhone(currentContact.phone || "");
        setContactRelation(currentContact.relation || "Family");
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
  }, [isOpen, currentContact]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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
    try {
      const contactObj: EmergencyContact = {
        name: trimmedName,
        phone: trimmedPhone,
        relation: contactRelation.trim() || "Family",
      };

      await updateUser({
        emergencyContact: contactObj,
      });

      setSaveSuccess(true);
      setIsEditingContact(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save emergency contact. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Dimmed Blurred Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm cursor-pointer"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg rounded-3xl bg-surface-container-lowest dark:bg-[#0C241D] border border-red-200/50 dark:border-red-900/40 shadow-2xl overflow-hidden z-10 my-8 text-on-surface"
            role="dialog"
            aria-modal="true"
            aria-labelledby="crisis-support-title"
          >
            {/* Top Crisis Banner Accent */}
            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 px-6 py-4 text-white relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-2xl font-bold animate-pulse text-white">
                    emergency
                  </span>
                  <div>
                    <h2 id="crisis-support-title" className="text-base sm:text-lg font-heading font-extrabold tracking-tight leading-tight">
                      Crisis Support &amp; Safety
                    </h2>
                    <p className="text-[11px] sm:text-xs text-white/90 font-medium leading-tight">
                      Immediate help is available 24/7. You are not alone.
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  aria-label="Close crisis support modal"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6 max-h-[82vh] overflow-y-auto">
              {/* Immediate Safety Alert Callout */}
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-red-900 dark:text-red-200">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-xl shrink-0 mt-0.5">
                  health_and_safety
                </span>
                <p className="text-xs font-semibold leading-relaxed">
                  If you or someone you know is in immediate life-threatening danger, please dial{" "}
                  <a href="tel:112" className="underline font-bold text-red-700 dark:text-red-300">
                    112
                  </a>{" "}
                  or reach the nearest emergency hospital department immediately.
                </p>
              </div>

              {/* Section 1: User's Personal Emergency Contact */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-rose-500 text-lg">
                      contact_phone
                    </span>
                    <h3 className="text-sm font-heading font-bold text-on-surface">
                      Your Trusted Emergency Contact
                    </h3>
                  </div>

                  {hasContact && !isEditingContact && isAuthenticated && (
                    <button
                      type="button"
                      onClick={() => setIsEditingContact(true)}
                      className="text-xs font-heading font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {saveSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                    <span>Emergency contact updated successfully!</span>
                  </div>
                )}

                {/* Display Saved Emergency Contact */}
                {hasContact && !isEditingContact && (
                  <div className="p-4 rounded-2xl bg-surface-container dark:bg-surface-container-high border border-surface-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-heading font-bold text-on-surface">
                          {currentContact?.name}
                        </span>
                        {currentContact?.relation && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-heading font-semibold bg-primary/10 text-primary border border-primary/20">
                            {currentContact.relation}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono font-bold text-on-surface-variant">
                        {currentContact?.phone}
                      </p>
                    </div>

                    <a
                      href={`tel:${currentContact?.phone}`}
                      className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-heading font-bold transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">call</span>
                      <span>Call {currentContact?.name}</span>
                    </a>
                  </div>
                )}

                {/* Emergency Contact Intake Form (First-time or Editing) */}
                {(!hasContact || isEditingContact) && (
                  <div className="p-4 rounded-2xl bg-surface-container/60 dark:bg-surface-container-high/60 border border-dashed border-red-300 dark:border-red-900/50 space-y-3">
                    <div className="space-y-1">
                      <p className="text-xs font-heading font-bold text-on-surface">
                        {hasContact ? "Update Emergency Contact" : "Add an Emergency Contact for Quick Access"}
                      </p>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">
                        Add someone you trust (partner, parent, close friend). You can reach them directly from this crisis tab at any time.
                      </p>
                    </div>

                    {isAuthenticated ? (
                      <form onSubmit={handleSaveContact} className="space-y-3 pt-1">
                        {errorMsg && (
                          <p className="text-xs text-red-500 font-semibold">{errorMsg}</p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-heading font-bold text-on-surface-variant mb-1">
                              Contact Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={contactName}
                              onChange={(e) => setContactName(e.target.value)}
                              placeholder="e.g. Priya Sharma"
                              className="w-full px-3 py-2 text-xs rounded-xl bg-surface border border-surface-variant focus:outline-hidden focus:ring-2 focus:ring-primary text-on-surface"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-heading font-bold text-on-surface-variant mb-1">
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              required
                              value={contactPhone}
                              onChange={(e) => setContactPhone(e.target.value)}
                              placeholder="e.g. +91 98765 43210"
                              className="w-full px-3 py-2 text-xs rounded-xl bg-surface border border-surface-variant focus:outline-hidden focus:ring-2 focus:ring-primary text-on-surface"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-heading font-bold text-on-surface-variant mb-1">
                            Relationship
                          </label>
                          <select
                            value={contactRelation}
                            onChange={(e) => setContactRelation(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-surface border border-surface-variant focus:outline-hidden focus:ring-2 focus:ring-primary text-on-surface cursor-pointer"
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
                            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-purple text-white text-xs font-heading font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
                              className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-variant/40 text-on-surface text-xs font-heading font-medium transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    ) : (
                      <div className="pt-1 flex items-center justify-between gap-3">
                        <p className="text-[11px] text-on-surface-variant">
                          Sign in to save your personal emergency contact for 1-tap dialling.
                        </p>
                        <Link
                          href="/login"
                          onClick={onClose}
                          className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-heading font-bold hover:bg-primary-purple transition-all shrink-0"
                        >
                          Sign In
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Section 2: 24/7 Verified Helplines */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500 text-lg">
                    support_agent
                  </span>
                  <h3 className="text-sm font-heading font-bold text-on-surface">
                    Verified 24/7 National Helplines
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Tele-MANAS */}
                  <div className="p-3.5 rounded-2xl bg-surface-container dark:bg-surface-container-high border border-surface-variant/40 flex flex-col justify-between gap-2.5">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-heading font-extrabold text-on-surface">
                          Tele-MANAS
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-heading font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          24/7 Free
                        </span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant mt-1 leading-snug">
                        Govt. of India mental health helpline in 20+ languages.
                      </p>
                    </div>

                    <a
                      href="tel:14416"
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-heading font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">call</span>
                      <span>Call 14416</span>
                    </a>
                  </div>

                  {/* National Emergency */}
                  <div className="p-3.5 rounded-2xl bg-surface-container dark:bg-surface-container-high border border-surface-variant/40 flex flex-col justify-between gap-2.5">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-heading font-extrabold text-on-surface">
                          National Emergency
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-heading font-bold bg-red-500/10 text-red-600 dark:text-red-400">
                          Emergency
                        </span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant mt-1 leading-snug">
                        Immediate police, fire, and medical ambulance emergency services.
                      </p>
                    </div>

                    <a
                      href="tel:112"
                      className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-heading font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">call</span>
                      <span>Call 112</span>
                    </a>
                  </div>

                  {/* KIRAN Helpline */}
                  <div className="p-3.5 rounded-2xl bg-surface-container dark:bg-surface-container-high border border-surface-variant/40 flex flex-col justify-between gap-2.5">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-heading font-extrabold text-on-surface">
                          KIRAN Mental Health
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-heading font-bold bg-primary/10 text-primary">
                          Toll-Free
                        </span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant mt-1 leading-snug">
                        Govt. mental health rehabilitation &amp; psychological support.
                      </p>
                    </div>

                    <a
                      href="tel:18005990019"
                      className="w-full py-2 rounded-xl bg-surface-container-highest hover:bg-primary/20 text-on-surface text-xs font-heading font-bold transition-all border border-surface-variant/50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm text-primary">call</span>
                      <span>1800-599-0019</span>
                    </a>
                  </div>

                  {/* Vandrevala Foundation */}
                  <div className="p-3.5 rounded-2xl bg-surface-container dark:bg-surface-container-high border border-surface-variant/40 flex flex-col justify-between gap-2.5">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-heading font-extrabold text-on-surface">
                          Vandrevala Foundation
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-heading font-bold bg-primary/10 text-primary">
                          Counseling
                        </span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant mt-1 leading-snug">
                        24/7 free psychological counseling and crisis support.
                      </p>
                    </div>

                    <a
                      href="tel:+919999666555"
                      className="w-full py-2 rounded-xl bg-surface-container-highest hover:bg-primary/20 text-on-surface text-xs font-heading font-bold transition-all border border-surface-variant/50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm text-primary">call</span>
                      <span>+91 9999 666 555</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Section 3: Grounding & Calming Breathing Exercise */}
              <div className="p-4 rounded-2xl bg-surface-container/50 dark:bg-surface-container-high/40 border border-surface-variant/30 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">air</span>
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-heading font-bold text-on-surface">
                    Take a Grounding Pause Right Now
                  </h4>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Breathe in gently for 4 seconds... Hold for 4 seconds... Exhale slowly for 4 seconds. Ground your feet onto the floor. You are safe in this moment.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-surface-container dark:bg-surface-container-high/80 border-t border-surface-variant/30 flex items-center justify-between">
              <span className="text-[11px] text-on-surface-variant">
                Manraah Crisis Support Desk
              </span>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-surface-container-highest hover:bg-surface-variant/60 text-on-surface text-xs font-heading font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
