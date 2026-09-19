import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";
import { verifyAdminSession } from "@/backend/auth/admin-guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = verifyAdminSession(request);
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  try {
    const posts = await sql`
      SELECT 
        id, 
        author_name AS "authorName", 
        title, 
        content, 
        category, 
        likes, 
        comments_count AS "commentsCount", 
        created_at AS "createdAt"
      FROM community_posts
      ORDER BY created_at DESC
    `;

    const reports = [
      {
        id: "rep-201",
        postId: posts[0]?.id || "p1",
        postTitle: posts[0]?.title || "Struggling with late night panic attacks",
        reportedUser: posts[0]?.authorName || "Anonymous Member #309",
        reason: "Expressed severe distress and panic during late hours.",
        severity: "HIGH",
        isSafetyRelated: true,
        timestamp: "40 mins ago",
        status: "OPEN",
      },
      {
        id: "rep-202",
        postId: posts[1]?.id || "p2",
        postTitle: posts[1]?.title || "Anyone else feeling burnt out?",
        reportedUser: posts[1]?.authorName || "Anonymous Member #512",
        reason: "Offensive language in thread replies.",
        severity: "LOW",
        isSafetyRelated: false,
        timestamp: "2 hours ago",
        status: "OPEN",
      },
    ];

    return NextResponse.json({
      success: true,
      posts,
      reports,
    });
  } catch (err: any) {
    console.error("[GET /api/admin/community Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch community reports" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = verifyAdminSession(request);
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    await sql`DELETE FROM community_posts WHERE id = ${postId}`;

    return NextResponse.json({ success: true, message: "Post removed from community" });
  } catch (err: any) {
    console.error("[DELETE /api/admin/community Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to moderate post" }, { status: 500 });
  }
}
