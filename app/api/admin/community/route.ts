import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filterStatus = searchParams.get("status");

    let query;
    if (filterStatus && filterStatus !== "all") {
      query = await sql`
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
          COALESCE(status, 'approved') as "status",
          created_at as "createdAt"
        FROM community_posts
        WHERE COALESCE(status, 'approved') = ${filterStatus}
        ORDER BY created_at DESC
        LIMIT 100
      `;
    } else {
      query = await sql`
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
          COALESCE(status, 'approved') as "status",
          created_at as "createdAt"
        FROM community_posts
        ORDER BY created_at DESC
        LIMIT 100
      `;
    }

    // Compute status counts for admin summary badges
    const allPosts = await sql`
      SELECT 
        COALESCE(status, 'approved') as "status",
        COUNT(*)::int as "count"
      FROM community_posts
      GROUP BY COALESCE(status, 'approved')
    `;

    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    let total = 0;

    for (const row of allPosts) {
      const c = Number(row.count) || 0;
      total += c;
      if (row.status === "pending") pendingCount = c;
      else if (row.status === "approved") approvedCount = c;
      else if (row.status === "rejected") rejectedCount = c;
    }

    return NextResponse.json({
      posts: query,
      stats: {
        total,
        pendingCount,
        approvedCount,
        rejectedCount,
      },
    });
  } catch (err: any) {
    console.error("Failed to fetch admin community posts:", err);
    return NextResponse.json(
      {
        posts: [],
        stats: { total: 0, pendingCount: 0, approvedCount: 0, rejectedCount: 0 },
      },
      { status: 200 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { postId, status } = body;

    if (!postId || !["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid postId or status. Expected 'approved', 'rejected', or 'pending'." },
        { status: 400 }
      );
    }

    const updated = await sql`
      UPDATE community_posts
      SET status = ${status}
      WHERE id = ${postId}
      RETURNING 
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
    `;

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      post: updated[0],
      message:
        status === "approved"
          ? "Post approved and is now live in the community feed."
          : "Post has been rejected from public display.",
    });
  } catch (err: any) {
    console.error("Failed to moderate community post:", err);
    return NextResponse.json(
      { error: err.message || "Failed to moderate post" },
      { status: 500 }
    );
  }
}
