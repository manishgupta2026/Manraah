import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";
import { calculateWellnessScore, normalizeStress } from "@/backend/lib/wellness-scoring";

export const dynamic = "force-dynamic";

let wpTablesInitialized = false;

async function ensureWpTablesExist() {
  if (wpTablesInitialized) return;

  try {
    await Promise.all([
      sql`
        CREATE TABLE IF NOT EXISTS wp_appointments (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(100) NOT NULL,
          doctor_name VARCHAR(100) NOT NULL,
          doctor_title VARCHAR(100) NOT NULL,
          doctor_avatar VARCHAR(255),
          appointment_date DATE NOT NULL,
          appointment_time VARCHAR(20) NOT NULL,
          status VARCHAR(50) DEFAULT 'SCHEDULED',
          video_call_url VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `,
      sql`
        CREATE TABLE IF NOT EXISTS wp_goals (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(100) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description VARCHAR(255),
          completed_at TIMESTAMP WITH TIME ZONE,
          priority VARCHAR(50) DEFAULT 'Medium',
          due_date VARCHAR(100),
          completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `,
      sql`
        CREATE TABLE IF NOT EXISTS wp_focus_sessions (
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
        CREATE TABLE IF NOT EXISTS wp_sleep_records (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(100) NOT NULL,
          duration_minutes INT DEFAULT 480,
          quality_score INT DEFAULT 78,
          bedtime VARCHAR(50),
          wake_time VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `,
      sql`
        CREATE TABLE IF NOT EXISTS wp_schedule_events (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(100) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100),
          location VARCHAR(255),
          start_time VARCHAR(20) NOT NULL,
          end_time VARCHAR(20) NOT NULL,
          event_date DATE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `,
      sql`
        CREATE TABLE IF NOT EXISTS wp_work_life_records (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(100) NOT NULL,
          work_val INT NOT NULL DEFAULT 70,
          personal_val INT NOT NULL DEFAULT 80,
          recovery_val INT NOT NULL DEFAULT 60,
          balance_score INT NOT NULL DEFAULT 70,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `,
    ]);
    wpTablesInitialized = true;
  } catch (e) {
    console.error("ensureWpTablesExist error:", e);
  }
}

export async function GET(req: Request) {
  const session = getAuthSessionFromRequest();
  let userId = session.user?.id;

  try {
    // 1. Resolve User
    let userResult: any[] = [];
    if (userId) {
      userResult = await sql`
        SELECT 
          id, name, email, sanctuary_name, avatar, selected_category, streak_days, mindfulness_minutes, current_mood,
          age, profession, industry, work_schedule, working_hours, work_situation, wellness_goals, onboarding_completed, created_at
        FROM users WHERE id = ${userId} LIMIT 1
      `;
    }

    if (userResult.length === 0) {
      // Find latest working professional user or demo user
      const latestWp = await sql`
        SELECT 
          id, name, email, sanctuary_name, avatar, selected_category, streak_days, mindfulness_minutes, current_mood,
          age, profession, industry, work_schedule, working_hours, work_situation, wellness_goals, onboarding_completed, created_at
        FROM users 
        WHERE selected_category IN ('working-professional', 'working_professional')
        ORDER BY created_at DESC 
        LIMIT 1
      `;

      if (latestWp.length > 0) {
        userResult = latestWp;
        userId = userResult[0].id;
      } else {
        userId = userId || "demo-wp-user";
        const defaultName = "Ashutosh";
        await sql`
          INSERT INTO users (
            id, name, sanctuary_name, email, selected_category, 
            profession, work_schedule, working_hours, work_situation,
            streak_days, mindfulness_minutes, current_mood, onboarding_completed
          ) VALUES (
            ${userId}, ${defaultName}, ${defaultName}, 'demo@manraah.com', 'working-professional',
            'Software Engineer', 'Hybrid', '40 hrs/wk', 'Comfortable',
            1, 0, 'Good', true
          )
          ON CONFLICT (id) DO UPDATE SET selected_category = 'working-professional'
        `;
        userResult = await sql`
          SELECT * FROM users WHERE id = ${userId} LIMIT 1
        `;
      }
    }

    const user = userResult[0];
    const userCategory = (user.selected_category || "working-professional").toLowerCase().trim();

    if (userCategory !== "working-professional" && userCategory !== "working_professional") {
      let redirectRoute = "/dashboard/working-professional";
      if (userCategory === "student") {
        redirectRoute = "/dashboard/student";
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

    const preferredName = user.name || user.sanctuary_name || "Sanctuary Member";

    // Fast non-blocking table check if not yet initialized
    if (!wpTablesInitialized) {
      await ensureWpTablesExist();
    }

    // 2. Fetch all data concurrently in ONE Promise.all
    const [
      rawCheckins,
      focusWeek,
      sleepRecords,
      scheduleEventsResult,
      workLifeRecordsResult,
      recentReflections,
      sessionsResult,
      appointmentsResult,
      goalsResult,
    ] = await Promise.all([
      sql`
        SELECT id, user_id, mood, energy_level as energy, sleep_quality, stress, work_life_balance, note, created_at
        FROM daily_checkins
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
        LIMIT 14
      `,
      sql`
        SELECT duration_minutes, created_at
        FROM wp_focus_sessions
        WHERE user_id = ${user.id} AND created_at >= CURRENT_DATE - INTERVAL '7 days'
      `,
      sql`
        SELECT duration_minutes, quality_score, bedtime, wake_time, created_at
        FROM wp_sleep_records
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
        LIMIT 7
      `,
      sql`
        SELECT id, title, start_time, end_time, event_date
        FROM wp_schedule_events
        WHERE user_id = ${user.id}
        ORDER BY event_date ASC, start_time ASC
      `,
      sql`
        SELECT id, work_val, personal_val, recovery_val, balance_score, created_at
        FROM wp_work_life_records
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
        LIMIT 7
      `,
      sql`
        SELECT id, title, excerpt, content, mood_tag, category, created_at 
        FROM journal_entries 
        WHERE user_id = ${user.id} 
        ORDER BY created_at DESC 
        LIMIT 10
      `,
      sql`
        SELECT count(*) as count
        FROM activity_sessions
        WHERE user_id = ${user.id} AND completed = true
      `,
      sql`
        SELECT id, doctor_name, doctor_title, doctor_avatar, appointment_date, appointment_time, status, video_call_url
        FROM wp_appointments
        WHERE user_id = ${user.id} AND status = 'SCHEDULED'
        ORDER BY appointment_date ASC, appointment_time ASC
      `,
      sql`
        SELECT id, title, priority, due_date, completed, created_at
        FROM wp_goals
        WHERE user_id = ${user.id}
        ORDER BY created_at ASC
      `,
    ]);

    const history = rawCheckins;

    // Real data arrays directly from DB (empty array if no records logged yet)
    const appointments = appointmentsResult || [];
    const goals = goalsResult || [];
    const scheduleEvents = scheduleEventsResult || [];
    const workLifeRecords = workLifeRecordsResult || [];

    // 3. Today's Check-in
    const latestCheckin = history.length > 0 ? history[0] : null;
    const isToday = latestCheckin
      ? new Date(latestCheckin.created_at).toDateString() === new Date().toDateString()
      : false;
    const todayCheckin = isToday ? latestCheckin : null;

    // 4. Calculate Dynamic Wellness Score
    const completedFocusMinutes = focusWeek.reduce((acc: number, f: any) => acc + (f.duration_minutes || 0), 0);
    const latestSleep = sleepRecords[0] || null;
    const workLife = workLifeRecords[0] || { work_val: 70, personal_val: 80, recovery_val: 60, balance_score: 70 };

    let wellnessScoreObj = null;
    if (history.length > 0) {
      const activeEntry = todayCheckin || history[0];
      const result = calculateWellnessScore({
        mood: activeEntry.mood || "Good",
        stress: activeEntry.stress || "Manageable",
        energy: Number(activeEntry.energy) || 4,
        sleep: Number(activeEntry.sleep_quality) || 4,
        workLifeBalance: Number(activeEntry.work_life_balance) || 3,
      });

      const mindVal = result.breakdown.mind;
      const stressScoreVal = normalizeStress(activeEntry.stress);
      const sleepVal = latestSleep ? latestSleep.quality_score : 75;
      const balanceVal = workLife ? workLife.balance_score : 70;

      const currentScore = Math.round((mindVal + stressScoreVal + sleepVal + balanceVal) / 4);
      const scoreLevel = currentScore >= 85 ? "Thriving" : currentScore >= 70 ? "Good" : currentScore >= 50 ? "Stable" : "Needs Care";
      
      let deltaVsLastWeek = 0;
      if (history.length > 1) {
        const pastEntries = history.slice(1);
        let pastTotal = 0;
        pastEntries.forEach((e: any) => {
          const res = calculateWellnessScore({
            mood: e.mood,
            stress: e.stress,
            energy: Number(e.energy) || 3,
            sleep: Number(e.sleep_quality) || 3,
            workLifeBalance: Number(e.work_life_balance) || 3,
          });
          pastTotal += res.score;
        });
        const pastAvg = Math.round(pastTotal / pastEntries.length);
        deltaVsLastWeek = currentScore - pastAvg;
      }

      wellnessScoreObj = {
        score: currentScore,
        level: scoreLevel,
        breakdown: {
          mind: mindVal,
          stress: stressScoreVal,
          sleep: sleepVal,
          balance: balanceVal,
        },
        delta: deltaVsLastWeek,
      };
    } else {
      wellnessScoreObj = {
        score: 70,
        level: "STABLE",
        breakdown: {
          mind: 70,
          stress: 70,
          sleep: 70,
          balance: 70
        },
        delta: 0
      };
    }

    // 5. Dynamic Consecutive Streak Calculation
    let calculatedStreak = 0;
    if (history.length > 0) {
      const uniqueDates = Array.from(
        new Set(history.map((h: any) => new Date(h.created_at).toDateString()))
      );

      const todayStr = new Date().toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
        calculatedStreak = uniqueDates.length;
      } else {
        calculatedStreak = 0;
      }
    }
    const streakDays = Math.max(1, calculatedStreak || user.streak_days || 1);

    const completedSessionsCount = parseInt(sessionsResult[0]?.count || "0", 10);

    // Burnout risk calculation
    let burnoutRisk = "LOW";
    if (history.length > 0) {
      const recentStress = history.slice(0, 5);
      const stressedCount = recentStress.filter((h: any) => {
        const s = (h.stress || "").toLowerCase();
        return s === "high" || s === "extreme" || s === "overwhelmed" || s === "stressed" || s === "moderate";
      }).length;
      if (stressedCount >= 4) {
        burnoutRisk = "HIGH";
      } else if (stressedCount >= 2) {
        burnoutRisk = "MEDIUM";
      }
    }

    // Recommendation & motivation quote
    let recommendation = "Take a short reset after work to mentally transition into your personal time.";
    let motivation = "Your private space is here to support you at every step.";
    if (todayCheckin) {
      const moodLower = todayCheckin.mood.toLowerCase();
      if (moodLower === "stressed" || moodLower === "overwhelmed") {
        recommendation = "Stress levels are slightly elevated. Consider a 2-minute breathing reset before starting your evening.";
        motivation = "Take a breath. You don't need to solve everything at once.";
      } else if (moodLower === "drained" || moodLower === "tired") {
        recommendation = "Energy levels are lower today. Focus on decompression and recovery tonight.";
        motivation = "Rest is not laziness; it is a vital part of your growth.";
      }
    }

    // 6. Construct and return response
    return NextResponse.json({
      user: {
        id: user.id,
        name: preferredName,
        preferredName,
        email: user.email,
        avatar: user.avatar || "/images/user_avatar.jpg",
        selectedCategory: user.selected_category || "working-professional",
        age: user.age,
        profession: user.profession || "Working Professional",
        industry: user.industry,
        workSchedule: user.work_schedule,
        workingHours: user.working_hours,
        workSituation: user.work_situation,
        wellnessGoals: user.wellness_goals || [],
        streakDays,
        mindfulnessMinutes: user.mindfulness_minutes || completedSessionsCount * 2,
        currentMood: todayCheckin?.mood || user.current_mood || "Good",
        assessmentPercentage: wellnessScoreObj ? wellnessScoreObj.score : 76,
        wellnessLevel: wellnessScoreObj ? wellnessScoreObj.level : "STABLE",
        createdAt: user.created_at
      },
      todayMood: todayCheckin?.mood || null,
      todayCheckin: todayCheckin ? {
        id: todayCheckin.id,
        mood: todayCheckin.mood,
        stress: todayCheckin.stress,
        energy: todayCheckin.energy,
        note: todayCheckin.note,
        work_life_balance: todayCheckin.work_life_balance,
        created_at: todayCheckin.created_at
      } : null,
      history,
      wellnessScore: wellnessScoreObj,
      streak: {
        currentStreak: streakDays,
        longestStreak: Math.max(streakDays, user.streak_days || 1),
      },
      recentReflections: recentReflections || [],
      completedSessionsCount,
      upcomingAppointment: appointments[0] || null,
      appointments: appointments || [],
      goals,
      focus: {
        sessions: focusWeek,
        weeklyMinutes: completedFocusMinutes,
        todaySessionsCount: focusWeek.filter((f: any) => new Date(f.created_at).toDateString() === new Date().toDateString()).length,
      },
      sleep: latestSleep ? {
        duration: latestSleep.duration_minutes,
        score: latestSleep.quality_score,
        bedtime: latestSleep.bedtime,
        wakeTime: latestSleep.wake_time,
      } : null,
      sleepRecords,
      scheduleEvents,
      workLife: {
        work: workLife.work_val,
        personal: workLife.personal_val,
        recovery: workLife.recovery_val,
        balanceScore: workLife.balance_score,
      },
      workLifeRecords,
      burnoutRisk,
      recommendation,
      motivation,
    });
  } catch (err: any) {
    console.error("API GET /api/dashboard/working-professional error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load working professional dashboard" },
      { status: 500 }
    );
  }
}
