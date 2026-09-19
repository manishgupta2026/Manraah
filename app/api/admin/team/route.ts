import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";
import { verifyAdminSession } from "@/backend/auth/admin-guard";
import { hashPassword } from "@/backend/auth/crypto";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = verifyAdminSession(request);
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  try {
    const team = await sql`
      SELECT 
        id, 
        name, 
        email, 
        role, 
        COALESCE(status, 'ONLINE') AS status, 
        created_at AS "createdAt"
      FROM companion_users
      ORDER BY created_at ASC
    `;

    return NextResponse.json({
      success: true,
      team: team.map((m: any) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role?.toLowerCase() || "listener",
        avatar: m.role?.toLowerCase() === "admin" ? "/images/user_avatar.jpg" : "/images/therapist_sarah.jpg",
        status: m.status || "Active",
        joinedDate: m.createdAt
          ? new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "Recent",
      })),
    });
  } catch (err: any) {
    console.error("[GET /api/admin/team Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch team members" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = verifyAdminSession(request);
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  try {
    const body = await request.json();
    const { name, email, role, password } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const assignedRole = (role || "listener").toLowerCase();
    const displayName = name?.trim() || email.split("@")[0];
    const plainPassword = password || "CompanionPass123!";
    const passwordHash = hashPassword(plainPassword);
    const newId = `cmp_${Date.now()}`;

    const inserted = await sql`
      INSERT INTO companion_users (id, name, email, password_hash, role, status)
      VALUES (${newId}, ${displayName}, ${email.toLowerCase().trim()}, ${passwordHash}, ${assignedRole}, 'ONLINE')
      ON CONFLICT (email) DO UPDATE SET
        role = EXCLUDED.role,
        name = EXCLUDED.name
      RETURNING id, name, email, role, status, created_at
    `;

    const m = inserted[0];

    return NextResponse.json({
      success: true,
      member: {
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role,
        avatar: "/images/user_avatar.jpg",
        status: m.status || "Active",
        joinedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      },
    });
  } catch (err: any) {
    console.error("[POST /api/admin/team Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to invite team member" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = verifyAdminSession(request);
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  try {
    const body = await request.json();
    const { userId, role, status } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    if (role) {
      await sql`
        UPDATE companion_users 
        SET role = ${role.toLowerCase()}
        WHERE id = ${userId}
      `;
    }

    if (status) {
      await sql`
        UPDATE companion_users 
        SET status = ${status}
        WHERE id = ${userId}
      `;
    }

    const updated = await sql`
      SELECT id, name, email, role, status, created_at 
      FROM companion_users 
      WHERE id = ${userId}
      LIMIT 1
    `;

    const m = updated[0];

    return NextResponse.json({
      success: true,
      member: {
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role,
        avatar: "/images/user_avatar.jpg",
        status: m.status || "Active",
        joinedDate: m.created_at ? new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent",
      },
    });
  } catch (err: any) {
    console.error("[PATCH /api/admin/team Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to update team member" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = verifyAdminSession(request);
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    await sql`DELETE FROM companion_users WHERE id = ${userId}`;

    return NextResponse.json({ success: true, message: "Member removed successfully" });
  } catch (err: any) {
    console.error("[DELETE /api/admin/team Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to remove member" }, { status: 500 });
  }
}
