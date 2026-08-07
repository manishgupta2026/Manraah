"use client";

import React, { useState } from "react";

interface FeedbackScreenProps {
  onComplete: () => void;
}

export default function FeedbackScreen({ onComplete }: FeedbackScreenProps) {
  const [rating, setRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const emojis = ["💔 Needs Work", "🙁 Okay", "😐 Neutral", "🙂 Good", "💙 Deeply Helpful"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onComplete();
    }, 1800);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 text-center space-y-6 animate-fadeIn select-none">
      {!submitted ? (
        <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-6">
          <div className="w-16 h-16 rounded-full bg-mint/30 text-secondary mx-auto flex items-center justify-center text-3xl font-bold">
            ✓
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-heading font-bold text-on-surface">Session Completed</h2>
            <p className="text-xs text-on-surface-variant">
              How supported did you feel during your 1-on-1 session today?
            </p>
          </div>

          {/* Rating Emoji Buttons */}
          <div className="space-y-2">
            <div className="flex justify-between gap-1">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setRating(num)}
                  className={`flex-1 py-3 rounded-2xl font-bold text-xs transition-all ${
                    rating === num
                      ? "bg-primary text-white shadow-md scale-105"
                      : "bg-surface-container-low text-on-surface hover:bg-surface-container"
                  }`}
                >
                  ⭐ {num}
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-primary">{emojis[rating - 1]}</p>
          </div>

          {/* Optional Reflection */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-on-surface">Optional Feedback / Reflection</label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={3}
              placeholder="What helped most during this session?"
              className="w-full p-3 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-purple text-white font-bold text-xs shadow-md transition-all scale-105 active:scale-95"
          >
            Submit Feedback & Return →
          </button>
        </form>
      ) : (
        <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
          <span className="material-symbols-outlined text-5xl text-secondary animate-bounce block mx-auto">
            favorite
          </span>
          <h3 className="text-xl font-heading font-bold text-on-surface">Thank You!</h3>
          <p className="text-xs text-on-surface-variant">
            Your feedback helps keep Manraah Sanctuary safe, warm, and deeply supportive.
          </p>
        </div>
      )}
    </div>
  );
}
