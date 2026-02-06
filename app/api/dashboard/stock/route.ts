import { NextRequest, NextResponse } from "next/server";
import { getSession, getUserStore } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "owner") return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
    const store = await getUserStore(session.userId);
    if (!store) return NextResponse.json({ products: [], movements: [] });

    const sql = getDb();
    const [products, movements] = await Promise.all([
      sql`SELECT id, name, stock_quantity, min_stock, is_active FROM products WHERE store_id = ${store.id} ORDER BY name`,
      sql`SELECT sm.*, p.name as product_name FROM stock_movements sm JOIN products p ON sm.product_id = p.id WHERE sm.store_id = ${store.id} ORDER BY sm.created_at DESC LIMIT 50`,
    ]);

    return NextResponse.json({ products, movements });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "owner") return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
    const store = await getUserStore(session.userId);
    if (!store) return NextResponse.json({ error: "Loja nao encontrada" }, { status: 404 });

    const body = await request.json();
    const { product_id, type, quantity, reason } = body;

    if (!product_id || !type || !quantity)
      return NextResponse.json({ error: "Campos obrigatorios faltando" }, { status: 400 });

    const sql = getDb();

    // Record movement
    await sql`
      INSERT INTO stock_movements (product_id, store_id, type, quantity, reason)
      VALUES (${product_id}, ${store.id}, ${type}, ${quantity}, ${reason || null})
    `;

    // Update product stock
    if (type === "in") {
      await sql`UPDATE products SET stock_quantity = stock_quantity + ${quantity} WHERE id = ${product_id} AND store_id = ${store.id}`;
    } else if (type === "out") {
      await sql`UPDATE products SET stock_quantity = GREATEST(stock_quantity - ${quantity}, 0) WHERE id = ${product_id} AND store_id = ${store.id}`;
    } else {
      await sql`UPDATE products SET stock_quantity = ${quantity} WHERE id = ${product_id} AND store_id = ${store.id}`;
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao registrar movimentacao" }, { status: 500 });
  }
}
