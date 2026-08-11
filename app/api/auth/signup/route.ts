import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";
import { saveUserAssessment } from "@/backend/queries/assessment";
import { generateUniqueSanctuaryName } from "@/backend/auth/sanctuary";
import crypto from "crypto";

// Allowed sanctuary categories
const ALLOWED_CATEGORIES = new Set([
  "student",
  "young_pro",
  "working_professional",
  "parent",
  "couple",
  "family",
  "women",
  "men",
  "senior_citizen",
]);

// Map common frontend variants to canonical DB category IDs
function normalizeCategory(cat: string | undefined): string | null {
  if (!cat) return null;
  const c = cat.toLowerCase().trim();
  if (ALLOWED_CATEGORIES.has(c)) return c;
  if (c === "youngprofessional" || c === "young-pro") return "young_pro";
  if (c === "workingprofessional" || c === "working-professional") return "working_professional";
  if (c === "seniorcitizen" || c === "senior-citizen") return "senior_citizen";
  if (c === "parents") return "parent";
  if (c === "couples") return "couple";
  return null;
}

// Secure password hashing using Node scrypt
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, sanctuaryName, category, initialAnswers, answers, computedScore, percentage, wellnessLevel } = body;

    // 1. Input validation
    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // 2. Validate category against allowed Manraah categories
    const validatedCategory = normalizeCategory(category);
    if (!validatedCategory) {
      return NextResponse.json(
        { error: "Invalid sanctuary journey category. Please select a valid category." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 3. Check if user already exists
    const existing = await sql`
      SELECT id FROM users WHERE LOWER(email) = ${cleanEmail} LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // 4. Validate custom Sanctuary Name or auto-generate one
    let finalSanctuaryName = sanctuaryName && typeof sanctuaryName === "string" ? sanctuaryName.trim() : "";
    if (finalSanctuaryName) {
      if (finalSanctuaryName.length < 2 || finalSanctuaryName.length > 30) {
        return NextResponse.json(
          { error: "Sanctuary Name must be between 2 and 30 characters." },
          { status: 400 }
        );
      }
      
      const existingName = await sql`
        SELECT id FROM users WHERE LOWER(sanctuary_name) = LOWER(${finalSanctuaryName}) LIMIT 1
      `;
      if (existingName.length > 0) {
        return NextResponse.json(
          { error: "This Sanctuary Name is already taken. Please choose another one or leave it blank to auto-generate." },
          { status: 400 }
        );
      }
    } else {
      finalSanctuaryName = await generateUniqueSanctuaryName();
    }

    // 5. Create user ID & hash password
    const userId = "usr_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    const passwordHash = hashPassword(password);
    const initialJson = initialAnswers ? JSON.stringify(initialAnswers) : "{}";

    // 6. Insert user into Neon PostgreSQL with permanent category
    await sql`
      INSERT INTO users (id, name, email, password_hash, sanctuary_name, selected_category, streak_days, mindfulness_minutes, current_mood, initial_answers_json)
      VALUES (${userId}, ${finalSanctuaryName}, ${cleanEmail}, ${passwordHash}, ${finalSanctuaryName}, ${validatedCategory}, 1, 0, 'Sanctuary Member', ${initialJson}::jsonb)
    `;

    // 7. Save assessment if provided
    if (answers && Array.isArray(answers) && answers.length > 0) {
      await saveUserAssessment(
        userId,
        validatedCategory,
        answers,
        typeof computedScore === "number" ? computedScore : 50,
        typeof percentage === "number" ? percentage : 50,
        wellnessLevel || "Balanced"
      );
    }

    const userProfile = {
      id: userId,
      name: finalSanctuaryName,
      sanctuaryName: finalSanctuaryName,
      email: cleanEmail,
      avatar: "/images/user_avatar.jpg",
      streakDays: 1,
      mindfulnessMinutes: 0,
      currentMood: "Sanctuary Member",
      selectedCategory: validatedCategory,
    };

    const sessionData = {
      user: userProfile,
      token: "m_token_" + userId,
      isAuthenticated: true,
    };

    // 8. Create HTTP session cookies
    const response = NextResponse.json(sessionData);
    response.cookies.set("manraah_session", JSON.stringify(sessionData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    response.cookies.set("userType", userProfile.selectedCategory, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("[Auth Signup API Error]:", err);
    return NextResponse.json(
      { error: "We couldn't create your account. Please try again." },
      { status: 500 }
    );
  }
}
