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

  const [todayStats] = await sql`
    SELECT
      COALESCE(SUM(delivery_fee), 0) as today_earnings,
      COUNT(*) as today_deliveries
    FROM deliveries
    WHERE motoboy_id = ${uid}
      AND status = 'delivered'
      AND delivered_at >= CURRENT_DATE
  `;

  const [weekStats] = await sql`
    SELECT COALESCE(SUM(delivery_fee), 0) as week_earnings
    FROM deliveries
    WHERE motoboy_id = ${uid}
      AND status = 'delivered'
      AND delivered_at >= DATE_TRUNC('week', CURRENT_DATE)
  `;

  const [ratingStats] = await sql`
    SELECT
      COALESCE(AVG(rating), 0) as avg_rating,
      COUNT(*) as total_ratings
    FROM motoboy_ratings
    WHERE motoboy_id = ${uid}
  `;

  const [totalStats] = await sql`
    SELECT COUNT(*) as total_deliveries
    FROM deliveries
    WHERE motoboy_id = ${uid} AND status = 'delivered'
  `;

  return NextResponse.json({
    todayEarnings: Number(todayStats.today_earnings),
    todayDeliveries: Number(todayStats.today_deliveries),
    weekEarnings: Number(weekStats.week_earnings),
    avgRating: Number(ratingStats.avg_rating),
    totalRatings: Number(ratingStats.total_ratings),
    totalDeliveries: Number(totalStats.total_deliveries),
  });
}
