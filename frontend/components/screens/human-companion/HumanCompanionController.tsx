"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const searchPayloadRef = useRef<{ roomId: string; userTag: any; activeTopic: string } | null>(null);

  useEffect(() => {
    const socket = getSocketClient();

    const handleSessionAccepted = (data: { companionAlias?: string }) => {
      searchPayloadRef.current = null;
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
      searchPayloadRef.current = null;
      setStep("FEEDBACK");
    };

    const handleConnect = () => {
      if (searchPayloadRef.current && step === "SEARCHING") {
        const { roomId, userTag, activeTopic } = searchPayloadRef.current;
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
      }
    };

    if (socket.connected) {
      handleConnect();
    }
    socket.on("connect", handleConnect);
    socket.on("session_accepted", handleSessionAccepted);
    socket.on("mode_switch", handleModeSwitch);
    socket.on("session_ended", handleSessionEnded);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("session_accepted", handleSessionAccepted);
      socket.off("mode_switch", handleModeSwitch);
      socket.off("session_ended", handleSessionEnded);
    };
  }, [step]);

  const handleStartSearch = (mode: "listener" | "peer_support", userTopic?: string) => {
    const roomId = `sess_${Date.now()}`;
    setCurrentRoomId(roomId);

    const socket = getSocketClient();
    const userTag = getAnonymizedUserTag(roomId, "Student");
    const activeTopic = userTopic || userTag.topic;

    searchPayloadRef.current = { roomId, userTag, activeTopic };
    setStep("SEARCHING");

    console.log("⚡ Emitting join_room & queue_join for member:", roomId);
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
    searchPayloadRef.current = null;
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
    searchPayloadRef.current = null;
    setStep("FEEDBACK");
  };

  const handleFeedbackComplete = () => {
    setStep("ENTRY");
    setListener(null);
    setCurrentRoomId(null);
    searchPayloadRef.current = null;
  };

  return (
    <div className="space-y-6">
      {step === "ENTRY" && <EntryModeSelect onStartSearch={handleStartSearch} />}
      {step === "SEARCHING" && <SearchingState onCancelSearch={handleCancelSearch} />}
      {step === "MATCHED" && listener && (
        <MatchedScreen
          listener={listener}
          onStartChat={handleStartChat}
          onStartCall={handleStartCall}
        />
      )}
      {step === "CHAT" && listener && currentRoomId && (
        <ChatScreen
          listener={listener}
          roomId={currentRoomId}
          onEndSession={handleEndSession}
          onSwitchToCall={handleStartCall}
        />
      )}
      {step === "CALL" && listener && currentRoomId && (
        <CallScreen
          listener={listener}
          roomId={currentRoomId}
          onEndCall={handleEndSession}
          onSwitchToChat={handleStartChat}
        />
      )}
      {step === "FEEDBACK" && <FeedbackScreen onComplete={handleFeedbackComplete} />}
    </div>
  );
}
