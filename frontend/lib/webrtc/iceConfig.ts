// WebRTC STUN/TURN ICE Configuration

export function getWebRTCConfiguration(): RTCConfiguration {
  const iceServers: RTCIceServer[] = [
    // Multi-Provider Free Public STUN Server Pool for Cross-Network NAT Traversal
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302",
        "stun:stun.services.mozilla.com",
        "stun:global.stun.twilio.com:3478",
      ],
    },
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
    bundlePolicy: "balanced",
    rtcpMuxPolicy: "require",
  };
}
