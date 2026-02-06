import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const sql = getDb();
    const posts = await sql`
      SELECT id, title, slug, excerpt, image_url, tags, published_at, author,
             COALESCE(cover_image, image_url) as cover_image,
             COALESCE(author_name, author) as author_name,
             COALESCE(views, 0) as views
      FROM blog_posts
      WHERE is_published = true
      ORDER BY published_at DESC
    `;
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("[v0] Blog API error:", error);
    return NextResponse.json({ posts: [] });
  }
}
