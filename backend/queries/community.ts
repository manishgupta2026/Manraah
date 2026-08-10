export interface CommunityReport {
  id: string;
  postId: string;
  postTitle: string;
  reportedUser: string;
  reason: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  isSafetyRelated: boolean;
  timestamp: string;
  status: "OPEN" | "RESOLVED" | "DISMISSED";
  assignedTo?: string;
}

let MOCK_COMMUNITY_REPORTS: CommunityReport[] = [
  {
    id: "rep-201",
    postId: "p1",
    postTitle: "Struggling with late night panic attacks",
    reportedUser: "Anonymous Member #309",
    reason: "Expressed distress and isolation without support.",
    severity: "HIGH",
    isSafetyRelated: true,
    timestamp: "40 mins ago",
    status: "OPEN",
  },
  {
    id: "rep-202",
    postId: "p4",
    postTitle: "Is anyone awake right now?",
    reportedUser: "Anonymous Member #512",
    reason: "Offensive language in thread comment.",
    severity: "LOW",
    isSafetyRelated: false,
    timestamp: "2 hours ago",
    status: "OPEN",
  },
];

export async function getCommunityReports(): Promise<CommunityReport[]> {
  return [...MOCK_COMMUNITY_REPORTS];
}

export async function updateCommunityReportStatus(id: string, status: "OPEN" | "RESOLVED" | "DISMISSED", assignedTo?: string): Promise<CommunityReport> {
  const report = MOCK_COMMUNITY_REPORTS.find((r) => r.id === id);
  if (!report) throw new Error("Report not found");
  report.status = status;
  if (assignedTo) report.assignedTo = assignedTo;
  return { ...report };
}
