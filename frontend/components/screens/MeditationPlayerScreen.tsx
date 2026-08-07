"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { useRouter } from "next/navigation";
import ScreenHeader from "@/frontend/components/ui/ScreenHeader";

export default function MeditationPlayerScreen() {
  const router = useRouter();
  const { categoryDetails } = useCategory();

  // Selected session settings
  const [selectedDuration, setSelectedDuration] = useState<number>(5); // 1, 3, 5, 10 mins
  const [selectedMode, setSelectedMode] = useState<"432Hz Calm" | "Theta Waves" | "Zen Resonance">("432Hz Calm");
  const [natureSound, setNatureSound] = useState<"None" | "Gentle Rain" | "Ocean Waves" | "Forest Wind">("None");

  // Timer & Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(5 * 60);
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathSeconds, setBreathSeconds] = useState<number>(4);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Post-Session Reflection Modal State
  const [showReflectionModal, setShowReflectionModal] = useState<boolean>(false);
  const [reflectionInput, setReflectionInput] = useState<string>("");
  const [savingReflection, setSavingReflection] = useState<boolean>(false);

  // Live Stats
  const [stats, setStats] = useState({ totalMinutes: 0, streakDays: 1, totalSessions: 0 });

  // Web Audio Context Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // Fetch live stats from Neon DB on load
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/meditation/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to load meditation stats:", err);
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
      setTimeout(() => {
        startAudio();
      }, 200);
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
        gainNode.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 2);
      } else if (selectedMode === "Theta Waves") {
        osc1.type = "triangle";
        osc1.frequency.setValueAtTime(528, ctx.currentTime);
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(536, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 2);
      } else {
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(216, ctx.currentTime);
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(432, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.07, ctx.currentTime + 2);
      }

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc1.start();
      osc2.start();

      osc1Ref.current = osc1;
      osc2Ref.current = osc2;
      gainNodeRef.current = gainNode;

      // Generate Nature Sound Layer (Pink/White Noise Filtering)
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
          noiseGain.gain.setValueAtTime(0.025, ctx.currentTime);
        } else {
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(600, ctx.currentTime);
          noiseGain.gain.setValueAtTime(0.02, ctx.currentTime);
        }

        whiteNoise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        whiteNoise.start();
        noiseNodeRef.current = whiteNoise as any;
      }
    } catch (err) {
      console.warn("Web Audio API warning:", err);
    }
  };

  const stopAudio = () => {
    try {
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.5);
        setTimeout(() => {
          osc1Ref.current?.stop();
          osc2Ref.current?.stop();
          osc1Ref.current?.disconnect();
          osc2Ref.current?.disconnect();
          if (noiseNodeRef.current) {
            (noiseNodeRef.current as any).stop?.();
            noiseNodeRef.current = null;
          }
          osc1Ref.current = null;
          osc2Ref.current = null;
        }, 500);
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
      playTibetanBowlChime(audioCtxRef.current, 324);
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
        setStats((prev) => ({
          totalMinutes: data.totalMinutes || prev.totalMinutes + selectedDuration,
          streakDays: data.currentStreak || prev.streakDays,
          totalSessions: prev.totalSessions + 1,
        }));
        setShowReflectionModal(true);
      }
    } catch (err) {
      console.error("Failed to save meditation log:", err);
    }
  };

  const handleSaveReflection = async () => {
    setSavingReflection(true);
    try {
      if (reflectionInput.trim()) {
        await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `${selectedDuration}-Min Meditation Reflection`,
            content: reflectionInput,
            moodTag: "Reflective",
            category: categoryDetails.name,
          }),
        });
      }
      setToastMessage(`🎉 Session Complete! +${selectedDuration} Mins & reflection saved to your Sanctuary Profile!`);
      setShowReflectionModal(false);
      setReflectionInput("");
      setTimeout(() => setToastMessage(null), 6000);
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
    <div className="max-w-4xl mx-auto py-4 space-y-6 animate-fadeIn select-none relative">
      <ScreenHeader title="🧘 Meditation" showBackButton={true} fallbackRoute="/dashboard" />
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-secondary text-white text-xs font-bold text-center shadow-lg border border-white/20 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Feature 4: Live Mindfulness Stats Banner */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-primary-container/15 border border-primary/20 text-center">
          <p className="text-[11px] font-semibold text-on-surface-variant/70 uppercase">Mindfulness Minutes</p>
          <p className="text-xl font-heading font-black text-primary">{stats.totalMinutes} mins</p>
        </div>
        <div className="p-4 rounded-2xl bg-mint/20 border border-secondary/20 text-center">
          <p className="text-[11px] font-semibold text-on-surface-variant/70 uppercase">Current Streak</p>
          <p className="text-xl font-heading font-black text-secondary">{stats.streakDays} Days 🔥</p>
        </div>
        <div className="p-4 rounded-2xl bg-peach/30 border border-tertiary/20 text-center">
          <p className="text-[11px] font-semibold text-on-surface-variant/70 uppercase">Total Sessions</p>
          <p className="text-xl font-heading font-black text-tertiary">{stats.totalSessions} Sessions</p>
        </div>
      </div>

      {/* Feature 1: Daily Mindfulness Reflection Card */}
      <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">format_quote</span>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-heading font-bold text-on-surface">Daily Mindfulness Reset</p>
            <p className="text-xs text-on-surface-variant italic">
              "Notice three small things that bring you quiet ease and breathing space today."
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-surface-container text-xs font-bold text-primary shrink-0">
          Daily Reflection
        </span>
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
            🎵 Mode: <span className="underline">{selectedMode}</span> {natureSound !== "None" && `+ ${natureSound}`}
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

      {/* Feature 2: Ambient Nature Sound Layer */}
      <div className="space-y-3">
        <h3 className="font-heading font-bold text-lg text-on-surface">Ambient Nature Layer</h3>
        <div className="flex flex-wrap items-center gap-3">
          {(["None", "Gentle Rain", "Ocean Waves", "Forest Wind"] as const).map((sound) => (
            <button
              key={sound}
              onClick={() => setNatureSound(sound)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                natureSound === sound
                  ? "bg-secondary text-white shadow-md scale-105"
                  : "bg-surface-container-lowest border border-surface-variant/30 text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              🌿 {sound}
            </button>
          ))}
        </div>
      </div>

      {/* Soundscape & Audio Mode Options */}
      <div className="space-y-3">
        <h3 className="font-heading font-bold text-lg text-on-surface">Select Audio Soundscape Mode</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { mode: "432Hz Calm" as const, desc: "432 Hz Solfeggio sine wave + 6 Hz Theta binaural beat for deep nervous system relaxation", icon: "graphic_eq" },
            { mode: "Theta Waves" as const, desc: "528 Hz Transformation frequency + 8 Hz Alpha focus beat for mental clarity", icon: "waves" },
            { mode: "Zen Resonance" as const, desc: "216 Hz Deep grounding bass overtone with Tibetan singing bowl harmonic undertones", icon: "ring_volume" },
          ].map((m) => (
            <div
              key={m.mode}
              onClick={() => setSelectedMode(m.mode)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                selectedMode === m.mode
                  ? "bg-primary-container/20 border-primary shadow-md scale-[1.02]"
                  : "bg-surface-container-lowest border-surface-variant/30 hover:bg-surface-container-low"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-xl ${selectedMode === m.mode ? "text-primary font-bold" : "text-primary/70"}`}>
                  {m.icon}
                </span>
                <h4 className="font-heading font-bold text-xs text-on-surface">{m.mode}</h4>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature 3: Post-Session Quick Reflection Modal */}
      {showReflectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl p-8 max-w-md w-full border border-surface-variant/40 shadow-soft-xl space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-secondary-container text-on-secondary-container mx-auto flex items-center justify-center text-3xl">
              🧘
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-heading font-bold text-on-surface">Session Complete!</h3>
              <p className="text-xs text-on-surface-variant">
                How does your body & mind feel right now? (Optional reflection for your journal).
              </p>
            </div>

            <textarea
              rows={3}
              value={reflectionInput}
              onChange={(e) => setReflectionInput(e.target.value)}
              placeholder="e.g. My shoulders felt relaxed and my mind settled down..."
              className="w-full p-4 rounded-2xl bg-surface-container-low border border-surface-variant/40 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReflectionModal(false);
                  setToastMessage(`🎉 Session Complete! +${selectedDuration} Mins saved to your profile.`);
                  setTimeout(() => setToastMessage(null), 5000);
                }}
                className="flex-1 py-3 rounded-full bg-surface-container text-on-surface-variant font-semibold text-xs hover:bg-surface-container-high"
              >
                Skip Reflection
              </button>
              <button
                onClick={handleSaveReflection}
                disabled={savingReflection}
                className="flex-1 py-3 rounded-full bg-primary text-white font-bold text-xs shadow-md hover:bg-primary-purple transition-all"
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
