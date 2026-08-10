import AdminShell from "@/frontend/components/shell/AdminShell";
import UserDetailView from "@/frontend/components/screens/admin/UserDetailView";

export const metadata = {
  title: "User Inspection Details | Manraah Admin",
  description: "Detailed member profile inspection and serenity score telemetry.",
};

export default function AdminUserDetailPage({ params }: { params: { userId: string } }) {
  return (
    <AdminShell>
      <UserDetailView userId={params.userId} />
    </AdminShell>
  );
}
