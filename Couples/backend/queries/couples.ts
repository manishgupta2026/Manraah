import { sql } from "@/backend/db/client";

// Couples Relationship Dashboard DB Schema and queries
export async function initCouplesDatabase() {
  try {
    // 1. Create couple_profiles table
    await sql`
      CREATE TABLE IF NOT EXISTS couple_profiles (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        partner_name VARCHAR(255) DEFAULT 'Elena',
        harmony_score INTEGER DEFAULT 90,
        stress_level INTEGER DEFAULT 3,
        energy_level INTEGER DEFAULT 7,
        communication_score INTEGER DEFAULT 8,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 2. Create couple_appointments table
    await sql`
      CREATE TABLE IF NOT EXISTS couple_appointments (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        doctor_name VARCHAR(255) NOT NULL,
        hospital_name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        date VARCHAR(100) NOT NULL,
        time VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 3. Create couple_tasks table
    await sql`
      CREATE TABLE IF NOT EXISTS couple_tasks (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
  } catch (err) {
    console.error("[Couples DB Init Error]:", err);
  }
}

export async function getCouplesDashboardData(userId: string) {
  await initCouplesDatabase();

  // 1. Get or create couple profile
  let profiles = await sql`
    SELECT * FROM couple_profiles WHERE user_id = ${userId} LIMIT 1
  `;
  if (profiles.length === 0) {
    await sql`
      INSERT INTO couple_profiles (user_id, partner_name, harmony_score, stress_level, energy_level, communication_score)
      VALUES (${userId}, 'Elena', 90, 3, 7, 8)
    `;
    profiles = await sql`
      SELECT * FROM couple_profiles WHERE user_id = ${userId} LIMIT 1
    `;
  }
  const profile = profiles[0];

  // 2. Get or seed default tasks
  let tasks = await sql`
    SELECT * FROM couple_tasks WHERE user_id = ${userId} ORDER BY id ASC
  `;
  if (tasks.length === 0) {
    const defaultTasks = [
      "💬 Share one genuine appreciation with your partner today",
      "🧘 Complete a 3-minute synchronized breathing pause together",
      "🔇 Set devices to 'Do Not Disturb' for at least 1 hour of quality time",
      "💌 Leave a sweet or supportive note in their physical/digital journal"
    ];
    for (const t of defaultTasks) {
      await sql`
        INSERT INTO couple_tasks (user_id, text, completed) VALUES (${userId}, ${t}, false)
      `;
    }
    tasks = await sql`
      SELECT * FROM couple_tasks WHERE user_id = ${userId} ORDER BY id ASC
    `;
  }

  // 3. Get or seed default appointments (mocking the image layout)
  let appointments = await sql`
    SELECT * FROM couple_appointments WHERE user_id = ${userId} ORDER BY id ASC
  `;
  if (appointments.length === 0) {
    const defaultAppts = [
      {
        title: "Physiotherapy",
        category: "Physiotherapy",
        doctor_name: "Dr. Emilia Winson",
        hospital_name: "Manggis ST Hospital",
        location: "New York, USA",
        date: "14 Mar 2022",
        time: "09.00 pm"
      },
      {
        title: "Manage stress",
        category: "Stress Management",
        doctor_name: "Self-guide",
        hospital_name: "Home Sanctuary",
        location: "Cozy Room",
        date: "Daily",
        time: "10:00pm - 12:00 pm"
      },
      {
        title: "Physiotherapy Session",
        category: "Physiotherapy",
        doctor_name: "Dr. Emilia Winson",
        hospital_name: "Home Sanctuary",
        location: "Cozy Room",
        date: "Daily",
        time: "09:00am - 10:00 am"
      }
    ];
    for (const app of defaultAppts) {
      await sql`
        INSERT INTO couple_appointments (user_id, title, category, doctor_name, hospital_name, location, date, time)
        VALUES (${userId}, ${app.title}, ${app.category}, ${app.doctor_name}, ${app.hospital_name}, ${app.location}, ${app.date}, ${app.time})
      `;
    }
    appointments = await sql`
      SELECT * FROM couple_appointments WHERE user_id = ${userId} ORDER BY id ASC
    `;
  }

  // 4. Get userProfile from user_profiles table for assessment validation checks
  const userProfiles = await sql`
    SELECT * FROM user_profiles WHERE user_id = ${userId} LIMIT 1
  `;
  const userProfile = userProfiles.length > 0 ? userProfiles[0] : null;

  // 5. Get streak from user_streaks table
  const streakResults = await sql`
    SELECT current_streak, last_checkin_date FROM user_streaks WHERE user_id = ${userId} LIMIT 1
  `;
  const streak = streakResults.length > 0 ? {
    currentStreak: streakResults[0].current_streak,
    lastCheckinDate: streakResults[0].last_checkin_date ? new Date(streakResults[0].last_checkin_date).toISOString() : null
  } : {
    currentStreak: 0,
    lastCheckinDate: null
  };

  // 6. Return complete dataset with activity trends (monthly bars matching the image: Jul, Aug, Sep, Oct, Nov, Oct)
  const monthlyActivity = [
    { month: "Jul", value: 65 },
    { month: "Aug", value: 50 },
    { month: "Sep", value: 85 },
    { month: "Oct", value: 60 },
    { month: "Nov", value: 78 },
    { month: "Dec", value: 90 }
  ];

  return {
    profile,
    tasks: tasks.map(t => ({ id: t.id, text: t.text, completed: t.completed })),
    appointments: appointments.map(a => ({
      id: a.id,
      title: a.title,
      category: a.category,
      doctor_name: a.doctor_name,
      hospital_name: a.hospital_name,
      location: a.location,
      date: a.date,
      time: a.time
    })),
    monthlyActivity,
    userProfile,
    streak
  };
}

export async function updatePartnerName(userId: string, partnerName: string) {
  await initCouplesDatabase();
  await sql`
    UPDATE couple_profiles
    SET partner_name = ${partnerName}, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ${userId}
  `;
  return { success: true };
}

export async function updateHarmonyMetrics(
  userId: string,
  stressLevel: number,
  energyLevel: number,
  communicationScore: number
) {
  await initCouplesDatabase();
  // Formula: stress points are inverse (10 - stressLevel)
  const computedHarmony = Math.round((((10 - stressLevel) + energyLevel + communicationScore) / 30) * 100);

  await sql`
    UPDATE couple_profiles
    SET stress_level = ${stressLevel},
        energy_level = ${energyLevel},
        communication_score = ${communicationScore},
        harmony_score = ${computedHarmony},
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ${userId}
  `;

  return { success: true, harmonyScore: computedHarmony };
}

export async function toggleCoupleTask(userId: string, taskId: number, completed: boolean) {
  await initCouplesDatabase();
  await sql`
    UPDATE couple_tasks
    SET completed = ${completed}
    WHERE id = ${taskId} AND user_id = ${userId}
  `;
  return { success: true };
}

export async function addCoupleAppointment(
  userId: string,
  title: string,
  category: string,
  doctor_name: string,
  hospital_name: string,
  location: string,
  date: string,
  time: string
) {
  await initCouplesDatabase();
  await sql`
    INSERT INTO couple_appointments (user_id, title, category, doctor_name, hospital_name, location, date, time)
    VALUES (${userId}, ${title}, ${category}, ${doctor_name}, ${hospital_name}, ${location}, ${date}, ${time})
  `;
  return { success: true };
}
