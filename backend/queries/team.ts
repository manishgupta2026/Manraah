import { UserRole } from "@/backend/types";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  status: "Active" | "Pending" | "Suspended";
  joinedDate: string;
}

let MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "tm-1",
    name: "Ashutosh Sahu",
    email: "admin@manraah.com",
    role: "admin",
    avatar: "/images/user_avatar.jpg",
    status: "Active",
    joinedDate: "Aug 1, 2026",
  },
  {
    id: "tm-2",
    name: "Dr. Sarah Jenkins",
    email: "sarah@manraah.com",
    role: "listener",
    avatar: "/images/therapist_sarah.jpg",
    status: "Active",
    joinedDate: "Jul 15, 2026",
  },
  {
    id: "tm-3",
    name: "Aanya Verma",
    email: "aanya@manraah.org",
    role: "user",
    avatar: "/images/user_avatar.jpg",
    status: "Active",
    joinedDate: "Jul 28, 2026",
  },
];

export async function listTeamMembers(): Promise<TeamMember[]> {
  return [...MOCK_TEAM_MEMBERS];
}

export async function updateUserRole(userId: string, newRole: UserRole): Promise<TeamMember> {
  const member = MOCK_TEAM_MEMBERS.find((m) => m.id === userId);
  if (!member) {
    throw new Error("Team member not found.");
  }
  member.role = newRole;
  return { ...member };
}

export async function inviteTeamMember(email: string, role: UserRole): Promise<TeamMember> {
  const newMember: TeamMember = {
    id: `tm-${Date.now()}`,
    name: email.split("@")[0],
    email,
    role,
    avatar: "/images/user_avatar.jpg",
    status: "Pending",
    joinedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  };
  MOCK_TEAM_MEMBERS.push(newMember);
  return newMember;
}
