"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudentDashboard } from "@/frontend/components/screens/StudentDashboard";

interface Appointment {
  id: number;
  doctor_name: string;
  doctor_title: string;
  doctor_avatar?: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  video_call_url?: string;
}

export function WorkingProfessionalMeetingsContent() {
  const { isDarkMode } = useStudentDashboard();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs: "today" | "upcoming" | "past"
  const [activeTab, setActiveTab] = useState<"today" | "upcoming" | "past">("upcoming");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Appointment | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formParticipant, setFormParticipant] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("02:00 PM");
  const [formVideoUrl, setFormVideoUrl] = useState("");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchMeetings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/working-professional/appointments");
      if (!res.ok) {
        throw new Error("Failed to load meetings.");
      }
      const data = await res.json();
      setAppointments(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load meetings list.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const handleOpenAddModal = () => {
    setEditingMeeting(null);
    setFormTitle("");
    setFormParticipant("");
    const localDateStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
    setFormDate(localDateStr);
    setFormTime("02:00 PM");
    setFormVideoUrl("");
    setShowModal(true);
  };

  const handleOpenEditModal = (appt: Appointment) => {
    setEditingMeeting(appt);
    setFormTitle(appt.doctor_name);
    setFormParticipant(appt.doctor_title);
    setFormDate(appt.appointment_date.split("T")[0]);
    setFormTime(appt.appointment_time);
    setFormVideoUrl(appt.video_call_url || "");
    setShowModal(true);
  };

  const handleSaveMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formParticipant || !formDate || !formTime) {
      triggerToast("Please fill all required fields.");
      return;
    }

    try {
      if (editingMeeting) {
        // Reschedule/edit
        // PATCH api/working-professional/appointments/[id] expects appointmentDate and appointmentTime
        // Wait, what if we also want to update title or participant? The current PATCH endpoint only updates date, time, and status.
        // Let's look at app/api/working-professional/appointments/[id]/route.ts!
        // It has PATCH endpoint. Let's see if we should also make sure it works.
        // Yes, the PATCH endpoint updates appointment_date and appointment_time. Let's send that!
        const res = await fetch(`/api/working-professional/appointments/${editingMeeting.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appointmentDate: formDate,
            appointmentTime: formTime,
            status: "SCHEDULED"
          }),
        });

        if (!res.ok) throw new Error("Failed to reschedule meeting");
        triggerToast("Meeting rescheduled successfully!");
      } else {
        // Create new
        const res = await fetch("/api/working-professional/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doctorName: formTitle,
            doctorTitle: formParticipant,
            doctorAvatar: "/images/avatar_placeholder.jpg",
            appointmentDate: formDate,
            appointmentTime: formTime,
            videoCallUrl: formVideoUrl || "https://meet.google.com/new"
          }),
        });

        if (!res.ok) throw new Error("Failed to schedule meeting");
        triggerToast("Meeting scheduled successfully!");
      }

      setShowModal(false);
      fetchMeetings();
    } catch (err: any) {
      triggerToast(err.message || "Failed to save meeting.");
    }
  };

  const handleCancelMeeting = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this meeting?")) return;

    try {
      const res = await fetch(`/api/working-professional/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (!res.ok) throw new Error("Failed to cancel meeting");
      triggerToast("Meeting cancelled successfully!");
      fetchMeetings();
    } catch (err: any) {
      triggerToast(err.message || "Failed to cancel meeting.");
    }
  };

  const handleDeleteMeeting = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this meeting record?")) return;

    try {
      const res = await fetch(`/api/working-professional/appointments/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete meeting");
      triggerToast("Meeting record deleted successfully!");
      fetchMeetings();
    } catch (err: any) {
      triggerToast(err.message || "Failed to delete meeting.");
    }
  };

  // Filters
  const getFilteredMeetings = () => {
    const todayStr = new Date().toDateString();
    const todayTime = new Date();
    todayTime.setHours(0, 0, 0, 0);

    return appointments.filter((appt) => {
      const apptDate = new Date(appt.appointment_date);
      const apptDateStr = apptDate.toDateString();

      if (activeTab === "today") {
        return apptDateStr === todayStr;
      } else if (activeTab === "upcoming") {
        return apptDate >= todayTime && apptDateStr !== todayStr;
      } else {
        return apptDate < todayTime;
      }
    });
  };

  const filteredMeetings = getFilteredMeetings();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#5F4EA5]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left animate-fadeIn">
      {/* Toast Notice */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-0 right-0 mx-auto z-50 w-fit max-w-[320px] px-4 py-2.5 bg-[#5F4EA5] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg text-center"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-black text-[#100E26] dark:text-slate-100">Meetings</h2>
          <p className="text-xs font-semibold text-slate-450 mt-1">
            Track and manage your upcoming consultations, team collaborations, and 1-on-1 calls.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-2xl bg-[#5F4EA5] hover:bg-[#100E26] text-white font-heading font-black text-[10px] uppercase tracking-wider transition-all shadow-2xs cursor-pointer"
        >
          + Schedule Meeting
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/40 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold">
          ⚠️ {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-px">
        {(["today", "upcoming", "past"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-xs font-black uppercase tracking-widest border-b-2 cursor-pointer transition-all ${
              activeTab === tab
                ? "border-[#5F4EA5] text-[#5F4EA5] dark:text-purple-350"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            {tab === "today" ? "Today's Meetings" : tab === "upcoming" ? "Upcoming" : "Past"}
          </button>
        ))}
      </div>

      {/* Meetings List */}
      <div className="p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <h3 className="font-heading font-black text-xs text-[#100E26] dark:text-slate-100 uppercase tracking-widest">
          {activeTab === "today" ? "Today" : activeTab === "upcoming" ? "Upcoming" : "Past"} Meetings ({filteredMeetings.length})
        </h3>

        {filteredMeetings.length === 0 ? (
          <p className="text-xs text-slate-400 font-bold py-12 text-center">
            No meetings found in this category. Schedule one to get started!
          </p>
        ) : (
          <div className="space-y-3">
            {filteredMeetings.map((appt) => {
              const formattedDate = new Date(appt.appointment_date).toLocaleDateString([], {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={appt.id}
                  className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/30 dark:border-slate-750 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left"
                >
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        appt.status === "SCHEDULED" ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600" : "bg-red-50 dark:bg-red-950/20 text-red-500"
                      }`}>
                        {appt.status}
                      </span>
                      <span className="text-[9px] font-black text-[#5F4EA5] dark:text-purple-300 bg-[#5F4EA5]/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {appt.doctor_title}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-slate-850 dark:text-slate-250">
                      {appt.doctor_name}
                    </h4>

                    <p className="text-[10px] text-slate-400 font-bold">
                      🗓️ {formattedDate} | ⏱️ {appt.appointment_time}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {appt.video_call_url && appt.status !== "CANCELLED" && (
                      <a
                        href={appt.video_call_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-[#5F4EA5] hover:bg-[#100E26] text-white text-[9px] font-black uppercase tracking-wider transition-all text-center cursor-pointer shadow-2xs"
                      >
                        Join Call 💻
                      </a>
                    )}

                    {appt.status !== "CANCELLED" && (
                      <button
                        onClick={() => handleOpenEditModal(appt)}
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-550 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Reschedule
                      </button>
                    )}

                    {appt.status === "SCHEDULED" ? (
                      <button
                        onClick={() => handleCancelMeeting(appt.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-all"
                        title="Cancel Meeting"
                      >
                        <span className="material-symbols-outlined text-sm leading-none">block</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeleteMeeting(appt.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-all"
                        title="Delete Record"
                      >
                        <span className="material-symbols-outlined text-sm leading-none">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule Meeting Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-md rounded-[32px] bg-white dark:bg-[#132E3F] border border-slate-200 dark:border-slate-800 p-7 shadow-2xl space-y-6 text-left"
            >
              <div>
                <h3 className="font-heading font-black text-sm text-[#100E26] dark:text-slate-100 uppercase tracking-widest">
                  {editingMeeting ? "Reschedule Meeting" : "Schedule Meeting"}
                </h3>
                <p className="text-[10px] font-semibold text-slate-400 mt-1">
                  Book a collaborative or wellness meeting on your agenda.
                </p>
              </div>

              <form onSubmit={handleSaveMeeting} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                    Meeting Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Design Sync / Therapy Session"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-250 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                    Participant / Meeting Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={formParticipant}
                    onChange={(e) => setFormParticipant(e.target.value)}
                    placeholder="e.g. Wellness Coach / Engineering Team"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-250 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      Meeting Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-250 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      Meeting Time *
                    </label>
                    <input
                      type="text"
                      required
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      placeholder="e.g. 02:00 PM"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-250 font-bold"
                    />
                  </div>
                </div>

                {!editingMeeting && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      Video Call Link
                    </label>
                    <input
                      type="text"
                      value={formVideoUrl}
                      onChange={(e) => setFormVideoUrl(e.target.value)}
                      placeholder="e.g. https://meet.google.com/abc-defg-hij"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-250 font-semibold"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-550 hover:bg-slate-50 dark:hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-2xl bg-[#5F4EA5] hover:bg-[#100E26] text-white text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all text-center shadow-md"
                  >
                    {editingMeeting ? "Reschedule" : "Schedule"}
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
