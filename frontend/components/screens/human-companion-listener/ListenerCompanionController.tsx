"use client";

import React, { useState, useEffect } from "react";
import AvailabilityToggle from "./AvailabilityToggle";
import IncomingMatch from "./IncomingMatch";
import SessionQueue from "./SessionQueue";
import ListenerChatScreen from "./ListenerChatScreen";
import ListenerCallScreen from "./ListenerCallScreen";
import PostSessionFlag from "./PostSessionFlag";
import { getSocketClient } from "@/frontend/lib/realtime/socketClient";
import { AnonymizedUser } from "@/backend/types";

type ListenerStep = "DASHBOARD" | "CHAT" | "CALL" | "FLAG";

export default function ListenerCompanionController() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [step, setStep] = useState<ListenerStep>("DASHBOARD");
  const [activeUser, setActiveUser] = useState<AnonymizedUser | null>(null);
  const [queue, setQueue] = useState<AnonymizedUser[]>([]);

  useEffect(() => {
    const socket = getSocketClient();

    const subscribeQueue = () => {
      socket.emit("join_companion_queue");
    };

    if (socket.connected) {
      subscribeQueue();
    }
    socket.on("connect", subscribeQueue);

    const handleQueueUpdate = (data: { action: string; room?: any; roomId?: string }) => {
      if (data.action === "join" && data.room) {
        const newUser: AnonymizedUser = {
          id: data.room.roomId,
          userTag: data.room.alias || `Member #${data.room.roomId?.slice(-4)}`,
          categoryTag: data.room.category || "Student",
          topic: data.room.topic || "General Restorative Support",
          waitTime: "Just now",
        };
        setQueue((prev) => {
          if (prev.some((u) => u.id === newUser.id)) return prev;
          return [...prev, newUser];
        });
      } else if (data.action === "accept" && data.roomId) {
        setQueue((prev) => prev.filter((u) => u.id !== data.roomId));
      }
    };

    socket.on("companion_queue_updated", handleQueueUpdate);

    return () => {
      socket.off("connect", subscribeQueue);
      socket.off("companion_queue_updated", handleQueueUpdate);
    };
  }, []);

  const handleAcceptMatch = (user: AnonymizedUser) => {
    setActiveUser(user);
    const socket = getSocketClient();
    socket.emit("accept_companion_match", { roomId: user.id });
    setStep("CHAT");
  };

  const handleDeclineMatch = (user: AnonymizedUser) => {
    setQueue((prev) => prev.filter((u) => u.id !== user.id));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto select-none">
      {step === "DASHBOARD" && (
        <>
          <AvailabilityToggle
            isAvailable={isAvailable}
            onToggle={() => setIsAvailable(!isAvailable)}
          />

          {isAvailable && queue.length > 0 && (
            <IncomingMatch
              user={queue[0]}
              onAccept={() => handleAcceptMatch(queue[0])}
              onDecline={() => handleDeclineMatch(queue[0])}
            />
          )}

          <SessionQueue
            queue={queue}
            onAccept={handleAcceptMatch}
          />
        </>
      )}

      {step === "CHAT" && activeUser && (
        <ListenerChatScreen
          user={activeUser}
          onEndSession={() => setStep("FLAG")}
          onSwitchToCall={() => setStep("CALL")}
        />
      )}

      {step === "CALL" && activeUser && (
        <ListenerCallScreen
          user={activeUser}
          onEndCall={() => setStep("FLAG")}
          onSwitchToChat={() => setStep("CHAT")}
        />
      )}

      {step === "FLAG" && activeUser && (
        <PostSessionFlag
          user={activeUser}
          onSubmit={() => {
            setStep("DASHBOARD");
            setActiveUser(null);
          }}
        />
      )}
    </div>
  );
}
