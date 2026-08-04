import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/backend/auth/auth";
import { updateMoodEntry, deleteMoodEntry } from "@/backend/queries/mood";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const body = await req.json();
    const { mood, energy, stress, reflection, factors } = body;

    if (!mood || energy === undefined || !stress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updated = await updateMoodEntry(session.user.id, id, {
      mood,
      energy: Number(energy),
      stress,
      reflection,
      factors,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("API PUT /api/mood/[id] error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const res = await deleteMoodEntry(session.user.id, id);
    return NextResponse.json(res);
  } catch (err: any) {
    console.error("API DELETE /api/mood/[id] error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
