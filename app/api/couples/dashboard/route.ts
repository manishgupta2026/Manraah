import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { getCouplesDashboardData, updatePartnerName, updateHarmonyMetrics, toggleCoupleTask, addCoupleAppointment } from "@/Couples/backend/queries/couples";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getCouplesDashboardData(userId);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[Couples Dashboard GET API Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to load dashboard data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "updatePartner") {
      const { partnerName } = body;
      if (!partnerName || !partnerName.trim()) {
        return NextResponse.json({ error: "Partner name is required" }, { status: 400 });
      }
      const res = await updatePartnerName(userId, partnerName.trim());
      return NextResponse.json(res);
    }

    if (action === "updateMetrics") {
      const { stressLevel, energyLevel, communicationScore } = body;
      if (stressLevel === undefined || energyLevel === undefined || communicationScore === undefined) {
        return NextResponse.json({ error: "Metrics are required" }, { status: 400 });
      }
      const res = await updateHarmonyMetrics(
        userId,
        Number(stressLevel),
        Number(energyLevel),
        Number(communicationScore)
      );
      return NextResponse.json(res);
    }

    if (action === "toggleTask") {
      const { taskId, completed } = body;
      if (taskId === undefined || completed === undefined) {
        return NextResponse.json({ error: "Task ID and completed status are required" }, { status: 400 });
      }
      const res = await toggleCoupleTask(userId, Number(taskId), Boolean(completed));
      return NextResponse.json(res);
    }

    if (action === "addAppointment") {
      const { title, category, doctor_name, hospital_name, location, date, time } = body;
      if (!title || !category || !doctor_name || !hospital_name || !location || !date || !time) {
        return NextResponse.json({ error: "All appointment details are required" }, { status: 400 });
      }
      const res = await addCoupleAppointment(userId, title, category, doctor_name, hospital_name, location, date, time);
      return NextResponse.json(res);
    }

    return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
  } catch (err: any) {
    console.error("[Couples Dashboard POST API Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to execute action" }, { status: 500 });
  }
}
