import AdminMainDashboard from "@/frontend/components/admin/AdminMainDashboard";

export const metadata = {
  title: "Human Companion Console | Manraah Sanctuary Admin",
  description: "Live peer listener match queue, real-time chat, and WebRTC voice call operations.",
};

export default function AdminHumanCompanionPage() {
  return <AdminMainDashboard initialTab="COMPANION" />;
}
