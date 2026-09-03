import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";
import { calculateWellnessScore } from "@/backend/lib/wellness-scoring";
import { recordUserLogin } from "@/backend/queries/streak";
import { getCalendarDayString } from "@/backend/lib/date-utils";

export const dynamic = "force-dynamic";

let studentTablesInitialized = false;

async function ensureStudentTablesExist() {
  if (studentTablesInitialized) return;
  try {
    await Promise.all([
      sql`
        CREATE TABLE IF NOT EXISTS student_tasks (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(100) NOT NULL,
          subject VARCHAR(255) NOT NULL,
          task_title VARCHAR(255) NOT NULL,
          priority VARCHAR(50) DEFAULT 'Medium',
          due_date TIMESTAMP WITH TIME ZONE NOT NULL,
          estimated_duration INT DEFAULT 30,
          completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `,
      sql`
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
      `,
      sql`
        CREATE TABLE IF NOT EXISTS student_focus_sessions (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(100) NOT NULL,
          duration_minutes INT NOT NULL,
          start_time TIMESTAMP WITH TIME ZONE,
          end_time TIMESTAMP WITH TIME ZONE,
          status VARCHAR(50) DEFAULT 'COMPLETED',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `,
      sql`
        CREATE TABLE IF NOT EXISTS student_sleep_records (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(100) NOT NULL,
          sleep_time TIMESTAMP WITH TIME ZONE,
          wake_time TIMESTAMP WITH TIME ZONE,
          duration_minutes INT DEFAULT 480,
          quality_score INT DEFAULT 78,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `,
      sql`
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
      `,
    ]);
    studentTablesInitialized = true;
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

    // 1. Fetch User Profile
    let userResult = await sql`
      SELECT id, name, email, sanctuary_name, avatar, selected_category, streak_days, mindfulness_minutes, current_mood, onboarding_completed, created_at
      FROM users WHERE id = ${userId} LIMIT 1
    `;

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userResult[0];
    const userCategory = (user.selected_category || "student").toLowerCase().trim();

    // Verification: If authenticated user is not a student, return 403 mismatch with their target route
    if (userCategory !== "student") {
      let redirectRoute = "/dashboard/student";
      if (userCategory.includes("working") || userCategory.includes("prof") || userCategory.includes("young")) {
        redirectRoute = "/dashboard/working-professional";
      } else if (userCategory === "parent" || userCategory === "parents") {
        redirectRoute = "/dashboard/parents";
      } else if (userCategory === "couple" || userCategory === "couples") {
        redirectRoute = "/dashboard/couple";
      } else if (userCategory === "senior_citizen" || userCategory === "seniorcitizen") {
        redirectRoute = "/dashboard/senior_citizen";
      }

      return NextResponse.json(
        {
          error: "Category mismatch",
          redirect: redirectRoute,
          category: userCategory,
        },
        { status: 403 }
      );
    }
    // Record login streak activity
    const streakInfo = await recordUserLogin(userId);
    const preferredName = user.name || user.sanctuary_name || "Student Sanctuary Member";

    const url = new URL(req.url);
    const localDate = url.searchParams.get("localDate") || getCalendarDayString(new Date());

    // 2. Fetch Checkins
    let rawCheckins: any[] = [];
    try {
      rawCheckins = await sql`
        SELECT id, user_id, mood, energy_level as energy, sleep_quality, stress, note, created_at, checkin_date
        FROM daily_checkins
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
        LIMIT 14
      `;
    } catch (e) {
      console.error("rawCheckins fetch error:", e);
    }

    const history = rawCheckins;

    const todayCheckin = history.find((c: any) => {
      const checkinDateVal = c.checkin_date || c.check_in_date;
      if (checkinDateVal) {
        const dateStr = getCalendarDayString(checkinDateVal);
        return dateStr === localDate;
      }
      return false;
    }) || null;

    // 3. Focus sessions statistics for today
    let completedSessionsCount = 0;
    let totalDurationToday = 0;
    try {
      const focusSessionsToday = await sql`
        SELECT id, duration_minutes, created_at
        FROM student_focus_sessions
        WHERE user_id = ${user.id} AND created_at >= CURRENT_DATE
      `;
      completedSessionsCount = focusSessionsToday.length;
      totalDurationToday = focusSessionsToday.reduce((acc: number, curr: any) => acc + curr.duration_minutes, 0);
    } catch (e) {
      console.error("focusSessionsToday fetch error:", e);
    }

    const focusSession = {
      completed: completedSessionsCount,
      total: 3, // Target
      duration: totalDurationToday,
    };

    // 4. Fetch study tasks (Planner)
    let tasks: any[] = [];
    try {
      tasks = await sql`
        SELECT id, subject, task_title as title, priority, due_date as date, estimated_duration as duration, completed
        FROM student_tasks
        WHERE user_id = ${user.id}
        ORDER BY completed ASC, due_date ASC
      `;
      tasks = tasks.map((t: any) => ({
        ...t,
        due_date: t.date,
        duration_minutes: t.duration
      }));
    } catch (e) {
      console.error("tasks fetch error:", e);
    }

    // 5. Fetch exams
    let exams: any[] = [];
    try {
      exams = await sql`
        SELECT id, exam_name as name, subject, exam_date as date, exam_time as time, priority, prep_progress as progress
        FROM student_exams
        WHERE user_id = ${user.id}
        ORDER BY exam_date ASC
      `;

      // Adjust days_left dynamically
      exams = exams.map((ex: any) => {
        const diff = Math.ceil((new Date(ex.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        return {
          ...ex,
          exam_name: ex.name,
          exam_date: ex.date,
          exam_time: ex.time,
          progress_percentage: ex.progress,
          daysLeft: Math.max(0, diff),
        };
      });
    } catch (e) {
      console.error("exams fetch error:", e);
    }

    // 6. Fetch upcoming appointments
    let appointments: any[] = [];
    try {
      appointments = await sql`
        SELECT id, doctor_name as name, doctor_title as title, doctor_avatar as avatar, appointment_date as date, appointment_time as time, status, video_call_url
        FROM student_appointments
        WHERE user_id = ${user.id} AND status = 'ACTIVE'
        ORDER BY appointment_date ASC
        LIMIT 1
      `;
    } catch (e) {
      console.error("appointments fetch error:", e);
    }

    // 7. Fetch sleep records
    let sleepRecord = null;
    try {
      const sleepResult = await sql`
        SELECT id, sleep_time, wake_time, duration_minutes as duration, quality_score as score
        FROM student_sleep_records
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
        LIMIT 1
      `;
      sleepRecord = sleepResult.length > 0 ? sleepResult[0] : null;
    } catch (e) {
      console.error("sleepResult fetch error:", e);
    }

    // 8. Dynamic Wellness Score calculation
    let wellnessScoreObj = null;

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

      const currentScore = Math.round((moodVal + stressVal + sleepVal + focusVal) / 4);
      const scoreLevel = currentScore >= 85 ? "Thriving" : currentScore >= 70 ? "Good" : currentScore >= 50 ? "Stable" : "Needs Care";
      wellnessScoreObj = {
        score: currentScore,
        level: scoreLevel,
        breakdown: {
          mood: moodVal,
          stress: stressVal,
          sleep: sleepVal,
          focus: focusVal,
        },
      };
    }

    // 9. Generate AI recommendation and motivation Quote dynamically
    let recommendation = "Your stress has been slightly elevated recently. Try a short breathing session before your next study block.";
    let motivation = "Your sanctuary is here to support you at every step.";

    if (todayCheckin) {
      const moodLower = todayCheckin.mood.toLowerCase();
      if (moodLower === "stressed" || moodLower === "overwhelmed") {
        recommendation = "Your stress has been elevated recently. Try a short breathing session in the Quick Tools tray before your next study block.";
        motivation = "Take a breath. You don't need to solve everything at once.";
      } else if (moodLower === "drained") {
        recommendation = "Your energy levels are lower today. Consider scaling back study tasks and taking recovery breaks.";
        motivation = "Rest is not laziness; it is a vital part of your academic growth.";
      } else if (sleepRecord && sleepRecord.score < 70) {
        recommendation = "Your recent sleep duration has been lower. Consider winding down a little earlier tonight using Sleep Support.";
        motivation = "A good night's sleep is the best preparation for tomorrow's challenges.";
      } else {
        recommendation = "You have been studying consistently. A short 5-minute recovery walk or deep breath could keep you balanced.";
        motivation = "Stay curious, stay calm. Every effort brings you closer to your dreams.";
      }
    } else if (user.initial_answers_json && Array.isArray(user.initial_answers_json) && user.initial_answers_json.length > 0) {
      // Base on onboarding answers if available
      const supportAnswer = String(user.initial_answers_json[9]?.answer || "");
      if (supportAnswer.includes("Stress")) {
        motivation = "You are stronger than any academic challenge. Take it one task at a time.";
      } else if (supportAnswer.includes("Focus")) {
        motivation = "Focus is a muscle. Train it gently and celebrate the focused moments.";
      }
    }

    // 3b. Weekly study focus analytics (last 7 days)
    const weeklyFocus = [0, 0, 0, 0, 0, 0, 0];
    try {
      const focusWeek = await sql`
        SELECT duration_minutes, created_at
        FROM student_focus_sessions
        WHERE user_id = ${user.id} AND created_at >= CURRENT_DATE - INTERVAL '7 days'
      `;
      focusWeek.forEach((session: any) => {
        const day = new Date(session.created_at).getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
        const idx = day === 0 ? 6 : day - 1; // Map to 0-6 (Mon-Sun)
        weeklyFocus[idx] += session.duration_minutes;
      });
    } catch (e) {
      console.error("weeklyFocus fetch error:", e);
    }

    // 2b. Weekly mood stats (last 7 days checkins)
    const weeklyMoods = [4, 4, 4, 4, 4, 4, 4]; // Default to 4 (Okay)
    try {
      const checkinWeek = await sql`
        SELECT mood, created_at
        FROM daily_checkins
        WHERE user_id = ${user.id} AND created_at >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY created_at ASC
      `;

      const checkinDaysSeen: { [key: number]: boolean } = {};
      checkinWeek.forEach((ch: any) => {
        const day = new Date(ch.created_at).getDay();
        const idx = day === 0 ? 6 : day - 1;
        if (!checkinDaysSeen[idx]) {
          checkinDaysSeen[idx] = true;
          const m = (ch.mood || "").toLowerCase().trim();
          if (m === "good" || m === "joyful" || m === "happy" || m === "amazing") weeklyMoods[idx] = 5;
          else if (m === "okay" || m === "calm") weeklyMoods[idx] = 4;
          else if (m === "stressed" || m === "anxious" || m === "low") weeklyMoods[idx] = 3;
          else if (m === "overwhelmed" || m === "drained") weeklyMoods[idx] = 2;
        }
      });
    } catch (e) {
      console.error("weeklyMoods fetch error:", e);
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
        wellnessLevel: wellnessScoreObj ? wellnessScoreObj.level : "Good",
        wellnessScore: wellnessScoreObj ? wellnessScoreObj.score : 78,
        onboardingCompleted: user.onboarding_completed,
      },
      weeklyFocus,
      weeklyMoods,
      todayMood: todayCheckin?.mood || null,
      todayCheckin: todayCheckin ? {
        id: todayCheckin.id,
        mood: todayCheckin.mood,
        stress: todayCheckin.stress,
        energy: todayCheckin.energy,
        note: todayCheckin.note,
        created_at: todayCheckin.created_at,
      } : null,
      history: history.slice(0, 7),
      wellnessScore: wellnessScoreObj,
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
      motivation,
    });
  } catch (err: any) {
    console.error("GET /api/dashboard/student error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load student dashboard" },
      { status: 500 }
    );
  }
}
