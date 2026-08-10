import AdminShell from "@/frontend/components/shell/AdminShell";
import ResourceLibraryManagement from "@/frontend/components/screens/admin/ResourceLibraryManagement";

export const metadata = {
  title: "Resource Library Management | Manraah Admin",
  description: "Content manager for guided meditations, sleep soundscapes, and articles.",
};

export default function AdminResourcesPage() {
  return (
    <AdminShell>
      <ResourceLibraryManagement />
    </AdminShell>
  );
}
