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
    <div className="space-y-6 animate-fadeIn select-none">
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold text-center animate-fadeIn">
          ✓ {toastMessage}
        </div>
      )}

      <AdminCard
        title="Executive System & Infrastructure Settings"
        subtitle="Configure platform safety gates, real-time socket parameters, and database security controls."
      >
        <div className="space-y-6 pt-2">
          {/* Security & Access Controls */}
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-sm text-on-surface border-b border-surface-variant/20 pb-2">
              Platform Safety & Access Controls
            </h4>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-container-low">
              <div>
                <p className="text-xs font-bold text-on-surface">Allow Public User Registrations</p>
                <p className="text-[11px] text-on-surface-variant">Enable new members to complete onboarding assessment & signup</p>
              </div>
              <input
                type="checkbox"
                checked={allowPublicSignups}
                onChange={(e) => setAllowPublicSignups(e.target.checked)}
                className="w-5 h-5 accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-container-low">
              <div>
                <p className="text-xs font-bold text-on-surface">Require Crisis Protocol Disclaimer</p>
                <p className="text-[11px] text-on-surface-variant">Display 24/7 crisis helpline numbers before companion sessions</p>
              </div>
              <input
                type="checkbox"
                checked={requireCrisisAck}
                onChange={(e) => setRequireCrisisAck(e.target.checked)}
                className="w-5 h-5 accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-container-low">
              <div>
                <p className="text-xs font-bold text-on-surface">Max Companion Queue Capacity</p>
                <p className="text-[11px] text-on-surface-variant">Maximum waiting members in live companion matching queue</p>
              </div>
              <input
                type="number"
                value={maxQueueSize}
                onChange={(e) => setMaxQueueSize(Number(e.target.value))}
                className="w-20 px-3 py-1.5 rounded-xl bg-surface-container-high text-xs font-bold text-on-surface text-center focus:outline-none"
              />
            </div>
          </div>

          {/* Infrastructure Health */}
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-sm text-on-surface border-b border-surface-variant/20 pb-2">
              Database & Cloud Telemetry
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-surface-container-low flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-on-surface">Neon PostgreSQL Primary</p>
                  <p className="text-[10px] text-on-surface-variant font-mono">ep-crimson-waterfall (AWS ap-southeast-1)</p>
                </div>
                <StatusBadge label="Healthy" variant="success" />
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container-low flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-on-surface">WebRTC Peer Mesh</p>
                  <p className="text-[10px] text-on-surface-variant font-mono">ICE Servers Active</p>
                </div>
                <StatusBadge label="Ready" variant="success" />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-surface-variant/20 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-2xl bg-primary text-white text-xs font-bold shadow-card-lift hover:opacity-95 transition-all flex items-center gap-2"
            >
              <span className={`material-symbols-outlined text-sm ${saving ? 'animate-spin' : ''}`}>save</span>
              {saving ? "Saving Changes..." : "Save Configuration"}
            </button>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
