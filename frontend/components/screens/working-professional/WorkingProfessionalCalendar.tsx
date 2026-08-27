"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudentDashboard } from "@/frontend/components/screens/StudentDashboard";
import { getClientSession } from "@/backend/auth/client";

interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  category?: string;
  location?: string;
  start_time: string;
  end_time: string;
  event_date: string;
}

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

export function WorkingProfessionalCalendarContent() {
  const { isDarkMode } = useStudentDashboard();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("Work");
  const [formLocation, setFormLocation] = useState("");
  const [formStartTime, setFormStartTime] = useState("09:00 AM");
  const [formEndTime, setFormEndTime] = useState("10:00 AM");
  const [formDate, setFormDate] = useState("");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchCalendarData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [eventsRes, apptsRes] = await Promise.all([
        fetch("/api/working-professional/schedule"),
        fetch("/api/working-professional/appointments"),
      ]);

      if (!eventsRes.ok || !apptsRes.ok) {
        throw new Error("Failed to load events or meetings data.");
      }

      const eventsJson = await eventsRes.json();
      const apptsJson = await apptsRes.json();

      setEvents(eventsJson || []);
      setAppointments(apptsJson || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to sync calendar.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const buildCells = () => {
    const cells = [];
    const prevMonthDays = new Date(year, month, 0).getDate();

    // Previous month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      cells.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    // Next month padding to complete grid
    const totalCells = Math.ceil(cells.length / 7) * 7;
    const nextMonthPadding = totalCells - cells.length;
    for (let i = 1; i <= nextMonthPadding; i++) {
      cells.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return cells;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleOpenAddModal = () => {
    setEditingEvent(null);
    setFormTitle("");
    setFormDescription("");
    setFormCategory("Work");
    setFormLocation("");
    setFormStartTime("09:00 AM");
    setFormEndTime("10:00 AM");
    // Format selectedDate to YYYY-MM-DD
    const localDateStr = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
    setFormDate(localDateStr);
    setShowModal(true);
  };

  const handleOpenEditModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormTitle(event.title);
    setFormDescription(event.description || "");
    setFormCategory(event.category || "Work");
    setFormLocation(event.location || "");
    setFormStartTime(event.start_time);
    setFormEndTime(event.end_time);
    const dateStr = event.event_date.split("T")[0];
    setFormDate(dateStr);
    setShowModal(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formStartTime || !formEndTime || !formDate) {
      triggerToast("Please fill all required fields.");
      return;
    }

    const payload = {
      title: formTitle,
      description: formDescription,
      category: formCategory,
      location: formLocation,
      startTime: formStartTime,
      endTime: formEndTime,
      eventDate: formDate,
    };

    try {
      const url = editingEvent
        ? `/api/working-professional/schedule/${editingEvent.id}`
        : "/api/working-professional/schedule";
      const method = editingEvent ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save event");
      }

      triggerToast(editingEvent ? "Event updated successfully!" : "Event created successfully!");
      setShowModal(false);
      fetchCalendarData();
    } catch (err: any) {
      triggerToast(err.message || "Failed to save event.");
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const res = await fetch(`/api/working-professional/schedule/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete event");
      }

      triggerToast("Event deleted successfully!");
      fetchCalendarData();
    } catch (err: any) {
      triggerToast(err.message || "Failed to delete event.");
    }
  };

  // Filter Items for Selected Date
  const getSelectedDayItems = () => {
    const dayItems: any[] = [];
    const dateStr = selectedDate.toDateString();

    events.forEach((ev) => {
      const evDate = new Date(ev.event_date).toDateString();
      if (evDate === dateStr) {
        dayItems.push({
          type: "event",
          id: ev.id,
          title: ev.title,
          time: `${ev.start_time} - ${ev.end_time}`,
          desc: ev.description || "No description provided.",
          category: ev.category || "Work",
          location: ev.location,
          raw: ev,
        });
      }
    });

    appointments.forEach((appt) => {
      const apptDate = new Date(appt.appointment_date).toDateString();
      if (apptDate === dateStr) {
        dayItems.push({
          type: "appointment",
          id: appt.id,
          title: `Consultation: ${appt.doctor_name}`,
          time: appt.appointment_time,
          desc: appt.doctor_title,
          status: appt.status,
          videoUrl: appt.video_call_url,
          raw: appt,
        });
      }
    });

    return dayItems.sort((a, b) => a.time.localeCompare(b.time));
  };

  const selectedDayItems = getSelectedDayItems();

  // Upcoming Schedule (Future items limit 5)
  const getUpcomingItems = () => {
    const upcoming: any[] = [];
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    events.forEach((ev) => {
      const evDate = new Date(ev.event_date);
      if (evDate >= todayStart) {
        upcoming.push({
          type: "event",
          title: ev.title,
          date: evDate,
          time: ev.start_time,
          desc: ev.category || "Event",
        });
      }
    });

    appointments.forEach((appt) => {
      const apptDate = new Date(appt.appointment_date);
      if (apptDate >= todayStart && appt.status !== "CANCELLED") {
        upcoming.push({
          type: "appointment",
          title: `Meeting: ${appt.doctor_name}`,
          date: apptDate,
          time: appt.appointment_time,
          desc: "Consultation",
        });
      }
    });

    return upcoming
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  };

  const upcomingItems = getUpcomingItems();

  // Render Day Cells helper to draw indicators
  const getIndicators = (cellDate: Date) => {
    const dateStr = cellDate.toDateString();
    const hasEvent = events.some((ev) => new Date(ev.event_date).toDateString() === dateStr);
    const hasAppt = appointments.some((ap) => new Date(ap.appointment_date).toDateString() === dateStr && ap.status !== "CANCELLED");

    return { hasEvent, hasAppt };
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#5F4EA5]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left animate-fadeIn">
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
          <h2 className="text-2xl font-heading font-black text-[#100E26] dark:text-slate-100">Calendar</h2>
          <p className="text-xs font-semibold text-slate-450 mt-1">
            Manage your schedule, meetings, and personal wellness breaks.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-2xl bg-[#5F4EA5] hover:bg-[#100E26] text-white font-heading font-black text-[10px] uppercase tracking-wider transition-all shadow-2xs cursor-pointer"
        >
          + Add Event
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/40 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold">
          ⚠️ {error}
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Grid Container */}
        <div className="lg:col-span-7 bg-white dark:bg-[#132E3F] p-6 rounded-[28px] border border-slate-200/40 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          {/* Header Controls */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-heading font-black text-sm text-[#100E26] dark:text-slate-100">
              {months[month]} {year}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-xl border border-slate-200/60 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </button>
              <button
                onClick={handleNextMonth}
                className="w-8 h-8 rounded-xl border border-slate-200/60 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {weekDays.map((d) => (
              <span key={d} className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                {d}
              </span>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {buildCells().map((cell, idx) => {
              const isSelected = cell.date.toDateString() === selectedDate.toDateString();
              const isToday = cell.date.toDateString() === new Date().toDateString();
              const { hasEvent, hasAppt } = getIndicators(cell.date);

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(cell.date)}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative cursor-pointer select-none transition-all ${
                    !cell.isCurrentMonth
                      ? "text-slate-300 dark:text-slate-650 opacity-40"
                      : "text-slate-850 dark:text-slate-200"
                  } ${
                    isSelected
                      ? "bg-[#5F4EA5] text-white! dark:text-white! shadow-md"
                      : isToday
                      ? "bg-[#F5F3FC] dark:bg-purple-950/20 border border-[#5F4EA5]/30 text-[#5F4EA5] dark:text-purple-300"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <span className={`text-[11px] font-black ${isSelected ? "text-white" : ""}`}>
                    {cell.day}
                  </span>
                  
                  {/* Indicator Dots */}
                  <div className="flex gap-0.5 mt-0.5 absolute bottom-1.5">
                    {hasEvent && (
                      <span className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-[#5F4EA5]"}`} />
                    )}
                    {hasAppt && (
                      <span className={`w-1 h-1 rounded-full ${isSelected ? "bg-amber-300" : "bg-amber-500"}`} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda and Upcoming Events */}
        <div className="lg:col-span-5 space-y-6">
          {/* Selected Date List */}
          <div className="bg-white dark:bg-[#132E3F] p-6 rounded-[28px] border border-slate-200/40 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
              <h4 className="font-heading font-black text-xs text-[#100E26] dark:text-slate-100 uppercase tracking-widest">
                Schedule: {selectedDate.toLocaleDateString([], { month: "short", day: "numeric" })}
              </h4>
              <span className="text-[10px] text-slate-400 font-bold">
                {selectedDayItems.length} Items
              </span>
            </div>

            {selectedDayItems.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold py-8 text-center">
                No events or meetings scheduled for this date.
              </p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {selectedDayItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border text-left flex items-start justify-between gap-3 ${
                      item.type === "appointment"
                        ? "bg-[#FFF3EC]/40 dark:bg-amber-950/10 border-amber-200/30 dark:border-amber-900/20"
                        : "bg-[#F5F3FC]/40 dark:bg-purple-950/10 border-purple-200/30 dark:border-purple-900/20"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">
                          {item.type === "appointment" ? "🩺" : "⏰"}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#5F4EA5] dark:text-purple-300">
                          {item.time}
                        </span>
                        {item.status && (
                          <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                            item.status === "SCHEDULED" ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600" : "bg-red-50 dark:bg-red-950/20 text-red-500"
                          }`}>
                            {item.status}
                          </span>
                        )}
                      </div>
                      <h5 className="text-xs font-black text-slate-850 dark:text-slate-200">
                        {item.title}
                      </h5>
                      <p className="text-[10px] text-slate-450 font-bold leading-normal">
                        {item.desc}
                      </p>
                      {item.location && (
                        <p className="text-[9px] font-bold text-[#5F4EA5] dark:text-purple-400 truncate">
                          📍 {item.location}
                        </p>
                      )}
                      {item.videoUrl && item.status !== "CANCELLED" && (
                        <a
                          href={item.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-1 hover:underline"
                        >
                          Join Call 💻
                        </a>
                      )}
                    </div>

                    {item.type === "event" && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleOpenEditModal(item.raw)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm leading-none">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(item.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-650 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm leading-none">delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Schedule Card */}
          <div className="bg-white dark:bg-[#132E3F] p-6 rounded-[28px] border border-slate-200/40 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <h4 className="font-heading font-black text-xs text-[#100E26] dark:text-slate-100 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850 pb-3">
              Upcoming Agenda
            </h4>

            {upcomingItems.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold py-4 text-center">
                No upcoming events or consultations.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center gap-4 text-left">
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-black text-slate-850 dark:text-slate-200">
                        {item.title}
                      </h5>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        {item.desc}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-black text-[#5F4EA5] dark:text-purple-300 block">
                        {item.date.toLocaleDateString([], { month: "short", day: "numeric" })}
                      </span>
                      <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                        {item.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Event Modal */}
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
                  {editingEvent ? "Edit Event" : "Create Event"}
                </h3>
                <p className="text-[10px] font-semibold text-slate-400 mt-1">
                  Schedule personal sessions, focus times, or reminders.
                </p>
              </div>

              <form onSubmit={handleSaveEvent} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Stress Reset Session"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-250 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="e.g. Taking 15 mins to clear my thoughts and practice deep breathing."
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-250 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-250 font-bold"
                    >
                      <option value="Work">💼 Work</option>
                      <option value="Wellness">🌸 Wellness</option>
                      <option value="Personal">👤 Personal</option>
                      <option value="Other">✨ Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-250 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      Start Time *
                    </label>
                    <input
                      type="text"
                      required
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      placeholder="e.g. 09:00 AM"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-250 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      End Time *
                    </label>
                    <input
                      type="text"
                      required
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      placeholder="e.g. 10:00 AM"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-250 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                    Location / Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Meeting Room B or https://..."
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-250 font-semibold"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-2xl bg-[#5F4EA5] hover:bg-[#100E26] text-white text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all text-center shadow-md"
                  >
                    {editingEvent ? "Save Changes" : "Create Event"}
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
