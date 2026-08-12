"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RainAmbientProps {
  isActive: boolean;
}

interface Drop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  width: number;
}

export default function RainAmbient({ isActive }: RainAmbientProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // 1. Web Audio API — Gentle, soothing synthetic rain sound (0 external dependencies)
  useEffect(() => {
    if (!isActive) {
      if (gainNodeRef.current && audioCtxRef.current) {
        // Gentle audio fade out
        const now = audioCtxRef.current.currentTime;
        gainNodeRef.current.gain.linearRampToValueAtTime(0.0001, now + 0.6);
        setTimeout(() => {
          try {
            noiseSourceRef.current?.stop();
            noiseSourceRef.current?.disconnect();
          } catch {
            // ignore
          }
        }, 700);
      }
      return;
    }

    // Start soothing audio on user interaction
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Generate 4 seconds of smooth pink/brown filtered noise buffer
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Pink noise filtering
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      noiseSourceRef.current = noise;

      // Gentle Lowpass filter for soft rainfall tone
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(650, ctx.currentTime);
      filter.Q.setValueAtTime(1.2, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      // Gentle fade in
      gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 1.2);
      gainNodeRef.current = gain;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(0);
    } catch {
      // Audio autoplay gracefully handled if disabled
    }

    return () => {
      try {
        gainNodeRef.current?.gain.setValueAtTime(0, audioCtxRef.current?.currentTime || 0);
        noiseSourceRef.current?.stop();
        audioCtxRef.current?.close();
      } catch {
        // ignore
      }
    };
  }, [isActive]);

  // 2. High-Performance Canvas Rain Visuals
  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isReducedMotion = mediaQuery.matches;

    const dropCount = isReducedMotion ? 25 : width < 768 ? 55 : 95;
    const drops: Drop[] = [];

    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 18 + 12,
        speed: Math.random() * 2.8 + 2.2,
        opacity: Math.random() * 0.18 + 0.08,
        width: Math.random() * 0.8 + 0.6,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw each gentle raindrop
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];

        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 2, d.y + d.length);
        ctx.strokeStyle = `rgba(124, 107, 196, ${d.opacity})`; // Soft Manraah lavender-blue
        ctx.lineWidth = d.width;
        ctx.lineCap = "round";
        ctx.stroke();

        // Move drop
        d.y += d.speed;
        d.x -= 0.3;

        // Reset if past bottom
        if (d.y > height) {
          d.y = -d.length;
          d.x = Math.random() * width;
        }
        if (d.x < 0) {
          d.x = width;
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 pointer-events-none z-[1] overflow-hidden select-none"
          aria-hidden="true"
        >
          {/* Subtle atmospheric mist layer */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-50/20 via-transparent to-purple-100/15 pointer-events-none" />

          {/* HTML5 Rain Canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
