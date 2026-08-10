import AdminShell from "@/frontend/components/shell/AdminShell";
import UserManagementTable from "@/frontend/components/screens/admin/UserManagementTable";

export const metadata = {
  title: "User Directory & Moderation | Manraah Admin",
  description: "Member directory and privacy-preserved serenity score inspection.",
};

export default function AdminUsersPage() {
  return (
    <AdminShell>
      <UserManagementTable />
    </AdminShell>
  );
}
