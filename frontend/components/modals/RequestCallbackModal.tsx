"use client";

import React, { useState } from "react";
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleResetAndClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative w-full max-w-xl bg-surface-container-lowest dark:bg-[#0B3029] text-on-surface dark:text-[#F4FAF7] rounded-2xl sm:rounded-3xl shadow-2xl border border-surface-variant/30 dark:border-[rgba(150,210,195,0.15)] overflow-hidden my-auto max-h-[92vh] flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-surface-variant/20 dark:border-[rgba(150,210,195,0.12)] flex items-center justify-between bg-surface-container-low/40 dark:bg-[#04382F]/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-[rgba(0,168,137,0.15)] text-primary dark:text-[#00A889] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">support_agent</span>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-on-surface dark:text-[#F4FAF7] leading-snug">
                    Request an Institutional Callback
                  </h3>
                  <p className="text-xs text-on-surface-variant dark:text-[#9DB9B0] font-medium">
                    Tailored for Deans, HR Leaders, and Campus Directors
                  </p>
                </div>
              </div>

              <button
                onClick={handleResetAndClose}
                className="w-8 h-8 rounded-full bg-surface-container dark:bg-[#0E3931] hover:bg-surface-variant/40 dark:hover:bg-[#12463C] flex items-center justify-center text-on-surface-variant dark:text-[#9DB9B0] dark:hover:text-[#F4FAF7] transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto no-scrollbar space-y-5">
              {isSuccess ? (
                /* Success View */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 px-4 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 dark:bg-[#0E3931] dark:text-[#00A889] mx-auto flex items-center justify-center shadow-inner border border-transparent dark:border-[rgba(150,210,195,0.12)]">
                    <span className="material-symbols-outlined text-3xl font-bold">check_circle</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-heading font-extrabold text-2xl text-on-surface dark:text-[#F4FAF7]">
                      Callback Scheduled!
                    </h4>
                    <p className="text-sm text-on-surface-variant dark:text-[#D5E6E0] max-w-md mx-auto leading-relaxed">
                      Thank you, <span className="font-bold text-on-surface dark:text-[#F4FAF7]">{formData.fullName}</span>.
                      Our Institutional Care Director will review your requirements for{" "}
                      <span className="font-semibold text-primary dark:text-[#00A889]">{formData.orgName}</span> and
                      connect with you at <span className="font-semibold text-on-surface dark:text-[#F4FAF7]">{formData.phone}</span> within 4 business hours.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-container-low/70 dark:bg-[#0E3931] border border-surface-variant/20 dark:border-[rgba(150,210,195,0.12)] text-xs text-on-surface-variant dark:text-[#9DB9B0] text-left space-y-1.5 max-w-md mx-auto">
                    <div className="flex items-center gap-2 text-primary dark:text-[#00A889] font-bold">
                      <span className="material-symbols-outlined text-sm">verified_user</span>
                      <span>Next Steps in Your Demo:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] dark:text-[#D5E6E0]">
                      <li>Supreme Court 2025 / UGC Institutional Compliance checklist</li>
                      <li>Anonymous multi-lingual counsellor provisioning walkthrough</li>
                      <li>Custom per-student or per-employee pricing &amp; MoU architecture</li>
                    </ul>
                  </div>

                  <div className="pt-3">
                    <button
                      onClick={handleResetAndClose}
                      className="px-8 py-3 rounded-full bg-primary dark:bg-[#008F78] dark:hover:bg-[#00A889] text-white font-heading font-bold text-sm shadow-md hover:bg-primary-purple transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Form View */
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-error/10 dark:bg-red-950/40 border border-error/30 dark:border-red-900/60 text-error dark:text-red-300 text-xs font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-base shrink-0">error</span>
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Segment Selector */}
                  <div>
                    <label className="block text-xs font-heading font-bold text-on-surface dark:text-[#F4FAF7] mb-1.5">
                      I represent a:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: "College / University", label: "College / University", icon: "school" },
                        { id: "Corporate / Workplace", label: "Corporate / Workplace", icon: "corporate_fare" },
                        { id: "School / Coaching Hub", label: "School / Coaching", icon: "menu_book" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, segment: item.id })}
                          className={`p-2.5 rounded-xl border text-xs font-heading font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            formData.segment === item.id
                              ? "bg-primary/10 dark:bg-[rgba(0,168,137,0.15)] border-primary dark:border-[#00A889] text-primary dark:text-[#73D8C4] shadow-xs"
                              : "bg-surface-container dark:bg-[#082821] border-surface-variant/30 dark:border-[rgba(150,210,195,0.12)] text-on-surface-variant dark:text-[#9DB9B0] hover:bg-surface-variant/30 dark:hover:bg-[#0E3931]"
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-heading font-bold text-on-surface dark:text-[#F4FAF7] mb-1">
                        Your Full Name <span className="text-primary dark:text-[#00A889]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. Rajesh / Sunita Mehta"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container dark:bg-[#082821] border border-surface-variant/40 dark:border-[rgba(150,210,195,0.16)] text-xs font-medium text-on-surface dark:text-[#F4FAF7] placeholder:text-gray-400 dark:placeholder:text-[#789990] focus:outline-none focus:ring-2 focus:ring-primary/40 dark:focus:ring-[#00A889]/40 focus:border-primary dark:focus:border-[#00A889] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-heading font-bold text-on-surface dark:text-[#F4FAF7] mb-1">
                        Official / Work Email <span className="text-primary dark:text-[#00A889]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="name@institute.edu / name@company.com"
                        value={formData.workEmail}
                        onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container dark:bg-[#082821] border border-surface-variant/40 dark:border-[rgba(150,210,195,0.16)] text-xs font-medium text-on-surface dark:text-[#F4FAF7] placeholder:text-gray-400 dark:placeholder:text-[#789990] focus:outline-none focus:ring-2 focus:ring-primary/40 dark:focus:ring-[#00A889]/40 focus:border-primary dark:focus:border-[#00A889] transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone & Organization Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-heading font-bold text-on-surface dark:text-[#F4FAF7] mb-1">
                        Phone Number <span className="text-primary dark:text-[#00A889]">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-xs font-bold text-on-surface-variant/70 dark:text-[#76968D]">
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
                          className="w-full pl-11 pr-3.5 py-2.5 rounded-xl bg-surface-container dark:bg-[#082821] border border-surface-variant/40 dark:border-[rgba(150,210,195,0.16)] text-xs font-medium text-on-surface dark:text-[#F4FAF7] placeholder:text-gray-400 dark:placeholder:text-[#789990] focus:outline-none focus:ring-2 focus:ring-primary/40 dark:focus:ring-[#00A889]/40 focus:border-primary dark:focus:border-[#00A889] transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-heading font-bold text-on-surface dark:text-[#F4FAF7] mb-1">
                        Organization / Campus Name <span className="text-primary dark:text-[#00A889]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., IIT Bombay / Infosys"
                        value={formData.orgName}
                        onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container dark:bg-[#082821] border border-surface-variant/40 dark:border-[rgba(150,210,195,0.16)] text-xs font-medium text-on-surface dark:text-[#F4FAF7] placeholder:text-gray-400 dark:placeholder:text-[#789990] focus:outline-none focus:ring-2 focus:ring-primary/40 dark:focus:ring-[#00A889]/40 focus:border-primary dark:focus:border-[#00A889] transition-all"
                      />
                    </div>
                  </div>

                  {/* Organization Size */}
                  <div>
                    <label className="block text-xs font-heading font-bold text-on-surface dark:text-[#F4FAF7] mb-1.5">
                      Estimated Students / Employees:
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {["< 500", "500 - 2,000", "2,000 - 10,000", "10,000+"].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setFormData({ ...formData, orgSize: size })}
                          className={`py-2 px-1 rounded-xl border text-[11px] font-heading font-bold text-center transition-all cursor-pointer ${
                            formData.orgSize === size
                              ? "bg-secondary/15 dark:bg-[rgba(0,168,137,0.15)] border-secondary dark:border-[#00A889] text-secondary dark:text-[#73D8C4] shadow-xs"
                              : "bg-surface-container dark:bg-[#082821] border-surface-variant/30 dark:border-[rgba(150,210,195,0.12)] text-on-surface-variant dark:text-[#9DB9B0] hover:bg-surface-variant/30 dark:hover:bg-[#0E3931]"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Areas of Interest */}
                  <div>
                    <label className="block text-xs font-heading font-bold text-on-surface dark:text-[#F4FAF7] mb-1.5">
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
                                ? "bg-primary dark:bg-[#008F78] text-white border-primary dark:border-[#008F78] shadow-xs"
                                : "bg-surface-container dark:bg-[#082821] border-surface-variant/30 dark:border-[rgba(150,210,195,0.12)] text-on-surface-variant dark:text-[#9DB9B0] hover:bg-surface-variant/30 dark:hover:bg-[#0E3931]"
                            }`}
                          >
                            {isSelected && (
                              <span className="material-symbols-outlined text-xs">check</span>
                            )}
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Optional Notes */}
                  <div>
                    <label className="block text-xs font-heading font-bold text-on-surface dark:text-[#F4FAF7] mb-1">
                      Specific Notes or Timeline (Optional):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g., Looking to deploy before upcoming semester / quarterly renewal..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-surface-container dark:bg-[#082821] border border-surface-variant/40 dark:border-[rgba(150,210,195,0.16)] text-xs font-medium text-on-surface dark:text-[#F4FAF7] placeholder:text-gray-400 dark:placeholder:text-[#789990] focus:outline-none focus:ring-2 focus:ring-primary/40 dark:focus:ring-[#00A889]/40 focus:border-primary dark:focus:border-[#00A889] transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-full bg-primary dark:bg-[#008F78] dark:hover:bg-[#00A889] text-white font-heading font-bold text-sm shadow-md hover:bg-primary-purple active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
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
}
