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

interface Splash {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

export default function RainAmbient({ isActive }: RainAmbientProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // 1. Web Audio API — Gentle, soothing synthetic rain sound
  useEffect(() => {
    if (!isActive) {
      if (gainNodeRef.current && audioCtxRef.current) {
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

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
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

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(650, ctx.currentTime);
      filter.Q.setValueAtTime(1.2, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 1.2);
      gainNodeRef.current = gain;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(0);
    } catch {
      // ignore
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

  // 2. Crisp, Well-Visible Raindrop Simulation
  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const dpr = window.devicePixelRatio || 1;
    let width = (canvas.width = window.innerWidth * dpr);
    let height = (canvas.height = window.innerHeight * dpr);
    ctx.scale(dpr, dpr);

    const clientWidth = window.innerWidth;
    const clientHeight = window.innerHeight;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isReducedMotion = mediaQuery.matches;

    // Visible droplet density
    const dropCount = isReducedMotion ? 40 : clientWidth < 768 ? 100 : 180;
    const drops: Drop[] = [];
    const splashes: Splash[] = [];

    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * clientWidth,
        y: Math.random() * clientHeight,
        length: Math.random() * 26 + 22, // Longer, distinct streaks
        speed: Math.random() * 5 + 6,    // Natural, visible falling speed
        opacity: Math.random() * 0.35 + 0.45, // Crisp 0.45–0.80 visibility
        width: Math.random() * 0.8 + 1.2,     // 1.2px - 2.0px stroke
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", handleResize);

    const render = () => {
      ctx.clearRect(0, 0, clientWidth, clientHeight);

      // Render & Update Raindrops
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];

        // Draw raindrop streak with gradient for glassy look
        const grad = ctx.createLinearGradient(d.x, d.y, d.x - 3, d.y + d.length);
        grad.addColorStop(0, `rgba(139, 123, 216, ${d.opacity * 0.2})`);
        grad.addColorStop(0.7, `rgba(95, 78, 165, ${d.opacity})`);
        grad.addColorStop(1, `rgba(80, 140, 220, ${d.opacity * 0.9})`);

        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 3, d.y + d.length);
        ctx.strokeStyle = grad;
        ctx.lineWidth = d.width;
        ctx.lineCap = "round";
        ctx.stroke();

        // Motion update
        d.y += d.speed;
        d.x -= 0.6; // Soft wind angle

        // Reached bottom: create subtle splash and reset to top
        if (d.y > clientHeight) {
          if (Math.random() > 0.65 && splashes.length < 25) {
            splashes.push({
              x: d.x,
              y: clientHeight - Math.random() * 20,
              radius: 1,
              maxRadius: Math.random() * 8 + 6,
              opacity: 0.5,
            });
          }
          d.y = -d.length;
          d.x = Math.random() * (clientWidth + 100);
        }
        if (d.x < -10) {
          d.x = clientWidth + 10;
        }
      }

      // Render & Update Soft Ground Splashes
      for (let s = splashes.length - 1; s >= 0; s--) {
        const sp = splashes[s];
        ctx.beginPath();
        ctx.ellipse(sp.x, sp.y, sp.radius * 1.5, sp.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(124, 107, 196, ${sp.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        sp.radius += 0.5;
        sp.opacity -= 0.035;

        if (sp.opacity <= 0 || sp.radius >= sp.maxRadius) {
          splashes.splice(s, 1);
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
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 pointer-events-none z-30 overflow-hidden select-none"
          aria-hidden="true"
        >
          {/* Gentle atmospheric mist tone */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/[0.04] via-transparent to-blue-900/[0.05] pointer-events-none" />

          {/* High-visibility HTML5 Rain Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
