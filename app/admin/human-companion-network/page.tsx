import AdminShell from "@/frontend/components/shell/AdminShell";
import HumanCompanionNetworkOps from "@/frontend/components/screens/admin/HumanCompanionNetworkOps";

export const metadata = {
  title: "Human Companion Network Ops | Manraah Admin",
  description: "Read-only aggregate oversight of active peer listener nodes, live sessions, and queue capacity.",
};

export default function AdminHumanCompanionNetworkPage() {
  return (
    <AdminShell>
      <HumanCompanionNetworkOps />
    </AdminShell>
  );
}
