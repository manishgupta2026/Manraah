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

    const subscribeQueue = () => {
      console.log("⚡ Companion Listener subscribing to companion_queue on connection...");
      socket.emit("join_companion_queue");
    };

    if (socket.connected) {
      subscribeQueue();
    }
    socket.on("connect", subscribeQueue);

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
      socket.off("connect", subscribeQueue);
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
      setActiveUser(null);
    }
  };

  const handleEndChatSession = () => {
    if (activeUser) {
      const socket = getSocketClient();
      socket.emit("queue_end", { roomId: activeUser.id });
    }
    setStep("FLAG");
  };

  const handleSwitchToCall = () => {
    setStep("CALL");
    if (activeUser) {
      const socket = getSocketClient();
      socket.emit("mode_switch", { roomId: activeUser.id, mode: "CALL" });
    }
  };

  const handleSwitchToChat = () => {
    setStep("CHAT");
    if (activeUser) {
      const socket = getSocketClient();
      socket.emit("mode_switch", { roomId: activeUser.id, mode: "CHAT" });
    }
  };

  const handleEndCallSession = () => {
    if (activeUser) {
      const socket = getSocketClient();
      socket.emit("webrtc_end", { roomId: activeUser.id });
    }
    setStep("FLAG");
  };

  const handleFlagComplete = () => {
    setActiveUser(null);
    setStep("DASHBOARD");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Availability Status Banner Bar */}
      <AvailabilityToggle isAvailable={isAvailable} onToggle={handleToggleAvailability} />

      {/* Main Admin Content Switcher */}
      {step === "DASHBOARD" && (
        <div className="space-y-6">
          {/* Active Incoming Support Match Card */}
          {activeUser && isAvailable ? (
            <IncomingMatch
              user={activeUser}
              onAccept={handleAcceptIncoming}
              onDecline={handleDeclineIncoming}
            />
          ) : (
            <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 text-center space-y-2">
              <span className="material-symbols-outlined text-4xl text-primary opacity-50">
                radar
              </span>
              <h3 className="font-heading font-bold text-sm text-on-surface">
                {isAvailable ? "Listening for Incoming Member Requests..." : "Status Offline"}
              </h3>
              <p className="text-xs text-on-surface-variant">
                {isAvailable
                  ? "When an anonymous member requests 1-on-1 support, their match card will appear above automatically."
                  : "Turn on 'Available to Listen' above to receive member requests."}
              </p>
            </div>
          )}

          {/* Active Queued Session Overview Table */}
          <SessionQueue queue={queue} />
        </div>
      )}

      {step === "CHAT" && activeUser && (
        <AdminChatScreen
          user={activeUser}
          onEndSession={handleEndChatSession}
          onSwitchToCall={handleSwitchToCall}
        />
      )}

      {step === "CALL" && activeUser && (
        <AdminCallScreen
          user={activeUser}
          onEndCall={handleEndCallSession}
          onSwitchToChat={handleSwitchToChat}
        />
      )}

      {step === "FLAG" && (
        <PostSessionFlag onComplete={handleFlagComplete} />
      )}
    </div>
  );
}
