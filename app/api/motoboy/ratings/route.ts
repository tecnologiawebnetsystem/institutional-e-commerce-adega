import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "motoboy") {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const sql = getDb();
  const uid = session.userId;

  const [stats] = await sql`
    SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as total_ratings
    FROM motoboy_ratings WHERE motoboy_id = ${uid}
  `;

  const dist = await sql`
    SELECT rating, COUNT(*) as count
    FROM motoboy_ratings WHERE motoboy_id = ${uid}
    GROUP BY rating ORDER BY rating DESC
  `;

  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  dist.forEach((d: { rating: number; count: string }) => { distribution[d.rating] = Number(d.count); });

  const reviews = await sql`
    SELECT r.*, u.name as rated_by_name
    FROM motoboy_ratings r
    JOIN users u ON r.rated_by = u.id
    WHERE r.motoboy_id = ${uid}
    ORDER BY r.created_at DESC
    LIMIT 50
  `;

  return NextResponse.json({
    avgRating: Number(stats.avg_rating),
    totalRatings: Number(stats.total_ratings),
    distribution,
    reviews,
  });
}
