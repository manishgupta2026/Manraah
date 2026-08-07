"use client";

import React, { useState } from "react";

interface SharedChatInputProps {
  onSendMessage: (text: string) => void;
  placeholder?: string;
  quickPromptChips?: string[];
  accentButtonClass?: string;
}

export default function SharedChatInput({
  onSendMessage,
  placeholder = "Type your message...",
  quickPromptChips = [],
  accentButtonClass = "bg-primary hover:bg-primary-purple text-white",
}: SharedChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleChipClick = (chipText: string) => {
    onSendMessage(chipText);
  };

  return (
    <div className="space-y-3 pt-3 border-t border-surface-variant/20">
      {quickPromptChips.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {quickPromptChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChipClick(chip)}
              className="px-3 py-1.5 rounded-full bg-surface-container-low border border-surface-variant/30 text-[11px] font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all whitespace-nowrap shrink-0"
            >
              + "{chip}"
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1 p-3.5 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          type="submit"
          className={`px-5 py-3.5 rounded-2xl font-bold text-xs shadow-md transition-all shrink-0 ${accentButtonClass}`}
        >
          Send →
        </button>
      </form>
    </div>
  );
}
