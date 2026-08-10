import AdminShell from "@/frontend/components/shell/AdminShell";
import CommunityModerationQueue from "@/frontend/components/screens/admin/CommunityModerationQueue";

export const metadata = {
  title: "Community Moderation Queue | Manraah Admin",
  description: "Moderation queue for community posts, safety reviews, and user flags.",
};

export default function AdminCommunityPage() {
  return (
    <AdminShell>
      <CommunityModerationQueue />
    </AdminShell>
  );
}
