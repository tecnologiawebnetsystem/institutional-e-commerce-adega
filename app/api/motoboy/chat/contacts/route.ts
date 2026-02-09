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

  // Get active deliveries for this motoboy
  const deliveries = await sql`
    SELECT d.id as delivery_id, d.store_id, d.status, d.customer_name, d.customer_phone,
           s.name as store_name, o.customer_id
    FROM deliveries d
    JOIN stores s ON d.store_id = s.id
    LEFT JOIN orders o ON d.order_id = o.id
    WHERE d.motoboy_id = ${uid} AND d.status IN ('accepted','picking_up','in_transit','arrived')
    ORDER BY d.updated_at DESC
  `;

  const statusLabels: Record<string, string> = {
    accepted: "Aceito",
    picking_up: "Buscando",
    in_transit: "Em transito",
    arrived: "Chegou",
  };

  const contacts = deliveries.flatMap((d: { delivery_id: string; store_id: string; store_name: string; customer_name: string; customer_phone: string; status: string }) => [
    {
      delivery_id: d.delivery_id,
      store_id: d.store_id,
      store_name: d.store_name,
      customer_name: d.customer_name,
      customer_phone: d.customer_phone,
      status: statusLabels[d.status] || d.status,
      type: "store" as const,
      display_name: d.store_name,
    },
    {
      delivery_id: d.delivery_id,
      store_id: d.store_id,
      store_name: d.store_name,
      customer_name: d.customer_name,
      customer_phone: d.customer_phone,
      status: statusLabels[d.status] || d.status,
      type: "customer" as const,
      display_name: d.customer_name || "Cliente",
    },
  ]);

  return NextResponse.json({ contacts });
}
