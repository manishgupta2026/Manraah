import AdminMainDashboard from "@/frontend/components/admin/AdminMainDashboard";

export const metadata = {
  title: "Admin Operations & Analytics Dashboard | Manraah Sanctuary",
  description: "Executive control dashboard for peer listener companion matching, user moderation, therapist verification, and system health.",
};

export default function AdminDashboardPage() {
  return <AdminMainDashboard initialTab="OVERVIEW" />;
}
