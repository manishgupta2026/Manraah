import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";
import { validateCommunityPost } from "@/frontend/lib/moderation";

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
        status,
        created_at as "createdAt"
      FROM community_posts
      WHERE COALESCE(status, 'approved') = 'approved'
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
  const authorName = session.user?.name || session.user?.sanctuaryName || "Manraah Member";
  const avatar = session.user?.avatar || "/images/user_avatar.jpg";

  try {
    const body = await req.json();
    const { title, content, category } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Missing title or content" }, { status: 400 });
    }

    // Check for inappropriate content / messages
    const moderation = validateCommunityPost(title, content);
    if (moderation.isInappropriate) {
      return NextResponse.json(
        {
          error: "inappropriate_content",
          message:
            moderation.reason ||
            "You cannot post this. Your message contains inappropriate content that violates our community safety standards.",
        },
        { status: 422 }
      );
    }

    const id = `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Posts now publish immediately with 'approved' status (no admin review required)
    const result = await sql`
      INSERT INTO community_posts (id, user_id, author_name, avatar, category, title, content, likes, comments_count, status)
      VALUES (${id}, ${userId}, ${authorName}, ${avatar}, ${category || "General Discussion"}, ${title}, ${content}, 1, 0, 'approved')
      RETURNING id, user_id as "userId", author_name as "author", avatar, category, title, content, likes, comments_count as "commentsCount", status, created_at as "createdAt"
    `;

    return NextResponse.json({
      success: true,
      message: "Post published to community circle successfully.",
      post: result[0],
    });
  } catch (err: any) {
    console.error("Failed to create community post:", err);
    return NextResponse.json({ error: err.message || "Failed to create post" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let postId = searchParams.get("id");

    if (!postId) {
      const body = await req.json().catch(() => ({}));
      postId = body?.id || body?.postId;
    }

    if (!postId) {
      return NextResponse.json({ error: "Missing post id" }, { status: 400 });
    }

    await sql`
      DELETE FROM community_posts
      WHERE id = ${postId}
    `;

    return NextResponse.json({
      success: true,
      deletedId: postId,
      message: "Post deleted successfully.",
    });
  } catch (err: any) {
    console.error("Failed to delete community post:", err);
    return NextResponse.json({ error: err.message || "Failed to delete post" }, { status: 500 });
  }
}
