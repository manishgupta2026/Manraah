import ListenerCompanionController from "@/frontend/components/screens/human-companion-listener/ListenerCompanionController";

export const metadata = {
  title: "Companion Listener Dashboard | Manraah Sanctuary",
  description: "Peer listener workspace for accepting sessions, live chat, and WebRTC voice calls.",
};

export default function CompanionDashboardPage() {
  return <ListenerCompanionController />;
}
