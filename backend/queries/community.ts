import { CommunityPost } from "@/backend/types";

/**
 * Community Posts & Discussions Queries (Stub)
 * 
 * TODO: Implement real database query functions once DB provider is selected.
 */

export async function fetchCommunityPosts(): Promise<CommunityPost[]> {
  // TODO: Replace with real database call
  return [];
}

export async function createCommunityPost(post: Omit<CommunityPost, "id" | "likes" | "commentsCount">): Promise<CommunityPost> {
  // TODO: Replace with real database call
  return {
    id: Date.now().toString(),
    likes: 0,
    commentsCount: 0,
    ...post,
  };
}
