"use client";

import React, { useState, useEffect } from "react";
import EntryModeSelect from "./EntryModeSelect";
import SearchingState from "./SearchingState";
import MatchedScreen from "./MatchedScreen";
import ChatScreen from "./ChatScreen";
import CallScreen from "./CallScreen";
import FeedbackScreen from "./FeedbackScreen";
import { getSocketClient } from "@/frontend/lib/realtime/socketClient";
import { getAnonymizedUserTag } from "@/backend/queries/human-companion";
import { AnonymizedListener } from "@/backend/types";

type Step = "ENTRY" | "SEARCHING" | "MATCHED" | "CHAT" | "CALL" | "FEEDBACK";

export default function HumanCompanionController() {
  const [step, setStep] = useState<Step>("ENTRY");
  const [listener, setListener] = useState<AnonymizedListener | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  useEffect(() => {
    const socket = getSocketClient();

    const handleSessionAccepted = (data: { companionAlias?: string }) => {
      console.log("⚡ Real-time match accepted by listener:", data);
      setListener({
        id: "lst_active",
        displayId: data.companionAlias || "Peer Listener #104",
        contextTag: "Active Listener • Peer Mental Health Support",
        avatarBg: "bg-mint/30 border-mint text-secondary",
        rating: 4.9,
        totalSessions: 142,
      });
      setStep("MATCHED");
    };

    const handleModeSwitch = (data: { mode: "CHAT" | "CALL" }) => {
      if (data.mode === "CALL") setStep("CALL");
      if (data.mode === "CHAT") setStep("CHAT");
    };

    const handleSessionEnded = () => {
      console.log("⚡ Real-time session ended by companion/listener");
      setStep("FEEDBACK");
    };

    socket.on("session_accepted", handleSessionAccepted);
    socket.on("mode_switch", handleModeSwitch);
    socket.on("session_ended", handleSessionEnded);

    return () => {
      socket.off("session_accepted", handleSessionAccepted);
      socket.off("mode_switch", handleModeSwitch);
      socket.off("session_ended", handleSessionEnded);
    };
  }, []);

  const handleStartSearch = (mode: "listener" | "peer_support", userTopic?: string) => {
    const roomId = `sess_${Date.now()}`;
    setCurrentRoomId(roomId);
    setStep("SEARCHING");

    const socket = getSocketClient();
    const userTag = getAnonymizedUserTag(roomId, "Student");
    const activeTopic = userTopic || userTag.topic;

    // Join room & broadcast to listener queue
    socket.emit("join_room", { roomId, userAlias: userTag.userTag });
    socket.emit("queue_join", {
      room: {
        id: roomId,
        userTag: userTag.userTag,
        categoryTag: userTag.categoryTag,
        topic: activeTopic,
        waitTime: "Just now",
      },
    });
  };

  const handleCancelSearch = () => {
    if (currentRoomId) {
      const socket = getSocketClient();
      socket.emit("queue_end", { roomId: currentRoomId });
    }
    setStep("ENTRY");
    setListener(null);
    setCurrentRoomId(null);
  };

  const handleStartChat = () => {
    setStep("CHAT");
    if (currentRoomId) {
      const socket = getSocketClient();
      socket.emit("mode_switch", { roomId: currentRoomId, mode: "CHAT" });
    }
  };

  const handleStartCall = () => {
    setStep("CALL");
    if (currentRoomId) {
      const socket = getSocketClient();
      socket.emit("mode_switch", { roomId: currentRoomId, mode: "CALL" });
    }
  };

  const handleEndSession = () => {
    if (currentRoomId) {
      const socket = getSocketClient();
      socket.emit("queue_end", { roomId: currentRoomId });
    }
    setStep("FEEDBACK");
  };

  const handleFeedbackComplete = () => {
    setStep("ENTRY");
    setListener(null);
    setCurrentRoomId(null);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center">
      {step === "ENTRY" && <EntryModeSelect onStartSearch={handleStartSearch} />}
      
      {step === "SEARCHING" && (
        <SearchingState onFound={() => {}} onCancel={handleCancelSearch} />
      )}

      {step === "MATCHED" && listener && (
        <MatchedScreen
          listener={listener}
          onStartChat={handleStartChat}
          onStartCall={handleStartCall}
          onCancel={handleCancelSearch}
        />
      )}

      {step === "CHAT" && listener && (
        <ChatScreen
          listener={listener}
          roomId={currentRoomId || "sess_default"}
          onEndSession={handleEndSession}
          onSwitchToCall={handleStartCall}
        />
      )}

      {step === "CALL" && listener && (
        <CallScreen
          listener={listener}
          roomId={currentRoomId || "sess_default"}
          onEndCall={handleEndSession}
          onSwitchToChat={handleStartChat}
        />
      )}

      {step === "FEEDBACK" && (
        <FeedbackScreen onComplete={handleFeedbackComplete} />
      )}
    </div>
  );
}
