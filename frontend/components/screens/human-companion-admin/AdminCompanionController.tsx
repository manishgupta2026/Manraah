"use client";

import React, { useState, useEffect } from "react";
import AvailabilityToggle from "./AvailabilityToggle";
import IncomingMatch from "./IncomingMatch";
import SessionQueue from "./SessionQueue";
import AdminChatScreen from "./AdminChatScreen";
import AdminCallScreen from "./AdminCallScreen";
import PostSessionFlag from "./PostSessionFlag";
import { getSocketClient } from "@/frontend/lib/realtime/socketClient";
import { AnonymizedUser } from "@/backend/types";

type AdminStep = "DASHBOARD" | "CHAT" | "CALL" | "FLAG";

export default function AdminCompanionController() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [step, setStep] = useState<AdminStep>("DASHBOARD");
  const [activeUser, setActiveUser] = useState<AnonymizedUser | null>(null);
  const [queue, setQueue] = useState<AnonymizedUser[]>([]);

  useEffect(() => {
    const socket = getSocketClient();
    socket.emit("join_companion_queue");

    const handleQueueUpdate = (data: { action: string; room?: any; roomId?: string }) => {
      console.log("⚡ Listener Console received queue update:", data);
      if (data.action === "join" && data.room) {
        const incomingUser: AnonymizedUser = {
          id: data.room.id,
          userTag: data.room.userTag || "Anonymous Member #104",
          categoryTag: data.room.categoryTag || "Student",
          topic: data.room.topic || "Emotional Venting & Guidance",
          waitTime: "Just now",
        };

        setActiveUser(incomingUser);
      } else if (data.action === "end") {
        if (data.roomId === activeUser?.id) {
          setActiveUser(null);
          setStep("DASHBOARD");
        }
        setQueue((prev) => prev.filter((q) => q.id !== data.roomId));
      }
    };

    const handleModeSwitch = (data: { mode: "CHAT" | "CALL" }) => {
      if (data.mode === "CALL") setStep("CALL");
      if (data.mode === "CHAT") setStep("CHAT");
    };

    const handleSessionEnded = () => {
      console.log("⚡ Real-time session ended by user");
      setActiveUser(null);
      setStep("FLAG");
    };

    socket.on("queue_update", handleQueueUpdate);
    socket.on("mode_switch", handleModeSwitch);
    socket.on("session_ended", handleSessionEnded);

    return () => {
      socket.off("queue_update", handleQueueUpdate);
      socket.off("mode_switch", handleModeSwitch);
      socket.off("session_ended", handleSessionEnded);
    };
  }, [activeUser?.id]);

  const handleToggleAvailability = (newStatus: boolean) => {
    setIsAvailable(newStatus);
    if (newStatus) {
      const socket = getSocketClient();
      socket.emit("join_companion_queue");
    } else {
      setActiveUser(null);
    }
  };

  const handleAcceptIncoming = () => {
    if (!activeUser) return;
    const socket = getSocketClient();
    socket.emit("queue_accept", {
      roomId: activeUser.id,
      companionAlias: "Peer Listener #104",
    });
    socket.emit("join_room", { roomId: activeUser.id, userAlias: "Peer Listener #104" });
    setStep("CHAT");
  };

  const handleDeclineIncoming = () => {
    if (activeUser) {
      const socket = getSocketClient();
      socket.emit("queue_end", { roomId: activeUser.id });
    }
    setActiveUser(null);
  };

  const handleSelectFromQueue = (user: AnonymizedUser) => {
    setActiveUser(user);
    const socket = getSocketClient();
    socket.emit("queue_accept", {
      roomId: user.id,
      companionAlias: "Peer Listener #104",
    });
    socket.emit("join_room", { roomId: user.id, userAlias: "Peer Listener #104" });
    setQueue((prev) => prev.filter((q) => q.id !== user.id));
    setStep("CHAT");
  };

  const handleSwitchMode = (mode: "CHAT" | "CALL") => {
    setStep(mode);
    if (activeUser) {
      const socket = getSocketClient();
      socket.emit("mode_switch", { roomId: activeUser.id, mode });
    }
  };

  const handleEndSession = () => {
    if (activeUser) {
      const socket = getSocketClient();
      socket.emit("queue_end", { roomId: activeUser.id });
    }
    setStep("FLAG");
  };

  const handleFlagComplete = () => {
    setActiveUser(null);
    setStep("DASHBOARD");
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8 animate-fadeIn">
      {/* Top Title Banner */}
      <div className="flex items-center justify-between border-b border-surface-variant/20 pb-4">
        <div>
          <span className="px-3.5 py-1 rounded-full bg-peach/30 text-tertiary text-xs font-bold uppercase tracking-wider">
            Admin Listener Portal
          </span>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-on-surface mt-1">
            Human Companion Operations Console
          </h1>
        </div>
        <div className="text-right">
          <span className="px-3 py-1 rounded-full bg-mint/30 text-secondary text-xs font-bold">
            Role: Admin Listener
          </span>
        </div>
      </div>

      {step === "DASHBOARD" && (
        <div className="space-y-6">
          <AvailabilityToggle isAvailable={isAvailable} onToggle={handleToggleAvailability} />

          {isAvailable && activeUser && (
            <IncomingMatch
              user={activeUser}
              onAccept={handleAcceptIncoming}
              onDecline={handleDeclineIncoming}
            />
          )}

          {isAvailable && !activeUser && (
            <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 text-center space-y-2">
              <span className="material-symbols-outlined text-4xl text-secondary animate-pulse block mx-auto">
                sensors
              </span>
              <h4 className="font-heading font-bold text-base text-on-surface">Listening Queue Active</h4>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                Standing by for real incoming 1-on-1 support requests from sanctuary members...
              </p>
            </div>
          )}

          <SessionQueue queue={queue} onSelectUser={handleSelectFromQueue} />
        </div>
      )}

      {(step === "CHAT" || step === "CALL") && (
        <>
          {step === "CHAT" && (
            <AdminChatScreen
              user={activeUser || { id: "sess_active", userTag: "Anonymous Member #104", categoryTag: "Student", topic: "Emotional Venting", waitTime: "Just now" }}
              onEndSession={handleEndSession}
              onSwitchToCall={() => handleSwitchMode("CALL")}
              onTriggerFlag={() => setStep("FLAG")}
            />
          )}

          {step === "CALL" && (
            <AdminCallScreen
              user={activeUser || { id: "sess_active", userTag: "Anonymous Member #104", categoryTag: "Student", topic: "Emotional Venting", waitTime: "Just now" }}
              onEndCall={handleEndSession}
              onSwitchToChat={() => handleSwitchMode("CHAT")}
              onTriggerFlag={() => setStep("FLAG")}
            />
          )}
        </>
      )}

      {step === "FLAG" && (
        <PostSessionFlag onComplete={handleFlagComplete} />
      )}
    </div>
  );
}
