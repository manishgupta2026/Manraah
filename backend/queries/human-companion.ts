import { AnonymizedListener, AnonymizedUser, SessionFlag } from "@/backend/types";

/**
 * Human Companion Anonymization & Mock Session Service
 * 
 * TODO: Replace in-memory mock handlers with live WebSockets/Pusher/Ably infrastructure
 * when real-time backend engine is finalized.
 */

// Anonymized pool of available listeners
const MOCK_LISTENERS: AnonymizedListener[] = [
  {
    id: "lst_104",
    displayId: "Peer Listener #104",
    contextTag: "Active Listener • Peer Mental Health Support",
    avatarBg: "bg-mint/30 border-mint text-secondary",
    rating: 4.9,
    totalSessions: 142,
  },
  {
    id: "lst_208",
    displayId: "Peer Listener #208",
    contextTag: "Trained Companion • Mindfulness Practitioner",
    avatarBg: "bg-peach/30 border-peach text-tertiary",
    rating: 4.8,
    totalSessions: 98,
  },
];

/**
 * Find an available anonymized listener for matching
 */
export async function findAvailableListener(): Promise<AnonymizedListener> {
  // TODO: Query real-time listener availability from Neon DB / Socket state
  await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate search latency
  return MOCK_LISTENERS[0];
}

/**
 * Generate anonymized user display tag for admin incoming match view
 * NEVER exposes real name or email
 * Deterministic hash prevents React SSR hydration mismatches
 */
export function getAnonymizedUserTag(userId: string = "demo", category: string = "Student"): AnonymizedUser {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  const tagNum = 100 + (Math.abs(hash) % 899);

  return {
    id: userId,
    userTag: `Anonymous Member #${tagNum}`,
    categoryTag: category,
    topic: "Emotional Venting & Guidance",
    waitTime: "Just now",
  };
}

/**
 * Match a session between user and listener
 */
export async function matchSession(userId: string, listenerId?: string) {
  return {
    sessionId: `sess_${Date.now()}`,
    status: "CONNECTED",
    matchedAt: new Date().toISOString(),
  };
}

/**
 * End an active companion session
 */
export async function endSession(sessionId: string) {
  return {
    sessionId,
    status: "ENDED",
    endedAt: new Date().toISOString(),
  };
}

/**
 * Flag session for supervisor review
 */
export async function flagSession(sessionId: string, reason: SessionFlag) {
  return {
    sessionId,
    flagged: true,
    reason,
    timestamp: new Date().toISOString(),
  };
}

export function getWaitingQueue(): AnonymizedUser[] {
  return [];
}
