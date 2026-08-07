"use client";

import React from "react";
import { CompanionChatMessage } from "@/backend/types";

interface SharedChatBubbleProps {
  message: CompanionChatMessage;
  isSelf: boolean;
  accentColor?: "mint" | "peach" | "purple";
}

export default function SharedChatBubble({ message, isSelf, accentColor = "purple" }: SharedChatBubbleProps) {
  if (message.sender === "system") {
    return (
      <div className="p-3 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-xs text-on-surface-variant text-center leading-relaxed max-w-md mx-auto my-2">
        🛡️ {message.text}
      </div>
    );
  }

  const bgStyle = isSelf
    ? "bg-primary text-white rounded-tr-none shadow-xs"
    : accentColor === "mint"
    ? "bg-mint/20 border border-mint/40 text-on-surface rounded-tl-none"
    : accentColor === "peach"
    ? "bg-peach/20 border border-peach/40 text-on-surface rounded-tl-none"
    : "bg-surface-container-low border border-surface-variant/30 text-on-surface rounded-tl-none";

  return (
    <div className={`flex flex-col ${isSelf ? "items-end" : "items-start"} my-1.5 animate-fadeIn`}>
      <div className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${bgStyle}`}>
        {message.text}
      </div>
      <span className="text-[10px] text-on-surface-variant/60 mt-1 px-1 font-mono">
        {message.timestamp}
      </span>
    </div>
  );
}
