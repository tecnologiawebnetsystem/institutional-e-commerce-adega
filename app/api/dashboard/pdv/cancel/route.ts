import { getSession, getUserStore } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const store = await getUserStore(session.userId);
  if (!store) return NextResponse.json({ error: "Loja nao encontrada" }, { status: 404 });

  const { orderNumber, reason } = await request.json();
  if (!orderNumber || !reason) {
    return NextResponse.json({ error: "Numero do pedido e motivo obrigatorios" }, { status: 400 });
  }

  const sql = getDb();

  // Find the order
  const orders = await sql`
    SELECT id, status, total FROM orders
    WHERE order_number = ${orderNumber} AND store_id = ${store.id} AND channel = 'pos'
    LIMIT 1
  `;
  if (orders.length === 0) {
    return NextResponse.json({ error: "Pedido nao encontrado" }, { status: 404 });
  }

  const order = orders[0];
  if (order.status === "cancelled") {
    return NextResponse.json({ error: "Pedido ja foi cancelado" }, { status: 400 });
  }

  // Get order items to restore stock
  const items = await sql`
    SELECT product_id, product_name, quantity FROM order_items WHERE order_id = ${order.id}
  `;

  // Restore stock for each item
  for (const item of items) {
    await sql`
      UPDATE products SET stock_quantity = stock_quantity + ${item.quantity}, updated_at = NOW()
      WHERE id = ${item.product_id} AND store_id = ${store.id}
    `;
    await sql`
      INSERT INTO stock_movements (product_id, store_id, type, quantity, reason)
      VALUES (${item.product_id}, ${store.id}, 'in', ${item.quantity}, ${"Cancelamento PDV " + orderNumber + ": " + reason})
    `;
  }

  // Cancel the order
  await sql`
    UPDATE orders SET status = 'cancelled', notes = COALESCE(notes, '') || ${" | CANCELADO: " + reason + " em " + new Date().toLocaleString("pt-BR")}, updated_at = NOW()
    WHERE id = ${order.id}
  `;

  // Cancel corresponding receivable
  await sql`
    UPDATE accounts_receivable SET status = 'cancelled', notes = ${"Cancelado: " + reason}
    WHERE order_id = ${order.id} AND store_id = ${store.id}
  `;

  return NextResponse.json({ success: true, message: "Venda cancelada e estoque restaurado" });
}
