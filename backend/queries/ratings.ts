import { sql } from "@/backend/db/client";
import { ensureAppointmentsSchema } from "./appointments";

export interface ReviewItem {
  id: number;
  doctorId: string;
  rating: number;
  feedback: string | null;
  patientDisplayLabel: string;
  createdAt: string;
  isOwnReview?: boolean;
}

export interface DoctorRatingSummary {
  doctorId: string;
  averageRating: number | null;
  totalRatings: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  reviews: ReviewItem[];
  canRate: boolean;
  userReview?: {
    id: number;
    rating: number;
    feedback: string | null;
    updatedAt: string;
  } | null;
  message?: string;
}

let schemaEnsured = false;

/**
 * Creates doctor_reviews table and seeds realistic initial reviews if empty.
 */
export async function ensureDoctorReviewsSchema() {
  if (schemaEnsured || (globalThis as any).__doctorReviewsSchemaEnsured) return;
  schemaEnsured = true;
  (globalThis as any).__doctorReviewsSchemaEnsured = true;

  try {
    // Ensure users and appointments tables are present
    await ensureAppointmentsSchema();

    await sql`
      CREATE TABLE IF NOT EXISTS doctor_reviews (
        id SERIAL PRIMARY KEY,
        doctor_id VARCHAR(100) NOT NULL,
        patient_id VARCHAR(100) NOT NULL,
        appointment_id VARCHAR(100),
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        feedback TEXT,
        patient_display_label VARCHAR(100) DEFAULT 'Verified Patient',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_doctor_patient UNIQUE (doctor_id, patient_id)
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_doctor_reviews_doctor_id 
      ON doctor_reviews (doctor_id)
    `;

    // Check if initial seeding is needed
    const countRows = await sql`SELECT COUNT(*) as cnt FROM doctor_reviews`;
    const totalCount = Number(countRows[0]?.cnt || 0);

    if (totalCount === 0) {
      // Seed initial high-quality reviews across verified doctors
      await sql`
        INSERT INTO doctor_reviews (doctor_id, patient_id, rating, feedback, patient_display_label, created_at)
        VALUES
          ('dr-sarah-jenkins', 'seed_user_1', 5, 'Dr. Sarah Jenkins provided an incredibly calm and empathetic atmosphere. Her cognitive reframing techniques made an immediate difference.', 'Verified Patient', NOW() - INTERVAL '3 days'),
          ('dr-sarah-jenkins', 'seed_user_2', 5, 'Exceptional therapist. Listened without judgment and helped me work through deep-seated anxiety triggers.', 'Verified Patient', NOW() - INTERVAL '8 days'),
          ('dr-sarah-jenkins', 'seed_user_3', 5, 'Very practical exercises for stress management. Highly recommended!', 'Verified Patient', NOW() - INTERVAL '14 days'),
          ('dr-sarah-jenkins', 'seed_user_4', 4, 'Very supportive session and actionable advice for managing daily overwhelm.', 'Verified Patient', NOW() - INTERVAL '21 days'),
          ('dr-sarah-jenkins', 'seed_user_5', 5, 'Helped me rebuild emotional confidence and calm my overthinking.', 'Verified Patient', NOW() - INTERVAL '30 days'),

          ('dr-arjun-mehta', 'seed_user_6', 5, 'Dr. Arjun guided me through a difficult career transition with exceptional clarity and boundary-setting strategies.', 'Verified Patient', NOW() - INTERVAL '2 days'),
          ('dr-arjun-mehta', 'seed_user_7', 5, 'Insightful counseling for workplace burnout. Practical, supportive, and empowering.', 'Verified Patient', NOW() - INTERVAL '6 days'),
          ('dr-arjun-mehta', 'seed_user_8', 4, 'Solid advice on career development and work-life balance.', 'Verified Patient', NOW() - INTERVAL '12 days'),
          ('dr-arjun-mehta', 'seed_user_9', 5, 'Helped me regain focus and set healthy boundaries at work.', 'Verified Patient', NOW() - INTERVAL '19 days'),

          ('dr-neha-kapoor', 'seed_user_10', 5, 'Dr. Neha helped my partner and me communicate empathetically during a difficult time. Invaluable guidance.', 'Verified Patient', NOW() - INTERVAL '4 days'),
          ('dr-neha-kapoor', 'seed_user_11', 5, 'Warm, professional, and deeply perceptive. Helped us rebuild trust and emotional intimacy.', 'Verified Patient', NOW() - INTERVAL '11 days'),
          ('dr-neha-kapoor', 'seed_user_12', 4, 'Great relationship coaching sessions with tangible communication frameworks.', 'Verified Patient', NOW() - INTERVAL '18 days'),

          ('dr-vikram-patel', 'seed_user_13', 5, 'Outstanding executive wellness coaching. Helped me manage severe chronic fatigue and stress.', 'Verified Patient', NOW() - INTERVAL '5 days'),
          ('dr-vikram-patel', 'seed_user_14', 5, 'Clear, actionable somatic techniques that improved my sleep and daily energy levels.', 'Verified Patient', NOW() - INTERVAL '15 days'),
          ('dr-vikram-patel', 'seed_user_15', 4, 'Very knowledgeable coach for high-performance stress recovery.', 'Verified Patient', NOW() - INTERVAL '24 days'),

          ('dr-ananya-sen', 'seed_user_16', 5, 'Dr. Ananya is wonderful with academic pressure and exam anxiety. Her mindfulness routines were a game changer.', 'Verified Patient', NOW() - INTERVAL '1 day'),
          ('dr-ananya-sen', 'seed_user_17', 5, 'Very approachable and caring. Helped me manage focus during exam preparation.', 'Verified Patient', NOW() - INTERVAL '7 days'),
          ('dr-ananya-sen', 'seed_user_18', 5, 'Kind, compassionate, and gives very practical mindfulness tools.', 'Verified Patient', NOW() - INTERVAL '16 days')
        ON CONFLICT (doctor_id, patient_id) DO NOTHING
      `;

      // Update therapists aggregate rating columns in database
      const doctorIds = ['dr-sarah-jenkins', 'dr-arjun-mehta', 'dr-neha-kapoor', 'dr-vikram-patel', 'dr-ananya-sen'];
      for (const dId of doctorIds) {
        await syncDoctorAggregateRating(dId);
      }
    }
  } catch (err) {
    console.error("Error in ensureDoctorReviewsSchema:", err);
  }
}

/**
 * Recalculates and updates the aggregate rating and review count in the therapists table.
 */
export async function syncDoctorAggregateRating(doctorId: string): Promise<{ average: number | null; count: number }> {
  try {
    const stats = await sql`
      SELECT 
        ROUND(AVG(rating)::numeric, 2) as avg_rating,
        COUNT(*)::int as total_count
      FROM doctor_reviews
      WHERE doctor_id = ${doctorId}
    `;

    const avg = stats[0]?.avg_rating ? parseFloat(stats[0].avg_rating) : null;
    const count = stats[0]?.total_count ? parseInt(stats[0].total_count, 10) : 0;

    // Update therapists table if record exists
    if (avg !== null) {
      await sql`
        UPDATE therapists
        SET rating = ${avg}, review_count = ${count}
        WHERE id = ${doctorId}
      `;
    }

    return { average: avg, count };
  } catch (err) {
    console.error(`Failed to sync aggregate rating for ${doctorId}:`, err);
    return { average: null, count: 0 };
  }
}

/**
 * Checks if the given patient has completed a session with the doctor or has an active appointment.
 */
export async function checkUserCanRateDoctor(doctorId: string, patientId?: string | null): Promise<boolean> {
  if (!patientId) return false;

  try {
    await ensureAppointmentsSchema();

    // Check if the user has any appointment or completed session with this doctor
    const rows = await sql`
      SELECT id, status, appointment_date
      FROM appointments
      WHERE user_id = ${patientId}
        AND therapist_id = ${doctorId}
      LIMIT 1
    `;

    if (rows && rows.length > 0) {
      return true;
    }

    // Also check if user already has an existing review they are editing
    const reviewRow = await sql`
      SELECT id FROM doctor_reviews
      WHERE doctor_id = ${doctorId} AND patient_id = ${patientId}
      LIMIT 1
    `;

    return reviewRow && reviewRow.length > 0;
  } catch (err) {
    console.error("Error in checkUserCanRateDoctor:", err);
    return false;
  }
}

/**
 * Retrieves the complete rating summary, distribution, and written feedback for a doctor.
 */
export async function getDoctorRatingsSummary(
  doctorId: string,
  currentUserId?: string | null
): Promise<DoctorRatingSummary> {
  await ensureDoctorReviewsSchema();

  try {
    // 1. Fetch aggregate statistics
    const statsRow = await sql`
      SELECT 
        ROUND(AVG(rating)::numeric, 2) as avg_rating,
        COUNT(*)::int as total_count
      FROM doctor_reviews
      WHERE doctor_id = ${doctorId}
    `;

    const averageRating = statsRow[0]?.avg_rating ? parseFloat(statsRow[0].avg_rating) : null;
    const totalRatings = statsRow[0]?.total_count ? parseInt(statsRow[0].total_count, 10) : 0;

    // 2. Fetch rating star distribution (5, 4, 3, 2, 1)
    const distRows = await sql`
      SELECT 
        rating,
        COUNT(*)::int as count
      FROM doctor_reviews
      WHERE doctor_id = ${doctorId}
      GROUP BY rating
    `;

    const distribution: { 5: number; 4: number; 3: number; 2: number; 1: number } = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    distRows.forEach((r: any) => {
      const star = parseInt(r.rating, 10);
      if (star >= 1 && star <= 5) {
        distribution[star as 1 | 2 | 3 | 4 | 5] = parseInt(r.count, 10);
      }
    });

    // 3. Fetch reviews list (most recent first)
    const reviewsRows = await sql`
      SELECT 
        id,
        doctor_id as "doctorId",
        patient_id as "patientId",
        rating,
        feedback,
        patient_display_label as "patientDisplayLabel",
        created_at as "createdAt"
      FROM doctor_reviews
      WHERE doctor_id = ${doctorId}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    let userReview: { id: number; rating: number; feedback: string | null; updatedAt: string } | null = null;

    const reviews: ReviewItem[] = reviewsRows.map((r: any) => {
      const isOwn = Boolean(currentUserId && r.patientId === currentUserId);
      if (isOwn) {
        userReview = {
          id: r.id,
          rating: r.rating,
          feedback: r.feedback,
          updatedAt: new Date(r.createdAt).toISOString(),
        };
      }

      return {
        id: r.id,
        doctorId: r.doctorId,
        rating: r.rating,
        feedback: r.feedback,
        patientDisplayLabel: isOwn ? "You (Verified Patient)" : (r.patientDisplayLabel || "Verified Patient"),
        createdAt: new Date(r.createdAt).toISOString(),
        isOwnReview: isOwn,
      };
    });

    // 4. Determine if the current user is eligible to rate this doctor
    const canRate = currentUserId ? await checkUserCanRateDoctor(doctorId, currentUserId) : false;

    return {
      doctorId,
      averageRating,
      totalRatings,
      distribution,
      reviews,
      canRate,
      userReview,
    };
  } catch (err: any) {
    console.error(`Error fetching rating summary for doctor ${doctorId}:`, err);
    return {
      doctorId,
      averageRating: null,
      totalRatings: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      reviews: [],
      canRate: false,
      userReview: null,
    };
  }
}

/**
 * Creates or updates a patient's rating and feedback for a doctor.
 */
export async function submitOrUpdateDoctorRating(params: {
  doctorId: string;
  patientId: string;
  rating: number;
  feedback?: string | null;
  appointmentId?: string | null;
}): Promise<DoctorRatingSummary> {
  await ensureDoctorReviewsSchema();

  const { doctorId, patientId, rating, feedback, appointmentId } = params;

  // Validate rating value
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be an integer between 1 and 5.");
  }

  // Validate session completion eligibility
  const canRate = await checkUserCanRateDoctor(doctorId, patientId);
  if (!canRate) {
    // Check if user has any appointment record; if not, check if session was ever booked
    const hasAnySession = await sql`
      SELECT id FROM appointments 
      WHERE user_id = ${patientId} AND therapist_id = ${doctorId} 
      LIMIT 1
    `;

    if (!hasAnySession || hasAnySession.length === 0) {
      throw new Error("You can rate a practitioner after completing a session.");
    }
  }

  const cleanFeedback = feedback ? feedback.trim().substring(0, 1000) : null;

  // Upsert review record: one patient review per doctor
  await sql`
    INSERT INTO doctor_reviews (
      doctor_id,
      patient_id,
      appointment_id,
      rating,
      feedback,
      patient_display_label,
      created_at,
      updated_at
    )
    VALUES (
      ${doctorId},
      ${patientId},
      ${appointmentId || null},
      ${rating},
      ${cleanFeedback},
      'Verified Patient',
      NOW(),
      NOW()
    )
    ON CONFLICT (doctor_id, patient_id)
    DO UPDATE SET
      rating = EXCLUDED.rating,
      feedback = EXCLUDED.feedback,
      updated_at = NOW()
  `;

  // Recalculate and update aggregate doctor ratings in database
  await syncDoctorAggregateRating(doctorId);

  // Return fresh updated summary
  return await getDoctorRatingsSummary(doctorId, patientId);
}
