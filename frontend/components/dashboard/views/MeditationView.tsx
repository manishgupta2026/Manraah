"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { getClientSession } from "@/backend/auth/client";
import { getCategoryPersonalization } from "@/frontend/lib/mock-data";

export default function MeditationView() {
  const { categoryDetails, category } = useCategory();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedCategory = mounted ? (category || "student") : "student";
  const p = getCategoryPersonalization(resolvedCategory);

  // Selected session settings
  const [selectedDuration, setSelectedDuration] = useState<number>(5); // 1, 3, 5, 10, 15 mins
  const [selectedMode, setSelectedMode] = useState<"432Hz Calm" | "Theta Waves" | "Zen Resonance">("432Hz Calm");
  const [natureSound, setNatureSound] = useState<"None" | "Gentle Rain" | "Ocean Waves" | "Forest Wind">("None");

  // Timer & Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(5 * 60);
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathSeconds, setBreathSeconds] = useState<number>(4);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Reflection State
  const [reflectionInput, setReflectionInput] = useState<string>("");
  const [savingReflection, setSavingReflection] = useState<boolean>(false);
  const [reflectionSavedToast, setReflectionSavedToast] = useState<boolean>(false);

  // Post-Session Reflection Modal State
  const [showReflectionModal, setShowReflectionModal] = useState<boolean>(false);

  // Live Stats
  const [stats, setStats] = useState({ totalMinutes: 15, streakDays: 2, totalSessions: 3 });

  // Web Audio Context Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // Fetch live stats on load
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/meditation/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        // Fallback gracefully
      }
    }
    loadStats();
  }, []);

  // Initialize or reset timer when duration changes
  useEffect(() => {
    setIsPlaying(false);
    stopAudio();
    setSecondsLeft(selectedDuration * 60);
  }, [selectedDuration]);

  // Restart audio synth seamlessly if user changes soundscape or nature mode while playing
  useEffect(() => {
    if (isPlaying) {
      stopAudio();
      const t = setTimeout(() => {
        startAudio();
      }, 150);
      return () => clearTimeout(t);
    }
  }, [selectedMode, natureSound]);

  // Master Timer Tick Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isPlaying && secondsLeft === 0) {
      handleCompleteSession();
    }
    return () => clearInterval(timer);
  }, [isPlaying, secondsLeft]);

  // 4-7-8 Visual Breathing Sync Effect
  useEffect(() => {
    let breathTimer: NodeJS.Timeout;
    if (isPlaying) {
      breathTimer = setInterval(() => {
        setBreathSeconds((prevSec) => {
          if (prevSec > 1) {
            return prevSec - 1;
          } else {
            if (breathPhase === "Inhale") {
              setBreathPhase("Hold");
              return 7;
            } else if (breathPhase === "Hold") {
              setBreathPhase("Exhale");
              return 8;
            } else {
              setBreathPhase("Inhale");
              return 4;
            }
          }
        });
      }, 1000);
    } else {
      setBreathPhase("Inhale");
      setBreathSeconds(4);
    }
    return () => clearInterval(breathTimer);
  }, [isPlaying, breathPhase]);

  // Play Tibetan Singing Bowl chime
  const playTibetanBowlChime = (ctx: AudioContext, freq: number) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 3.2);
    } catch (e) {
      console.warn(e);
    }
  };

  // Web Audio API: Soundscape & Nature Noise Synthesizer
  const startAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      playTibetanBowlChime(ctx, selectedMode === "Zen Resonance" ? 180 : 216);

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      if (selectedMode === "432Hz Calm") {
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(432, ctx.currentTime);
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(438, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 2);
      } else if (selectedMode === "Theta Waves") {
        osc1.type = "triangle";
        osc1.frequency.setValueAtTime(528, ctx.currentTime);
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(536, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.035, ctx.currentTime + 2);
      } else {
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(216, ctx.currentTime);
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(432, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.055, ctx.currentTime + 2);
      }

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc1.start();
      osc2.start();

      osc1Ref.current = osc1;
      osc2Ref.current = osc2;
      gainNodeRef.current = gainNode;

      // Nature noise filtering layer
      if (natureSound !== "None") {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        const noiseGain = ctx.createGain();

        if (natureSound === "Gentle Rain") {
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(1000, ctx.currentTime);
          noiseGain.gain.setValueAtTime(0.015, ctx.currentTime);
        } else if (natureSound === "Ocean Waves") {
          filter.type = "bandpass";
          filter.frequency.setValueAtTime(400, ctx.currentTime);
          noiseGain.gain.setValueAtTime(0.022, ctx.currentTime);
        } else {
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(600, ctx.currentTime);
          noiseGain.gain.setValueAtTime(0.018, ctx.currentTime);
        }

        whiteNoise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        whiteNoise.start();
        noiseNodeRef.current = whiteNoise;
      }
    } catch (e) {
      console.warn("Web Audio start warning:", e);
    }
  };

  const stopAudio = () => {
    try {
      if (osc1Ref.current) {
        osc1Ref.current.stop();
        osc1Ref.current.disconnect();
        osc1Ref.current = null;
      }
      if (osc2Ref.current) {
        osc2Ref.current.stop();
        osc2Ref.current.disconnect();
        osc2Ref.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
      if (noiseNodeRef.current) {
        (noiseNodeRef.current as any).stop?.();
        noiseNodeRef.current.disconnect();
        noiseNodeRef.current = null;
      }
    } catch (e) {
      console.warn("Stop audio warning:", e);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        try {
          audioCtxRef.current.close();
        } catch (e) {}
      }
    };
  }, []);

  const togglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopAudio();
    } else {
      setIsPlaying(true);
      startAudio();
    }
  };

  const handleCompleteSession = async () => {
    setIsPlaying(false);
    stopAudio();
    if (audioCtxRef.current) {
      playTibetanBowlChime(audioCtxRef.current, 324);
    }

    try {
      const res = await fetch("/api/meditation/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minutes: selectedDuration,
          title: `${selectedDuration}-Min ${selectedMode} Meditation`,
          category: categoryDetails?.name || "Mindfulness",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStats((prev) => ({
          totalMinutes: data.totalMinutes || prev.totalMinutes + selectedDuration,
          streakDays: data.currentStreak || prev.streakDays,
          totalSessions: prev.totalSessions + 1,
        }));
      }
    } catch (err) {
      setStats((prev) => ({
        ...prev,
        totalMinutes: prev.totalMinutes + selectedDuration,
        totalSessions: prev.totalSessions + 1,
      }));
    }

    setShowReflectionModal(true);
  };

  const handleSaveReflection = async () => {
    if (!reflectionInput.trim()) return;
    setSavingReflection(true);
    try {
      await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${selectedDuration}-Min Meditation Reflection`,
          content: reflectionInput.trim(),
          moodTag: "Reflective",
          category: categoryDetails?.name || "Mindfulness",
        }),
      });
      setReflectionSavedToast(true);
      setReflectionInput("");
      setShowReflectionModal(false);
      setToastMessage(`🎉 Session Complete! +${selectedDuration} Mins & reflection saved to your Journal!`);
      setTimeout(() => {
        setReflectionSavedToast(false);
        setToastMessage(null);
      }, 5000);
    } catch (err) {
      console.error("Failed to save reflection:", err);
    } finally {
      setSavingReflection(false);
    }
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const totalSeconds = selectedDuration * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - secondsLeft) / totalSeconds) * 100));

  return (
    <div className="w-full min-w-0 flex flex-col gap-5 select-none animate-fade-in">
      {/* 1. Header Banner with Integrated Stats */}
      <div className="bg-white dark:bg-[#102F27] rounded-3xl p-5 sm:p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#88F7D6] text-[10.5px] font-heading font-black tracking-wider border border-[#D2EAE0] dark:border-[#23483E]">
              <span>🧘 Mindfulness Manraah</span>
              <span>•</span>
              <span>Breathe & reset</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
              Guided Meditation & Soundscapes
            </h1>
            <p className="text-xs text-[#5A756C] dark:text-[#A9C5BC] max-w-xl font-medium">
              Settle into quiet clarity with synchronized 4-7-8 breathing, Solfeggio soundscapes, and gentle mindfulness.
            </p>
          </div>

          {/* Quick Stats Pills */}
          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
            <div className="px-3.5 py-2 rounded-2xl bg-[#F4F9F6] dark:bg-[#14382F] border border-[#E2ECE6] dark:border-[#23483E] text-center min-w-[90px]">
              <span className="block text-xs font-heading font-black text-[#006C56] dark:text-[#88F7D6]">
                {stats.totalMinutes}m
              </span>
              <span className="text-[10px] font-medium text-[#6B857C] dark:text-[#A9C5BC] tracking-wider">
                Minutes
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-[#F4F9F6] dark:bg-[#14382F] border border-[#E2ECE6] dark:border-[#23483E] text-center min-w-[90px]">
              <span className="block text-xs font-heading font-black text-[#D97706] dark:text-[#FBBF24]">
                {stats.streakDays}d 🔥
              </span>
              <span className="text-[10px] font-medium text-[#6B857C] dark:text-[#A9C5BC] tracking-wider">
                Streak
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-[#F4F9F6] dark:bg-[#14382F] border border-[#E2ECE6] dark:border-[#23483E] text-center min-w-[90px]">
              <span className="block text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                {stats.totalSessions}
              </span>
              <span className="text-[10px] font-medium text-[#6B857C] dark:text-[#A9C5BC] tracking-wider">
                Sessions
              </span>
            </div>
          </div>
        </div>

        {/* Optional Category Focus Strip */}
        {p?.meditationBannerTitle && (
          <div
            className="mt-3.5 pt-3 border-t border-[#E2ECE6] dark:border-[#23483E] flex items-center justify-between gap-3 text-xs"
            suppressHydrationWarning
          >
            <div className="flex items-center gap-2 text-[#006C56] dark:text-[#88F7D6] font-medium" suppressHydrationWarning>
              <span>🌿</span>
              <span suppressHydrationWarning>{p.meditationBannerTitle}</span>
              <span className="text-[#5A756C] dark:text-[#A9C5BC] hidden sm:inline" suppressHydrationWarning>
                • {p.meditationBannerBody}
              </span>
            </div>
            <span
              className="px-2.5 py-0.5 rounded-full bg-[#EAF6F0] dark:bg-[#14382F] text-[10px] font-bold text-[#006C56] dark:text-[#88F7D6] border border-[#D2EAE0] dark:border-[#23483E] shrink-0"
              suppressHydrationWarning
            >
              {p.meditationBadge || "Focus Mode"}
            </span>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-[#006C56] dark:bg-[#00A982] text-white dark:text-[#071C17] text-xs font-heading font-bold text-center shadow-md animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* 2. Main Two-Column Balanced Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Visual Breathing Player (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#102F27] rounded-3xl p-6 sm:p-7 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs flex flex-col items-center justify-between gap-6 transition-colors">
          {/* Duration Selector Tabs */}
          <div className="w-full flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-[#E2ECE6] dark:border-[#23483E]">
            <span className="text-xs font-heading font-bold text-[#19332A] dark:text-[#F4FAF7]">
              Session Length
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: "1m", mins: 1 },
                { label: "3m", mins: 3 },
                { label: "5m", mins: 5 },
                { label: "10m", mins: 10 },
                { label: "15m", mins: 15 },
              ].map((item) => (
                <button
                  key={item.mins}
                  onClick={() => setSelectedDuration(item.mins)}
                  className={`px-3 py-1 rounded-full text-xs font-heading font-bold transition-all cursor-pointer ${
                    selectedDuration === item.mins
                      ? "bg-[#006C56] dark:bg-[#00A982] text-white dark:text-[#071C17] shadow-xs"
                      : "bg-[#F4FAF7] dark:bg-[#14382F] text-[#5A756C] dark:text-[#A9C5BC] hover:bg-[#E2ECE6] dark:hover:bg-[#1C4E40]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Animated 4-7-8 Breathing Ring */}
          <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center my-2">
            <div
              className={`absolute inset-0 rounded-full border-4 transition-all duration-1000 shadow-inner flex items-center justify-center ${
                isPlaying
                  ? breathPhase === "Inhale"
                    ? "scale-110 border-[#00A982] bg-[#EAF6F0]/70 dark:bg-[#14382F]/80 shadow-[#00A982]/20"
                    : breathPhase === "Hold"
                    ? "scale-105 border-[#006C56] bg-[#006C56]/15 dark:bg-[#00A982]/20"
                    : "scale-90 border-[#D97706] bg-[#FEF3C7]/40 dark:bg-[#78350F]/20"
                  : "scale-100 border-[#D2EAE0] dark:border-[#23483E] bg-[#F4FAF7] dark:bg-[#14382F]/50"
              }`}
            >
              <div className="text-center space-y-1">
                <span className="material-symbols-outlined text-3xl sm:text-4xl text-[#006C56] dark:text-[#00A982] block">
                  {isPlaying ? "spa" : "self_improvement"}
                </span>
                {isPlaying ? (
                  <div className="space-y-0.5">
                    <span className="font-heading font-bold text-xs sm:text-sm text-[#006C56] dark:text-[#88F7D6] block tracking-wider">
                      {breathPhase}
                    </span>
                    <span className="font-mono font-bold text-xs text-[#5A756C] dark:text-[#A9C5BC] block">
                      {breathSeconds}s
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-heading font-bold text-[#5A756C] dark:text-[#A9C5BC] block">
                    Ready to Begin
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Session Title & Active Mode */}
          <div className="text-center space-y-1">
            <h2
              className="text-lg sm:text-xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7]"
              suppressHydrationWarning
            >
              {selectedDuration}-Minute {mounted ? (categoryDetails?.name || "Mindfulness") : "Mindfulness"} Session
            </h2>
            <p className="text-[11px] text-[#006C56] dark:text-[#88F7D6] font-semibold tracking-wider">
              🎵 Mode: <span className="underline">{selectedMode}</span>{" "}
              {natureSound !== "None" && `+ ${natureSound}`}
            </p>
          </div>

          {/* Live Countdown & Progress Bar */}
          <div className="w-full max-w-sm space-y-1.5">
            <div className="h-2 bg-[#EAF6F0] dark:bg-[#14382F] rounded-full overflow-hidden border border-[#D2EAE0] dark:border-[#23483E]">
              <div
                className="h-full bg-gradient-to-r from-[#006C56] to-[#00A982] transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[#5A756C] dark:text-[#A9C5BC] font-mono font-semibold">
              <span>{formatTime(selectedDuration * 60 - secondsLeft)}</span>
              <span className="text-[#006C56] dark:text-[#88F7D6] font-bold">
                {formatTime(secondsLeft)}
              </span>
            </div>
          </div>

          {/* Player Action Buttons */}
          <div className="flex items-center justify-center gap-5 pt-1">
            <button
              type="button"
              onClick={() => setSecondsLeft((s) => Math.min(selectedDuration * 60, s + 30))}
              className="w-11 h-11 rounded-full bg-[#F4FAF7] dark:bg-[#14382F] text-[#19332A] dark:text-[#F4FAF7] flex items-center justify-center shadow-xs hover:bg-[#E2ECE6] dark:hover:bg-[#1C4E40] transition-all cursor-pointer border border-[#E2ECE6] dark:border-[#23483E]"
              title="Add 30 seconds"
            >
              <span className="material-symbols-outlined text-xl">replay_30</span>
            </button>

            <button
              type="button"
              onClick={togglePlayback}
              className={`w-14 h-14 rounded-full text-white flex items-center justify-center shadow-md transition-all scale-105 active:scale-95 cursor-pointer ${
                isPlaying
                  ? "bg-[#D97706] hover:bg-[#B45309]"
                  : "bg-[#006C56] hover:bg-[#005241] dark:bg-[#00A982] dark:hover:bg-[#00916F]"
              }`}
            >
              <span className="material-symbols-outlined text-3xl">
                {isPlaying ? "pause" : "play_arrow"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleCompleteSession()}
              className="w-11 h-11 rounded-full bg-[#F4FAF7] dark:bg-[#14382F] text-[#006C56] dark:text-[#88F7D6] flex items-center justify-center shadow-xs hover:bg-[#E2ECE6] dark:hover:bg-[#1C4E40] transition-all cursor-pointer border border-[#E2ECE6] dark:border-[#23483E]"
              title="Complete & Log Session"
            >
              <span className="material-symbols-outlined text-xl">check_circle</span>
            </button>
          </div>
        </div>

        {/* Right Column: Audio Modes, Ambient Sounds & Reflections (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Soundscape Mode Card */}
          <div className="bg-white dark:bg-[#102F27] rounded-3xl p-5 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7] tracking-wider">
                Soundscape Frequency Mode
              </h3>
              <span className="text-[10px] text-[#5A756C] dark:text-[#A9C5BC]">
                Web Audio
              </span>
            </div>

            <div className="space-y-2">
              {[
                {
                  mode: "432Hz Calm" as const,
                  tag: "432 Hz Solfeggio + 6Hz Theta",
                  desc: "Restores parasympathetic calm and relieves mental strain.",
                  icon: "graphic_eq",
                },
                {
                  mode: "Theta Waves" as const,
                  tag: "528 Hz Transformation + 8Hz Alpha",
                  desc: "Supports mental clarity, emotional release, and renewal.",
                  icon: "waves",
                },
                {
                  mode: "Zen Resonance" as const,
                  tag: "216 Hz Deep Grounding + Tibetan Chime",
                  desc: "Rich resonant grounding tone for deep meditation focus.",
                  icon: "ring_volume",
                },
              ].map((m) => (
                <div
                  key={m.mode}
                  onClick={() => setSelectedMode(m.mode)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    selectedMode === m.mode
                      ? "bg-[#EAF6F0] dark:bg-[#14382F] border-[#006C56] dark:border-[#00A982] shadow-xs ring-1 ring-[#006C56]/30"
                      : "bg-[#F4FAF7]/60 dark:bg-[#071C17]/40 border-[#E2ECE6] dark:border-[#23483E] hover:bg-[#F4FAF7] dark:hover:bg-[#14382F]"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedMode === m.mode
                        ? "bg-[#006C56] text-white"
                        : "bg-white dark:bg-[#102F27] text-[#5A756C] dark:text-[#A9C5BC]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">{m.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-heading font-bold text-[#19332A] dark:text-[#F4FAF7]">
                        {m.mode}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-[#5A756C] dark:text-[#A9C5BC] leading-snug mt-0.5">
                      {m.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ambient Nature Sound Layer */}
          <div className="bg-white dark:bg-[#102F27] rounded-3xl p-5 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-2.5 transition-colors">
            <h3 className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7] tracking-wider">
              Ambient Nature Layer
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {(["None", "Gentle Rain", "Ocean Waves", "Forest Wind"] as const).map((sound) => (
                <button
                  key={sound}
                  onClick={() => setNatureSound(sound)}
                  className={`px-3 py-1.5 rounded-full text-xs font-heading font-bold transition-all cursor-pointer ${
                    natureSound === sound
                      ? "bg-[#006C56] dark:bg-[#00A982] text-white dark:text-[#071C17] shadow-xs"
                      : "bg-[#F4FAF7] dark:bg-[#14382F] border border-[#E2ECE6] dark:border-[#23483E] text-[#5A756C] dark:text-[#A9C5BC] hover:bg-[#E2ECE6] dark:hover:bg-[#1C4E40]"
                  }`}
                >
                  🌿 {sound}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Mindfulness Reset Quote & Quick Reflection */}
          <div className="bg-white dark:bg-[#102F27] rounded-3xl p-5 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-3 transition-colors">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-lg text-[#006C56] dark:text-[#88F7D6] shrink-0">
                format_quote
              </span>
              <p className="text-xs text-[#5A756C] dark:text-[#A9C5BC] italic leading-relaxed">
                &quot;Notice three small things that bring you quiet ease and breathing space today.&quot;
              </p>
            </div>

            <textarea
              rows={2}
              value={reflectionInput}
              onChange={(e) => setReflectionInput(e.target.value)}
              placeholder="Jot down a quick thought or feeling from this meditation..."
              className="w-full p-3 rounded-2xl bg-[#F4FAF7] dark:bg-[#071C17] border border-[#E2ECE6] dark:border-[#23483E] text-xs text-[#19332A] dark:text-[#F4FAF7] focus:outline-none focus:ring-2 focus:ring-[#006C56] resize-none"
            />

            <div className="flex items-center justify-between">
              {reflectionSavedToast ? (
                <span className="text-[11px] font-bold text-[#006C56] dark:text-[#88F7D6]">
                  ✓ Saved to Journal!
                </span>
              ) : (
                <span className="text-[10px] text-[#5A756C] dark:text-[#A9C5BC]">
                  Encrypted & private
                </span>
              )}
              <button
                type="button"
                onClick={handleSaveReflection}
                disabled={savingReflection || !reflectionInput.trim()}
                className="px-3 py-1.5 rounded-full bg-[#006C56] hover:bg-[#005241] dark:bg-[#00A982] dark:hover:bg-[#00916F] disabled:opacity-40 text-white dark:text-[#071C17] text-xs font-heading font-bold transition-all cursor-pointer"
              >
                {savingReflection ? "Saving..." : "Save to Journal"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post-Session Reflection Modal */}
      {showReflectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#102F27] rounded-3xl p-6 sm:p-7 max-w-md w-full border border-[#E2ECE6] dark:border-[#23483E] shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#88F7D6] mx-auto flex items-center justify-center text-3xl border border-[#D2EAE0] dark:border-[#23483E]">
              🧘
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                Session Complete!
              </h3>
              <p className="text-xs text-[#5A756C] dark:text-[#A9C5BC]">
                How does your body & mind feel right now? (Optional reflection saved to your journal).
              </p>
            </div>

            <textarea
              rows={3}
              value={reflectionInput}
              onChange={(e) => setReflectionInput(e.target.value)}
              placeholder="e.g. My shoulders dropped, my breath slowed, and I feel centered..."
              className="w-full p-3.5 rounded-2xl bg-[#F4FAF7] dark:bg-[#071C17] border border-[#E2ECE6] dark:border-[#23483E] text-xs text-[#19332A] dark:text-[#F4FAF7] focus:outline-none focus:ring-2 focus:ring-[#006C56] resize-none"
            />

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowReflectionModal(false);
                  setToastMessage(`🎉 Session Complete! +${selectedDuration} Mins saved to your profile.`);
                  setTimeout(() => setToastMessage(null), 5000);
                }}
                className="flex-1 py-2.5 rounded-full bg-[#F4FAF7] dark:bg-[#14382F] text-[#4F685F] dark:text-[#A9C5BC] font-heading font-bold text-xs hover:bg-[#E2ECE6] dark:hover:bg-[#1C4E40] transition-colors cursor-pointer"
              >
                Skip Reflection
              </button>
              <button
                type="button"
                onClick={handleSaveReflection}
                disabled={savingReflection}
                className="flex-1 py-2.5 rounded-full bg-[#006C56] hover:bg-[#005241] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] font-heading font-black text-xs shadow-md transition-all cursor-pointer"
              >
                {savingReflection ? "Saving..." : "Save to Journal →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
