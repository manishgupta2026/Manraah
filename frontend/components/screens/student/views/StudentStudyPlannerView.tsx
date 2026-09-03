"use client";

import React from "react";
import { useStudentDashboard } from "@/frontend/components/screens/student/context/StudentDashboardContext";
import { displayTaskDate } from "@/frontend/components/screens/StudentDashboard";

export function StudentStudyPlannerContent() {
  const { tasks, handleToggleTaskComplete, togglingTaskId, setActiveModal, setEditingTaskId, setTaskSubject, setTaskTitle, setTaskPriority, setTaskDate, setTaskDuration } = useStudentDashboard();

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading font-black text-[#100E26] dark:text-slate-100">Study Planner</h2>
          <p className="text-xs font-semibold text-slate-400 mt-1">Organize your academic tasks, routine, and preparation focus.</p>
        </div>
        <button
          onClick={() => {
            setTaskSubject("");
            setTaskTitle("");
            setTaskPriority("Medium");
            setTaskDate(new Date().toISOString().split("T")[0]);
            setTaskDuration(30);
            setEditingTaskId(null);
            setActiveModal("task");
          }}
          className="px-5 py-3 rounded-2xl bg-[#5F4EA5] hover:bg-[#100E26] text-white font-heading font-black text-[10px] uppercase tracking-wider transition-all shadow-2xs cursor-pointer"
        >
          + Add Study Task
        </button>
      </div>

      <div className="p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <h3 className="font-heading font-black text-xs text-[#100E26] dark:text-slate-100 uppercase tracking-widest">
          Your Study Tasks ({tasks.length})
        </h3>

        {tasks.length === 0 ? (
          <p className="text-xs text-slate-400 font-bold py-6 text-center">No tasks planned yet. Add tasks to stay on track.</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task: any) => (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  task.completed
                    ? "bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800 opacity-60"
                    : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/30 dark:border-slate-750 hover:bg-slate-100/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={!!task.completed}
                    disabled={togglingTaskId === task.id}
                    onChange={() => handleToggleTaskComplete(task.id, task.completed)}
                    className="w-4.5 h-4.5 rounded-lg border-slate-300 text-[#5F4EA5] focus:ring-[#5F4EA5] cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black text-[#5F4EA5] dark:text-purple-300 bg-[#5F4EA5]/10 dark:bg-[#5F4EA5]/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {task.subject}
                      </span>
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        task.priority.toLowerCase() === "high" ? "bg-red-50 dark:bg-red-950/20 text-red-600" :
                        task.priority.toLowerCase() === "low" ? "bg-slate-100 dark:bg-slate-850 text-slate-500" :
                        "bg-amber-50 dark:bg-amber-950/20 text-amber-600"
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className={`text-xs font-black text-slate-850 dark:text-slate-200 mt-1.5 ${task.completed ? "line-through" : ""}`}>
                      {task.title}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                      ⏱️ {task.duration || task.duration_minutes || 30} mins | Due: {displayTaskDate(task.date || task.due_date)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setTaskSubject(task.subject);
                    setTaskTitle(task.title);
                    setTaskPriority(task.priority);
                    const taskDateStr = task.date || task.due_date;
                    setTaskDate(taskDateStr ? new Date(taskDateStr).toISOString().split("T")[0] : "");
                    setTaskDuration(task.duration || task.duration_minutes || 30);
                    setEditingTaskId(task.id);
                    setActiveModal("task");
                  }}
                  className="p-2 rounded-xl hover:bg-slate-200/50 text-slate-400 hover:text-slate-650 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
