import TherapistProfileScreen from "@/frontend/components/screens/TherapistProfileScreen";

export default function TherapistDetailPage({ params }: { params: { therapistId: string } }) {
  return <TherapistProfileScreen therapistId={params.therapistId} />;
}
