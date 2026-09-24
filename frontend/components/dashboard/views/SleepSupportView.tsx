"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/frontend/lib/context/AuthContext";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { getClientSession } from "@/backend/auth/client";

interface Soundscape {
  id: string;
  title: string;
  desc: string;
  icon: string;
  category: string;
  duration: string;
  type: "rain" | "waves" | "forest" | "delta" | "fire" | "pink";
}

const SOUNDSCAPES: Soundscape[] = [
  {
    id: "rain",
    title: "Gentle Rain",
    desc: "Soothing rain patter against the windowpane to relax racing thoughts",
    icon: "water_drop",
    category: "Nature Sound",
    duration: "Continuous",
    type: "rain",
  },
  {
    id: "waves",
    title: "Deep Ocean Waves",
    desc: "Low-frequency ocean tides rhythmic pulse for deep slow-wave sleep",
    icon: "waves",
    category: "Ocean Soundscape",
    duration: "Continuous",
    type: "waves",
  },
  {
    id: "forest",
    title: "Night Forest Breeze",
    desc: "Soft crickets and gentle night breeze through tranquil pine trees",
    icon: "forest",
    category: "Ambient Nature",
    duration: "Continuous",
    type: "forest",
  },
  {
    id: "delta",
    title: "Binaural Delta Waves",
    desc: "Scientific 2Hz Delta wave binaural beat to guide brain into REM & restorative sleep",
    icon: "graphic_eq",
    category: "Brainwave Entrainment",
    duration: "Continuous",
    type: "delta",
  },
  {
    id: "fire",
    title: "Cozy Hearth Fire",
    desc: "Warm crackling fireplace ambiance that induces comforting sleepy warmth",
    icon: "local_fire_department",
    category: "Cozy Ambiance",
    duration: "Continuous",
    type: "fire",
  },
  {
    id: "pink",
    title: "Deep Pink Noise",
    desc: "Balanced frequency spectrum that masks disruptive sudden night noises",
    icon: "air",
    category: "Frequency Masking",
    duration: "Continuous",
    type: "pink",
  },
];

export default function SleepSupportView() {
  const { user } = useAuth();
  const { category } = useCategory();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userName = mounted ? (user?.name || user?.sanctuaryName || "Friend") : "Friend";

  // Audio Playback state
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);

  // Evening Reflection state
  const [reflectionText, setReflectionText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSavedMessage, setNoteSavedMessage] = useState(false);

  // Web Audio Synth references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const soundNodesRef = useRef<any[]>([]);

  // Stop current Web Audio synthesis
  const stopAudio = () => {
    soundNodesRef.current.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    soundNodesRef.current = [];
  };

  // Start soundscape Web Audio synthesis
  const startAudio = (type: Soundscape["type"]) => {
    stopAudio();
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      if (type === "rain") {
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
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(800, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();
        soundNodesRef.current.push(whiteNoise, filter);
      } else if (type === "waves") {
        const bufferSize = ctx.sampleRate * 4;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(350, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(250, ctx.currentTime);

        lfo.connect(filter.frequency);
        noise.connect(filter);
        filter.connect(masterGain);

        noise.start();
        lfo.start();
        soundNodesRef.current.push(noise, filter, lfo, lfoGain);
      } else if (type === "forest") {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(500, ctx.currentTime);

        const cricketOsc = ctx.createOscillator();
        cricketOsc.type = "sine";
        cricketOsc.frequency.setValueAtTime(4500, ctx.currentTime);
        const cricketGain = ctx.createGain();
        cricketGain.gain.setValueAtTime(0.003, ctx.currentTime);

        noise.connect(filter);
        filter.connect(masterGain);
        cricketOsc.connect(cricketGain);
        cricketGain.connect(masterGain);

        noise.start();
        cricketOsc.start();
        soundNodesRef.current.push(noise, filter, cricketOsc, cricketGain);
      } else if (type === "delta") {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(100, ctx.currentTime);
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(102, ctx.currentTime);

        osc1.connect(masterGain);
        osc2.connect(masterGain);
        osc1.start();
        osc2.start();
        soundNodesRef.current.push(osc1, osc2);
      } else if (type === "fire") {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * (Math.random() > 0.95 ? 2.5 : 0.4);
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(700, ctx.currentTime);

        noise.connect(filter);
        filter.connect(masterGain);
        noise.start();
        soundNodesRef.current.push(noise, filter);
      } else {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          output[i] = (b0 + b1 + b2) * 0.5;
        }

        const pink = ctx.createBufferSource();
        pink.buffer = noiseBuffer;
        pink.loop = true;

        pink.connect(masterGain);
        pink.start();
        soundNodesRef.current.push(pink);
      }
    } catch (e) {
      console.warn("Sleep audio start warning:", e);
    }
  };

  // Update volume live
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        volume * 0.15,
        audioCtxRef.current.currentTime
      );
    }
  }, [volume]);

  // Clean up audio on unmount
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

  const handleSelectSound = (sound: Soundscape) => {
    if (activeSoundId === sound.id && isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      setActiveSoundId(sound.id);
      setIsPlaying(true);
      startAudio(sound.type);
    }
  };

  const handleToggleMasterPlay = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      const targetId = activeSoundId || "rain";
      const sound = SOUNDSCAPES.find((s) => s.id === targetId) || SOUNDSCAPES[0];
      setActiveSoundId(sound.id);
      setIsPlaying(true);
      startAudio(sound.type);
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
          title: "Evening Wind-Down & Sleep Reflection",
          content: reflectionText.trim(),
          moodTag: "Peaceful",
          category: category || "General",
        }),
      });
      setNoteSavedMessage(true);
      setReflectionText("");
      setTimeout(() => setNoteSavedMessage(false), 4500);
    } catch (err) {
      console.error("Failed to save evening note:", err);
    } finally {
      setIsSavingNote(false);
    }
  };

  const activeSoundObj = SOUNDSCAPES.find((s) => s.id === activeSoundId);

  return (
    <div className="w-full min-w-0 flex flex-col gap-5 select-none animate-fade-in">
      {/* 1. Full-Width Header Banner with Integrated Player Controller */}
      <div className="bg-white dark:bg-[#102F27] rounded-3xl p-5 sm:p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#88F7D6] text-[10.5px] font-heading font-black tracking-wider uppercase border border-[#D2EAE0] dark:border-[#23483E]">
              <span>🌙 REST & RECOVERY</span>
              <span>•</span>
              <span>WIND-DOWN MANRAAH</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
              Night Sleep Support & Soundscapes
            </h1>
            <p className="text-xs text-[#5A756C] dark:text-[#A9C5BC] max-w-xl font-medium">
              Drift into deep, restorative sleep with continuous ambient audio, bedtime reflections, and science-backed sleep wind-down tools.
            </p>
          </div>

          {/* Master Audio Controller Pill */}
          <div className="flex items-center gap-3.5 bg-[#F4F9F6] dark:bg-[#14382F] p-3 px-4 rounded-2xl border border-[#E2ECE6] dark:border-[#23483E] self-start lg:self-auto min-w-[280px]">
            <button
              type="button"
              onClick={handleToggleMasterPlay}
              className="w-10 h-10 rounded-full bg-[#006C56] hover:bg-[#005241] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] flex items-center justify-center shadow-xs cursor-pointer transition-all shrink-0"
              title={isPlaying ? "Pause audio" : "Play audio"}
            >
              <span className="material-symbols-outlined text-xl">
                {isPlaying ? "pause" : "play_arrow"}
              </span>
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-heading font-bold text-[#19332A] dark:text-[#F4FAF7] truncate">
                {activeSoundObj ? activeSoundObj.title : "Gentle Rain"}
              </p>
              <p className="text-[10px] text-[#006C56] dark:text-[#88F7D6] font-semibold">
                {isPlaying ? "Playing continuous" : "Ready to play"}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 pl-1 border-l border-[#E2ECE6] dark:border-[#23483E]">
              <span className="material-symbols-outlined text-sm text-[#5A756C] dark:text-[#A9C5BC]">
                volume_down
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 sm:w-20 accent-[#006C56] dark:accent-[#00A982] cursor-pointer h-1"
                title={`Volume: ${Math.round(volume * 100)}%`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Ambient Soundscape Cards (3-Column Balanced Grid) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7] uppercase tracking-wider">
            Ambient Soundscape Tracks
          </h2>
          <span className="text-xs text-[#5A756C] dark:text-[#A9C5BC] font-medium">
            Continuous Web Audio synthesis • Click to listen
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {SOUNDSCAPES.map((sound) => {
            const isSelected = activeSoundId === sound.id;
            const isThisPlaying = isSelected && isPlaying;

            return (
              <div
                key={sound.id}
                onClick={() => handleSelectSound(sound)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isThisPlaying
                    ? "bg-[#EAF6F0] dark:bg-[#14382F] border-[#006C56] dark:border-[#00A982] shadow-xs ring-1 ring-[#006C56]/40"
                    : isSelected
                    ? "bg-white dark:bg-[#102F27] border-[#006C56]/40 dark:border-[#00A982]/40 shadow-2xs"
                    : "bg-white dark:bg-[#102F27] border-[#E2ECE6] dark:border-[#23483E] hover:border-[#006C56]/30 dark:hover:border-[#00A982]/30 shadow-2xs"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${
                      isThisPlaying
                        ? "bg-[#006C56] text-white border-[#006C56]"
                        : "bg-[#F4FAF7] dark:bg-[#071C17] text-[#006C56] dark:text-[#88F7D6] border-[#D2EAE0] dark:border-[#23483E]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">{sound.icon}</span>
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-heading font-bold text-xs text-[#19332A] dark:text-[#F4FAF7] truncate">
                        {sound.title}
                      </h3>
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-[#F4FAF7] dark:bg-[#071C17] text-[#5A756C] dark:text-[#A9C5BC] shrink-0 border border-[#E2ECE6] dark:border-[#23483E]">
                        {sound.duration}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5A756C] dark:text-[#A9C5BC] line-clamp-1 leading-snug">
                      {sound.desc}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isThisPlaying
                      ? "bg-[#006C56] text-white shadow-xs"
                      : "bg-[#F4FAF7] dark:bg-[#071C17] text-[#4F685F] dark:text-[#A9C5BC] border border-[#E2ECE6] dark:border-[#23483E]"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {isThisPlaying ? "pause" : "play_arrow"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Bottom Two-Column Balanced Layout: Evening Reflection + 4-7-8 Technique */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Evening Wind-Down Journal Note */}
        <div className="bg-white dark:bg-[#102F27] rounded-3xl p-5 sm:p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-3 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#88F7D6] flex items-center justify-center">
              <span className="material-symbols-outlined text-base">edit_note</span>
            </div>
            <div>
              <h3 className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7] uppercase tracking-wider">
                Evening Wind-Down Reflection
              </h3>
              <p className="text-[11px] text-[#5A756C] dark:text-[#A9C5BC]">
                Release today&apos;s thoughts before heading to sleep
              </p>
            </div>
          </div>

          <textarea
            rows={3}
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="Write 1 thing you are grateful for, or a thought you want to let go of tonight..."
            className="w-full p-3 rounded-2xl bg-[#F4FAF7] dark:bg-[#071C17] border border-[#E2ECE6] dark:border-[#23483E] text-xs text-[#19332A] dark:text-[#F4FAF7] focus:outline-none focus:ring-2 focus:ring-[#006C56] resize-none"
          />

          <div className="flex items-center justify-between">
            {noteSavedMessage ? (
              <span className="text-xs text-[#006C56] dark:text-[#88F7D6] font-bold">
                ✓ Saved to your Journal!
              </span>
            ) : (
              <span className="text-[10px] text-[#5A756C] dark:text-[#A9C5BC]">
                🔒 Private & encrypted
              </span>
            )}

            <button
              type="button"
              onClick={handleSaveReflection}
              disabled={isSavingNote || !reflectionText.trim()}
              className="px-3.5 py-1.5 rounded-full bg-[#006C56] hover:bg-[#005241] dark:bg-[#00A982] dark:hover:bg-[#00916F] disabled:opacity-40 text-white dark:text-[#071C17] text-xs font-heading font-bold transition-all cursor-pointer shadow-xs"
            >
              {isSavingNote ? "Saving..." : "Save Reflection"}
            </button>
          </div>
        </div>

        {/* 4-7-8 Sleep Breathing Technique Card */}
        <div className="bg-white dark:bg-[#102F27] rounded-3xl p-5 sm:p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-3 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#88F7D6] flex items-center justify-center">
              <span className="material-symbols-outlined text-base">air</span>
            </div>
            <div>
              <h3 className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7] uppercase tracking-wider">
                The 4-7-8 Bedtime Breath
              </h3>
              <p className="text-[11px] text-[#5A756C] dark:text-[#A9C5BC]">
                Natural nervous system tranquilizer
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-[#F4FAF7] dark:bg-[#071C17] border border-[#E2ECE6] dark:border-[#23483E]">
              <span className="text-xs font-mono font-bold text-[#006C56] dark:text-[#88F7D6] block">
                4 SEC
              </span>
              <span className="text-[10.5px] font-heading font-bold text-[#19332A] dark:text-[#F4FAF7]">
                Inhale
              </span>
              <span className="text-[9px] text-[#5A756C] dark:text-[#A9C5BC] block mt-0.5">
                Quiet nose
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#F4FAF7] dark:bg-[#071C17] border border-[#E2ECE6] dark:border-[#23483E]">
              <span className="text-xs font-mono font-bold text-[#D97706] dark:text-[#FBBF24] block">
                7 SEC
              </span>
              <span className="text-[10.5px] font-heading font-bold text-[#19332A] dark:text-[#F4FAF7]">
                Hold
              </span>
              <span className="text-[9px] text-[#5A756C] dark:text-[#A9C5BC] block mt-0.5">
                Retain breath
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#F4FAF7] dark:bg-[#071C17] border border-[#E2ECE6] dark:border-[#23483E]">
              <span className="text-xs font-mono font-bold text-[#006C56] dark:text-[#88F7D6] block">
                8 SEC
              </span>
              <span className="text-[10.5px] font-heading font-bold text-[#19332A] dark:text-[#F4FAF7]">
                Exhale
              </span>
              <span className="text-[9px] text-[#5A756C] dark:text-[#A9C5BC] block mt-0.5">
                Slow mouth
              </span>
            </div>
          </div>

          <div
            className="p-2.5 rounded-2xl bg-[#EAF6F0] dark:bg-[#14382F] text-[11px] text-[#006C56] dark:text-[#88F7D6] leading-snug border border-[#D2EAE0] dark:border-[#23483E]"
            suppressHydrationWarning
          >
            💡 <strong suppressHydrationWarning>Sleep Tip for {userName}:</strong> Repeat 4 cycles as your head hits the pillow to lower heart rate and switch on parasympathetic recovery.
          </div>
        </div>
      </div>
    </div>
  );
}
