"use client";

import React, { useState, useEffect } from "react";
import AdminCard from "@/frontend/components/ui/AdminCard";
import StatusBadge from "@/frontend/components/ui/StatusBadge";

export default function AdminSettings() {
  const [allowPublicSignups, setAllowPublicSignups] = useState(true);
  const [requireCrisisAck, setRequireCrisisAck] = useState(true);
  const [maxQueueSize, setMaxQueueSize] = useState(25);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setAllowPublicSignups(data.settings.allowPublicSignups ?? true);
            setRequireCrisisAck(data.settings.requireCrisisAck ?? true);
            setMaxQueueSize(data.settings.maxQueueSize ?? 25);
          }
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allowPublicSignups,
          requireCrisisAck,
          maxQueueSize,
        }),
      });

      if (res.ok) {
        showToast("Platform configuration saved successfully.");
      }
    } catch (err) {
      console.error("Error saving settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 select-none max-w-4xl">
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-600">✕</button>
        </div>
      )}

      <AdminCard
        title="Executive System & Platform Settings"
        subtitle="Manage platform safety gates, companion capacity, and infrastructure status."
      >
        <div className="space-y-6">
          {/* Security & Access Controls */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Platform Safety & Access Controls
            </h4>

            {/* Toggle 1: Public Signups */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  Allow Public Member Registrations
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Allows prospective members to complete clinical onboarding assessments and register accounts.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={allowPublicSignups}
                onClick={() => setAllowPublicSignups(!allowPublicSignups)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  allowPublicSignups ? "bg-primary" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    allowPublicSignups ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Crisis Disclaimer */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  Enforce Crisis Escalation Disclaimer
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Displays national 24/7 tele-MANAS & suicide prevention helpline numbers before peer listener matching.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={requireCrisisAck}
                onClick={() => setRequireCrisisAck(!requireCrisisAck)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  requireCrisisAck ? "bg-primary" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    requireCrisisAck ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Input: Companion Queue Size */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  Maximum Concurrent Companion Queue
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Caps waiting members in real-time WebRTC listener dispatch room before routing to AI companion.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={5}
                  max={200}
                  value={maxQueueSize}
                  onChange={(e) => setMaxQueueSize(Number(e.target.value))}
                  className="w-20 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-xs text-slate-500 font-medium">slots</span>
              </div>
            </div>
          </div>

          {/* Infrastructure Health */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Database & Cloud Telemetry
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-900">Neon Cloud PostgreSQL</p>
                  <p className="text-[10px] text-slate-400 font-mono">AWS ap-southeast-1 (Singapore)</p>
                </div>
                <StatusBadge label="Connected" variant="success" size="sm" />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-900">Real-time Socket & WebRTC</p>
                  <p className="text-[10px] text-slate-400 font-mono">WebSocket Gateway Pool</p>
                </div>
                <StatusBadge label="Operational" variant="success" size="sm" />
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-semibold flex items-center gap-2 active:scale-[0.98] transition-all shadow-xs disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">save</span>
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
