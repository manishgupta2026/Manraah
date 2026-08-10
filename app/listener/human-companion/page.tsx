import ListenerCompanionController from "@/frontend/components/screens/human-companion-listener/ListenerCompanionController";

export const metadata = {
  title: "Peer Listener Console | Manraah Sanctuary",
  description: "Human Companion volunteer listener workspace for accepting sessions, real-time chat, and WebRTC voice calls.",
};

export default function ListenerHumanCompanionPage() {
  return <ListenerCompanionController />;
}
