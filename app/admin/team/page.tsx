import AdminShell from "@/frontend/components/shell/AdminShell";
import TeamRolesManagement from "@/frontend/components/screens/admin/TeamRolesManagement";

export const metadata = {
  title: "Team & Roles Management | Manraah Admin",
  description: "Platform role assignment (user -> listener -> admin) and team invite controls.",
};

export default function AdminTeamPage() {
  return (
    <AdminShell>
      <TeamRolesManagement />
    </AdminShell>
  );
}
