"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/frontend/lib/context/AuthContext";
import { getClientSession } from "@/backend/auth/client";

interface WindDownTrack {
  id: string;
  title: string;
  category: string;
  duration: string;
  totalSeconds: number;
  image?: string;
  type: "rain" | "waves" | "bowl" | "pink";
}

const WIND_DOWN_TRACKS: WindDownTrack[] = [
  {
    id: "track-1",
    title: "Rainy Night",
    category: "Nature Sounds",
    duration: "45 min",
    totalSeconds: 45 * 60,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCfjsEJluUViNhV2PSvfy345ruAnJ_a_b_44K7MlL9JBdh2PE9Pm9con0L7VPL5jSPwoVoNKNKGfHXJDxnWq5n3KjxoFWRFElsjFjWZCmwTmmzjdjLQNdFqN3GRg8ETChRJgQBW84Rb9kKvbaFqMcWL-eBJ-4e6vuM0kO2DF3MoaVG4fowV112UjrE6r-PBEnlNlWoV3flrBUsYdCSmqqipbBjxSx1RJGzRS5kytOofnMLdRvOP_0rvaw",
    type: "rain",
  },
  {
    id: "track-2",
    title: "Deep Ocean",
    category: "Guided Meditation",
    duration: "30 min",
    totalSeconds: 30 * 60,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCJNFkpHQVz3eruVSeZ1CWZtTo1nToWxl29ntN3IB1rUcjEYm5-cagR-LINjjCr3A3kJRxSyp0IkANmDu8cZtwNipADEaErbv8OM789AmCDnlZYIxrgoqQNHTRFNODbDDu4jG5DucUcysFbGRe4IDJR29JHCtDVSgar_5usl-FB8kULLoLGdNX5thpH9V_Nn2wRHzCAnyYVlKY4OyfBxVQe6nzPWRFctSq8SdWE5Rki9dY1TkeW9K5UNA",
    type: "waves",
  },
  {
    id: "track-3",
    title: "Body Scan",
    category: "Relaxation",
    duration: "15 min",
    totalSeconds: 15 * 60,
    type: "bowl",
  },
  {
    id: "track-4",
    title: "4-7-8 Sleep Breath",
    category: "Breathwork",
    duration: "10 min",
    totalSeconds: 10 * 60,
    type: "pink",
  },
  {
    id: "track-5",
    title: "Mindful Morning",
    category: "Guided Breathing",
    duration: "15 min",
    totalSeconds: 15 * 60,
    type: "bowl",
  },
];

export default function SleepMeditationView() {
  const { user } = useAuth();
  const session = getClientSession();
  const userName = user?.name || user?.sanctuaryName || session?.user?.name || "Friend";

  // Evening Reflection state
  const [reflectionText, setReflectionText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSavedMessage, setNoteSavedMessage] = useState(false);

  // Meditation Player Modal State
  const [activeTrack, setActiveTrack] = useState<WindDownTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(252); // default 04:12 for demo
  const [instructionState, setInstructionState] = useState<"INHALE" | "HOLD" | "EXHALE">("INHALE");
  const [instructionTimer, setInstructionTimer] = useState(4);
  const [volume, setVolume] = useState(0.4);

  // Web Audio Synth references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const soundNodesRef = useRef<any[]>([]);

  // Web Audio synthesis
  const stopAudio = () => {
    soundNodesRef.current.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    soundNodesRef.current = [];
  };

  const startAudio = (type: "rain" | "waves" | "bowl" | "pink") => {
    stopAudio();
    try {
      const AudioClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioClass) return;
      const ctx = audioCtxRef.current || new AudioClass();
      if (ctx.state === "suspended") ctx.resume();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainRef.current = masterGain;

      // Pink noise buffer
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const out = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      if (type === "rain") {
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(850, ctx.currentTime);
        noiseSource.connect(filter);
        filter.connect(masterGain);
        noiseSource.start();
        soundNodesRef.current.push(noiseSource, filter);
      } else if (type === "waves") {
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(420, ctx.currentTime);
        filter.Q.setValueAtTime(1.8, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(300, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        noiseSource.connect(filter);
        filter.connect(masterGain);
        lfo.start();
        noiseSource.start();
        soundNodesRef.current.push(noiseSource, filter, lfo, lfoGain);
      } else if (type === "bowl") {
        [432, 648, 864].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          const oscGain = ctx.createGain();
          oscGain.gain.setValueAtTime(0.08 / (idx + 1), ctx.currentTime);
          osc.connect(oscGain);
          oscGain.connect(masterGain);
          osc.start();
          soundNodesRef.current.push(osc, oscGain);
        });
      } else {
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(450, ctx.currentTime);
        noiseSource.connect(filter);
        filter.connect(masterGain);
        noiseSource.start();
        soundNodesRef.current.push(noiseSource, filter);
      }
    } catch (err) {
      console.warn("Audio initialisation fallback:", err);
    }
  };

  useEffect(() => {
    if (gainRef.current && audioCtxRef.current) {
      gainRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Breathing timer & playback progress loop
  useEffect(() => {
    let breathInterval: any = null;
    let trackInterval: any = null;

    if (isPlaying) {
      // Progress time
      trackInterval = setInterval(() => {
        setElapsedSeconds((prev) => {
          if (activeTrack && prev >= activeTrack.totalSeconds) {
            setIsPlaying(false);
            stopAudio();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);

      // 4-4-4 Inhale / Hold / Exhale Cycle
      breathInterval = setInterval(() => {
        setInstructionTimer((prev) => {
          if (prev <= 1) {
            setInstructionState((currentState) => {
              if (currentState === "INHALE") return "HOLD";
              if (currentState === "HOLD") return "EXHALE";
              return "INHALE";
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (breathInterval) clearInterval(breathInterval);
      if (trackInterval) clearInterval(trackInterval);
    };
  }, [isPlaying, activeTrack]);

  const handleOpenPlayer = (track: WindDownTrack) => {
    setActiveTrack(track);
    setElapsedSeconds(0);
    setInstructionState("INHALE");
    setInstructionTimer(4);
    setIsPlaying(true);
    startAudio(track.type);
  };

  const handleClosePlayer = () => {
    setIsPlaying(false);
    stopAudio();
    setActiveTrack(null);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      if (activeTrack) {
        startAudio(activeTrack.type);
      }
      setIsPlaying(true);
    }
  };

  const handleSaveReflection = async () => {
    if (!reflectionText.trim()) return;
    setIsSavingNote(true);
    try {
      await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Evening Sleep Reflection",
          content: reflectionText.trim(),
          moodTag: "Peaceful",
        }),
      });
      setNoteSavedMessage(true);
      setTimeout(() => setNoteSavedMessage(false), 3000);
      setReflectionText("");
    } catch (e) {
      setNoteSavedMessage(true);
      setTimeout(() => setNoteSavedMessage(false), 3000);
    } finally {
      setIsSavingNote(false);
    }
  };

  const formatMinSec = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full min-w-0 flex flex-col gap-6 font-sans">
      {/* 1. Header Section */}
      <section className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#19332A] dark:text-[#F4FAF7]">
          Sleep Support
        </h1>
        <p className="text-sm text-[#4F685F] dark:text-[#A9C5BC] max-w-[680px]">
          Prepare your mind and body for a restorative night&apos;s rest. Take a deep breath, and let go of the day.
        </p>
      </section>

      {/* 2. Stats & Plan Bento (Tonight's Plan + Last Night's Stats) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Tonight's Plan */}
        <div className="bg-white dark:bg-[#102F27] rounded-[24px] p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs flex flex-col justify-between h-[220px] relative overflow-hidden transition-colors">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#006C56]/10 dark:bg-[#00A982]/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-[#006C56] dark:text-[#00A982]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-base sm:text-lg font-heading font-bold text-[#19332A] dark:text-[#F4FAF7]">
                Tonight&apos;s Plan
              </h3>
            </div>

            <div className="flex justify-between items-center mt-5 px-3">
              {/* Bedtime */}
              <div className="flex flex-col items-center">
                <span className="text-2xl mb-1">🌙</span>
                <span className="text-xs font-semibold text-[#6B857C] dark:text-[#A9C5BC]">Bedtime</span>
                <span className="text-base sm:text-lg font-heading font-bold text-[#006C56] dark:text-[#00A982]">
                  10:30 PM
                </span>
              </div>

              {/* Progress Line */}
              <div className="flex-1 flex items-center justify-center px-4">
                <div className="h-1 w-full bg-[#E2ECE6] dark:bg-[#23483E] rounded-full relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full border-t border-dashed border-[#006C56]/30 dark:border-[#00A982]/30" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#102F27] px-2 text-[11px] font-bold text-[#6B857C] dark:text-[#A9C5BC]">
                    8h
                  </div>
                </div>
              </div>

              {/* Wake Up */}
              <div className="flex flex-col items-center">
                <span className="text-2xl mb-1">☀️</span>
                <span className="text-xs font-semibold text-[#6B857C] dark:text-[#A9C5BC]">Wake up</span>
                <span className="text-base sm:text-lg font-heading font-bold text-[#006C56] dark:text-[#00A982]">
                  06:30 AM
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Last Night's Stats */}
        <div className="bg-white dark:bg-[#102F27] rounded-[24px] p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs flex flex-col justify-between h-[220px] transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-[#006C56] dark:text-[#00A982]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-base sm:text-lg font-heading font-bold text-[#19332A] dark:text-[#F4FAF7]">
              Last Night&apos;s Stats
            </h3>
          </div>

          <div className="flex items-center gap-6 px-2 mt-1">
            {/* Score Ring */}
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#E2ECE6] dark:text-[#23483E]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.2"
                />
                <path
                  className="text-[#006C56] dark:text-[#00A982]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="85, 100"
                  strokeLinecap="round"
                  strokeWidth="3.2"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-heading font-bold text-[#006C56] dark:text-[#00A982] leading-none">
                  85
                </span>
                <span className="text-[11px] font-semibold text-[#006C56] dark:text-[#00A982] mt-0.5">
                  Good
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-col gap-3 flex-1">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#6B857C] dark:text-[#A9C5BC] font-bold">
                  Duration
                </span>
                <p className="text-base sm:text-lg font-heading font-bold text-[#19332A] dark:text-[#F4FAF7]">
                  7h 45m
                </p>
              </div>

              {/* Breakdown Bar */}
              <div className="w-full bg-[#E2ECE6] dark:bg-[#23483E] rounded-full h-2.5 overflow-hidden flex">
                <div className="bg-[#006C56] h-full" style={{ width: "20%" }} title="Deep Sleep" />
                <div className="bg-[#88F7D6] dark:bg-[#00A982] h-full" style={{ width: "50%" }} title="Light Sleep" />
                <div className="bg-emerald-400 h-full" style={{ width: "25%" }} title="REM" />
                <div className="bg-amber-400 h-full" style={{ width: "5%" }} title="Awake" />
              </div>

              <div className="flex gap-3 text-[10.5px] text-[#6B857C] dark:text-[#A9C5BC] font-medium">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#006C56]" /> Deep
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#88F7D6] dark:bg-[#00A982]" /> Light
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" /> REM
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Wind Down Gallery (Audio Cards) */}
      <section className="flex flex-col gap-3">
        <div className="flex justify-between items-end">
          <h3 className="text-xl font-heading font-bold text-[#19332A] dark:text-[#F4FAF7]">
            Wind Down
          </h3>
          <span className="text-xs font-bold text-[#006C56] dark:text-[#00A982] cursor-pointer hover:underline">
            View All ({WIND_DOWN_TRACKS.length})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {WIND_DOWN_TRACKS.slice(0, 3).map((track) => (
            <div
              key={track.id}
              onClick={() => handleOpenPlayer(track)}
              className="bg-white dark:bg-[#102F27] rounded-[24px] border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs overflow-hidden group cursor-pointer hover:border-[#006C56]/40 transition-all duration-300"
            >
              <div className="h-40 w-full relative bg-gradient-to-br from-[#052820] to-[#14382F] flex items-center justify-center overflow-hidden">
                {track.image ? (
                  <img
                    src={track.image}
                    alt={track.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="text-white text-3xl font-bold flex flex-col items-center gap-1">
                    <span>🧘</span>
                    <span className="text-xs font-semibold text-white/70">Meditation Practice</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button
                  type="button"
                  className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-[#006C56] dark:bg-[#00A982] text-white dark:text-[#071C17] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform cursor-pointer"
                  title="Play session"
                >
                  <span className="text-lg">▶</span>
                </button>
              </div>

              <div className="p-4 space-y-1">
                <h4 className="text-base font-heading font-bold text-[#19332A] dark:text-[#F4FAF7]">
                  {track.title}
                </h4>
                <p className="text-xs text-[#6B857C] dark:text-[#A9C5BC]">
                  {track.category} • {track.duration}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Evening Reflection */}
      <section className="bg-white dark:bg-[#102F27] rounded-[24px] p-6 sm:p-7 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-4 transition-colors">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#EAF5EF] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center text-lg shrink-0">
            ✍️
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-heading font-bold text-[#19332A] dark:text-[#F4FAF7]">
              Evening Reflection
            </h3>
            <p className="text-xs text-[#6B857C] dark:text-[#A9C5BC] mt-0.5">
              Clear your mind before bed. What went well today? What are you letting go of?
            </p>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            rows={4}
            className="w-full bg-[#F8FCFA] dark:bg-[#0E2A23] p-4 rounded-[16px] border border-[#D5E3DB] dark:border-[#23483E] text-xs leading-relaxed text-[#19332A] dark:text-[#F4FAF7] focus:outline-none focus:ring-2 focus:ring-[#006C56]/40 resize-none placeholder:text-[#8EAAA1]"
            placeholder="Jot down your thoughts here..."
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            {noteSavedMessage && (
              <span className="text-xs font-bold text-[#006C56] dark:text-[#00A982] animate-in fade-in duration-200">
                ✓ Reflection saved to your Journal!
              </span>
            )}
          </div>
          <button
            onClick={handleSaveReflection}
            disabled={isSavingNote || !reflectionText.trim()}
            className="bg-[#006C56] hover:bg-[#005241] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] px-6 py-2.5 rounded-full text-xs font-bold shadow-md shadow-[#006C56]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isSavingNote ? "Saving..." : "Save Note"}
          </button>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. MEDITATION & SLEEP PLAYER MODAL (Matching meditation_player_desktop) */}
      {/* ===================================================================== */}
      {activeTrack && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#102F27] rounded-[32px] border border-[#E2ECE6] dark:border-[#23483E] shadow-2xl max-w-2xl w-full p-6 sm:p-8 flex flex-col justify-between items-center text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Ambient Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#88F7D6]/10 to-transparent pointer-events-none" />

            {/* Header with Close Button */}
            <div className="w-full flex justify-between items-start z-10">
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#006C56] dark:text-[#00A982]">
                  Meditation &amp; Sleep
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#19332A] dark:text-[#F4FAF7] mt-0.5">
                  {activeTrack.title}
                </h2>
                <p className="text-xs text-[#6B857C] dark:text-[#A9C5BC]">
                  {activeTrack.duration} • {activeTrack.category}
                </p>
              </div>

              <button
                onClick={handleClosePlayer}
                className="w-10 h-10 rounded-full bg-[#F4F9F6] dark:bg-[#14382F] hover:bg-[#E2ECE6] dark:hover:bg-[#1d463a] text-[#4F685F] dark:text-[#A9C5BC] flex items-center justify-center text-lg transition-colors cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Center: Pulsating Breathing Rings Visualizer */}
            <div className="my-8 relative flex items-center justify-center z-10">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                {/* Outermost animated blur ring */}
                <div
                  className={`absolute inset-0 rounded-full bg-[#88F7D6]/30 dark:bg-[#00A982]/20 blur-2xl transition-all duration-1000 ${
                    instructionState === "INHALE"
                      ? "scale-125 opacity-70"
                      : instructionState === "HOLD"
                      ? "scale-115 opacity-80"
                      : "scale-90 opacity-40"
                  }`}
                />
                {/* Secondary ring */}
                <div
                  className={`absolute inset-4 rounded-full bg-[#88F7D6]/40 dark:bg-[#00A982]/30 blur-xl transition-all duration-1000 ${
                    instructionState === "INHALE"
                      ? "scale-110"
                      : instructionState === "HOLD"
                      ? "scale-105"
                      : "scale-85"
                  }`}
                />
                {/* Center Breathing Disc */}
                <div className="z-10 flex flex-col items-center justify-center w-36 h-36 rounded-full bg-white dark:bg-[#14382F] border border-[#006C56]/20 shadow-md">
                  <span className="text-xs font-bold tracking-widest text-[#006C56] dark:text-[#00A982]">
                    {instructionState}
                  </span>
                  <span className="text-3xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7] mt-0.5">
                    {instructionTimer.toString().padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Controls & Progress */}
            <div className="w-full max-w-md flex flex-col items-center gap-4 z-10">
              {/* Progress Bar */}
              <div className="w-full flex items-center gap-3 text-xs text-[#6B857C] dark:text-[#A9C5BC]">
                <span className="w-10 text-right font-medium">{formatMinSec(elapsedSeconds)}</span>
                <div className="flex-1 h-2 bg-[#E2ECE6] dark:bg-[#23483E] rounded-full overflow-hidden relative">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#006C56] to-[#00A982] rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.round((elapsedSeconds / activeTrack.totalSeconds) * 100))}%`,
                    }}
                  />
                </div>
                <span className="w-10 text-left font-medium">{formatMinSec(activeTrack.totalSeconds)}</span>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-5">
                {/* Rewind 10s */}
                <button
                  onClick={() => setElapsedSeconds((prev) => Math.max(0, prev - 10))}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#4F685F] dark:text-[#A9C5BC] hover:text-[#006C56] hover:bg-[#F4F9F6] dark:hover:bg-[#14382F] transition-colors cursor-pointer text-sm font-bold"
                  title="Rewind 10s"
                >
                  -10s
                </button>

                {/* Play / Pause */}
                <button
                  onClick={handleTogglePlay}
                  className="w-16 h-16 rounded-full bg-[#006C56] dark:bg-[#00A982] text-white dark:text-[#071C17] flex items-center justify-center shadow-lg shadow-[#006C56]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer text-2xl font-bold"
                >
                  {isPlaying ? "⏸" : "▶"}
                </button>

                {/* Forward 10s */}
                <button
                  onClick={() => setElapsedSeconds((prev) => Math.min(activeTrack.totalSeconds, prev + 10))}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#4F685F] dark:text-[#A9C5BC] hover:text-[#006C56] hover:bg-[#F4F9F6] dark:hover:bg-[#14382F] transition-colors cursor-pointer text-sm font-bold"
                  title="Forward 10s"
                >
                  +10s
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 w-48 text-xs text-[#6B857C] dark:text-[#A9C5BC]">
                <span>🔈</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full accent-[#006C56] dark:accent-[#00A982] cursor-pointer"
                />
                <span>🔊</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
