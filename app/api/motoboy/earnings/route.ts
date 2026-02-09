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

  const [today] = await sql`
    SELECT COALESCE(SUM(delivery_fee), 0) as total, COUNT(*) as count
    FROM deliveries WHERE motoboy_id = ${uid} AND status = 'delivered' AND delivered_at >= CURRENT_DATE
  `;
  const [week] = await sql`
    SELECT COALESCE(SUM(delivery_fee), 0) as total, COUNT(*) as count
    FROM deliveries WHERE motoboy_id = ${uid} AND status = 'delivered' AND delivered_at >= DATE_TRUNC('week', CURRENT_DATE)
  `;
  const [month] = await sql`
    SELECT COALESCE(SUM(delivery_fee), 0) as total, COUNT(*) as count
    FROM deliveries WHERE motoboy_id = ${uid} AND status = 'delivered' AND delivered_at >= DATE_TRUNC('month', CURRENT_DATE)
  `;
  const [allTime] = await sql`
    SELECT COALESCE(SUM(delivery_fee), 0) as total, COUNT(*) as count
    FROM deliveries WHERE motoboy_id = ${uid} AND status = 'delivered'
  `;

  const dailyBreakdown = await sql`
    SELECT
      DATE(delivered_at) as date,
      COALESCE(SUM(delivery_fee), 0) as total,
      COUNT(*) as count
    FROM deliveries
    WHERE motoboy_id = ${uid} AND status = 'delivered' AND delivered_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(delivered_at)
    ORDER BY date DESC
  `;

  return NextResponse.json({
    today: { total: Number(today.total), count: Number(today.count) },
    week: { total: Number(week.total), count: Number(week.count) },
    month: { total: Number(month.total), count: Number(month.count) },
    allTime: { total: Number(allTime.total), count: Number(allTime.count) },
    dailyBreakdown: dailyBreakdown.map(d => ({ date: d.date, total: Number(d.total), count: Number(d.count) })),
  });
}
