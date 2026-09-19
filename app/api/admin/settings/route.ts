import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/backend/auth/admin-guard";

export const dynamic = "force-dynamic";

let ADMIN_CONFIG = {
  allowPublicSignups: true,
  requireCrisisAck: true,
  maxQueueSize: 25,
  autoTriageSeverity: "HIGH",
  turnServerRedundancy: true,
};

export async function GET(request: Request) {
  const auth = verifyAdminSession(request);
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  return NextResponse.json({
    success: true,
    settings: ADMIN_CONFIG,
  });
}

export async function POST(request: Request) {
  const auth = verifyAdminSession(request);
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  try {
    const body = await request.json();
    ADMIN_CONFIG = { ...ADMIN_CONFIG, ...body };

    return NextResponse.json({
      success: true,
      settings: ADMIN_CONFIG,
      message: "Admin configuration updated successfully.",
    });
  } catch (err: any) {
    console.error("[POST /api/admin/settings Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to update settings" }, { status: 500 });
  }
}
