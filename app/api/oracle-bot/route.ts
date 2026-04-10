import { NextRequest, NextResponse } from "next/server";
import { generateOraclePost, generateBatch } from "@/lib/oracle-bot";
import type { PostCategory } from "@/lib/oracle-bot";

const VALID_CATEGORIES: PostCategory[] = [
  "prophecy",
  "fun-fact",
  "rival-alert",
  "market-update",
  "countdown",
  "biology",
  "historical",
];

/**
 * GET /api/oracle-bot
 *
 * Query params:
 *   category - optional, one of: prophecy, fun-fact, rival-alert, market-update, countdown, biology, historical
 *   count    - optional, number of posts to generate (max 20, default 1)
 *
 * Returns JSON:
 *   Single: { category, text, hashtags, url }
 *   Batch:  { posts: [{ category, text, hashtags, url }, ...] }
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const categoryParam = searchParams.get("category");
  const countParam = searchParams.get("count");

  // Validate category
  let category: PostCategory | undefined;
  if (categoryParam) {
    if (!VALID_CATEGORIES.includes(categoryParam as PostCategory)) {
      return NextResponse.json(
        {
          error: `Invalid category. Valid options: ${VALID_CATEGORIES.join(", ")}`,
        },
        { status: 400 }
      );
    }
    category = categoryParam as PostCategory;
  }

  // Batch mode
  const count = countParam ? Math.min(Math.max(1, parseInt(countParam, 10) || 1), 20) : 1;

  if (count > 1) {
    const posts = generateBatch(count);
    return NextResponse.json({ posts });
  }

  // Single post
  const post = generateOraclePost(category);
  return NextResponse.json(post);
}
