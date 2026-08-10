"use client";

import React, { useState } from "react";
import AdminCard from "@/frontend/components/ui/AdminCard";
import StatusBadge from "@/frontend/components/ui/StatusBadge";

export default function AdminSettings() {
  const [allowPublicSignups, setAllowPublicSignups] = useState(true);
  const [requireCrisisAck, setRequireCrisisAck] = useState(true);
  const [maxQueueSize, setMaxQueueSize] = useState(25);

  return (
    <div className="space-y-6 animate-fadeIn select-none">
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

          {/* Connected Infrastructure Status */}
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-sm text-on-surface border-b border-surface-variant/20 pb-2">
              Connected Infrastructure Status
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-surface-container-low flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-on-surface">VPS Socket.IO Server</p>
                  <p className="text-[10px] text-on-surface-variant font-mono">https://tradesagaai.duckdns.org</p>
                </div>
                <StatusBadge label="Online" variant="success" pulse />
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container-low flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-on-surface">Neon PostgreSQL Cloud DB</p>
                  <p className="text-[10px] text-on-surface-variant font-mono">Serverless SQL</p>
                </div>
                <StatusBadge label="Synced" variant="success" />
              </div>
            </div>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
