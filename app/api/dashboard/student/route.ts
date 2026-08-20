import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";
import { calculateWellnessScore } from "@/backend/lib/wellness-scoring";
import { recordUserLogin } from "@/backend/queries/streak";

export const dynamic = "force-dynamic";

async function ensureStudentTablesExist() {
  try {
    // 1. student_tasks (Study Planner)
    await sql`
      CREATE TABLE IF NOT EXISTS student_tasks (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        task_title VARCHAR(255) NOT NULL,
        priority VARCHAR(50) DEFAULT 'Medium',
        due_date TIMESTAMP WITH TIME ZONE NOT NULL,
        estimated_duration INT DEFAULT 30, -- minutes
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 2. student_exams (Exam Tracker)
    await sql`
      CREATE TABLE IF NOT EXISTS student_exams (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        exam_name VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        exam_date TIMESTAMP WITH TIME ZONE NOT NULL,
        exam_time VARCHAR(50) DEFAULT '09:00 AM',
        priority VARCHAR(50) DEFAULT 'Medium',
        prep_progress INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 3. student_focus_sessions (Focus Timer)
    await sql`
      CREATE TABLE IF NOT EXISTS student_focus_sessions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        duration_minutes INT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 4. student_sleep_records (Sleep Quality)
    await sql`
      CREATE TABLE IF NOT EXISTS student_sleep_records (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        sleep_time TIMESTAMP WITH TIME ZONE,
        white_time TIMESTAMP WITH TIME ZONE, -- wake_time, but let's name column properly
        wake_time TIMESTAMP WITH TIME ZONE,
        duration_minutes INT DEFAULT 480,
        quality_score INT DEFAULT 78,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    try {
      await sql`ALTER TABLE student_sleep_records ADD COLUMN IF NOT EXISTS wake_time TIMESTAMP WITH TIME ZONE`;
    } catch (e) {}

    // 5. student_appointments (Upcoming Consultation)
    await sql`
      CREATE TABLE IF NOT EXISTS student_appointments (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        doctor_name VARCHAR(255) NOT NULL,
        doctor_title VARCHAR(255) NOT NULL,
        doctor_avatar VARCHAR(255) NOT NULL,
        appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
        appointment_time VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'ACTIVE',
        video_call_url VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
  } catch (err) {
    console.error("Failed to verify/create student tables:", err);
  }
}

export async function GET(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Ensure all tables are created
    await ensureStudentTablesExist();

    // Record login streak activity
    const streakInfo = await recordUserLogin(userId);

    // 1. Fetch User Profile
    let userResult = await sql`
      SELECT id, name, email, sanctuary_name, avatar, selected_category, streak_days, mindfulness_minutes, current_mood, onboarding_completed, created_at
      FROM users WHERE id = ${userId} LIMIT 1
    `;

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userResult[0];
    const preferredName = user.name || user.sanctuary_name || "Student Sanctuary Member";

    // 2. Fetch Checkins
    const rawCheckins = await sql`
      SELECT id, user_id, mood, energy_level as energy, sleep_quality, stress, note, created_at
      FROM daily_checkins
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 14
    `;

    let history = rawCheckins;
    if (history.length === 0) {
      const moodHistory = await sql`
        SELECT id, user_id, mood, energy, COALESCE(sleep_quality, 3) as sleep_quality, stress, reflection as note, created_at
        FROM mood_entries
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
        LIMIT 14
      `;
      history = moodHistory;
    }

    const latestCheckin = history.length > 0 ? history[0] : null;
    const isToday = latestCheckin
      ? new Date(latestCheckin.created_at).toDateString() === new Date().toDateString()
      : false;
    const todayCheckin = isToday ? latestCheckin : null;

    // 3. Focus sessions statistics for today
    const focusSessionsToday = await sql`
      SELECT id, duration_minutes, created_at
      FROM student_focus_sessions
      WHERE user_id = ${user.id} AND created_at >= CURRENT_DATE
    `;
    const completedSessionsCount = focusSessionsToday.length;
    const totalDurationToday = focusSessionsToday.reduce((acc: number, curr: any) => acc + curr.duration_minutes, 0);

    const focusSession = {
      completed: completedSessionsCount,
      total: 3, // Target
      duration: totalDurationToday,
    };

    // 4. Seed default/fetch study tasks (Planner)
    let tasks = await sql`
      SELECT id, subject, task_title as title, priority, due_date as date, estimated_duration as duration, completed
      FROM student_tasks
      WHERE user_id = ${user.id}
      ORDER BY completed ASC, due_date ASC
    `;

    if (tasks.length === 0) {
      const today = new Date();
      await sql`
        INSERT INTO student_tasks (user_id, subject, task_title, priority, due_date, estimated_duration, completed)
        VALUES 
        (${user.id}, 'Physics', 'Read Chapter 4 on Thermodynamics', 'High', ${today.toISOString()}, 45, false),
        (${user.id}, 'Chemistry', 'Complete Lab Report Draft', 'Medium', ${today.toISOString()}, 60, false),
        (${user.id}, 'Mathematics', 'Solve Calculus Practice Set 2', 'Low', ${today.toISOString()}, 30, true)
      `;
      tasks = await sql`
        SELECT id, subject, task_title as title, priority, due_date as date, estimated_duration as duration, completed
        FROM student_tasks
        WHERE user_id = ${user.id}
        ORDER BY completed ASC, due_date ASC
      `;
    }

    // 5. Seed default/fetch exams
    let exams = await sql`
      SELECT id, exam_name as name, subject, exam_date as date, exam_time as time, priority, prep_progress as progress
      FROM student_exams
      WHERE user_id = ${user.id}
      ORDER BY exam_date ASC
    `;

    if (exams.length === 0) {
      const physicsDate = new Date();
      physicsDate.setDate(physicsDate.getDate() + 6);
      const mathDate = new Date();
      mathDate.setDate(mathDate.getDate() + 2);

      await sql`
        INSERT INTO student_exams (user_id, exam_name, subject, exam_date, exam_time, priority, prep_progress)
        VALUES 
        (${user.id}, 'Physics Midterm', 'Physics', ${physicsDate.toISOString()}, '10:00 AM', 'High', 72),
        (${user.id}, 'Math Quiz', 'Mathematics', ${mathDate.toISOString()}, '02:00 PM', 'Medium', 40)
      `;
      exams = await sql`
        SELECT id, exam_name as name, subject, exam_date as date, exam_time as time, priority, prep_progress as progress
        FROM student_exams
        WHERE user_id = ${user.id}
        ORDER BY exam_date ASC
      `;
    }

    // Adjust days_left dynamically
    exams = exams.map((ex: any) => {
      const diff = Math.ceil((new Date(ex.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      return {
        ...ex,
        daysLeft: Math.max(0, diff),
      };
    });

    // 6. Seed default/fetch upcoming appointments
    let appointments = await sql`
      SELECT id, doctor_name as name, doctor_title as title, doctor_avatar as avatar, appointment_date as date, appointment_time as time, status, video_call_url
      FROM student_appointments
      WHERE user_id = ${user.id} AND status = 'ACTIVE'
      ORDER BY appointment_date ASC
      LIMIT 1
    `;

    if (appointments.length === 0) {
      // Seed default appointment with Dr. Sarah Jenkins
      const apptDate = new Date();
      apptDate.setDate(apptDate.getDate() + 3);
      apptDate.setHours(21, 0, 0, 0); // 09:00 PM

      await sql`
        INSERT INTO student_appointments (user_id, doctor_name, doctor_title, doctor_avatar, appointment_date, appointment_time, status, video_call_url)
        VALUES (${user.id}, 'Dr. Sarah Jenkins', 'Child Psychology', '/images/therapist_sarah.jpg', ${apptDate.toISOString()}, '09:00 PM', 'ACTIVE', 'https://video.manraah.com/room/sarah-jenkins')
      `;
      appointments = await sql`
        SELECT id, doctor_name as name, doctor_title as title, doctor_avatar as avatar, appointment_date as date, appointment_time as time, status, video_call_url
        FROM student_appointments
        WHERE user_id = ${user.id} AND status = 'ACTIVE'
        ORDER BY appointment_date ASC
        LIMIT 1
      `;
    }

    // 7. Seed default/fetch sleep records
    let sleepResult = await sql`
      SELECT id, sleep_time, wake_time, duration_minutes as duration, quality_score as score
      FROM student_sleep_records
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (sleepResult.length === 0) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(22, 30, 0, 0); // 10:30 PM
      const todayWake = new Date();
      todayWake.setHours(6, 45, 0, 0); // 6:45 AM (8h 15m)

      await sql`
        INSERT INTO student_sleep_records (user_id, sleep_time, wake_time, duration_minutes, quality_score)
        VALUES (${user.id}, ${yesterday.toISOString()}, ${todayWake.toISOString()}, 495, 78)
      `;
      sleepResult = await sql`
        SELECT id, sleep_time, wake_time, duration_minutes as duration, quality_score as score
        FROM student_sleep_records
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
        LIMIT 1
      `;
    }

    const sleepRecord = sleepResult[0];

    // 8. Dynamic Wellness Score calculation
    let currentScore = 78;
    let scoreLevel = "Good";
    // Breakdown out of 100
    let scoreBreakdown = { mood: 82, stress: 64, sleep: 71, focus: 86 };

    if (history.length > 0) {
      const activeEntry = todayCheckin || history[0];
      const result = calculateWellnessScore({
        mood: activeEntry.mood || "Good",
        stress: activeEntry.stress || "Manageable",
        energy: Number(activeEntry.energy) || 4,
        sleep: Number(activeEntry.sleep_quality) || 4,
        workLifeBalance: Number(activeEntry.work_life_balance) || 4,
      });

      // Calibrate breakdowns dynamically
      const moodVal = result.breakdown.mind;
      const stressVal = result.breakdown.balance; // stress
      const sleepVal = Number(sleepRecord?.score) || 75; // sleep
      const focusVal = Math.min(100, Math.max(30, 50 + (completedSessionsCount * 10))); // focus

      currentScore = Math.round((moodVal + stressVal + sleepVal + focusVal) / 4);
      scoreLevel = currentScore >= 85 ? "Thriving" : currentScore >= 70 ? "Good" : currentScore >= 50 ? "Stable" : "Needs Care";
      scoreBreakdown = {
        mood: moodVal,
        stress: stressVal,
        sleep: sleepVal,
        focus: focusVal,
      };
    }

    // 9. Generate AI recommendation dynamically
    let recommendation = "Your stress has been slightly elevated recently. Try a short breathing session before your next study block.";
    if (todayCheckin) {
      const moodLower = todayCheckin.mood.toLowerCase();
      if (moodLower === "stressed" || moodLower === "overwhelmed") {
        recommendation = "Your stress has been elevated recently. Try a short breathing session in the Quick Tools tray before your next study block.";
      } else if (moodLower === "drained") {
        recommendation = "Your energy levels are lower today. Consider scaling back study tasks and taking recovery breaks.";
      } else if (sleepRecord?.score < 70) {
        recommendation = "Your recent sleep duration has been lower. Consider winding down a little earlier tonight using Sleep Support.";
      } else {
        recommendation = "You have been studying consistently. A short 5-minute recovery walk or deep breath could keep you balanced.";
      }
    }

    // 10. Compile results
    return NextResponse.json({
      user: {
        id: user.id,
        name: preferredName,
        email: user.email,
        avatar: user.avatar || "/images/user_avatar.jpg",
        selectedCategory: "student",
        streakDays: user.streak_days || 1,
        mindfulnessMinutes: user.mindfulness_minutes || totalDurationToday,
        currentMood: todayCheckin?.mood || user.current_mood || "Good",
        wellnessLevel: scoreLevel,
        wellnessScore: currentScore,
      },
      todayMood: todayCheckin?.mood || null,
      todayCheckin: todayCheckin ? {
        id: todayCheckin.id,
        mood: todayCheckin.mood,
        stress: todayCheckin.stress,
        energy: todayCheckin.energy,
        note: todayCheckin.note,
      } : null,
      history: history.slice(0, 7),
      wellnessScore: {
        score: currentScore,
        level: scoreLevel,
        breakdown: scoreBreakdown,
      },
      upcomingAppointment: appointments[0] || null,
      exams,
      tasks,
      focusSession,
      sleepRecord: sleepRecord ? {
        hours: Math.floor(sleepRecord.duration / 60),
        minutes: sleepRecord.duration % 60,
        score: sleepRecord.score,
      } : null,
      recommendation,
    });
  } catch (err: any) {
    console.error("GET /api/dashboard/student error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load student dashboard" },
      { status: 500 }
    );
  }
}
