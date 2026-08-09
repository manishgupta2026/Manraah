import AdminMainDashboard from "@/frontend/components/admin/AdminMainDashboard";

export const metadata = {
  title: "Volunteer Listener Portal | Manraah Sanctuary",
  description: "Workspace for trained peer listeners to accept sessions and provide empathetic support.",
};

export default function ListenerPortalPage() {
  return <AdminMainDashboard initialTab="COMPANION" />;
}
