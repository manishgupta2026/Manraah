"use client";

import React, { useState } from "react";
import { MOCK_USER } from "@/frontend/lib/mock-data";

export default function SettingsPrivacyScreen() {
  const [dataSharing, setDataSharing] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-3">
        <span className="px-4 py-1.5 rounded-full bg-primary-container/20 text-primary text-xs font-semibold uppercase tracking-wider">
          Account & Confidentiality
        </span>
        <h1 className="text-3xl font-heading font-bold text-on-surface">Settings & Privacy Controls</h1>
        <p className="text-sm text-on-surface-variant max-w-xl">
          Manage your personal profile, notification triggers, and data encryption preferences.
        </p>
      </div>

      {/* User Profile Card */}
      <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary-container/20 border-4 border-primary/20 flex items-center justify-center font-bold text-primary text-2xl">
          AS
        </div>
        <div className="space-y-1">
          <h3 className="font-heading font-bold text-xl text-on-surface">{MOCK_USER.name}</h3>
          <p className="text-xs text-on-surface-variant">{MOCK_USER.email}</p>
          <span className="inline-block px-3 py-1 rounded-full bg-mint/20 text-secondary text-xs font-semibold mt-2">
            Sanctuary Member • {MOCK_USER.streakDays} Day Streak
          </span>
        </div>
      </div>

      {/* Privacy Toggles */}
      <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-6">
        <h3 className="font-heading font-bold text-xl text-on-surface">Privacy & Security</h3>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low border border-surface-variant/30">
          <div>
            <h4 className="font-heading font-bold text-sm text-on-surface">End-to-End Log Encryption</h4>
            <p className="text-xs text-on-surface-variant">Your check-ins and journal entries are encrypted client-side.</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-mint/20 text-secondary text-xs font-bold">Enabled</span>
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low border border-surface-variant/30">
          <div>
            <h4 className="font-heading font-bold text-sm text-on-surface">Daily Mindful Notifications</h4>
            <p className="text-xs text-on-surface-variant">Receive gentle reminders for morning check-ins and evening sleep audio.</p>
          </div>
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low border border-surface-variant/30">
          <div>
            <h4 className="font-heading font-bold text-sm text-on-surface">Anonymous Research Data Sharing</h4>
            <p className="text-xs text-on-surface-variant">Opt-in to help improve mental health research without revealing identity.</p>
          </div>
          <input
            type="checkbox"
            checked={dataSharing}
            onChange={(e) => setDataSharing(e.target.checked)}
            className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
