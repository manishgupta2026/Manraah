// WebRTC STUN/TURN ICE Configuration

export function getWebRTCConfiguration(): RTCConfiguration {
  const iceServers: RTCIceServer[] = [
    // Standard Free Public STUN Server
    { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
  ];

  // Dynamic TURN Relay Server Support (Configurable via Environment Variables)
  const turnUrl = process.env.NEXT_PUBLIC_TURN_URL;
  const turnUsername = process.env.NEXT_PUBLIC_TURN_USERNAME;
  const turnCredential = process.env.NEXT_PUBLIC_TURN_CREDENTIAL;

  if (turnUrl) {
    iceServers.push({
      urls: turnUrl.split(","),
      username: turnUsername || undefined,
      credential: turnCredential || undefined,
    });
  }

  return {
    iceServers,
    iceTransportPolicy: "all",
    bundlePolicy: "balanced", // Compatible across all modern browsers without SDP bundle errors
    rtcpMuxPolicy: "require",
  };
}
