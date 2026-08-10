import AdminShell from "@/frontend/components/shell/AdminShell";
import AdminSettings from "@/frontend/components/screens/admin/AdminSettings";

export const metadata = {
  title: "Admin Infrastructure Settings | Manraah Admin",
  description: "Platform safety parameters, infrastructure status, and security configuration.",
};

export default function AdminSettingsPage() {
  return (
    <AdminShell>
      <AdminSettings />
    </AdminShell>
  );
}
