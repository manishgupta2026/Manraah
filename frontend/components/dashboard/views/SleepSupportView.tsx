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
  type: "rain" | "waves" | "forest" | "brown" | "delta" | "fire";
}

const SOUNDSCAPES: Soundscape[] = [
  {
    id: "rain",
    title: "Gentle Night Rain",
    desc: "Soft rain patter on the windowpane to dissolve racing thoughts",
    icon: "water_drop",
    category: "Nature Sound",
    duration: "Continuous",
    type: "rain",
  },
  {
    id: "waves",
    title: "Deep Ocean Waves",
    desc: "Low-frequency rhythmic ocean tides for slow-wave restorative sleep",
    icon: "waves",
    category: "Ocean Ambiance",
    duration: "Continuous",
    type: "waves",
  },
  {
    id: "forest",
    title: "Pine Forest & Crickets",
    desc: "Midnight breeze through pine needles with tranquil cricket chirps",
    icon: "forest",
    category: "Night Nature",
    duration: "Continuous",
    type: "forest",
  },
  {
    id: "brown",
    title: "Warm Brown Noise",
    desc: "Deep warm low-frequency roar that blankets distracting ambient sounds",
    icon: "air",
    category: "Frequency Masking",
    duration: "Continuous",
    type: "brown",
  },
  {
    id: "delta",
    title: "Binaural Delta (2Hz)",
    desc: "Scientific brainwave beat entrainment to guide brainwaves into deep REM sleep",
    icon: "graphic_eq",
    category: "Brainwave Entrainment",
    duration: "Continuous",
    type: "delta",
  },
  {
    id: "fire",
    title: "Cozy Fireside Embers",
    desc: "Soft crackling fireplace embers that induce soothing bedtime warmth",
    icon: "local_fire_department",
    category: "Cozy Ambiance",
    duration: "Continuous",
    type: "fire",
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

  // Active section tab switcher
  const [activeSectionTab, setActiveSectionTab] = useState<"all" | "audio" | "breath" | "tracker">("all");

  // Single audio playback & mixer state
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Multi-track mixer mode
  const [isMixerMode, setIsMixerMode] = useState<boolean>(false);
  const [mixerTracks, setMixerTracks] = useState<Record<string, { enabled: boolean; volume: number }>>({
    rain: { enabled: true, volume: 0.6 },
    forest: { enabled: true, volume: 0.3 },
    brown: { enabled: false, volume: 0.4 },
    delta: { enabled: false, volume: 0.5 },
    waves: { enabled: false, volume: 0.5 },
    fire: { enabled: false, volume: 0.4 },
  });

  // Audio Sleep Timer (Auto-Off Duration)
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Active Live Sleep Session Stopwatch
  const [isLiveSleepActive, setIsLiveSleepActive] = useState<boolean>(false);
  const [liveSleepStartTime, setLiveSleepStartTime] = useState<number | null>(null);
  const [liveSleepElapsedSeconds, setLiveSleepElapsedSeconds] = useState<number>(0);
  const liveSleepIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Interactive 4-7-8 Breathing Guide state
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathSecondsLeft, setBreathSecondsLeft] = useState<number>(4);
  const [breathCycleCount, setBreathCycleCount] = useState<number>(1);
  const [isBreathChimeEnabled, setIsBreathChimeEnabled] = useState<boolean>(true);
  const breathIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sleep Duration Stats & History
  const [sleepStats, setSleepStats] = useState<{
    averageDurationMinutes: number;
    averageCycles: number;
    averageQuality: number;
    totalLogs: number;
    sleepDebtHours: number;
    averageLatencyMinutes: number;
    averageEfficiency: number;
    lastSleep: {
      id: number;
      durationMinutes: number;
      durationFormatted: string;
      cycles: number;
      quality: number;
      bedtime: string;
      wakeTime: string;
      latencyMinutes: number;
      awakenings: number;
      notes: string;
      createdAt: string;
    };
    weeklyTrend: Array<{ day: string; minutes: number; quality: number }>;
    logs: Array<{
      id: number;
      durationMinutes: number;
      durationFormatted: string;
      cycles: number;
      quality: number;
      bedtime: string;
      wakeTime: string;
      latencyMinutes: number;
      awakenings: number;
      notes: string;
      createdAt: string;
    }>;
  }>({
    averageDurationMinutes: 465,
    averageCycles: 5.2,
    averageQuality: 4.2,
    totalLogs: 7,
    sleepDebtHours: 0.5,
    averageLatencyMinutes: 14,
    averageEfficiency: 91,
    lastSleep: {
      id: 0,
      durationMinutes: 465,
      durationFormatted: "7h 45m",
      cycles: 5.2,
      quality: 4,
      bedtime: "23:00",
      wakeTime: "06:45",
      latencyMinutes: 14,
      awakenings: 0,
      notes: "Deep restorative sleep",
      createdAt: new Date().toISOString(),
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
    logs: [],
  });

  // Log Sleep Duration Modal state
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);
  const [logBedtime, setLogBedtime] = useState<string>("23:00");
  const [logWakeTime, setLogWakeTime] = useState<string>("07:15");
  const [logLatency, setLogLatency] = useState<number>(15);
  const [logAwakenings, setLogAwakenings] = useState<number>(0);
  const [logQuality, setLogQuality] = useState<number>(4);
  const [logNotes, setLogNotes] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Ambient Sounds", "Deep Rest"]);
  const [isSavingSleepLog, setIsSavingSleepLog] = useState<boolean>(false);
  const [sleepLogSuccessToast, setSleepLogSuccessToast] = useState<string | null>(null);

  // Evening Reflection state
  const [reflectionText, setReflectionText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSavedMessage, setNoteSavedMessage] = useState(false);

  // Web Audio Synth references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const activeNodesRef = useRef<Map<string, { nodes: any[]; gain: GainNode }>>(new Map());

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
      console.warn("Could not load sleep stats:", e);
    }
  };

  const userName = mounted ? (user?.name || user?.sanctuaryName || "Friend") : "Friend";

  // Ensure AudioContext
  const getAudioContext = (): AudioContext => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Play gentle bell sound for breathing cues
  const playBreathChime = (freq = 440) => {
    if (!isBreathChimeEnabled) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {}
  };

  // Build sound synthesis node
  const createSoundNode = (ctx: AudioContext, type: Soundscape["type"], outGain: GainNode) => {
    const nodes: any[] = [];
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
      filter.frequency.setValueAtTime(750, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(outGain);
      whiteNoise.start();
      nodes.push(whiteNoise, filter);
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
      filter.frequency.setValueAtTime(320, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.1, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(220, ctx.currentTime);

      lfo.connect(filter.frequency);
      noise.connect(filter);
      filter.connect(outGain);

      noise.start();
      lfo.start();
      nodes.push(noise, filter, lfo, lfoGain);
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
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      const cricketOsc = ctx.createOscillator();
      cricketOsc.type = "sine";
      cricketOsc.frequency.setValueAtTime(4400, ctx.currentTime);
      const cricketGain = ctx.createGain();
      cricketGain.gain.setValueAtTime(0.0035, ctx.currentTime);

      noise.connect(filter);
      filter.connect(outGain);
      cricketOsc.connect(cricketGain);
      cricketGain.connect(outGain);

      noise.start();
      cricketOsc.start();
      nodes.push(noise, filter, cricketOsc, cricketGain);
    } else if (type === "brown") {
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }
      const brown = ctx.createBufferSource();
      brown.buffer = noiseBuffer;
      brown.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(400, ctx.currentTime);

      brown.connect(filter);
      filter.connect(outGain);
      brown.start();
      nodes.push(brown, filter);
    } else if (type === "delta") {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(108, ctx.currentTime);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(110, ctx.currentTime); // 2Hz Delta wave difference

      osc1.connect(outGain);
      osc2.connect(outGain);
      osc1.start();
      osc2.start();
      nodes.push(osc1, osc2);
    } else {
      // Fire
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * (Math.random() > 0.94 ? 2.5 : 0.35);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(650, ctx.currentTime);

      noise.connect(filter);
      filter.connect(outGain);
      noise.start();
      nodes.push(noise, filter);
    }
    return nodes;
  };

  // Stop all audio
  const stopAllAudio = () => {
    activeNodesRef.current.forEach(({ nodes, gain }) => {
      nodes.forEach((n) => {
        try {
          if (n.stop) n.stop();
          if (n.disconnect) n.disconnect();
        } catch {}
      });
      try {
        gain.disconnect();
      } catch {}
    });
    activeNodesRef.current.clear();
  };

  // Start single soundscape
  const startSingleAudio = (sound: Soundscape) => {
    stopAllAudio();
    try {
      const ctx = getAudioContext();
      if (!masterGainRef.current) {
        masterGainRef.current = ctx.createGain();
        masterGainRef.current.connect(ctx.destination);
      }
      masterGainRef.current.gain.setValueAtTime(isMuted ? 0 : volume * 0.18, ctx.currentTime);

      const trackGain = ctx.createGain();
      trackGain.gain.setValueAtTime(1, ctx.currentTime);
      trackGain.connect(masterGainRef.current);

      const nodes = createSoundNode(ctx, sound.type, trackGain);
      activeNodesRef.current.set(sound.id, { nodes, gain: trackGain });
    } catch (e) {
      console.warn("Audio start error:", e);
    }
  };

  // Start mixer audio with multiple enabled tracks
  const startMixerAudio = () => {
    stopAllAudio();
    try {
      const ctx = getAudioContext();
      if (!masterGainRef.current) {
        masterGainRef.current = ctx.createGain();
        masterGainRef.current.connect(ctx.destination);
      }
      masterGainRef.current.gain.setValueAtTime(isMuted ? 0 : volume * 0.18, ctx.currentTime);

      Object.entries(mixerTracks).forEach(([id, config]) => {
        if (config.enabled) {
          const sound = SOUNDSCAPES.find((s) => s.id === id);
          if (sound) {
            const trackGain = ctx.createGain();
            trackGain.gain.setValueAtTime(config.volume, ctx.currentTime);
            trackGain.connect(masterGainRef.current!);
            const nodes = createSoundNode(ctx, sound.type, trackGain);
            activeNodesRef.current.set(id, { nodes, gain: trackGain });
          }
        }
      });
    } catch (e) {
      console.warn("Mixer audio error:", e);
    }
  };

  // Toggle play/pause
  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAllAudio();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (isMixerMode) {
        startMixerAudio();
      } else {
        const targetId = activeSoundId || "rain";
        const sound = SOUNDSCAPES.find((s) => s.id === targetId) || SOUNDSCAPES[0];
        setActiveSoundId(sound.id);
        startSingleAudio(sound);
      }
    }
  };

  // Select single sound
  const handleSelectSound = (sound: Soundscape) => {
    if (isMixerMode) {
      setIsMixerMode(false);
    }
    if (activeSoundId === sound.id && isPlaying) {
      stopAllAudio();
      setIsPlaying(false);
    } else {
      setActiveSoundId(sound.id);
      setIsPlaying(true);
      startSingleAudio(sound);
    }
  };

  // Toggle track in mixer
  const handleToggleMixerTrack = (id: string) => {
    setMixerTracks((prev) => {
      const updated = {
        ...prev,
        [id]: { ...prev[id], enabled: !prev[id].enabled },
      };
      if (isPlaying && isMixerMode) {
        setTimeout(() => startMixerAudio(), 50);
      }
      return updated;
    });
  };

  // Change individual track volume in mixer
  const handleMixerVolumeChange = (id: string, vol: number) => {
    setMixerTracks((prev) => ({
      ...prev,
      [id]: { ...prev[id], volume: vol },
    }));
    const track = activeNodesRef.current.get(id);
    if (track && audioCtxRef.current) {
      track.gain.gain.setValueAtTime(vol, audioCtxRef.current.currentTime);
    }
  };

  // Switch to mixer mode
  const handleToggleMixerMode = () => {
    const nextMode = !isMixerMode;
    setIsMixerMode(nextMode);
    if (isPlaying) {
      if (nextMode) {
        startMixerAudio();
      } else {
        const sound = SOUNDSCAPES.find((s) => s.id === (activeSoundId || "rain")) || SOUNDSCAPES[0];
        startSingleAudio(sound);
      }
    }
  };

  // Master volume and mute change
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      const effectiveVol = isMuted ? 0 : volume * 0.18;
      masterGainRef.current.gain.setValueAtTime(effectiveVol, audioCtxRef.current.currentTime);
    }
  }, [volume, isMuted]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        try {
          audioCtxRef.current.close();
        } catch {}
      }
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (liveSleepIntervalRef.current) clearInterval(liveSleepIntervalRef.current);
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    };
  }, []);

  // Sleep Timer countdown
  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    if (isPlaying && timerSecondsLeft !== null && timerSecondsLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev === null || prev <= 1) {
            // Smooth 3s fade out
            if (masterGainRef.current && audioCtxRef.current) {
              try {
                masterGainRef.current.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 3);
              } catch {}
            }
            setTimeout(() => {
              stopAllAudio();
              setIsPlaying(false);
            }, 3000);
            setSleepTimerMinutes(null);
            setSleepLogSuccessToast("🌙 Sleep timer finished. Rest peacefully!");
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

  const handleSetTimer = (minutes: number | null) => {
    setSleepTimerMinutes(minutes);
    if (minutes === null) {
      setTimerSecondsLeft(null);
    } else {
      setTimerSecondsLeft(minutes * 60);
      if (!isPlaying) {
        handleTogglePlay();
      }
    }
  };

  // 4-7-8 Breathing Guide Loop
  useEffect(() => {
    if (isBreathingActive) {
      breathIntervalRef.current = setInterval(() => {
        setBreathSecondsLeft((prev) => {
          if (prev <= 1) {
            if (breathPhase === "Inhale") {
              setBreathPhase("Hold");
              playBreathChime(523); // C5 bell
              return 7;
            } else if (breathPhase === "Hold") {
              setBreathPhase("Exhale");
              playBreathChime(392); // G4 bell
              return 8;
            } else {
              // Finish Exhale -> Next cycle
              setBreathPhase("Inhale");
              playBreathChime(440); // A4 bell
              setBreathCycleCount((c) => {
                if (c >= 4) {
                  setIsBreathingActive(false);
                  setSleepLogSuccessToast("✨ 4 Bedtime cycles complete. Body is in parasympathetic recovery mode.");
                  setTimeout(() => setSleepLogSuccessToast(null), 5000);
                  return 1;
                }
                return c + 1;
              });
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    }
    return () => {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    };
  }, [isBreathingActive, breathPhase, breathCycleCount]);

  const handleStartBreath = () => {
    setIsBreathingActive(true);
    setBreathPhase("Inhale");
    setBreathSecondsLeft(4);
    playBreathChime(440);
  };

  const handlePauseBreath = () => {
    setIsBreathingActive(false);
  };

  const handleResetBreath = () => {
    setIsBreathingActive(false);
    setBreathPhase("Inhale");
    setBreathSecondsLeft(4);
    setBreathCycleCount(1);
  };

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

  const handleToggleLiveSleep = () => {
    if (!isLiveSleepActive) {
      setIsLiveSleepActive(true);
      setLiveSleepStartTime(Date.now());
      setLiveSleepElapsedSeconds(0);
    } else {
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

  // Compute duration, cycles, efficiency
  const computeCalculatedDuration = (bed: string, wake: string, latency = 15, wakes = 0) => {
    const [bH, bM] = bed.split(":").map(Number);
    const [wH, wM] = wake.split(":").map(Number);
    if (isNaN(bH) || isNaN(bM) || isNaN(wH) || isNaN(wM)) {
      return { totalMinutes: 480, hours: 8, mins: 0, cycles: 5.3, efficiency: 92 };
    }

    let bTotal = bH * 60 + bM;
    let wTotal = wH * 60 + wM;
    if (wTotal <= bTotal) {
      wTotal += 24 * 60; // crossed midnight
    }

    const totalMinutes = wTotal - bTotal;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const cycles = parseFloat((totalMinutes / 90).toFixed(1));

    // Efficiency: totalMinutes / (totalMinutes + latency + wakes * 15)
    const timeInBed = totalMinutes + latency + wakes * 15;
    const efficiency = Math.min(100, Math.round((totalMinutes / Math.max(1, timeInBed)) * 100));

    return { totalMinutes, hours, mins, cycles, efficiency };
  };

  const currentDurationCalc = computeCalculatedDuration(logBedtime, logWakeTime, logLatency, logAwakenings);

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
          durationMinutes: currentDurationCalc.totalMinutes,
          quality: logQuality,
          latencyMinutes: logLatency,
          awakenings: logAwakenings,
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

  // Delete a sleep log entry
  const handleDeleteSleepLog = async (id: number) => {
    if (!confirm("Are you sure you want to delete this sleep entry?")) return;
    try {
      const res = await fetch(`/api/sleep/log?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSleepLogSuccessToast("Entry removed");
        fetchSleepStats();
        setTimeout(() => setSleepLogSuccessToast(null), 3000);
      }
    } catch (e) {
      console.error("Failed to delete log:", e);
    }
  };

  // Save Evening Reflection
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

  const formatTimer = (sec: number | null) => {
    if (sec === null) return "--:--";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

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

      {/* 1. Header Banner & Integrated Master Audio Controller */}
      <div className="bg-white dark:bg-[#102F27] rounded-3xl p-5 sm:p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#88F7D6] text-[10.5px] font-heading font-black tracking-wider border border-[#D2EAE0] dark:border-[#23483E]">
              <span>🌙 Rest & recovery</span>
              <span>•</span>
              <span>Wind-down Manraah</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
              Night Sleep Support & Duration Hub
            </h1>
            <p className="text-xs text-[#5A756C] dark:text-[#A9C5BC] max-w-xl font-medium">
              Achieve deep, restorative sleep with layered ambient soundscapes, auto-stop sleep timers, active 4-7-8 breathing, and science-backed sleep duration tracking.
            </p>
          </div>

          {/* Master Soundscape Player Controller */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#F4F9F6] dark:bg-[#14382F] p-3 px-4 rounded-2xl border border-[#E2ECE6] dark:border-[#23483E] self-start lg:self-auto min-w-[320px]">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="w-10 h-10 rounded-full bg-[#006C56] hover:bg-[#005241] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] flex items-center justify-center shadow-xs cursor-pointer transition-all shrink-0"
                title={isPlaying ? "Pause audio" : "Play audio"}
              >
                <span className="material-symbols-outlined text-xl">
                  {isPlaying ? "pause" : "play_arrow"}
                </span>
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-heading font-bold text-[#19332A] dark:text-[#F4FAF7] truncate">
                    {isMixerMode
                      ? "Custom Layered Soundscape"
                      : activeSoundObj ? activeSoundObj.title : "Gentle Night Rain"}
                  </p>
                  {isMixerMode && (
                    <span className="px-1.5 py-0.2 rounded-md bg-[#006C56] text-white text-[8.5px] font-bold">
                      Mixer
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-[#006C56] dark:text-[#88F7D6] font-semibold">
                    {isPlaying ? "Playing ambient audio" : "Ready to play"}
                  </span>
                  {timerSecondsLeft !== null && isPlaying && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#006C56]/10 text-[#006C56] dark:text-[#88F7D6] text-[9.5px] font-mono font-bold">
                      ⏳ {formatTimer(timerSecondsLeft)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Volume & Sleep Timer Controls */}
            <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-[#E2ECE6] dark:border-[#23483E] sm:pl-3">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-[#5A756C] dark:text-[#A9C5BC] hover:text-[#006C56] cursor-pointer"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  <span className="material-symbols-outlined text-sm">
                    {isMuted || volume === 0 ? "volume_off" : "volume_down"}
                  </span>
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    if (isMuted) setIsMuted(false);
                  }}
                  className="w-14 sm:w-16 accent-[#006C56] dark:accent-[#00A982] cursor-pointer h-1"
                  title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                />
              </div>

              {/* Sleep Timer Preset Dropdown */}
              <div className="relative group">
                <button
                  type="button"
                  className={`px-2.5 py-1.5 rounded-xl text-[10.5px] font-heading font-bold flex items-center gap-1 border transition-colors cursor-pointer ${
                    sleepTimerMinutes !== null
                      ? "bg-[#006C56] text-white border-[#006C56]"
                      : "bg-white dark:bg-[#102F27] text-[#5A756C] dark:text-[#A9C5BC] border-[#E2ECE6] dark:border-[#23483E] hover:border-[#006C56]"
                  }`}
                  title="Auto-Off Sleep Duration Timer"
                >
                  <span className="material-symbols-outlined text-xs">timer</span>
                  <span>{sleepTimerMinutes ? `${sleepTimerMinutes}m` : "Timer"}</span>
                </button>

                <div className="absolute right-0 top-full mt-1.5 w-36 bg-white dark:bg-[#102F27] border border-[#E2ECE6] dark:border-[#23483E] rounded-2xl shadow-xl p-1.5 hidden group-hover:flex flex-col gap-1 z-30">
                  <span className="text-[9px] font-heading font-black text-[#5A756C] dark:text-[#A9C5BC] px-2 py-1">
                    Auto-off duration
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

        {/* Section Navigation Quick Filter Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#E2ECE6] dark:border-[#23483E] overflow-x-auto scrollbar-none">
          {[
            { id: "all", label: "🌟 Complete Suite", icon: "dashboard" },
            { id: "audio", label: "🌙 Soundscapes & Mixer", icon: "volume_up" },
            { id: "breath", label: "🌬️ 4-7-8 Breathing", icon: "air" },
            { id: "tracker", label: "📊 Sleep Duration & Logs", icon: "bedtime" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSectionTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSectionTab === tab.id
                  ? "bg-[#006C56] text-white shadow-xs"
                  : "bg-[#F4FAF7] dark:bg-[#14382F] text-[#5A756C] dark:text-[#A9C5BC] hover:bg-[#E2ECE6] dark:hover:bg-[#1c4439]"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Sleep Duration & Recovery Metrics Bar */}
      {(activeSectionTab === "all" || activeSectionTab === "tracker") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: 7-Day Average Duration */}
          <div className="bg-white dark:bg-[#102F27] rounded-3xl p-4 sm:p-5 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-heading font-bold tracking-wider text-[#5A756C] dark:text-[#A9C5BC]">
                Sleep duration
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#88F7D6] border border-[#D2EAE0] dark:border-[#23483E]">
                Target: 7–9h
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                  {avgH}h {avgM > 0 ? `${avgM}m` : ""}
                </span>
                <span className="text-xs text-[#006C56] dark:text-[#88F7D6] font-semibold">
                  • {sleepStats.averageCycles} cycles
                </span>
              </div>
              <p className="text-[11px] text-[#5A756C] dark:text-[#A9C5BC] mt-0.5">
                Last night: {sleepStats.lastSleep.durationFormatted} ({sleepStats.lastSleep.bedtime} - {sleepStats.lastSleep.wakeTime})
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowLogModal(true)}
              className="w-full py-2 rounded-xl bg-[#006C56] hover:bg-[#005241] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] text-xs font-heading font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              <span>Log Sleep Duration</span>
            </button>
          </div>

          {/* Card 2: Sleep Quality & Latency */}
          <div className="bg-white dark:bg-[#102F27] rounded-3xl p-4 sm:p-5 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-heading font-bold tracking-wider text-[#5A756C] dark:text-[#A9C5BC]">
                Sleep quality
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-[#F4FAF7] dark:bg-[#071C17] text-[#006C56] dark:text-[#88F7D6] border border-[#E2ECE6] dark:border-[#23483E]">
                {sleepStats.averageQuality} / 5.0
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-base">
                    {i < Math.round(sleepStats.averageQuality) ? "star" : "star_border"}
                  </span>
                ))}
                <span className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7] ml-1">
                  {Math.round((sleepStats.averageQuality / 5) * 100)}% Restful
                </span>
              </div>
              <p className="text-[11px] text-[#5A756C] dark:text-[#A9C5BC] mt-1">
                Avg time to fall asleep: <strong>{sleepStats.averageLatencyMinutes} mins</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleLiveSleep}
              className={`w-full py-2 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5 ${
                isLiveSleepActive
                  ? "bg-[#D97706] hover:bg-[#B45309] text-white animate-pulse"
                  : "bg-[#F4FAF7] dark:bg-[#14382F] hover:bg-[#E2ECE6] dark:hover:bg-[#1c4439] text-[#006C56] dark:text-[#88F7D6] border border-[#D2EAE0] dark:border-[#23483E]"
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {isLiveSleepActive ? "alarm_on" : "bed"}
              </span>
              <span>{isLiveSleepActive ? `☀️ Wake Up (${formatLiveSleep(liveSleepElapsedSeconds)})` : "🌙 Start Live Tracker"}</span>
            </button>
          </div>

          {/* Card 3: Sleep Debt & Recovery Status */}
          <div className="bg-white dark:bg-[#102F27] rounded-3xl p-4 sm:p-5 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-heading font-bold tracking-wider text-[#5A756C] dark:text-[#A9C5BC]">
                Sleep debt & bank
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold border ${
                  sleepStats.sleepDebtHours >= 0
                    ? "bg-[#EAF6F0] text-[#006C56] dark:bg-[#14382F] dark:text-[#88F7D6] border-[#D2EAE0]"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200"
                }`}
              >
                {sleepStats.sleepDebtHours >= 0 ? "Well-Rested" : "Deficit"}
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                  {sleepStats.sleepDebtHours >= 0 ? `+${sleepStats.sleepDebtHours}h` : `${sleepStats.sleepDebtHours}h`}
                </span>
                <span className="text-xs text-[#5A756C] dark:text-[#A9C5BC]">this week</span>
              </div>
              <p className="text-[11px] text-[#5A756C] dark:text-[#A9C5BC] mt-0.5">
                Sleep Efficiency: <strong>{sleepStats.averageEfficiency}%</strong> of time in bed asleep
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
              className="w-full py-2 rounded-xl bg-[#F4FAF7] dark:bg-[#14382F] hover:bg-[#E2ECE6] dark:hover:bg-[#1c4439] text-[#19332A] dark:text-[#F4FAF7] text-xs font-heading font-bold border border-[#E2ECE6] dark:border-[#23483E] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">history</span>
              <span>{showHistoryDrawer ? "Hide History" : "View Sleep History"}</span>
            </button>
          </div>

          {/* Card 4: 7-Day Trend Chart */}
          <div className="bg-white dark:bg-[#102F27] rounded-3xl p-4 sm:p-5 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-heading font-bold tracking-wider text-[#5A756C] dark:text-[#A9C5BC]">
                7-Night trend
              </span>
              <span className="text-[9.5px] text-[#5A756C] dark:text-[#A9C5BC] font-semibold">
                Goal: 8.0h
              </span>
            </div>

            <div className="flex items-end justify-between gap-1.5 h-14 pt-1 px-1">
              {sleepStats.weeklyTrend.map((item, idx) => {
                const hours = (item.minutes / 60).toFixed(1);
                const heightPercent = Math.min(100, Math.max(22, Math.round((item.minutes / 600) * 100)));
                const isTargetMet = item.minutes >= 420;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                    <div className="absolute -top-7 hidden group-hover:flex items-center px-1.5 py-0.5 rounded-lg bg-[#19332A] text-white text-[9px] font-mono whitespace-nowrap z-20 pointer-events-none shadow-md">
                      {hours}h • {item.day}
                    </div>

                    <div
                      className={`w-full rounded-t-md transition-all ${
                        isTargetMet
                          ? "bg-[#006C56] dark:bg-[#00A982] group-hover:opacity-85"
                          : "bg-[#D97706]/75 group-hover:bg-[#D97706]"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[9px] font-heading font-bold text-[#5A756C] dark:text-[#A9C5BC]">
                      {item.day[0]}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[9.5px] text-[#5A756C] dark:text-[#A9C5BC] pt-1 border-t border-[#E2ECE6] dark:border-[#23483E]">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006C56] dark:bg-[#00A982]" /> 7h+ Optimal
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" /> &lt;7h
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sleep History Logs Drawer / Table */}
      {showHistoryDrawer && (
        <div className="bg-white dark:bg-[#102F27] rounded-3xl p-5 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7] tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#006C56] dark:text-[#88F7D6]">
                history_toggle_off
              </span>
              <span>Recent sleep duration logs ({sleepStats.logs.length})</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowHistoryDrawer(false)}
              className="text-xs text-[#5A756C] dark:text-[#A9C5BC] hover:text-[#19332A] cursor-pointer"
            >
              Close
            </button>
          </div>

          {sleepStats.logs.length === 0 ? (
            <p className="text-xs text-[#5A756C] dark:text-[#A9C5BC] py-4 text-center">
              No custom sleep logs yet. Click &ldquo;Log Sleep Duration&rdquo; to add your first night!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2ECE6] dark:border-[#23483E] text-[#5A756C] dark:text-[#A9C5BC] text-[10.5px]">
                    <th className="py-2 font-bold">Date</th>
                    <th className="py-2 font-bold">Bedtime - wake</th>
                    <th className="py-2 font-bold">Duration</th>
                    <th className="py-2 font-bold">Cycles</th>
                    <th className="py-2 font-bold">Quality</th>
                    <th className="py-2 font-bold">Notes</th>
                    <th className="py-2 text-right font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2ECE6] dark:divide-[#23483E]">
                  {sleepStats.logs.map((log) => (
                    <tr key={log.id} className="text-[#19332A] dark:text-[#F4FAF7]">
                      <td className="py-2.5 font-medium">
                        {new Date(log.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td className="py-2.5 font-mono text-[11px] text-[#5A756C] dark:text-[#A9C5BC]">
                        {log.bedtime} - {log.wakeTime}
                      </td>
                      <td className="py-2.5 font-bold text-[#006C56] dark:text-[#88F7D6]">
                        {log.durationFormatted}
                      </td>
                      <td className="py-2.5 font-semibold text-xs">
                        {log.cycles}
                      </td>
                      <td className="py-2.5">
                        <span className="text-amber-500">{"★".repeat(log.quality)}</span>
                      </td>
                      <td className="py-2.5 text-[11px] text-[#5A756C] dark:text-[#A9C5BC] max-w-[200px] truncate">
                        {log.notes || "—"}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteSleepLog(log.id)}
                          className="px-2 py-1 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[11px] font-bold cursor-pointer transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. SOUNDSCAPES & MULTI-TRACK MIXER SECTION */}
      {(activeSectionTab === "all" || activeSectionTab === "audio") && (
        <div className="bg-white dark:bg-[#102F27] rounded-3xl p-5 sm:p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E2ECE6] dark:border-[#23483E]">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006C56] dark:text-[#88F7D6] text-xl">
                  headphones
                </span>
                <h2 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7] tracking-wider">
                  Ambient sleep soundscapes &amp; mixer
                </h2>
              </div>
              <p className="text-[11px] text-[#5A756C] dark:text-[#A9C5BC] mt-0.5">
                Listen to single restorative tracks or switch on Layer Mode to blend rain, crickets, and delta waves.
              </p>
            </div>

            {/* Mixer Layer Mode Toggle */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-heading font-bold text-[#19332A] dark:text-[#F4FAF7]">
                Layer Mode:
              </span>
              <button
                type="button"
                onClick={handleToggleMixerMode}
                className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isMixerMode
                    ? "bg-[#006C56] text-white shadow-xs"
                    : "bg-[#F4FAF7] dark:bg-[#14382F] text-[#5A756C] dark:text-[#A9C5BC] border border-[#E2ECE6] dark:border-[#23483E]"
                }`}
              >
                <span className="material-symbols-outlined text-sm">tune</span>
                <span>{isMixerMode ? "Multi-Track Mixer Active" : "Enable Multi-Track Mixer"}</span>
              </button>
            </div>
          </div>

          {/* Sound Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {SOUNDSCAPES.map((sound) => {
              const isSelected = activeSoundId === sound.id;
              const isThisPlaying = !isMixerMode && isSelected && isPlaying;
              const isMixerActive = isMixerMode && mixerTracks[sound.id]?.enabled;
              const mixerVol = mixerTracks[sound.id]?.volume ?? 0.5;

              return (
                <div
                  key={sound.id}
                  onClick={() => {
                    if (!isMixerMode) handleSelectSound(sound);
                  }}
                  className={`p-4 rounded-3xl border transition-all ${
                    !isMixerMode ? "cursor-pointer" : ""
                  } ${
                    isThisPlaying || isMixerActive
                      ? "bg-[#EAF6F0] dark:bg-[#14382F] border-[#006C56] dark:border-[#00A982] shadow-xs ring-1 ring-[#006C56]/40"
                      : isSelected
                      ? "bg-white dark:bg-[#102F27] border-[#006C56]/40 dark:border-[#00A982]/40 shadow-2xs"
                      : "bg-white dark:bg-[#102F27] border-[#E2ECE6] dark:border-[#23483E] hover:border-[#006C56]/30 dark:hover:border-[#00A982]/30 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${
                          isThisPlaying || isMixerActive
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
                        </div>
                        <p className="text-[11px] text-[#5A756C] dark:text-[#A9C5BC] line-clamp-1 leading-snug">
                          {sound.desc}
                        </p>
                      </div>
                    </div>

                    {/* Action in Card: Play/Pause in single mode, Checkbox in mixer mode */}
                    {isMixerMode ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleMixerTrack(sound.id);
                        }}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
                          isMixerActive
                            ? "bg-[#006C56] text-white border-[#006C56]"
                            : "bg-[#F4FAF7] dark:bg-[#071C17] text-[#5A756C] dark:text-[#A9C5BC] border-[#E2ECE6] dark:border-[#23483E]"
                        }`}
                        title={isMixerActive ? "Disable layer" : "Enable layer"}
                      >
                        <span className="material-symbols-outlined text-base">
                          {isMixerActive ? "check" : "add"}
                        </span>
                      </button>
                    ) : (
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
                    )}
                  </div>

                  {/* Mixer mode individual volume slider */}
                  {isMixerMode && (
                    <div className="mt-3 pt-2.5 border-t border-[#E2ECE6] dark:border-[#23483E] flex items-center justify-between gap-2">
                      <span className="text-[10px] text-[#5A756C] dark:text-[#A9C5BC] font-semibold">
                        Layer Vol: {Math.round(mixerVol * 100)}%
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={mixerVol}
                        disabled={!isMixerActive}
                        onChange={(e) => handleMixerVolumeChange(sound.id, parseFloat(e.target.value))}
                        className="w-24 sm:w-32 accent-[#006C56] dark:accent-[#00A982] cursor-pointer h-1 disabled:opacity-30"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. ACTIVE 4-7-8 BEDTIME BREATHWORK TRAINER */}
      {(activeSectionTab === "all" || activeSectionTab === "breath") && (
        <div className="bg-white dark:bg-[#102F27] rounded-3xl p-5 sm:p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-5 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E2ECE6] dark:border-[#23483E]">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006C56] dark:text-[#88F7D6] text-xl">
                  air
                </span>
                <h2 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7] tracking-wider">
                  The 4-7-8 bedtime breathwork trainer
                </h2>
              </div>
              <p className="text-[11px] text-[#5A756C] dark:text-[#A9C5BC] mt-0.5">
                Science-backed natural nervous system tranquilizer: 4s inhale, 7s hold, 8s exhale.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsBreathChimeEnabled(!isBreathChimeEnabled)}
                className={`text-[11px] font-heading font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                  isBreathChimeEnabled ? "text-[#006C56] dark:text-[#88F7D6]" : "text-[#5A756C] dark:text-[#A9C5BC]"
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {isBreathChimeEnabled ? "notifications_active" : "notifications_off"}
                </span>
                <span>{isBreathChimeEnabled ? "Chime On" : "Chime Muted"}</span>
              </button>
            </div>
          </div>

          {/* Interactive Breathing Visualizer Center */}
          <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-2">
            {/* Pulsating Visual Guide */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center shrink-0">
              <div
                className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                  breathPhase === "Inhale"
                    ? "bg-[#88F7D6]/35 dark:bg-[#00A982]/25 scale-125 blur-xl"
                    : breathPhase === "Hold"
                    ? "bg-amber-400/30 dark:bg-amber-500/20 scale-115 blur-lg"
                    : "bg-[#006C56]/20 dark:bg-[#00A982]/15 scale-90 blur-md"
                }`}
              />

              <div
                className={`z-10 flex flex-col items-center justify-center w-36 h-36 rounded-full bg-white dark:bg-[#14382F] border-2 shadow-md transition-all duration-700 ${
                  breathPhase === "Inhale"
                    ? "border-[#006C56] dark:border-[#88F7D6] scale-110"
                    : breathPhase === "Hold"
                    ? "border-amber-500 scale-105"
                    : "border-[#006C56]/40 scale-95"
                }`}
              >
                <span
                  className={`text-xs font-heading font-black tracking-widest transition-colors ${
                    breathPhase === "Inhale"
                      ? "text-[#006C56] dark:text-[#88F7D6]"
                      : breathPhase === "Hold"
                      ? "text-amber-500 dark:text-amber-400"
                      : "text-[#19332A] dark:text-[#F4FAF7]"
                  }`}
                >
                  {isBreathingActive ? breathPhase : "Ready"}
                </span>

                <span className="text-3xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7] mt-0.5">
                  {isBreathingActive ? breathSecondsLeft : "4-7-8"}
                </span>

                <span className="text-[10px] text-[#5A756C] dark:text-[#A9C5BC] font-medium mt-0.5">
                  Cycle {breathCycleCount} of 4
                </span>
              </div>
            </div>

            {/* Breathing Controls & Instruction Cards */}
            <div className="flex-1 max-w-md space-y-4">
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div
                  className={`p-3 rounded-2xl border transition-all ${
                    isBreathingActive && breathPhase === "Inhale"
                      ? "bg-[#EAF6F0] dark:bg-[#14382F] border-[#006C56] ring-1 ring-[#006C56]"
                      : "bg-[#F4FAF7] dark:bg-[#071C17] border-[#E2ECE6] dark:border-[#23483E]"
                  }`}
                >
                  <span className="text-xs font-mono font-bold text-[#006C56] dark:text-[#88F7D6] block">
                    4 sec
                  </span>
                  <span className="text-xs font-heading font-bold text-[#19332A] dark:text-[#F4FAF7]">
                    Inhale
                  </span>
                  <span className="text-[9.5px] text-[#5A756C] dark:text-[#A9C5BC] block mt-0.5">
                    Quiet nose
                  </span>
                </div>

                <div
                  className={`p-3 rounded-2xl border transition-all ${
                    isBreathingActive && breathPhase === "Hold"
                      ? "bg-amber-50 dark:bg-amber-950/30 border-amber-500 ring-1 ring-amber-500"
                      : "bg-[#F4FAF7] dark:bg-[#071C17] border-[#E2ECE6] dark:border-[#23483E]"
                  }`}
                >
                  <span className="text-xs font-mono font-bold text-[#D97706] dark:text-[#FBBF24] block">
                    7 sec
                  </span>
                  <span className="text-xs font-heading font-bold text-[#19332A] dark:text-[#F4FAF7]">
                    Hold
                  </span>
                  <span className="text-[9.5px] text-[#5A756C] dark:text-[#A9C5BC] block mt-0.5">
                    Calm retain
                  </span>
                </div>

                <div
                  className={`p-3 rounded-2xl border transition-all ${
                    isBreathingActive && breathPhase === "Exhale"
                      ? "bg-[#EAF6F0] dark:bg-[#14382F] border-[#006C56] ring-1 ring-[#006C56]"
                      : "bg-[#F4FAF7] dark:bg-[#071C17] border-[#E2ECE6] dark:border-[#23483E]"
                  }`}
                >
                  <span className="text-xs font-mono font-bold text-[#006C56] dark:text-[#88F7D6] block">
                    8 sec
                  </span>
                  <span className="text-xs font-heading font-bold text-[#19332A] dark:text-[#F4FAF7]">
                    Exhale
                  </span>
                  <span className="text-[9.5px] text-[#5A756C] dark:text-[#A9C5BC] block mt-0.5">
                    Gentle whoosh
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                {!isBreathingActive ? (
                  <button
                    type="button"
                    onClick={handleStartBreath}
                    className="flex-1 py-2.5 rounded-2xl bg-[#006C56] hover:bg-[#005241] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] text-xs font-heading font-black transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">play_arrow</span>
                    <span>Start 4-7-8 Breathing Guide</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePauseBreath}
                    className="flex-1 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-heading font-black transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">pause</span>
                    <span>Pause Exercise</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleResetBreath}
                  className="px-3.5 py-2.5 rounded-2xl bg-[#F4FAF7] dark:bg-[#14382F] hover:bg-[#E2ECE6] dark:hover:bg-[#1c4439] text-[#5A756C] dark:text-[#A9C5BC] text-xs font-heading font-bold border border-[#E2ECE6] dark:border-[#23483E] transition-colors cursor-pointer"
                  title="Reset Counter"
                >
                  <span className="material-symbols-outlined text-base">replay</span>
                </button>
              </div>

              <p className="text-[11px] text-[#5A756C] dark:text-[#A9C5BC] leading-relaxed">
                💡 Repeat 4 complete cycles as your head touches the pillow. The extended 8-second exhale stimulates the vagus nerve and triggers rapid sleep onset.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. EVENING WIND-DOWN REFLECTION JOURNAL NOTE */}
      {(activeSectionTab === "all" || activeSectionTab === "breath") && (
        <div className="bg-white dark:bg-[#102F27] rounded-3xl p-5 sm:p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-3 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#88F7D6] flex items-center justify-center">
              <span className="material-symbols-outlined text-base">edit_note</span>
            </div>
            <div>
              <h3 className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7] tracking-wider">
                Evening wind-down reflection
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
                🔒 Private &amp; encrypted
              </span>
            )}

            <button
              type="button"
              onClick={handleSaveReflection}
              disabled={isSavingNote || !reflectionText.trim()}
              className="px-4 py-2 rounded-xl bg-[#006C56] hover:bg-[#005241] dark:bg-[#00A982] dark:hover:bg-[#00916F] disabled:opacity-40 text-white dark:text-[#071C17] text-xs font-heading font-bold transition-all cursor-pointer shadow-xs"
            >
              {isSavingNote ? "Saving..." : "Save Reflection"}
            </button>
          </div>
        </div>
      )}

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
                  Log Sleep Duration &amp; Quality
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

            {/* Auto Calculated Duration & Efficiency Highlight Banner */}
            <div className="p-3.5 rounded-2xl bg-[#EAF6F0] dark:bg-[#14382F] border border-[#D2EAE0] dark:border-[#23483E] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-heading font-bold text-[#006C56] dark:text-[#88F7D6] tracking-wider block">
                  Total sleep duration
                </span>
                <span className="text-xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                  {currentDurationCalc.hours}h {currentDurationCalc.mins > 0 ? `${currentDurationCalc.mins}m` : ""}
                </span>
              </div>
              <div className="text-right space-y-0.5">
                <span className="text-xs font-heading font-bold text-[#006C56] dark:text-[#88F7D6] block">
                  {currentDurationCalc.cycles} Sleep Cycles
                </span>
                <span className="text-[10px] text-[#5A756C] dark:text-[#A9C5BC] block">
                  Efficiency: <strong>{currentDurationCalc.efficiency}%</strong>
                </span>
              </div>
            </div>

            {/* Latency & Night Awakenings */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-heading font-bold text-[#5A756C] dark:text-[#A9C5BC]">
                  Time to Fall Asleep
                </label>
                <select
                  value={logLatency}
                  onChange={(e) => setLogLatency(Number(e.target.value))}
                  className="w-full p-2 rounded-xl bg-[#F4FAF7] dark:bg-[#071C17] border border-[#E2ECE6] dark:border-[#23483E] text-xs text-[#19332A] dark:text-[#F4FAF7] focus:outline-none focus:ring-1 focus:ring-[#006C56]"
                >
                  <option value={5}>~5 minutes (Very Fast)</option>
                  <option value={15}>~15 minutes (Normal)</option>
                  <option value={30}>~30 minutes</option>
                  <option value={45}>45+ minutes</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-heading font-bold text-[#5A756C] dark:text-[#A9C5BC]">
                  Night Awakenings
                </label>
                <select
                  value={logAwakenings}
                  onChange={(e) => setLogAwakenings(Number(e.target.value))}
                  className="w-full p-2 rounded-xl bg-[#F4FAF7] dark:bg-[#071C17] border border-[#E2ECE6] dark:border-[#23483E] text-xs text-[#19332A] dark:text-[#F4FAF7] focus:outline-none focus:ring-1 focus:ring-[#006C56]"
                >
                  <option value={0}>0 times (Slept through)</option>
                  <option value={1}>1 time</option>
                  <option value={2}>2 times</option>
                  <option value={3}>3+ times</option>
                </select>
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

            {/* Sleep Factors & Environment Tags */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-heading font-bold text-[#5A756C] dark:text-[#A9C5BC]">
                Sleep Factors &amp; Environment
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
