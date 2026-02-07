import { NextRequest, NextResponse } from "next/server";
import { getSession, getUserStore } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "owner") return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
    const store = await getUserStore(session.userId);
    if (!store) return NextResponse.json({ orders: [] });

    const sql = getDb();
    const orders = await sql`
      SELECT o.*, COALESCE(o.channel, 'online') as channel, u.name as customer_name, u.email as customer_email
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      WHERE o.store_id = ${store.id}
      ORDER BY o.created_at DESC
    `;
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "owner") return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
    const store = await getUserStore(session.userId);
    if (!store) return NextResponse.json({ error: "Loja nao encontrada" }, { status: 404 });

    const body = await request.json();
    const { order_id, status } = body;

    const sql = getDb();
    await sql`UPDATE orders SET status = ${status}, updated_at = NOW() WHERE id = ${order_id} AND store_id = ${store.id}`;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar pedido" }, { status: 500 });
  }
}
