"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCategory } from "@/frontend/lib/context/CategoryContext";

export default function MeditationPlayerScreen() {
  const { categoryDetails } = useCategory();

  // Selected session settings
  const [selectedDuration, setSelectedDuration] = useState<number>(5); // 1, 3, 5, 10 mins
  const [selectedMode, setSelectedMode] = useState<string>("432Hz Calm");

  // Timer & Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(5 * 60);
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathSeconds, setBreathSeconds] = useState<number>(4);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audio Context Ref for Web Audio API Sound Generator
  const audioCtxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Initialize or reset timer when duration changes
  useEffect(() => {
    setIsPlaying(false);
    stopAudio();
    setSecondsLeft(selectedDuration * 60);
  }, [selectedDuration]);

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
            // Transition phase: Inhale (4s) -> Hold (7s) -> Exhale (8s)
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

  // Web Audio API: 432 Hz Solfeggio & Tibetan Bowl Chime Synthesizer
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

      // Play start Tibetan singing bowl chime
      playTibetanBowlChime(ctx, 216);

      // Create dual harmonic oscillators (432 Hz base + 436 Hz binaural theta beat)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(432, ctx.currentTime); // 432 Hz Healing Frequency

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(436, ctx.currentTime); // +4 Hz Theta relaxation wave

      // Soft ambient gain
      gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 3);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();

      osc1Ref.current = osc1;
      osc2Ref.current = osc2;
      gainNodeRef.current = gainNode;
    } catch (err) {
      console.warn("Web Audio API not supported on this browser:", err);
    }
  };

  const stopAudio = () => {
    try {
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 1);
        setTimeout(() => {
          osc1Ref.current?.stop();
          osc2Ref.current?.stop();
          osc1Ref.current?.disconnect();
          osc2Ref.current?.disconnect();
          osc1Ref.current = null;
          osc2Ref.current = null;
        }, 1000);
      }
    } catch (err) {
      console.warn("Error stopping audio:", err);
    }
  };

  const playTibetanBowlChime = (ctx: AudioContext, freq: number) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 4);
    } catch (e) {
      console.warn(e);
    }
  };

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
      playTibetanBowlChime(audioCtxRef.current, 324); // Completion chime
    }

    try {
      const res = await fetch("/api/meditation/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minutes: selectedDuration,
          title: `${selectedDuration}-Min ${selectedMode} Meditation`,
          category: categoryDetails.name,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setToastMessage(`🎉 Session Complete! +${selectedDuration} Mindfulness Minutes saved to your profile.`);
        setTimeout(() => setToastMessage(null), 6000);
      }
    } catch (err) {
      console.error("Failed to save meditation log:", err);
    }
  };

  // Format MM:SS
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const totalSeconds = selectedDuration * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - secondsLeft) / totalSeconds) * 100));

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6 animate-fadeIn select-none">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-secondary text-white text-xs font-bold text-center shadow-lg border border-white/20 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Sanctuary Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft text-center space-y-2">
        <span className="px-3.5 py-1 rounded-full bg-mint/20 text-secondary text-xs font-semibold uppercase tracking-wider">
          Tailored for {categoryDetails.name}
        </span>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-on-surface">
          Mindfulness & Breathing Sanctuary
        </h1>
        <p className="text-xs md:text-sm text-on-surface-variant max-w-lg mx-auto">
          Immerse yourself in real 432 Hz Solfeggio soundscapes and guided 4-7-8 breathing cycles.
        </p>
      </div>

      {/* Duration Selector Tabs */}
      <div className="flex items-center justify-center gap-3">
        {[
          { label: "1 Min Reset", mins: 1 },
          { label: "3 Min Pause", mins: 3 },
          { label: "5 Min Calm", mins: 5 },
          { label: "10 Min Journey", mins: 10 },
        ].map((item) => (
          <button
            key={item.mins}
            onClick={() => setSelectedDuration(item.mins)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              selectedDuration === item.mins
                ? "bg-primary text-white shadow-md scale-105"
                : "bg-surface-container-lowest border border-surface-variant/30 text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Master Interactive Visual Player */}
      <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-b from-surface-container-lowest via-surface-container-low to-surface-container border border-surface-variant/40 shadow-soft text-center space-y-6 relative overflow-hidden">
        
        {/* Animated 4-7-8 Expanding/Contracting Breathing Ring */}
        <div className="relative w-52 h-52 mx-auto flex items-center justify-center">
          <div
            className={`absolute inset-0 rounded-full bg-primary-container/20 border-4 border-primary/40 transition-all duration-1000 shadow-inner flex items-center justify-center ${
              isPlaying
                ? breathPhase === "Inhale"
                  ? "scale-110 border-secondary bg-secondary-container/30 shadow-secondary/30"
                  : breathPhase === "Hold"
                  ? "scale-105 border-primary bg-primary-container/40"
                  : "scale-90 border-tertiary bg-peach/20"
                : "scale-100"
            }`}
          >
            <div className="text-center space-y-1">
              <span className="material-symbols-outlined text-4xl text-primary block">
                {isPlaying ? "spa" : "self_improvement"}
              </span>
              {isPlaying ? (
                <div className="space-y-0.5">
                  <span className="font-heading font-bold text-sm text-primary uppercase block tracking-wider">
                    {breathPhase}
                  </span>
                  <span className="font-mono font-bold text-xs text-on-surface-variant/80 block">
                    {breathSeconds}s
                  </span>
                </div>
              ) : (
                <span className="text-xs font-bold text-on-surface-variant/70 block">Ready to Begin</span>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Track & Audio Mode Badge */}
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-heading font-bold text-on-surface">
            {selectedDuration}-Minute {categoryDetails.name} Session
          </h2>
          <p className="text-xs text-primary font-semibold uppercase tracking-widest">
            🎵 432 Hz Solfeggio Harmonic Resonance & Binaural Beats
          </p>
        </div>

        {/* Live Countdown & Progress Bar */}
        <div className="max-w-md mx-auto space-y-2">
          <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-on-surface-variant/80 font-mono font-semibold">
            <span>{formatTime(selectedDuration * 60 - secondsLeft)}</span>
            <span className="text-primary font-bold">{formatTime(secondsLeft)}</span>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center justify-center gap-6 pt-2">
          <button
            onClick={() => setSecondsLeft((s) => Math.min(selectedDuration * 60, s + 30))}
            className="w-12 h-12 rounded-full bg-surface-container-lowest text-on-surface flex items-center justify-center shadow-xs hover:bg-surface-container transition-all"
            title="Add 30 seconds"
          >
            <span className="material-symbols-outlined text-2xl">replay_30</span>
          </button>

          <button
            onClick={togglePlayback}
            className={`w-16 h-16 rounded-full text-white flex items-center justify-center shadow-lg transition-all scale-105 active:scale-95 ${
              isPlaying ? "bg-secondary hover:bg-secondary/90" : "bg-primary hover:bg-primary-purple"
            }`}
          >
            <span className="material-symbols-outlined text-4xl">{isPlaying ? "pause" : "play_arrow"}</span>
          </button>

          <button
            onClick={() => handleCompleteSession()}
            className="w-12 h-12 rounded-full bg-surface-container-lowest text-on-surface flex items-center justify-center shadow-xs hover:bg-surface-container transition-all"
            title="Complete & Log Session"
          >
            <span className="material-symbols-outlined text-2xl text-secondary">check_circle</span>
          </button>
        </div>
      </div>

      {/* Soundscape & Audio Mode Options */}
      <div className="space-y-3">
        <h3 className="font-heading font-bold text-lg text-on-surface">Select Audio Soundscape Mode</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { mode: "432Hz Calm", desc: "Solfeggio frequency for deep nervous system relaxation", icon: "graphic_eq" },
            { mode: "Theta Waves", desc: "+4 Hz binaural beat for mental focus and clarity", icon: "waves" },
            { mode: "Zen Resonance", desc: "Soft Tibetan singing bowl harmonic undertones", icon: "ring_volume" },
          ].map((m) => (
            <div
              key={m.mode}
              onClick={() => setSelectedMode(m.mode)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                selectedMode === m.mode
                  ? "bg-primary-container/20 border-primary shadow-sm"
                  : "bg-surface-container-lowest border-surface-variant/30 hover:bg-surface-container-low"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">{m.icon}</span>
                <h4 className="font-heading font-bold text-xs text-on-surface">{m.mode}</h4>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
