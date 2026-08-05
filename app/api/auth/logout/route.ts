import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully." });
  response.cookies.set("manraah_session", "", {
    httpOnly: false,
    maxAge: 0,
    path: "/",
  });
  return response;
}
