const { neon } = require('@neondatabase/serverless');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ Error: DATABASE_URL environment variable is not defined.");
  process.exit(1);
}
const sql = neon(connectionString);

async function initDB() {
  console.log("Connecting to Neon PostgreSQL...");

  try {
    // 1. Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          avatar TEXT DEFAULT '/images/user_avatar.jpg',
          selected_category VARCHAR(100) DEFAULT 'student',
          streak_days INT DEFAULT 1,
          mindfulness_minutes INT DEFAULT 0,
          current_mood VARCHAR(100) DEFAULT 'Sanctuary Member',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("✓ Table 'users' ready");

    await sql`
      CREATE TABLE IF NOT EXISTS user_assessments (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
          category VARCHAR(100) NOT NULL,
          stress_frequency INT NOT NULL,
          sleep_quality INT NOT NULL,
          support_level INT NOT NULL,
          computed_score INT NOT NULL,
          answers_json JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("✓ Table 'user_assessments' ready");

    await sql`
      CREATE TABLE IF NOT EXISTS mood_entries (
          id VARCHAR(100) PRIMARY KEY,
          user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
          mood VARCHAR(50) NOT NULL,
          score INT NOT NULL,
          note TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("✓ Table 'mood_entries' ready");

    await sql`
      CREATE TABLE IF NOT EXISTS journal_entries (
          id VARCHAR(100) PRIMARY KEY,
          user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          excerpt TEXT,
          content TEXT NOT NULL,
          mood_tag VARCHAR(50) DEFAULT 'Reflective',
          category VARCHAR(50) DEFAULT 'Personal',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("✓ Table 'journal_entries' ready");

    await sql`
      CREATE TABLE IF NOT EXISTS therapists (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          title VARCHAR(255) NOT NULL,
          avatar TEXT NOT NULL,
          specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
          rating NUMERIC(3,2) DEFAULT 4.9,
          review_count INT DEFAULT 0,
          hourly_rate VARCHAR(50) NOT NULL,
          bio TEXT NOT NULL,
          available_times TEXT[] DEFAULT ARRAY[]::TEXT[]
      );
    `;
    console.log("✓ Table 'therapists' ready");

    await sql`
      CREATE TABLE IF NOT EXISTS community_posts (
          id VARCHAR(100) PRIMARY KEY,
          user_id VARCHAR(100),
          author_name VARCHAR(255) NOT NULL,
          avatar TEXT DEFAULT '/images/user_avatar.jpg',
          category VARCHAR(100) NOT NULL,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          likes INT DEFAULT 0,
          comments_count INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("✓ Table 'community_posts' ready");

    await sql`
      CREATE TABLE IF NOT EXISTS resources (
          id VARCHAR(100) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          read_time VARCHAR(50) NOT NULL,
          category VARCHAR(100) NOT NULL,
          thumbnail TEXT NOT NULL,
          summary TEXT NOT NULL,
          author VARCHAR(255) NOT NULL
      );
    `;
    console.log("✓ Table 'resources' ready");

    // 2. Insert initial seed therapists if empty
    const existingTherapists = await sql`SELECT COUNT(*) FROM therapists`;
    if (parseInt(existingTherapists[0].count) === 0) {
      await sql`
        INSERT INTO therapists (id, name, title, avatar, specialties, rating, review_count, hourly_rate, bio, available_times)
        VALUES 
        ('t1', 'Dr. Sarah Jenkins', 'Clinical Psychologist, Ph.D.', '/images/therapist_sarah.jpg', ARRAY['CBT', 'Anxiety & Exam Stress', 'Mindfulness'], 4.95, 128, '₹1,500 / session', 'Specializing in cognitive behavioral therapy and academic stress management for over 10 years.', ARRAY['Tomorrow 10:00 AM', 'Tomorrow 2:00 PM', 'Friday 11:00 AM']),
        ('t2', 'Dr. Arjun Mehta', 'Senior Counselor & Family Therapist', '/images/therapist_arjun.jpg', ARRAY['Workplace Burnout', 'Relationship Dynamics', 'Parenting'], 4.88, 94, '₹1,800 / session', 'Helping working professionals and parents regain work-life balance and emotional alignment.', ARRAY['Today 4:00 PM', 'Thursday 1:00 PM', 'Saturday 10:00 AM'])
      `;
      console.log("✓ Seed data inserted into 'therapists'");
    }

    console.log("\n🎉 Neon PostgreSQL Database Initialization Complete!");
  } catch (err) {
    console.error("❌ Database Initialization Error:", err);
  }
}

initDB();
