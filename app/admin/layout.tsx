import { redirect } from "next/navigation";
import { getCompanionSessionFromRequest } from "@/backend/auth/companion";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = getCompanionSessionFromRequest();

  if (!session.isAuthenticated || !session.companion || session.companion.role !== "ADMIN") {
    redirect("/companion/login");
  }

  return <>{children}</>;
}
