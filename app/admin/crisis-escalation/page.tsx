import AdminShell from "@/frontend/components/shell/AdminShell";
import CrisisEscalationCenter from "@/frontend/components/screens/admin/CrisisEscalationCenter";

export const metadata = {
  title: "Crisis Escalation Center | Manraah Admin",
  description: "Unified emergency triage feed merging Companion flags, AI safety triggers, and Community safety reports.",
};

export default function AdminCrisisEscalationPage() {
  return (
    <AdminShell>
      <CrisisEscalationCenter />
    </AdminShell>
  );
}
