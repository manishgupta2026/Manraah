"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnonymizedListener } from "@/backend/types";
import { getSocketClient } from "@/frontend/lib/realtime/socketClient";
import { getWebRTCConfiguration } from "@/frontend/lib/webrtc/iceConfig";

interface CallScreenProps {
  listener: AnonymizedListener;
  roomId?: string;
  onEndCall: () => void;
  onSwitchToChat: () => void;
}

export default function CallScreen({ listener, roomId = "sess_default", onEndCall, onSwitchToChat }: CallScreenProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [callStatus, setCallStatus] = useState<"CONNECTING" | "CONNECTED" | "ENDED">("CONNECTING");
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [micErrorMsg, setMicErrorMsg] = useState<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  // Call Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callStatus === "CONNECTED") {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  const requestMicrophone = async (pc: RTCPeerConnection) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicErrorMsg("Browser blocked microphone on non-HTTPS IP origin.");
      setHasMicPermission(false);
      setCallStatus("CONNECTED");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      console.log("🎙️ User microphone permission granted!");
      localStreamRef.current = stream;
      setHasMicPermission(true);
      setMicErrorMsg(null);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      setCallStatus("CONNECTED");
    } catch (err: any) {
      console.warn("User mic access error:", err.message);
      setHasMicPermission(false);
      setMicErrorMsg(err.message || "Microphone permission denied.");
      setCallStatus("CONNECTED");
    }
  };

  // WebSockets & WebRTC Call Lifecycle
  useEffect(() => {
    const socket = getSocketClient();
    socket.emit("join_room", { roomId, userAlias: "User Member" });

    // Initialize WebRTC RTCPeerConnection
    const pc = new RTCPeerConnection(getWebRTCConfiguration());
    peerConnectionRef.current = pc;

    // Receive Remote Audio Track & Play
    pc.ontrack = (event) => {
      console.log("⚡ User received remote audio track:", event.streams);
      if (remoteAudioRef.current && event.streams[0]) {
        remoteAudioRef.current.srcObject = event.streams[0];
        remoteAudioRef.current.play().catch((err) => console.warn("Audio autoplay fallback:", err));
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc_ice", { roomId, sender: "user", candidate: event.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("⚡ User WebRTC Connection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setCallStatus("CONNECTED");
      }
    };

    // Auto prompt microphone
    requestMicrophone(pc);

    // WebRTC Signaling Handlers
    socket.on("offer", async (data: { sdpOffer: RTCSessionDescriptionInit }) => {
      console.log("⚡ User received WebRTC Offer from listener:", data);
      if (pc.signalingState !== "closed") {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdpOffer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc_answer", { roomId, sender: "user", sdpAnswer: answer });
        setCallStatus("CONNECTED");
      }
    });

    socket.on("answer", async (data: { sdpAnswer: RTCSessionDescriptionInit }) => {
      console.log("⚡ User received WebRTC Answer:", data);
      if (pc.signalingState !== "closed") {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdpAnswer));
        setCallStatus("CONNECTED");
      }
    });

    socket.on("ice_candidate", async (data: { candidate: RTCIceCandidateInit }) => {
      if (data.candidate && pc.signalingState !== "closed") {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.warn("ICE candidate error:", e);
        }
      }
    });

    socket.on("call_ended", () => {
      setCallStatus("ENDED");
      onEndCall();
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice_candidate");
      socket.off("call_ended");
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      pc.close();
    };
  }, [roomId, onEndCall]);

  const handleToggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  const handleManualMicRequest = () => {
    if (peerConnectionRef.current) {
      requestMicrophone(peerConnectionRef.current);
    }
  };

  const handleEndCallAction = () => {
    const socket = getSocketClient();
    socket.emit("webrtc_end", { roomId });
    onEndCall();
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8 animate-fadeIn text-center select-none">
      {/* Hidden Audio Output Tag for WebRTC Remote Stream */}
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="px-3.5 py-1 rounded-full bg-mint/30 text-secondary text-xs font-bold uppercase tracking-wider">
          ● Encrypted Voice Sanctuary
        </span>
        <span className="px-4 py-1.5 rounded-full bg-surface-container-high text-on-surface text-xs font-mono font-bold">
          ⏱️ {formatTime(seconds)}
        </span>
      </div>

      {/* Main Avatar & Call Visualizer */}
      <div className="p-10 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft-xl space-y-6 max-w-md mx-auto relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-mint/10 via-transparent to-peach/10 pointer-events-none" />

        <div className="relative">
          <div className="w-32 h-32 mx-auto rounded-full bg-mint/30 text-secondary border-4 border-mint flex items-center justify-center shadow-soft animate-pulse">
            <span className="material-symbols-outlined text-6xl">record_voice_over</span>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-heading font-bold text-on-surface">{listener.displayId}</h2>
          <p className="text-xs text-primary font-semibold">{listener.contextTag}</p>
          <p className="text-[11px] text-on-surface-variant/70 pt-1">
            {callStatus === "CONNECTING"
              ? "⚡ Connecting WebRTC Encrypted Voice..."
              : isMuted
              ? "🔇 Microphone Muted"
              : hasMicPermission
              ? "🎙️ Live Audio Session Active"
              : "🎙️ Voice Session Standby"}
          </p>

          {/* Explicit Microphone Request Button if Prompt Was Suppressed */}
          {hasMicPermission === false && (
            <div className="pt-2">
              <button
                onClick={handleManualMicRequest}
                className="px-4 py-2 rounded-2xl bg-secondary text-white text-xs font-bold shadow-md hover:bg-secondary/90 transition-all animate-pulse"
              >
                🎙️ Tap to Enable Microphone Access
              </button>
              {micErrorMsg && (
                <p className="text-[10px] text-rose-500 mt-1 font-medium">{micErrorMsg}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="p-4 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft flex items-center justify-center gap-6 max-w-sm mx-auto">
        <button
          onClick={handleToggleMute}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isMuted ? "bg-amber-500 text-white shadow-md" : "bg-surface-container-low text-on-surface hover:bg-surface-container"
          }`}
          title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
        >
          <span className="material-symbols-outlined text-2xl">{isMuted ? "mic_off" : "mic"}</span>
        </button>

        <button
          onClick={onSwitchToChat}
          className="w-14 h-14 rounded-full bg-surface-container-low text-on-surface flex items-center justify-center hover:bg-surface-container transition-all"
          title="Switch to Text Chat"
        >
          <span className="material-symbols-outlined text-2xl">chat</span>
        </button>

        <button
          onClick={handleEndCallAction}
          className="w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg transition-all scale-105 active:scale-95"
          title="End Call"
        >
          <span className="material-symbols-outlined text-2xl">call_end</span>
        </button>
      </div>
    </div>
  );
}
