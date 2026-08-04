"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const MOOD_VALUES: Record<string, { value: number; emoji: string; color: string }> = {
  Amazing: { value: 10, emoji: "😊", color: "#10B981" },
  Happy: { value: 9, emoji: "😁", color: "#34D399" },
  Calm: { value: 8, emoji: "😌", color: "#60A5FA" },
  Good: { value: 7, emoji: "🙂", color: "#818CF8" },
  Neutral: { value: 6, emoji: "😐", color: "#9CA3AF" },
  Low: { value: 5, emoji: "😔", color: "#6366F1" },
  Sad: { value: 4, emoji: "😢", color: "#3B82F6" },
  Anxious: { value: 3, emoji: "😣", color: "#F59E0B" },
  Frustrated: { value: 2, emoji: "😡", color: "#F97316" },
  Overwhelmed: { value: 1, emoji: "😩", color: "#EC4899" },
  Exhausted: { value: 0, emoji: "😴", color: "#EF4444" },
};

const STRESS_LEVELS = ["Low", "Medium", "High", "Very High"];

export default function MoodInsightsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState("week"); // today, week, month, year, all
  const [history, setHistory] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<any>(null);
  const [monthlySummary, setMonthlySummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Edit / delete state
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [editMood, setEditMood] = useState("");
  const [editEnergy, setEditEnergy] = useState(5);
  const [editStress, setEditStress] = useState("Medium");
  const [editReflection, setEditReflection] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [histRes, insRes, weekRes, monthRes] = await Promise.all([
        fetch(`/api/mood?filter=${filter}`),
        fetch("/api/mood/insights"),
        fetch("/api/mood/weekly"),
        fetch("/api/mood/monthly"),
      ]);

      if (histRes.ok) setHistory(await histRes.json());
      if (insRes.ok) setInsights(await insRes.json());
      if (weekRes.ok) setWeeklySummary(await weekRes.json());
      if (monthRes.ok) setMonthlySummary(await monthRes.json());
    } catch (err) {
      console.error("Error loading insights data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this sanctuary log?")) return;
    try {
      const res = await fetch(`/api/mood/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error("Failed to delete mood entry:", err);
    }
  };

  const startEdit = (entry: any) => {
    setEditingEntry(entry);
    setEditMood(entry.mood);
    setEditEnergy(entry.energy);
    setEditStress(entry.stress);
    setEditReflection(entry.reflection || "");
  };

  const handleUpdate = async () => {
    if (!editingEntry) return;
    try {
      const res = await fetch(`/api/mood/${editingEntry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: editMood,
          energy: editEnergy,
          stress: editStress,
          reflection: editReflection,
          factors: editingEntry.factors,
        }),
      });

      if (res.ok) {
        setEditingEntry(null);
        loadData();
      }
    } catch (err) {
      console.error("Failed to update mood entry:", err);
    }
  };

  // Helper to draw custom SVG Line Graph path for Mood Timeline
  const getLinePath = (data: any[], width: number, height: number) => {
    if (data.length < 2) return "";
    const points = data.map((item, idx) => {
      const x = (idx / (data.length - 1)) * (width - 40) + 20;
      const moodInfo = MOOD_VALUES[item.mood] || { value: 5 };
      const y = height - ((moodInfo.value / 10) * (height - 40) + 20);
      return { x, y };
    });

    // Generate cubic bezier curve commands
    return points.reduce((acc, p, i, arr) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = arr[i - 1];
      const cpX1 = prev.x + (p.x - prev.x) / 3;
      const cpY1 = prev.y;
      const cpX2 = prev.x + 2 * (p.x - prev.x) / 3;
      const cpY2 = p.y;
      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
    }, "");
  };

  // Helper to draw custom SVG Area Graph path for Energy Trend
  const getAreaPath = (data: any[], width: number, height: number) => {
    if (data.length < 2) return "";
    const points = data.map((item, idx) => {
      const x = (idx / (data.length - 1)) * (width - 40) + 20;
      const y = height - ((item.energy / 10) * (height - 40) + 20);
      return { x, y };
    });

    const startX = points[0].x;
    const endX = points[points.length - 1].x;

    const linePath = points.reduce((acc, p, i, arr) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = arr[i - 1];
      const cpX1 = prev.x + (p.x - prev.x) / 3;
      const cpY1 = prev.y;
      const cpX2 = prev.x + 2 * (p.x - prev.x) / 3;
      const cpY2 = p.y;
      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
    }, "");

    return `${linePath} L ${endX} ${height - 10} L ${startX} ${height - 10} Z`;
  };

  // Custom radial distribution calculation
  const getRadialDistribution = () => {
    const distribution: Record<string, number> = {};
    history.forEach((e) => {
      distribution[e.mood] = (distribution[e.mood] || 0) + 1;
    });

    const total = history.length || 1;
    let accumulatedAngle = 0;

    return Object.entries(distribution).map(([mood, count]) => {
      const percentage = (count / total) * 100;
      const angle = (count / total) * 360;
      const startAngle = accumulatedAngle;
      accumulatedAngle += angle;
      const color = MOOD_VALUES[mood]?.color || "#7C6BC4";
      
      // Calculate arc path
      const radStart = (startAngle - 90) * (Math.PI / 180);
      const radEnd = (startAngle + angle - 90) * (Math.PI / 180);
      const x1 = 75 + 50 * Math.cos(radStart);
      const y1 = 75 + 50 * Math.sin(radStart);
      const x2 = 75 + 50 * Math.cos(radEnd);
      const y2 = 75 + 50 * Math.sin(radEnd);
      const largeArc = angle > 180 ? 1 : 0;

      const path = `M 75 75 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;

      return { mood, percentage, path, color };
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-6 px-4 animate-fadeIn select-none">
      
      {/* 1. Conversational Landing Greeting */}
      <section className="text-center py-8 space-y-4">
        <span className="text-4xl block animate-bounce">🌿</span>
        <h1 className="text-3xl md:text-5xl font-heading font-black text-on-surface leading-tight tracking-tight">
          How are you feeling today?
        </h1>
        <p className="text-sm md:text-base text-on-surface-variant max-w-sm mx-auto leading-relaxed">
          Take a moment. There is no right or wrong emotion. Your sanctuary analytics are ready.
        </p>

        <div className="pt-4">
          <button
            onClick={() => router.push("/mood-checkin")}
            className="px-10 py-4 rounded-full bg-primary hover:bg-primary-purple text-white font-bold text-sm shadow-md hover:shadow-lg transition-all scale-102 hover:scale-105 active:scale-98"
          >
            Start Mood Check-in
          </button>
        </div>
      </section>

      {/* 2. Filter Navigation Bar */}
      <div className="flex justify-center gap-1.5 p-1 rounded-full bg-surface-container-low max-w-md mx-auto border border-surface-variant/20">
        {["today", "week", "month", "year", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all uppercase tracking-wider ${
              filter === f
                ? "bg-white text-primary shadow-sm"
                : "text-on-surface-variant/70 hover:text-on-surface"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">spa</span>
          <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Syncing dashboard data...</p>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* 3. Intelligent SVG Visualizations */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Chart 1: Mood Timeline */}
            <div className="p-6 rounded-[32px] bg-white border border-surface-variant/10 shadow-soft space-y-4">
              <h3 className="text-sm font-heading font-extrabold text-on-surface tracking-tight">Mood Timeline (Bezier Trend)</h3>
              <div className="h-[200px] w-full flex items-center justify-center">
                {history.length < 2 ? (
                  <p className="text-xs text-on-surface-variant">Log at least two entries to view Bezier paths.</p>
                ) : (
                  <svg className="w-full h-full" viewBox="0 0 300 150">
                    <defs>
                      <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7C6BC4" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#7C6BC4" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d={getLinePath(history.slice().reverse(), 300, 150)}
                      fill="none"
                      stroke="#7C6BC4"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>
            </div>

            {/* Chart 2: Mood Distribution (Concentric rings) */}
            <div className="p-6 rounded-[32px] bg-white border border-surface-variant/10 shadow-soft space-y-4">
              <h3 className="text-sm font-heading font-extrabold text-on-surface tracking-tight">Mood Distribution</h3>
              <div className="flex items-center justify-around h-[200px]">
                {history.length === 0 ? (
                  <p className="text-xs text-on-surface-variant">No check-ins logged.</p>
                ) : (
                  <>
                    <svg className="w-36 h-36" viewBox="0 0 150 150">
                      {getRadialDistribution().map((sector, idx) => (
                        <path key={idx} d={sector.path} fill={sector.color} className="hover:opacity-85 transition-opacity" />
                      ))}
                    </svg>
                    <div className="space-y-1.5 text-left max-h-[160px] overflow-y-auto pr-2 scrollbar-thin">
                      {getRadialDistribution().map((s, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="text-[10px] font-bold text-on-surface">{s.mood} ({Math.round(s.percentage)}%)</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Chart 3: Energy Trend Area */}
            <div className="p-6 rounded-[32px] bg-white border border-surface-variant/10 shadow-soft space-y-4">
              <h3 className="text-sm font-heading font-extrabold text-on-surface tracking-tight">Energy Trend (1-10 area)</h3>
              <div className="h-[200px] w-full flex items-center justify-center">
                {history.length < 2 ? (
                  <p className="text-xs text-on-surface-variant">Log entries to map energy areas.</p>
                ) : (
                  <svg className="w-full h-full" viewBox="0 0 300 150">
                    <defs>
                      <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34D399" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#34D399" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d={getAreaPath(history.slice().reverse(), 300, 150)}
                      fill="url(#areaGlow)"
                    />
                    <path
                      d={getLinePath(history.slice().reverse(), 300, 150)}
                      fill="none"
                      stroke="#34D399"
                      strokeWidth="2.5"
                    />
                  </svg>
                )}
              </div>
            </div>

            {/* Chart 4: Stress Index Grid Heatmap */}
            <div className="p-6 rounded-[32px] bg-white border border-surface-variant/10 shadow-soft space-y-4">
              <h3 className="text-sm font-heading font-extrabold text-on-surface tracking-tight">Stress Calendar (Heatmap)</h3>
              <div className="flex flex-wrap gap-2.5 justify-center py-4">
                {history.length === 0 ? (
                  <p className="text-xs text-on-surface-variant">No stress values logged.</p>
                ) : (
                  history.slice(0, 28).reverse().map((entry, idx) => {
                    const color = 
                      entry.stress === "Low" ? "bg-emerald-100 border-emerald-300" :
                      entry.stress === "Medium" ? "bg-amber-100 border-amber-300" :
                      entry.stress === "High" ? "bg-rose-100 border-rose-300" :
                      "bg-red-200 border-red-400";
                    return (
                      <div
                        key={idx}
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center text-[10px] font-bold shadow-sm ${color}`}
                        title={`Logged: ${entry.stress} stress`}
                      >
                        {entry.stress[0]}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </section>

          {/* 4. Weekly & Monthly Summary Panel */}
          {weeklySummary && (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Core Summary stats */}
              <div className="p-6 rounded-[32px] bg-gradient-to-tr from-primary-container/20 to-secondary/15 border border-primary/10 shadow-soft space-y-4">
                <span className="px-3.5 py-1 rounded-full bg-white text-[9px] font-black uppercase tracking-wider text-primary shadow-sm">
                  Weekly Stats
                </span>
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between border-b border-surface-variant/5 pb-1">
                    <span className="text-[10px] text-on-surface-variant font-semibold">Average Mood:</span>
                    <span className="text-xs font-bold text-on-surface">{weeklySummary.avgMood}</span>
                  </div>
                  <div className="flex justify-between border-b border-surface-variant/5 pb-1">
                    <span className="text-[10px] text-on-surface-variant font-semibold">Frequent Mood:</span>
                    <span className="text-xs font-bold text-on-surface">{weeklySummary.frequentMood}</span>
                  </div>
                  <div className="flex justify-between border-b border-surface-variant/5 pb-1">
                    <span className="text-[10px] text-on-surface-variant font-semibold">Best Day:</span>
                    <span className="text-xs font-bold text-on-surface">{weeklySummary.bestDay}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-[10px] text-on-surface-variant font-semibold">Hardest Day:</span>
                    <span className="text-xs font-bold text-on-surface">{weeklySummary.hardestDay}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Triggers / Factors */}
              <div className="p-6 rounded-[32px] bg-white border border-surface-variant/10 shadow-soft space-y-4">
                <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-[9px] font-black uppercase tracking-wider text-emerald-800 shadow-sm">
                  Top Triggers
                </span>
                <div className="space-y-4 pt-2">
                  <div>
                    <p className="text-[10px] text-on-surface-variant/80 font-bold uppercase tracking-widest">Primary Influence</p>
                    <p className="text-xl font-heading font-black text-on-surface mt-1">{weeklySummary.topTrigger}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant/80 font-bold uppercase tracking-widest">Average Stress</p>
                    <p className="text-xl font-heading font-black text-secondary mt-1">{weeklySummary.avgStress}</p>
                  </div>
                </div>
              </div>

              {/* Card 3: AI Calming Recommendations */}
              <div className="p-6 rounded-[32px] bg-white border border-surface-variant/10 shadow-soft space-y-4">
                <span className="px-3.5 py-1 rounded-full bg-indigo-50 text-[9px] font-black uppercase tracking-wider text-indigo-800 shadow-sm">
                  Sanctuary Recommendation
                </span>
                <p className="text-xs text-on-surface leading-relaxed font-semibold pt-2">
                  🌿 "{weeklySummary.aiRecommendation}"
                </p>
              </div>

            </section>
          )}

          {/* 5. Personalised Observation Insights */}
          {insights.length > 0 && (
            <section className="p-8 rounded-[36px] bg-[#FAFBFD] border border-surface-variant/5 shadow-soft space-y-4">
              <h3 className="text-sm font-heading font-extrabold text-on-surface tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">insights</span>
                AI Correlation Observations
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {insights.map((ins, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-surface-variant/10 shadow-sm">
                    <p className="text-xs text-on-surface leading-relaxed font-bold">✓ {ins.insightText}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 6. Timeline Log entries list */}
          <section className="space-y-6">
            <h3 className="text-sm font-heading font-extrabold text-on-surface tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">history</span>
              Sanctuary Log History
            </h3>
            
            <div className="space-y-4 max-w-lg mx-auto">
              {history.map((entry) => {
                const moodInfo = MOOD_VALUES[entry.mood] || { emoji: "🌸", color: "#7C6BC4" };
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="p-5 rounded-3xl bg-white border border-surface-variant/10 shadow-soft flex items-start gap-4 relative overflow-hidden"
                  >
                    <span className="text-3xl">{moodInfo.emoji}</span>
                    <div className="flex-1 space-y-1.5 text-left">
                      <div className="flex items-center justify-between">
                        <h4 className="font-heading font-black text-sm text-on-surface">
                          {entry.mood} check-in
                        </h4>
                        <span className="text-[10px] text-on-surface-variant/75 font-semibold">
                          {new Date(entry.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      
                      {entry.reflection && (
                        <p className="text-xs text-on-surface-variant leading-relaxed font-medium bg-surface-container-low/40 p-3 rounded-xl">
                          "{entry.reflection}"
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-100 text-[8px] font-bold text-on-surface-variant uppercase">
                          ⚡ Energy: {entry.energy}/10
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[8px] font-bold text-indigo-700 uppercase">
                          🕯️ Stress: {entry.stress}
                        </span>
                        {entry.factors && entry.factors.split(",").map((f: string) => (
                          <span key={f} className="px-2.5 py-0.5 rounded-full bg-primary-container/10 border border-primary/10 text-[8px] font-bold text-primary uppercase">
                            {f.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Options: Edit & Delete buttons */}
                    <div className="flex flex-col gap-1 items-end pl-2">
                      <button
                        onClick={() => startEdit(entry)}
                        className="text-[10px] font-bold text-primary hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-[10px] font-bold text-rose-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

        </div>
      )}

      {/* Editing Dialog Modal overlay */}
      {editingEntry && (
        <div className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-6 rounded-[32px] bg-white max-w-sm w-full border border-surface-variant/15 shadow-soft-xl space-y-6 text-left"
          >
            <div>
              <h3 className="font-heading font-black text-base text-on-surface">Edit Sanctuary Reflection</h3>
              <p className="text-[10px] text-on-surface-variant">Update the logs saved on this day.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">Mood:</label>
                <select
                  value={editMood}
                  onChange={(e) => setEditMood(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-surface-container-low border border-surface-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/45 font-semibold text-on-surface"
                >
                  {Object.keys(MOOD_VALUES).map((key) => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">Energy (1-10):</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editEnergy}
                  onChange={(e) => setEditEnergy(Number(e.target.value))}
                  className="w-full p-3.5 rounded-xl bg-surface-container-low border border-surface-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/45 font-semibold text-on-surface"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">Stress:</label>
                <select
                  value={editStress}
                  onChange={(e) => setEditStress(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-surface-container-low border border-surface-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/45 font-semibold text-on-surface"
                >
                  {STRESS_LEVELS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">Reflection Note:</label>
                <textarea
                  rows={3}
                  value={editReflection}
                  onChange={(e) => setEditReflection(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface leading-relaxed"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setEditingEntry(null)}
                className="px-5 py-2.5 rounded-full border border-surface-variant/30 text-xs font-bold text-on-surface-variant"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-6 py-2.5 rounded-full bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-purple"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
