import { NextResponse } from "next/server";
import { getCompanionSessionFromRequest } from "@/backend/auth/companion";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = getCompanionSessionFromRequest();
  if (!session.isAuthenticated || !session.companion) {
    return NextResponse.json({ companion: null, isAuthenticated: false }, { status: 401 });
  }
  return NextResponse.json(session);
}
