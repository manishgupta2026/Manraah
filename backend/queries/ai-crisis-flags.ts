export interface AICrisisFlag {
  id: string;
  userId: string;
  userTag: string;
  source: "AI Companion";
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  triggerMessage: string;
  aiGuidelineCategory: "Self-Harm Risk" | "Severe Anxiety Trigger" | "Depressive Episode";
  timestamp: string;
  assignedTo?: string;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED";
}

let MOCK_AI_CRISIS_FLAGS: AICrisisFlag[] = [
  {
    id: "ai-flag-101",
    userId: "usr-882",
    userTag: "Anonymous Member #882",
    source: "AI Companion",
    severity: "CRITICAL",
    triggerMessage: "I feel completely overwhelmed by exam stress and feel like giving up on everything tonight.",
    aiGuidelineCategory: "Self-Harm Risk",
    timestamp: "10 mins ago",
    status: "OPEN",
  },
  {
    id: "ai-flag-102",
    userId: "usr-412",
    userTag: "Anonymous Member #412",
    source: "AI Companion",
    severity: "HIGH",
    triggerMessage: "Heart is racing, can't breathe or sleep for 3 days straight.",
    aiGuidelineCategory: "Severe Anxiety Trigger",
    timestamp: "25 mins ago",
    status: "IN_REVIEW",
    assignedTo: "Ashutosh Sahu",
  },
];

export async function getAICrisisFlags(): Promise<AICrisisFlag[]> {
  return [...MOCK_AI_CRISIS_FLAGS];
}

export async function updateAICrisisStatus(id: string, status: "OPEN" | "IN_REVIEW" | "RESOLVED", assignedTo?: string): Promise<AICrisisFlag> {
  const flag = MOCK_AI_CRISIS_FLAGS.find((f) => f.id === id);
  if (!flag) throw new Error("Flag not found");
  flag.status = status;
  if (assignedTo) flag.assignedTo = assignedTo;
  return { ...flag };
}
