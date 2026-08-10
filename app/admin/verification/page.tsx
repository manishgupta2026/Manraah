import AdminShell from "@/frontend/components/shell/AdminShell";
import TherapistVerificationQueue from "@/frontend/components/screens/admin/TherapistVerificationQueue";

export const metadata = {
  title: "Therapist Verification Queue | Manraah Admin",
  description: "RCI license verification and clinical practitioner approval pipeline.",
};

export default function AdminVerificationPage() {
  return (
    <AdminShell>
      <TherapistVerificationQueue />
    </AdminShell>
  );
}
