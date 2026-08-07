"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnonymizedUser } from "@/backend/types";
import { getSocketClient } from "@/frontend/lib/realtime/socketClient";
import { getWebRTCConfiguration } from "@/frontend/lib/webrtc/iceConfig";

interface AdminCallScreenProps {
  user: AnonymizedUser;
  onEndCall: () => void;
  onSwitchToChat: () => void;
  onTriggerFlag: () => void;
}

export default function AdminCallScreen({
  user,
  onEndCall,
  onSwitchToChat,
  onTriggerFlag,
}: AdminCallScreenProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [callStatus, setCallStatus] = useState<"CONNECTING" | "CONNECTED" | "ENDED">("CONNECTING");
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [micErrorMsg, setMicErrorMsg] = useState<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const roomId = user.id;

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
      console.log("🎙️ Listener microphone permission granted!");
      localStreamRef.current = stream;
      setHasMicPermission(true);
      setMicErrorMsg(null);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      setCallStatus("CONNECTED");
    } catch (err: any) {
      console.warn("Listener mic access error:", err.message);
      setHasMicPermission(false);
      setMicErrorMsg(err.message || "Microphone permission denied.");
      setCallStatus("CONNECTED");
    }
  };

  // WebSockets & WebRTC Signaling Lifecycle
  useEffect(() => {
    const socket = getSocketClient();
    socket.emit("join_room", { roomId, userAlias: "Peer Listener #104" });

    // Initialize RTCPeerConnection with STUN/TURN servers
    const pc = new RTCPeerConnection(getWebRTCConfiguration());
    peerConnectionRef.current = pc;

    // Receive Remote Audio Track & Play
    pc.ontrack = (event) => {
      console.log("⚡ Admin Listener received remote audio track:", event.streams);
      if (remoteAudioRef.current && event.streams[0]) {
        remoteAudioRef.current.srcObject = event.streams[0];
        remoteAudioRef.current.play().catch((err) => console.warn("Audio autoplay fallback:", err));
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc_ice", { roomId, sender: "listener", candidate: event.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("⚡ Listener RTCPeerConnection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setCallStatus("CONNECTED");
      }
    };

    // Auto prompt microphone
    requestMicrophone(pc);

    // Socket Event Listeners
    socket.on("offer", async (data: { sdpOffer: RTCSessionDescriptionInit }) => {
      console.log("⚡ Listener received WebRTC Offer:", data);
      if (pc.signalingState !== "closed") {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdpOffer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc_answer", { roomId, sender: "listener", sdpAnswer: answer });
        socket.emit("call_accepted", { roomId, sender: "listener" });
        setCallStatus("CONNECTED");
      }
    });

    socket.on("answer", async (data: { sdpAnswer: RTCSessionDescriptionInit }) => {
      console.log("⚡ Listener received WebRTC Answer:", data);
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

    // Ensure audio transceiver is present before creating offer
    try {
      pc.addTransceiver("audio", { direction: "sendrecv" });
    } catch (e) {
      console.warn("Transceiver warning:", e);
    }

    // Auto initiate call offer from listener side
    pc.createOffer().then(async (offer) => {
      await pc.setLocalDescription(offer);
      socket.emit("webrtc_offer", { roomId, sender: "listener", sdpOffer: offer });
    }).catch((err) => {
      console.warn("Offer creation fallback:", err.message);
      setCallStatus("CONNECTED");
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

      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <span className="px-3.5 py-1 rounded-full bg-peach/30 text-tertiary text-xs font-bold uppercase tracking-wider">
          ● Listener Encrypted Voice Console
        </span>
        <span className="px-4 py-1.5 rounded-full bg-surface-container-high text-on-surface text-xs font-mono font-bold">
          ⏱️ {formatTime(seconds)}
        </span>
      </div>

      {/* Main Call Container */}
      <div className="p-10 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft-xl space-y-6 max-w-md mx-auto relative overflow-hidden">
        <div className="w-32 h-32 mx-auto rounded-full bg-peach/30 text-tertiary border-4 border-peach flex items-center justify-center shadow-soft animate-pulse">
          <span className="material-symbols-outlined text-6xl">person</span>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-heading font-bold text-on-surface">{user.userTag}</h2>
          <p className="text-xs text-primary font-semibold">{user.categoryTag} • {user.topic}</p>
          
          <p className="text-[11px] text-on-surface-variant/70 pt-1">
            {callStatus === "CONNECTING"
              ? "⚡ Establishing WebRTC Audio Session..."
              : isMuted
              ? "🔇 Listener Microphone Muted"
              : hasMicPermission
              ? "🎙️ Encrypted Audio Active"
              : "🎙️ Voice Session Standby"}
          </p>

          {/* Explicit Microphone Request Button if Prompt Was Suppressed */}
          {hasMicPermission === false && (
            <div className="pt-2">
              <button
                onClick={handleManualMicRequest}
                className="px-4 py-2 rounded-2xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary/90 transition-all animate-pulse"
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
      <div className="p-4 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft flex items-center justify-center gap-4 max-w-md mx-auto">
        <button
          onClick={handleToggleMute}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isMuted ? "bg-amber-500 text-white" : "bg-surface-container-low text-on-surface hover:bg-surface-container"
          }`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          <span className="material-symbols-outlined text-xl">{isMuted ? "mic_off" : "mic"}</span>
        </button>

        <button
          onClick={onSwitchToChat}
          className="w-12 h-12 rounded-full bg-surface-container-low text-on-surface flex items-center justify-center hover:bg-surface-container"
          title="Switch to Chat"
        >
          <span className="material-symbols-outlined text-xl">chat</span>
        </button>

        <button
          onClick={onTriggerFlag}
          className="px-4 py-3 rounded-2xl bg-amber-500/20 text-amber-700 font-bold text-xs hover:bg-amber-500/30"
        >
          Flag Session
        </button>

        <button
          onClick={handleEndCallAction}
          className="w-12 h-12 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg transition-all scale-105 active:scale-95"
          title="End Call"
        >
          <span className="material-symbols-outlined text-xl">call_end</span>
        </button>
      </div>
    </div>
  );
}
