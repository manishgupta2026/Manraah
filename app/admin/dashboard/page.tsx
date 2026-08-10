import AdminShell from "@/frontend/components/shell/AdminShell";
import DashboardOverview from "@/frontend/components/screens/admin/DashboardOverview";

export const metadata = {
  title: "Admin Dashboard Overview | Manraah Sanctuary",
  description: "Executive Operations & Telemetry Dashboard.",
};

export default function AdminDashboardOverviewPage() {
  return (
    <AdminShell>
      <DashboardOverview />
    </AdminShell>
  );
}
