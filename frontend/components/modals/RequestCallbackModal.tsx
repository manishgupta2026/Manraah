"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export interface RequestCallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSegment?: "colleges" | "corporates" | "schools";
}

export default function RequestCallbackModal({
  isOpen,
  onClose,
  defaultSegment = "colleges",
}: RequestCallbackModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    fullName: "",
    workEmail: "",
    phone: "",
    orgName: "",
    segment:
      defaultSegment === "corporates"
        ? "Corporate / Workplace"
        : defaultSegment === "schools"
        ? "School / Coaching Hub"
        : "College / University",
    orgSize: "500 - 2,000",
    interests: [] as string[],
    notes: "",
  });

  // Sync segment if defaultSegment changes or when opened
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        segment:
          defaultSegment === "corporates"
            ? "Corporate / Workplace"
            : defaultSegment === "schools"
            ? "School / Coaching Hub"
            : "College / University",
      }));
    }
  }, [isOpen, defaultSegment]);

  // Lock body scroll and listen for Escape key when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleResetAndClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const interestOptions = [
    "24/7 Anonymous Counselling",
    "Supreme Court 2025 / UGC Compliance",
    "Corporate EAP Suite",
    "Faculty / Manager Training",
    "Crisis Referral & Tele-MANAS Protocol",
    "Wellbeing Diagnostic & Reporting",
  ];

  const handleInterestToggle = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(item)
        ? prev.interests.filter((i) => i !== item)
        : [...prev.interests, item],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!formData.workEmail.trim() || !formData.workEmail.includes("@")) {
      setErrorMessage("Please provide a valid official/work email address.");
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setErrorMessage("Please provide a valid 10-digit phone number.");
      return;
    }
    if (!formData.orgName.trim()) {
      setErrorMessage("Please provide your institution or organization name.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save lead locally to localStorage for institutional telemetry
      const existingLeads = JSON.parse(
        localStorage.getItem("manraah_callback_requests") || "[]"
      );
      const newLead = {
        ...formData,
        id: "lead_" + Date.now(),
        createdAt: new Date().toISOString(),
      };
      existingLeads.push(newLead);
      localStorage.setItem(
        "manraah_callback_requests",
        JSON.stringify(existingLeads)
      );

      // Simulate API response time
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsSuccess(true);
    } catch {
      setErrorMessage("Something went wrong. Please try again or reach out directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setErrorMessage("");
    onClose();
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto overscroll-contain">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleResetAndClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-0"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="callback-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="relative z-10 w-[min(480px,calc(100vw-32px))] max-w-[480px] max-h-[90vh] bg-white dark:bg-[#131916] text-[#211D2E] dark:text-[#F4FAF7] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#B9DFD4]/60 dark:border-[#1E2824] overflow-hidden my-auto flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#B9DFD4]/50 dark:border-[#1E2824] flex items-center justify-between bg-[#F8FCFA] dark:bg-[#111714] shrink-0">
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-10 h-10 rounded-xl bg-[#E3F3EE] dark:bg-[rgba(95,175,138,0.15)] text-[#006F5B] dark:text-[#5FAF8A] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">support_agent</span>
                </div>
                <div className="min-w-0">
                  <h3 id="callback-modal-title" className="font-heading font-bold text-base sm:text-lg text-[#211D2E] dark:text-[#F4FAF7] leading-snug truncate">
                    Request an Institutional Callback
                  </h3>
                  <p className="text-xs text-[#211D2E]/70 dark:text-[#9DB9B0] font-medium truncate">
                    Tailored for Deans, HR Leaders, and Campus Directors
                  </p>
                </div>
              </div>

              <button
                onClick={handleResetAndClose}
                className="w-8 h-8 rounded-full bg-[#E3F3EE] dark:bg-[#18201C] hover:bg-[#D6EFE7] dark:hover:bg-[#22302A] border border-[#B9DFD4]/60 dark:border-[#1E2824] flex items-center justify-center text-[#211D2E] dark:text-[#9DB9B0] dark:hover:text-[#F4FAF7] transition-colors cursor-pointer shrink-0"
                aria-label="Close dialog"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 overflow-y-auto overscroll-contain [scrollbar-width:thin] space-y-4 sm:space-y-4">
              {isSuccess ? (
                /* Success View */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 px-4 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-[#E3F3EE] text-[#006F5B] dark:bg-[#18201C] dark:text-[#5FAF8A] mx-auto flex items-center justify-center shadow-inner border border-[#B9DFD4] dark:border-[#1E2824]">
                    <span className="material-symbols-outlined text-3xl font-bold">check_circle</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-heading font-extrabold text-2xl text-[#211D2E] dark:text-[#F4FAF7]">
                      Callback Scheduled!
                    </h4>
                    <p className="text-sm text-[#211D2E]/80 dark:text-[#D5E6E0] max-w-md mx-auto leading-relaxed">
                      Thank you, <span className="font-bold text-[#211D2E] dark:text-[#F4FAF7]">{formData.fullName}</span>.
                      Our Institutional Care Director will review your requirements for{" "}
                      <span className="font-semibold text-[#006F5B] dark:text-[#5FAF8A]">{formData.orgName}</span> and
                      connect with you at <span className="font-semibold text-[#211D2E] dark:text-[#F4FAF7]">{formData.phone}</span> within 4 business hours.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#E3F3EE]/60 dark:bg-[#131916] border border-[#B9DFD4] dark:border-[#1E2824] text-xs text-[#211D2E]/80 dark:text-[#9DB9B0] text-left space-y-1.5 max-w-md mx-auto">
                    <div className="flex items-center gap-2 text-[#006F5B] dark:text-[#5FAF8A] font-bold">
                      <span className="material-symbols-outlined text-sm">verified_user</span>
                      <span>Next Steps in Your Demo:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] dark:text-[#E4E4E7]">
                      <li>Supreme Court 2025 / UGC Institutional Compliance checklist</li>
                      <li>Anonymous multi-lingual counsellor provisioning walkthrough</li>
                      <li>Custom per-student or per-employee pricing &amp; MoU architecture</li>
                    </ul>
                  </div>

                  <div className="pt-3">
                    <button
                      onClick={handleResetAndClose}
                      className="px-8 py-3 rounded-full bg-primary dark:bg-[#5FAF8A] dark:text-[#112F28] dark:hover:bg-[#006B56] dark:hover:text-[#F4FAF7] text-white font-heading font-bold text-sm shadow-md hover:bg-primary-purple transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Form View */
                <form onSubmit={handleSubmit} className="space-y-3.5 pb-2">
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-error/10 dark:bg-red-950/40 border border-error/30 dark:border-red-900/60 text-error dark:text-red-300 text-xs font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-base shrink-0">error</span>
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Segment Selector */}
                  <div>
                    <label className="block text-xs font-heading font-bold text-[#211D2E] dark:text-[#F4FAF7] mb-1.5">
                      I represent a:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: "College / University", label: "College / Univ", icon: "school" },
                        { id: "Corporate / Workplace", label: "Workplace / EAP", icon: "corporate_fare" },
                        { id: "School / Coaching Hub", label: "School / Coaching", icon: "menu_book" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, segment: item.id })}
                          className={`p-2 rounded-xl border text-[11px] font-heading font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center ${
                            formData.segment === item.id
                              ? "bg-[#C8E7DD] dark:bg-[rgba(95,175,138,0.22)] border-[#006F5B] dark:border-[#1C463C] text-[#005747] dark:text-[#5FAF8A] shadow-xs"
                              : "bg-[#E3F3EE] dark:bg-[#131916] border-[#B9DFD4] dark:border-[#1E2824] text-[#211D2E] dark:text-[#9DB9B0] hover:bg-[#D6EFE7] dark:hover:bg-[#22302A] hover:border-[#96D1C1] dark:hover:border-[#325246]"
                          }`}
                        >
                          <span className={`material-symbols-outlined text-base shrink-0 ${
                            formData.segment === item.id ? "text-[#005747] dark:text-[#5FAF8A]" : "text-[#006F5B]/80 dark:text-[#789990]"
                          }`}>{item.icon}</span>
                          <span className="leading-tight">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-heading font-bold text-[#211D2E] dark:text-[#F4FAF7] mb-1">
                        Your Full Name <span className="text-[#006F5B] dark:text-[#5FAF8A]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. Rajesh / Sunita Mehta"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#E3F3EE] dark:bg-[#131916] border border-[#B9DFD4] dark:border-[#1E2824] text-xs font-medium text-[#211D2E] dark:text-[#F4FAF7] placeholder:text-[#9296A3] dark:placeholder:text-[#76968D] focus:outline-none focus:ring-2 focus:ring-[#006F5B]/30 dark:focus:ring-[#5FAF8A]/40 focus:border-[#006F5B] dark:focus:border-[#5FAF8A] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-heading font-bold text-[#211D2E] dark:text-[#F4FAF7] mb-1">
                        Official / Work Email <span className="text-[#006F5B] dark:text-[#5FAF8A]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="name@institute.edu / name@company.com"
                        value={formData.workEmail}
                        onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#E3F3EE] dark:bg-[#131916] border border-[#B9DFD4] dark:border-[#1E2824] text-xs font-medium text-[#211D2E] dark:text-[#F4FAF7] placeholder:text-[#9296A3] dark:placeholder:text-[#76968D] focus:outline-none focus:ring-2 focus:ring-[#006F5B]/30 dark:focus:ring-[#5FAF8A]/40 focus:border-[#006F5B] dark:focus:border-[#5FAF8A] transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone & Organization Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-heading font-bold text-[#211D2E] dark:text-[#F4FAF7] mb-1">
                        Phone Number <span className="text-[#006F5B] dark:text-[#5FAF8A]">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-xs font-bold text-[#211D2E]/70 dark:text-[#76968D]">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="98765 43210"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              phone: e.target.value.replace(/\D/g, ""),
                            })
                          }
                          className="w-full pl-11 pr-3.5 py-2.5 rounded-xl bg-[#E3F3EE] dark:bg-[#131916] border border-[#B9DFD4] dark:border-[#1E2824] text-xs font-medium text-[#211D2E] dark:text-[#F4FAF7] placeholder:text-[#9296A3] dark:placeholder:text-[#76968D] focus:outline-none focus:ring-2 focus:ring-[#006F5B]/30 dark:focus:ring-[#5FAF8A]/40 focus:border-[#006F5B] dark:focus:border-[#5FAF8A] transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-heading font-bold text-[#211D2E] dark:text-[#F4FAF7] mb-1">
                        Organization / Campus Name <span className="text-[#006F5B] dark:text-[#5FAF8A]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., IIT Bombay / Infosys"
                        value={formData.orgName}
                        onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#E3F3EE] dark:bg-[#131916] border border-[#B9DFD4] dark:border-[#1E2824] text-xs font-medium text-[#211D2E] dark:text-[#F4FAF7] placeholder:text-[#9296A3] dark:placeholder:text-[#76968D] focus:outline-none focus:ring-2 focus:ring-[#006F5B]/30 dark:focus:ring-[#5FAF8A]/40 focus:border-[#006F5B] dark:focus:border-[#5FAF8A] transition-all"
                      />
                    </div>
                  </div>

                  {/* Organization Size */}
                  <div>
                    <label className="block text-xs font-heading font-bold text-[#211D2E] dark:text-[#F4FAF7] mb-1.5">
                      Estimated Students / Employees:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {["< 500", "500 - 2,000", "2,000 - 10,000", "10,000+"].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setFormData({ ...formData, orgSize: size })}
                          className={`py-2 px-1 rounded-xl border text-[11px] font-heading font-bold text-center transition-all cursor-pointer ${
                            formData.orgSize === size
                              ? "bg-[#C8E7DD] dark:bg-[rgba(95,175,138,0.22)] border-[#006F5B] dark:border-[#1C463C] text-[#005747] dark:text-[#5FAF8A] shadow-xs"
                              : "bg-[#E3F3EE] dark:bg-[#131916] border-[#B9DFD4] dark:border-[#1E2824] text-[#211D2E] dark:text-[#9DB9B0] hover:bg-[#D6EFE7] dark:hover:bg-[#22302A] hover:border-[#96D1C1] dark:hover:border-[#325246]"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Areas of Interest */}
                  <div>
                    <label className="block text-xs font-heading font-bold text-[#211D2E] dark:text-[#F4FAF7] mb-1.5">
                      Priority Needs (Select all that apply):
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {interestOptions.map((opt) => {
                        const isSelected = formData.interests.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleInterestToggle(opt)}
                            className={`px-3 py-1.5 rounded-full border text-[11px] font-heading font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? "bg-[#C8E7DD] dark:bg-[rgba(95,175,138,0.22)] border-[#006F5B] dark:border-[#1C463C] text-[#005747] dark:text-[#5FAF8A] shadow-xs"
                                : "bg-[#E3F3EE] dark:bg-[#131916] border-[#B9DFD4] dark:border-[#1E2824] text-[#211D2E] dark:text-[#9DB9B0] hover:bg-[#D6EFE7] dark:hover:bg-[#22302A] hover:border-[#96D1C1] dark:hover:border-[#325246]"
                            }`}
                          >
                            {isSelected && (
                              <span className="material-symbols-outlined text-xs text-[#005747] dark:text-[#5FAF8A]">check</span>
                            )}
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Optional Notes */}
                  <div>
                    <label className="block text-xs font-heading font-bold text-[#211D2E] dark:text-[#F4FAF7] mb-1">
                      Specific Notes or Timeline (Optional):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g., Looking to deploy before upcoming semester / quarterly renewal..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#E3F3EE] dark:bg-[#131916] border border-[#B9DFD4] dark:border-[#1E2824] text-xs font-medium text-[#211D2E] dark:text-[#F4FAF7] placeholder:text-[#9296A3] dark:placeholder:text-[#76968D] focus:outline-none focus:ring-2 focus:ring-[#006F5B]/30 dark:focus:ring-[#5FAF8A]/40 focus:border-[#006F5B] dark:focus:border-[#5FAF8A] transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-full bg-primary dark:bg-[#5FAF8A] dark:text-[#112F28] dark:hover:bg-[#006B56] dark:hover:text-[#F4FAF7] text-white font-heading font-bold text-sm shadow-md hover:bg-primary-purple active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Connecting with Institutional Team...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit &amp; Request Instant Callback</span>
                          <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </>
                      )}
                    </button>
                    <p className="text-center text-[11px] text-on-surface-variant/70 dark:text-[#76968D] mt-2">
                      🔒 100% Confidential. DPDP Act compliant. No unsolicited spam.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
