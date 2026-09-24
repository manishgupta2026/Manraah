"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/frontend/lib/context/AuthContext";
import { useCategory } from "@/frontend/lib/context/CategoryContext";

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

const TIMER_PRESETS = [
  { label: "15m", minutes: 15 },
  { label: "30m", minutes: 30 },
  { label: "45m", minutes: 45 },
  { label: "60m", minutes: 60 },
  { label: "90m (1 cycle)", minutes: 90 },
  { label: "Continuous", minutes: null },
];

export default function SleepSupportView() {
  const { user } = useAuth();
  const { category } = useCategory();
  const [mounted, setMounted] = useState(false);

  // Audio Playback state
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);

  // Audio Sleep Timer (Auto-Off Duration) state
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Active Live Sleep Session state
  const [isLiveSleepActive, setIsLiveSleepActive] = useState<boolean>(false);
  const [liveSleepStartTime, setLiveSleepStartTime] = useState<number | null>(null);
  const [liveSleepElapsedSeconds, setLiveSleepElapsedSeconds] = useState<number>(0);
  const liveSleepIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sleep Duration Stats & History state
  const [sleepStats, setSleepStats] = useState<{
    averageDurationMinutes: number;
    averageCycles: number;
    averageQuality: number;
    totalLogs: number;
    lastSleep: {
      durationMinutes: number;
      durationFormatted: string;
      cycles: number;
      quality: number;
      bedtime: string;
      wakeTime: string;
    };
    weeklyTrend: Array<{ day: string; minutes: number; quality: number }>;
  }>({
    averageDurationMinutes: 454,
    averageCycles: 5.0,
    averageQuality: 4.1,
    totalLogs: 7,
    lastSleep: {
      durationMinutes: 465,
      durationFormatted: "7h 45m",
      cycles: 5.2,
      quality: 4,
      bedtime: "23:00",
      wakeTime: "06:45",
    },
    weeklyTrend: [
      { day: "Mon", minutes: 450, quality: 4 },
      { day: "Tue", minutes: 420, quality: 3 },
      { day: "Wed", minutes: 480, quality: 5 },
      { day: "Thu", minutes: 390, quality: 3 },
      { day: "Fri", minutes: 465, quality: 4 },
      { day: "Sat", minutes: 510, quality: 5 },
      { day: "Sun", minutes: 465, quality: 4 },
    ],
  });

  // Log Sleep Duration Modal state
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [logBedtime, setLogBedtime] = useState<string>("23:00");
  const [logWakeTime, setLogWakeTime] = useState<string>("07:15");
  const [logQuality, setLogQuality] = useState<number>(4);
  const [logNotes, setLogNotes] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Ambient Sounds", "Deep Rest"]);
  const [isSavingSleepLog, setIsSavingSleepLog] = useState<boolean>(false);
  const [sleepLogSuccessToast, setSleepLogSuccessToast] = useState<string | null>(null);

  // Sleep Cycle Calculator state
  const [calcMode, setCalcMode] = useState<"wake" | "bed">("wake");
  const [calcWakeTime, setCalcWakeTime] = useState<string>("07:00");

  // Evening Reflection state
  const [reflectionText, setReflectionText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSavedMessage, setNoteSavedMessage] = useState(false);

  // Web Audio Synth references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const soundNodesRef = useRef<any[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchSleepStats();
  }, []);

  const fetchSleepStats = async () => {
    try {
      const res = await fetch("/api/sleep/stats");
      if (res.ok) {
        const data = await res.json();
        setSleepStats(data);
      }
    } catch (e) {
      console.warn("Could not load sleep stats from API:", e);
    }
  };

  const userName = mounted ? (user?.name || user?.sanctuaryName || "Friend") : "Friend";

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
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (liveSleepIntervalRef.current) clearInterval(liveSleepIntervalRef.current);
    };
  }, []);

  // Audio Sleep Timer Countdown logic
  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    if (isPlaying && timerSecondsLeft !== null && timerSecondsLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev === null || prev <= 1) {
            // Fade out audio smoothly over 3 seconds
            if (gainNodeRef.current && audioCtxRef.current) {
              try {
                gainNodeRef.current.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 3);
              } catch (e) {}
            }
            setTimeout(() => {
              stopAudio();
              setIsPlaying(false);
            }, 3000);
            setSleepTimerMinutes(null);
            setSleepLogSuccessToast("🌙 Sleep timer ended. Rest peacefully!");
            setTimeout(() => setSleepLogSuccessToast(null), 4000);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isPlaying, timerSecondsLeft]);

  // Live Sleep Session Timer
  useEffect(() => {
    if (isLiveSleepActive) {
      liveSleepIntervalRef.current = setInterval(() => {
        if (liveSleepStartTime) {
          const diff = Math.floor((Date.now() - liveSleepStartTime) / 1000);
          setLiveSleepElapsedSeconds(diff);
        }
      }, 1000);
    } else {
      if (liveSleepIntervalRef.current) clearInterval(liveSleepIntervalRef.current);
    }
    return () => {
      if (liveSleepIntervalRef.current) clearInterval(liveSleepIntervalRef.current);
    };
  }, [isLiveSleepActive, liveSleepStartTime]);

  const handleSetTimer = (minutes: number | null) => {
    setSleepTimerMinutes(minutes);
    if (minutes === null) {
      setTimerSecondsLeft(null);
    } else {
      setTimerSecondsLeft(minutes * 60);
      if (!isPlaying) {
        handleToggleMasterPlay();
      }
    }
  };

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

  // Calculate sleep duration from bedtime & wakeTime
  const computeCalculatedDuration = (bed: string, wake: string): { minutes: number; hours: number; mins: number; cycles: number } => {
    const [bH, bM] = bed.split(":").map(Number);
    const [wH, wM] = wake.split(":").map(Number);
    if (isNaN(bH) || isNaN(bM) || isNaN(wH) || isNaN(wM)) {
      return { minutes: 480, hours: 8, mins: 0, cycles: 5.3 };
    }

    let bTotal = bH * 60 + bM;
    let wTotal = wH * 60 + wM;
    if (wTotal <= bTotal) {
      wTotal += 24 * 60; // crossed midnight
    }

    const diff = wTotal - bTotal;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    const cycles = parseFloat((diff / 90).toFixed(1));
    return { minutes: diff, hours, mins, cycles };
  };

  const currentDurationCalc = computeCalculatedDuration(logBedtime, logWakeTime);

  // Submit Sleep Duration Log
  const handleSaveSleepLog = async () => {
    setIsSavingSleepLog(true);
    try {
      const res = await fetch("/api/sleep/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bedtime: logBedtime,
          wakeTime: logWakeTime,
          durationMinutes: currentDurationCalc.minutes,
          quality: logQuality,
          notes: logNotes,
          tags: selectedTags,
        }),
      });

      if (res.ok) {
        setSleepLogSuccessToast(`Logged ${currentDurationCalc.hours}h ${currentDurationCalc.mins > 0 ? `${currentDurationCalc.mins}m` : ""} of sleep!`);
        setShowLogModal(false);
        fetchSleepStats();
        setTimeout(() => setSleepLogSuccessToast(null), 4500);
      }
    } catch (e) {
      console.error("Failed to submit sleep log:", e);
    } finally {
      setIsSavingSleepLog(false);
    }
  };

  // Toggle Live Sleep Tracking Session
  const handleToggleLiveSleep = () => {
    if (!isLiveSleepActive) {
      setIsLiveSleepActive(true);
      setLiveSleepStartTime(Date.now());
      setLiveSleepElapsedSeconds(0);
    } else {
      // Wake up & open logger prefilled with elapsed duration
      setIsLiveSleepActive(false);
      const elapsedMins = Math.max(15, Math.round(liveSleepElapsedSeconds / 60));
      const now = new Date();
      const wakeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

      const bedDate = new Date(now.getTime() - elapsedMins * 60000);
      const bedStr = `${bedDate.getHours().toString().padStart(2, "0")}:${bedDate.getMinutes().toString().padStart(2, "0")}`;

      setLogBedtime(bedStr);
      setLogWakeTime(wakeStr);
      setShowLogModal(true);
    }
  };

  // 90-Minute Sleep Cycle Calculator recommendations
  const getCycleRecommendations = () => {
    const [wH, wM] = calcWakeTime.split(":").map(Number);
    if (isNaN(wH) || isNaN(wM)) return [];

    const wakeMinutes = wH * 60 + wM;
    const fallAsleepBuffer = 14; // Average 14 mins to fall asleep

    // Calculate bedtime for 6, 5, and 4 cycles
    const cycles = [
      { count: 6, hours: "9h 00m", label: "Extended Recovery", optimal: false, emoji: "🌟" },
      { count: 5, hours: "7h 30m", label: "Recommended Optimal", optimal: true, emoji: "⭐" },
      { count: 4, hours: "6h 00m", label: "Minimum Rest", optimal: false, emoji: "⚡" },
    ];

    return cycles.map((c) => {
      const sleepDurationMinutes = c.count * 90;
      let bedTotal = wakeMinutes - sleepDurationMinutes - fallAsleepBuffer;
      while (bedTotal < 0) bedTotal += 24 * 60;

      const bH = Math.floor(bedTotal / 60) % 24;
      const bM = bedTotal % 60;
      const period = bH >= 12 ? "PM" : "AM";
      const displayH = bH % 12 === 0 ? 12 : bH % 12;
      const timeStr = `${displayH}:${bM.toString().padStart(2, "0")} ${period}`;

      return {
        ...c,
        bedtimeStr: timeStr,
        rawTime: `${bH.toString().padStart(2, "0")}:${bM.toString().padStart(2, "0")}`,
      };
    });
  };

  const activeSoundObj = SOUNDSCAPES.find((s) => s.id === activeSoundId);

  // Format seconds to mm:ss
  const formatTimer = (sec: number | null) => {
    if (sec === null) return "--:--";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Format live sleep seconds to 00h 00m 00s
  const formatLiveSleep = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  };

  const avgH = Math.floor(sleepStats.averageDurationMinutes / 60);
  const avgM = sleepStats.averageDurationMinutes % 60;

  return (
    <div className="w-full min-w-0 flex flex-col gap-5 select-none animate-fade-in relative">
      {/* Toast Notification */}
      {sleepLogSuccessToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#006C56] text-white shadow-xl animate-in slide-in-from-top-3 duration-200">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span className="text-xs font-heading font-bold">{sleepLogSuccessToast}</span>
        </div>
      )}

      {/* 1. Full-Width Header Banner with Integrated Player Controller & Sleep Timer */}
      <div className="bg-white dark:bg-[#102F27] rounded-3xl p-5 sm:p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#88F7D6] text-[10.5px] font-heading font-black tracking-wider uppercase border border-[#D2EAE0] dark:border-[#23483E]">
              <span>🌙 REST & SLEEP RECOVERY</span>
              <span>•</span>
              <span>WIND-DOWN MANRAAH</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
              Night Sleep Support & Duration Hub
            </h1>
            <p className="text-xs text-[#5A756C] dark:text-[#A9C5BC] max-w-xl font-medium">
              Track your sleep duration, calculate restorative 90-minute sleep cycles, and wind down with continuous ambient soundscapes and auto-stop sleep timers.
            </p>
          </div>

          {/* Master Audio Controller Pill */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#F4F9F6] dark:bg-[#14382F] p-3 px-4 rounded-2xl border border-[#E2ECE6] dark:border-[#23483E] self-start lg:self-auto min-w-[310px]">
            <div className="flex items-center gap-3 min-w-0 flex-1">
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
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#006C56] dark:text-[#88F7D6] font-semibold">
                    {isPlaying ? "Playing soundscape" : "Ready to play"}
                  </span>
                  {timerSecondsLeft !== null && isPlaying && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#006C56]/10 text-[#006C56] dark:text-[#88F7D6] text-[9.5px] font-mono font-bold">
                      ⏳ {formatTimer(timerSecondsLeft)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Volume & Quick Sleep Timer Action */}
            <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-[#E2ECE6] dark:border-[#23483E] sm:pl-3">
              <div className="flex items-center gap-1.5">
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
                  className="w-14 sm:w-16 accent-[#006C56] dark:accent-[#00A982] cursor-pointer h-1"
                  title={`Volume: ${Math.round(volume * 100)}%`}
                />
              </div>

              {/* Sleep Timer Selector */}
              <div className="relative group">
                <button
                  type="button"
                  className={`px-2.5 py-1.5 rounded-xl text-[10.5px] font-heading font-bold flex items-center gap-1 border transition-colors cursor-pointer ${
                    sleepTimerMinutes !== null
                      ? "bg-[#006C56] text-white border-[#006C56]"
                      : "bg-white dark:bg-[#102F27] text-[#5A756C] dark:text-[#A9C5BC] border-[#E2ECE6] dark:border-[#23483E] hover:border-[#006C56]"
                  }`}
                  title="Set Sleep Timer Duration"
                >
                  <span className="material-symbols-outlined text-xs">timer</span>
                  <span>{sleepTimerMinutes ? `${sleepTimerMinutes}m` : "Timer"}</span>
                </button>

                {/* Dropdown presets */}
                <div className="absolute right-0 top-full mt-1.5 w-36 bg-white dark:bg-[#102F27] border border-[#E2ECE6] dark:border-[#23483E] rounded-2xl shadow-xl p-1.5 hidden group-hover:flex flex-col gap-1 z-30">
                  <span className="text-[9px] font-heading font-black text-[#5A756C] dark:text-[#A9C5BC] uppercase px-2 py-1">
                    Auto-Off Duration
                  </span>
                  {TIMER_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleSetTimer(p.minutes)}
                      className={`text-left px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        sleepTimerMinutes === p.minutes
                          ? "bg-[#006C56] text-white font-bold"
                          : "text-[#19332A] dark:text-[#F4FAF7] hover:bg-[#F4FAF7] dark:hover:bg-[#14382F]"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SLEEP DURATION METRICS & QUICK LOGGING HUB */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Average Sleep Duration */}
        <div className="bg-white dark:bg-[#102F27] rounded-3xl p-5 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#88F7D6] flex items-center justify-center">
                <span className="material-symbols-outlined text-base">bedtime</span>
              </div>
              <div>
                <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#5A756C] dark:text-[#A9C5BC]">
                  Sleep Duration
                </span>
                <h3 className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                  7-Day Average
                </h3>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#88F7D6] border border-[#D2EAE0] dark:border-[#23483E]">
              Target: 7-9h
            </span>
          </div>

          <div className="my-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                {avgH}h {avgM > 0 ? `${avgM}m` : ""}
              </span>
              <span className="text-xs text-[#006C56] dark:text-[#88F7D6] font-semibold">
                • {sleepStats.averageCycles} cycles
              </span>
            </div>
            <p className="text-[11px] text-[#5A756C] dark:text-[#A9C5BC] mt-1 font-medium">
              Last night: {sleepStats.lastSleep.durationFormatted} ({sleepStats.lastSleep.bedtime} - {sleepStats.lastSleep.wakeTime})
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowLogModal(true)}
            className="w-full py-2.5 rounded-2xl bg-[#006C56] hover:bg-[#005241] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] text-xs font-heading font-black transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Log Sleep Duration</span>
          </button>
        </div>

        {/* Card 2: Sleep Quality & Live Session */}
        <div className="bg-white dark:bg-[#102F27] rounded-3xl p-5 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#88F7D6] flex items-center justify-center">
                <span className="material-symbols-outlined text-base">health_metrics</span>
              </div>
              <div>
                <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#5A756C] dark:text-[#A9C5BC]">
                  Sleep Quality
                </span>
                <h3 className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                  Recovery Index
                </h3>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F4FAF7] dark:bg-[#071C17] text-[#006C56] dark:text-[#88F7D6] border border-[#E2ECE6] dark:border-[#23483E]">
              {sleepStats.averageQuality} / 5.0
            </span>
          </div>

          <div className="my-1">
            <div className="flex items-center gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="material-symbols-outlined text-lg">
                  {i < Math.round(sleepStats.averageQuality) ? "star" : "star_border"}
                </span>
              ))}
              <span className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7] ml-1.5">
                {Math.round((sleepStats.averageQuality / 5) * 100)}% Restful
              </span>
            </div>
            <p className="text-[11px] text-[#5A756C] dark:text-[#A9C5BC] mt-1 font-medium">
              {isLiveSleepActive
                ? `Active sleep tracking: ${formatLiveSleep(liveSleepElapsedSeconds)}`
                : "Tracking consistent sleep timing & restorative sleep cycles"}
            </p>
          </div>

          {/* Live Sleep Tracker Button */}
          <button
            type="button"
            onClick={handleToggleLiveSleep}
            className={`w-full py-2.5 rounded-2xl text-xs font-heading font-black transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5 ${
              isLiveSleepActive
                ? "bg-[#D97706] hover:bg-[#B45309] text-white animate-pulse"
                : "bg-[#F4FAF7] dark:bg-[#14382F] hover:bg-[#E2ECE6] dark:hover:bg-[#1b4439] text-[#006C56] dark:text-[#88F7D6] border border-[#D2EAE0] dark:border-[#23483E]"
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {isLiveSleepActive ? "alarm_on" : "bed"}
            </span>
            <span>{isLiveSleepActive ? "☀️ Wake Up & Save Sleep" : "🌙 Start Sleep Tracker"}</span>
          </button>
        </div>

        {/* Card 3: 7-Day Sleep Duration Trend Bar Chart */}
        <div className="bg-white dark:bg-[#102F27] rounded-3xl p-5 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#88F7D6] flex items-center justify-center">
                <span className="material-symbols-outlined text-base">monitoring</span>
              </div>
              <div>
                <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#5A756C] dark:text-[#A9C5BC]">
                  Duration Trend
                </span>
                <h3 className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                  Last 7 Nights
                </h3>
              </div>
            </div>
            <span className="text-[10px] text-[#5A756C] dark:text-[#A9C5BC] font-semibold">
              Goal 8h
            </span>
          </div>

          {/* Symmetrical Mini Bar Chart */}
          <div className="flex items-end justify-between gap-1.5 h-16 pt-2 px-1">
            {sleepStats.weeklyTrend.map((item, idx) => {
              const hours = (item.minutes / 60).toFixed(1);
              // Max height 10 hours = 600m
              const heightPercent = Math.min(100, Math.max(20, Math.round((item.minutes / 600) * 100)));
              const isTargetMet = item.minutes >= 420; // 7+ hours

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 hidden group-hover:flex items-center px-1.5 py-0.5 rounded-lg bg-[#19332A] text-white text-[9px] font-mono whitespace-nowrap z-20 pointer-events-none shadow-md">
                    {hours}h
                  </div>

                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      isTargetMet
                        ? "bg-[#006C56] dark:bg-[#00A982] group-hover:opacity-85"
                        : "bg-[#D97706]/70 group-hover:bg-[#D97706]"
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[9.5px] font-heading font-bold text-[#5A756C] dark:text-[#A9C5BC]">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#5A756C] dark:text-[#A9C5BC] pt-1 border-t border-[#E2ECE6] dark:border-[#23483E]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#006C56] dark:bg-[#00A982]"></span>
              Optimal (7h+)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#D97706]/80"></span>
              Under 7h
            </span>
          </div>
        </div>
      </div>

      {/* 3. SMART 90-MINUTE SLEEP CYCLE DURATION CALCULATOR */}
      <div className="bg-white dark:bg-[#102F27] rounded-3xl p-5 sm:p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E2ECE6] dark:border-[#23483E]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#88F7D6] flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">alarm</span>
            </div>
            <div>
              <h2 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7] uppercase tracking-wider">
                90-Minute Sleep Cycle & Bedtime Calculator
              </h2>
              <p className="text-[11px] text-[#5A756C] dark:text-[#A9C5BC]">
                Wake up at the end of a sleep cycle to avoid sleep inertia and wake refreshed.
              </p>
            </div>
          </div>

          {/* Wake-Up Time Selector */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-heading font-bold text-[#19332A] dark:text-[#F4FAF7]">
              Wake up at:
            </span>
            <input
              type="time"
              value={calcWakeTime}
              onChange={(e) => setCalcWakeTime(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#F4FAF7] dark:bg-[#071C17] border border-[#E2ECE6] dark:border-[#23483E] text-xs font-mono font-bold text-[#006C56] dark:text-[#88F7D6] focus:outline-none focus:ring-1 focus:ring-[#006C56] cursor-pointer"
            />
          </div>
        </div>

        {/* Calculated Cycle Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {getCycleRecommendations().map((c) => (
            <div
              key={c.count}
              className={`p-4 rounded-2xl border transition-all ${
                c.optimal
                  ? "bg-[#EAF6F0] dark:bg-[#14382F] border-[#006C56] dark:border-[#00A982] ring-1 ring-[#006C56]/30 shadow-xs"
                  : "bg-[#F4FAF7] dark:bg-[#071C17] border-[#E2ECE6] dark:border-[#23483E]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">{c.emoji}</span>
                <span
                  className={`text-[9.5px] font-heading font-black uppercase px-2 py-0.5 rounded-full ${
                    c.optimal
                      ? "bg-[#006C56] text-white"
                      : "bg-white dark:bg-[#14382F] text-[#5A756C] dark:text-[#A9C5BC] border border-[#E2ECE6] dark:border-[#23483E]"
                  }`}
                >
                  {c.label}
                </span>
              </div>

              <div className="mt-2 space-y-0.5">
                <span className="text-xs text-[#5A756C] dark:text-[#A9C5BC] font-medium block">
                  Go to bed at:
                </span>
                <p className="text-xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                  {c.bedtimeStr}
                </p>
                <p className="text-[10.5px] text-[#006C56] dark:text-[#88F7D6] font-semibold">
                  {c.count} cycles • {c.hours} duration
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setLogBedtime(c.rawTime);
                  setLogWakeTime(calcWakeTime);
                  setShowLogModal(true);
                }}
                className="mt-3 w-full py-1.5 rounded-xl bg-white dark:bg-[#102F27] hover:bg-[#F4FAF7] dark:hover:bg-[#14382F] border border-[#E2ECE6] dark:border-[#23483E] text-[10.5px] font-heading font-bold text-[#19332A] dark:text-[#F4FAF7] transition-colors cursor-pointer"
              >
                Set this Schedule
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Ambient Soundscape Cards (3-Column Balanced Grid) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7] uppercase tracking-wider">
            Ambient Soundscape Tracks
          </h2>
          <span className="text-xs text-[#5A756C] dark:text-[#A9C5BC] font-medium">
            Continuous Web Audio synthesis • Click to play with sleep timer
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

      {/* 5. Bottom Two-Column Balanced Layout: Evening Reflection + 4-7-8 Technique */}
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

      {/* 6. LOG SLEEP DURATION MODAL */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#102F27] rounded-3xl border border-[#E2ECE6] dark:border-[#23483E] shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2ECE6] dark:border-[#23483E]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006C56] dark:text-[#88F7D6]">
                  bedtime
                </span>
                <h3 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                  Log Sleep Duration
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="w-8 h-8 rounded-full bg-[#F4FAF7] dark:bg-[#14382F] text-[#5A756C] dark:text-[#A9C5BC] hover:text-[#19332A] dark:hover:text-[#F4FAF7] flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Time Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-heading font-bold text-[#5A756C] dark:text-[#A9C5BC]">
                  Bedtime
                </label>
                <input
                  type="time"
                  value={logBedtime}
                  onChange={(e) => setLogBedtime(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#F4FAF7] dark:bg-[#071C17] border border-[#E2ECE6] dark:border-[#23483E] text-xs font-mono font-bold text-[#19332A] dark:text-[#F4FAF7] focus:outline-none focus:ring-1 focus:ring-[#006C56]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-heading font-bold text-[#5A756C] dark:text-[#A9C5BC]">
                  Wake-Up Time
                </label>
                <input
                  type="time"
                  value={logWakeTime}
                  onChange={(e) => setLogWakeTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#F4FAF7] dark:bg-[#071C17] border border-[#E2ECE6] dark:border-[#23483E] text-xs font-mono font-bold text-[#19332A] dark:text-[#F4FAF7] focus:outline-none focus:ring-1 focus:ring-[#006C56]"
                />
              </div>
            </div>

            {/* Auto Calculated Duration Highlight Banner */}
            <div className="p-3 rounded-2xl bg-[#EAF6F0] dark:bg-[#14382F] border border-[#D2EAE0] dark:border-[#23483E] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-heading font-bold text-[#006C56] dark:text-[#88F7D6] uppercase tracking-wider block">
                  Calculated Duration
                </span>
                <span className="text-xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                  {currentDurationCalc.hours}h {currentDurationCalc.mins > 0 ? `${currentDurationCalc.mins}m` : ""}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-heading font-bold text-[#006C56] dark:text-[#88F7D6] block">
                  {currentDurationCalc.cycles} Sleep Cycles
                </span>
                <span className="text-[10px] text-[#5A756C] dark:text-[#A9C5BC]">
                  (approx 90 min/cycle)
                </span>
              </div>
            </div>

            {/* Sleep Quality Rating */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-heading font-bold text-[#5A756C] dark:text-[#A9C5BC]">
                How restorative was your sleep?
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { star: 1, label: "Poor", emoji: "😴" },
                  { star: 2, label: "Restless", emoji: "😐" },
                  { star: 3, label: "Fair", emoji: "🙂" },
                  { star: 4, label: "Good", emoji: "😊" },
                  { star: 5, label: "Deep Rest", emoji: "🌟" },
                ].map((item) => (
                  <button
                    key={item.star}
                    type="button"
                    onClick={() => setLogQuality(item.star)}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      logQuality === item.star
                        ? "bg-[#006C56] text-white border-[#006C56] shadow-xs"
                        : "bg-[#F4FAF7] dark:bg-[#071C17] text-[#5A756C] dark:text-[#A9C5BC] border-[#E2ECE6] dark:border-[#23483E] hover:border-[#006C56]"
                    }`}
                  >
                    <span className="text-base">{item.emoji}</span>
                    <span className="text-[9.5px] font-heading font-bold truncate">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep Tags */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-heading font-bold text-[#5A756C] dark:text-[#A9C5BC]">
                Sleep Factors & Environment
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Ambient Sounds",
                  "Deep Rest",
                  "No Screens",
                  "Woke Up During Night",
                  "Vivid Dreams",
                  "Early Waking",
                  "Late Caffeine",
                ].map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSelectedTags((prev) =>
                          isSelected ? prev.filter((t) => t !== tag) : [...prev, tag]
                        );
                      }}
                      className={`px-2.5 py-1 rounded-full text-[10.5px] font-heading font-bold transition-colors cursor-pointer border ${
                        isSelected
                          ? "bg-[#006C56] text-white border-[#006C56]"
                          : "bg-white dark:bg-[#102F27] text-[#5A756C] dark:text-[#A9C5BC] border-[#E2ECE6] dark:border-[#23483E]"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E2ECE6] dark:border-[#23483E]">
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-heading font-bold text-[#5A756C] dark:text-[#A9C5BC] hover:bg-[#F4FAF7] dark:hover:bg-[#14382F] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSleepLog}
                disabled={isSavingSleepLog}
                className="px-5 py-2 rounded-xl bg-[#006C56] hover:bg-[#005241] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] text-xs font-heading font-black transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSavingSleepLog ? "Saving..." : "Save Sleep Log"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
