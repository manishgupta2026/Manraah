import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("manraah_session")?.value;

  if (!sessionCookie) {
    return NextResponse.json(
      { user: null, isAuthenticated: false },
      { status: 401 }
    );
  }

  try {
    const session = JSON.parse(sessionCookie);
    return NextResponse.json(session);
  } catch {
    return NextResponse.json(
      { user: null, isAuthenticated: false },
      { status: 401 }
    );
  }
}
