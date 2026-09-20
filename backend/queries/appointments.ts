import { sql } from "@/backend/db/client";

export interface AppointmentRecord {
  id: string;
  userId: string;
  therapistId: string;
  therapistName: string;
  therapistRole: string;
  therapistImage: string;
  appointmentDate: string;
  durationMinutes: number;
  sessionType: string;
  status: "confirmed" | "completed" | "cancelled" | "rejected";
  focusArea?: string;
  meetingLink?: string;
  createdAt: string;
  updatedAt: string;
}

let appointmentsTableEnsured = false;

export async function ensureAppointmentsSchema() {
  if (appointmentsTableEnsured || (globalThis as any).__appointmentsSchemaEnsured) return;
  appointmentsTableEnsured = true;
  (globalThis as any).__appointmentsSchemaEnsured = true;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS appointments (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        therapist_id VARCHAR(100) NOT NULL,
        therapist_name VARCHAR(255) NOT NULL,
        therapist_role VARCHAR(255),
        therapist_image VARCHAR(500),
        appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
        duration_minutes INT DEFAULT 45,
        session_type VARCHAR(50) DEFAULT '1-on-1 Video Session',
        status VARCHAR(50) DEFAULT 'confirmed',
        focus_area VARCHAR(255),
        meeting_link VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_appointments_user_status_date
      ON appointments (user_id, status, appointment_date)
    `;
  } catch (err) {
    console.error("Error creating appointments table:", err);
  }
}

/**
 * Returns the single nearest upcoming confirmed appointment for the authenticated user.
 * Strictly filters out past, cancelled, completed, or rejected appointments.
 */
export async function getNearestUpcomingAppointment(userId: string): Promise<AppointmentRecord | null> {
  await ensureAppointmentsSchema();

  try {
    const rows = await sql`
      SELECT 
        id,
        user_id as "userId",
        therapist_id as "therapistId",
        therapist_name as "therapistName",
        therapist_role as "therapistRole",
        therapist_image as "therapistImage",
        appointment_date as "appointmentDate",
        duration_minutes as "durationMinutes",
        session_type as "sessionType",
        status,
        focus_area as "focusArea",
        meeting_link as "meetingLink",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM appointments
      WHERE user_id = ${userId}
        AND status = 'confirmed'
        AND appointment_date >= CURRENT_TIMESTAMP
      ORDER BY appointment_date ASC
      LIMIT 1
    `;

    if (!rows || rows.length === 0) return null;

    const r = rows[0];
    return {
      id: r.id,
      userId: r.userId,
      therapistId: r.therapistId,
      therapistName: r.therapistName,
      therapistRole: r.therapistRole || "Therapist",
      therapistImage: r.therapistImage || "/images/therapist_sarah.jpg",
      appointmentDate: new Date(r.appointmentDate).toISOString(),
      durationMinutes: Number(r.durationMinutes || 45),
      sessionType: r.sessionType || "1-on-1 Video Session",
      status: r.status,
      focusArea: r.focusArea || undefined,
      meetingLink: r.meetingLink || undefined,
      createdAt: new Date(r.createdAt).toISOString(),
      updatedAt: new Date(r.updatedAt).toISOString(),
    };
  } catch (err) {
    console.error("Error in getNearestUpcomingAppointment:", err);
    return null;
  }
}

/**
 * Returns all upcoming appointments for the authenticated user (sorted earliest first).
 */
export async function getUpcomingAppointments(userId: string): Promise<AppointmentRecord[]> {
  await ensureAppointmentsSchema();

  try {
    const rows = await sql`
      SELECT 
        id,
        user_id as "userId",
        therapist_id as "therapistId",
        therapist_name as "therapistName",
        therapist_role as "therapistRole",
        therapist_image as "therapistImage",
        appointment_date as "appointmentDate",
        duration_minutes as "durationMinutes",
        session_type as "sessionType",
        status,
        focus_area as "focusArea",
        meeting_link as "meetingLink",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM appointments
      WHERE user_id = ${userId}
        AND status = 'confirmed'
        AND appointment_date >= CURRENT_TIMESTAMP
      ORDER BY appointment_date ASC
    `;

    return rows.map((r: any) => ({
      id: r.id,
      userId: r.userId,
      therapistId: r.therapistId,
      therapistName: r.therapistName,
      therapistRole: r.therapistRole || "Therapist",
      therapistImage: r.therapistImage || "/images/therapist_sarah.jpg",
      appointmentDate: new Date(r.appointmentDate).toISOString(),
      durationMinutes: Number(r.durationMinutes || 45),
      sessionType: r.sessionType || "1-on-1 Video Session",
      status: r.status,
      focusArea: r.focusArea || undefined,
      meetingLink: r.meetingLink || undefined,
      createdAt: new Date(r.createdAt).toISOString(),
      updatedAt: new Date(r.updatedAt).toISOString(),
    }));
  } catch (err) {
    console.error("Error in getUpcomingAppointments:", err);
    return [];
  }
}

/**
 * Returns all past/completed/cancelled appointments for the user.
 */
export async function getPastAppointments(userId: string): Promise<AppointmentRecord[]> {
  await ensureAppointmentsSchema();

  try {
    const rows = await sql`
      SELECT 
        id,
        user_id as "userId",
        therapist_id as "therapistId",
        therapist_name as "therapistName",
        therapist_role as "therapistRole",
        therapist_image as "therapistImage",
        appointment_date as "appointmentDate",
        duration_minutes as "durationMinutes",
        session_type as "sessionType",
        status,
        focus_area as "focusArea",
        meeting_link as "meetingLink",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM appointments
      WHERE user_id = ${userId}
        AND (status != 'confirmed' OR appointment_date < CURRENT_TIMESTAMP)
      ORDER BY appointment_date DESC
    `;

    return rows.map((r: any) => ({
      id: r.id,
      userId: r.userId,
      therapistId: r.therapistId,
      therapistName: r.therapistName,
      therapistRole: r.therapistRole || "Therapist",
      therapistImage: r.therapistImage || "/images/therapist_sarah.jpg",
      appointmentDate: new Date(r.appointmentDate).toISOString(),
      durationMinutes: Number(r.durationMinutes || 45),
      sessionType: r.sessionType || "1-on-1 Video Session",
      status: r.status,
      focusArea: r.focusArea || undefined,
      meetingLink: r.meetingLink || undefined,
      createdAt: new Date(r.createdAt).toISOString(),
      updatedAt: new Date(r.updatedAt).toISOString(),
    }));
  } catch (err) {
    console.error("Error in getPastAppointments:", err);
    return [];
  }
}

/**
 * Books a new appointment for the user.
 */
export async function bookAppointment(
  userId: string,
  data: {
    therapistId: string;
    therapistName: string;
    therapistRole?: string;
    therapistImage?: string;
    appointmentDate: string | Date;
    focusArea?: string;
    sessionType?: string;
    durationMinutes?: number;
  }
): Promise<AppointmentRecord> {
  await ensureAppointmentsSchema();

  const id = `apt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const dateObj = new Date(data.appointmentDate);

  const result = await sql`
    INSERT INTO appointments (
      id,
      user_id,
      therapist_id,
      therapist_name,
      therapist_role,
      therapist_image,
      appointment_date,
      duration_minutes,
      session_type,
      status,
      focus_area,
      meeting_link,
      created_at,
      updated_at
    )
    VALUES (
      ${id},
      ${userId},
      ${data.therapistId},
      ${data.therapistName},
      ${data.therapistRole || 'Clinical Psychologist'},
      ${data.therapistImage || '/images/therapist_sarah.jpg'},
      ${dateObj.toISOString()},
      ${data.durationMinutes || 45},
      ${data.sessionType || '1-on-1 Video Session'},
      'confirmed',
      ${data.focusArea || 'General Wellness & Mental Health'},
      ${'https://meet.manraah.com/session/' + id},
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    RETURNING 
      id,
      user_id as "userId",
      therapist_id as "therapistId",
      therapist_name as "therapistName",
      therapist_role as "therapistRole",
      therapist_image as "therapistImage",
      appointment_date as "appointmentDate",
      duration_minutes as "durationMinutes",
      session_type as "sessionType",
      status,
      focus_area as "focusArea",
      meeting_link as "meetingLink",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `;

  const r = result[0];
  return {
    id: r.id,
    userId: r.userId,
    therapistId: r.therapistId,
    therapistName: r.therapistName,
    therapistRole: r.therapistRole,
    therapistImage: r.therapistImage,
    appointmentDate: new Date(r.appointmentDate).toISOString(),
    durationMinutes: Number(r.durationMinutes || 45),
    sessionType: r.sessionType,
    status: r.status,
    focusArea: r.focusArea,
    meetingLink: r.meetingLink,
    createdAt: new Date(r.createdAt).toISOString(),
    updatedAt: new Date(r.updatedAt).toISOString(),
  };
}

/**
 * Cancels an appointment belonging to the user.
 */
export async function cancelAppointment(userId: string, appointmentId: string): Promise<boolean> {
  await ensureAppointmentsSchema();

  try {
    const result = await sql`
      UPDATE appointments
      SET status = 'cancelled',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${appointmentId} AND user_id = ${userId}
      RETURNING id
    `;
    return result.length > 0;
  } catch (err) {
    console.error("Error in cancelAppointment:", err);
    return false;
  }
}

/**
 * Deletes appointments for a specific user (used in testing/cleanup).
 */
export async function deleteAppointmentsForUser(userId: string): Promise<void> {
  await ensureAppointmentsSchema();
  try {
    await sql`DELETE FROM appointments WHERE user_id = ${userId}`;
  } catch (err) {
    // ignore
  }
}
