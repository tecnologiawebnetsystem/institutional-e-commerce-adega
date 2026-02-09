import { getSession, getUserStore } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const store = await getUserStore(session.userId);
  if (!store) return NextResponse.json({ error: "Loja nao encontrada" }, { status: 404 });

  const sql = getDb();

  const sales = await sql`
    SELECT
      o.id as order_id,
      o.order_number,
      o.total,
      o.status,
      o.notes,
      o.payment_method,
      o.created_at,
      (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as items_count
    FROM orders o
    WHERE o.store_id = ${store.id}
      AND o.channel = 'pos'
      AND o.created_at::date = CURRENT_DATE
    ORDER BY o.created_at DESC
  `;

  const formattedSales = sales.map((s: Record<string, string | number>) => {
    const notes = (s.notes as string) || "";
    // Use payment_method column first, fallback to extracting from notes
    let payMethod = s.payment_method as string;
    if (!payMethod || payMethod === "") {
      const payMatch = notes.match(/Pagamento: (\w+)/);
      payMethod = payMatch ? payMatch[1] : "-";
    }
    const custMatch = notes.match(/Cliente: ([^|]+)/);
    return {
      order_id: s.order_id,
      order_number: s.order_number,
      total: s.total,
      status: s.status,
      payment_method: payMethod,
      customer_name: custMatch ? custMatch[1].trim() : "",
      created_at: s.created_at,
      items_count: Number(s.items_count),
    };
  });

  // Total only includes non-cancelled sales
  const totalDay = formattedSales
    .filter((s: { status: string }) => s.status !== "cancelled")
    .reduce((sum: number, s: { total: number }) => sum + Number(s.total), 0);

  return NextResponse.json({ sales: formattedSales, total: totalDay });
}
