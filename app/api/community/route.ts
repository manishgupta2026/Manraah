import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await sql`
      SELECT 
        id,
        user_id as "userId",
        author_name as "author",
        avatar,
        category,
        title,
        content,
        likes,
        comments_count as "commentsCount",
        created_at as "createdAt"
      FROM community_posts
      ORDER BY created_at DESC
      LIMIT 50
    `;
    return NextResponse.json(posts);
  } catch (err: any) {
    console.error("Failed to fetch community posts:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || null;
  const authorName = session.user?.sanctuaryName || session.user?.name || "Sanctuary Member";
  const avatar = session.user?.avatar || "/images/user_avatar.jpg";

  try {
    const body = await req.json();
    const { title, content, category } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Missing title or content" }, { status: 400 });
    }

    const id = `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const result = await sql`
      INSERT INTO community_posts (id, user_id, author_name, avatar, category, title, content, likes, comments_count)
      VALUES (${id}, ${userId}, ${authorName}, ${avatar}, ${category || "General Discussion"}, ${title}, ${content}, 1, 0)
      RETURNING id, user_id as "userId", author_name as "author", avatar, category, title, content, likes, comments_count as "commentsCount"
    `;

    return NextResponse.json(result[0]);
  } catch (err: any) {
    console.error("Failed to create community post:", err);
    return NextResponse.json({ error: err.message || "Failed to create post" }, { status: 500 });
  }
}
