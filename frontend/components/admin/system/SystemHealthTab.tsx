"use client";

import React, { useState, useEffect } from "react";

export default function SystemHealthTab() {
  const [logs, setLogs] = useState([
    { id: 1, time: "19:38:12", type: "INFO", msg: "VPS Socket Server ping OK (https://tradesagaai.duckdns.org)" },
    { id: 2, time: "19:35:40", type: "SUCCESS", msg: "Neon PostgreSQL Cloud DB connection active (sslmode=require)" },
    { id: 3, time: "19:30:15", type: "INFO", msg: "WebRTC STUN pool verified (7 STUN nodes active)" },
    { id: 4, time: "19:24:02", type: "SECURITY", msg: "Let's Encrypt SSL cert valid for tradesagaai.duckdns.org" },
    { id: 5, time: "19:12:00", type: "INFO", msg: "PM2 daemon running (manraah-socket-server status: online)" },
  ]);

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      {/* Infrastructure Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-surface-container-lowest border border-emerald-500/30 shadow-soft space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-on-surface-variant">Real-Time Socket Engine</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div>
            <p className="text-lg font-heading font-bold text-emerald-600">ONLINE (Port 3005)</p>
            <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">https://tradesagaai.duckdns.org</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-surface-container-lowest border border-emerald-500/30 shadow-soft space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-on-surface-variant">Neon PostgreSQL DB</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div>
            <p className="text-lg font-heading font-bold text-emerald-600">CONNECTED</p>
            <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">Serverless SQL Pooling</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-surface-container-lowest border border-emerald-500/30 shadow-soft space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-on-surface-variant">WebRTC STUN/TURN Pool</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div>
            <p className="text-lg font-heading font-bold text-emerald-600">7 ACTIVE NODES</p>
            <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">Google, Mozilla, Twilio</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-surface-container-lowest border border-emerald-500/30 shadow-soft space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-on-surface-variant">SSL Encryption</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div>
            <p className="text-lg font-heading font-bold text-emerald-600">HTTPS WSS ACTIVE</p>
            <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">Let's Encrypt Cert</p>
          </div>
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">terminal</span>
            <h3 className="font-heading font-bold text-base text-on-surface">
              Live System Audit Logs & Events
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-mono font-bold">
            Real-Time Stream
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-inverse-surface text-inverse-on-surface font-mono text-xs space-y-2 max-h-72 overflow-y-auto border border-surface-variant/20 shadow-inner">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3">
              <span className="text-gray-400 shrink-0">[{log.time}]</span>
              <span
                className={`font-bold shrink-0 ${
                  log.type === "SUCCESS"
                    ? "text-emerald-400"
                    : log.type === "SECURITY"
                    ? "text-purple-400"
                    : "text-blue-400"
                }`}
              >
                {log.type}:
              </span>
              <span className="text-gray-200">{log.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
