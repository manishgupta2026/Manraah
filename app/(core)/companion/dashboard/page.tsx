import AdminMainDashboard from "@/frontend/components/admin/AdminMainDashboard";

export const metadata = {
  title: "Companion & Admin Operations Portal | Manraah Sanctuary",
  description: "Role-based management portal for human companions, supervisors, and platform administrators.",
};

export default function CompanionDashboardPage() {
  return <AdminMainDashboard initialTab="COMPANION" />;
}
