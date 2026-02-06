import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const sql = getDb();

    const posts = await sql`
      SELECT *, 
             COALESCE(cover_image, image_url) as cover_image,
             COALESCE(author_name, author) as author_name,
             COALESCE(views, 0) as views
      FROM blog_posts WHERE slug = ${slug} AND is_published = true
    `;

    if (posts.length === 0) {
      return NextResponse.json({ error: "Post nao encontrado" }, { status: 404 });
    }

    // Increment views safely
    try {
      await sql`UPDATE blog_posts SET views = COALESCE(views, 0) + 1 WHERE id = ${posts[0].id}`;
    } catch {
      // views column might not exist, ignore
    }

    return NextResponse.json({ post: posts[0] });
  } catch (error) {
    console.error("[v0] Blog detail API error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
