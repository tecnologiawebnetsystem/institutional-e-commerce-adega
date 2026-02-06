import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sql = getDb();
    const stores = await sql`
      SELECT s.*, u.name as owner_name
      FROM stores s
      JOIN users u ON s.owner_id = u.id
      WHERE s.id = ${id} AND s.is_active = true
    `;
    if (stores.length === 0) return NextResponse.json({ error: "Loja nao encontrada" }, { status: 404 });

    const products = await sql`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.store_id = ${id} AND p.is_active = true
      ORDER BY p.name
    `;

    const categories = await sql`
      SELECT DISTINCT c.id, c.name
      FROM categories c
      JOIN products p ON p.category_id = c.id
      WHERE c.store_id = ${id} AND p.is_active = true
      ORDER BY c.name
    `;

    const promotions = await sql`
      SELECT * FROM promotions
      WHERE store_id = ${id} AND is_active = true AND start_date <= NOW() AND end_date >= NOW()
    `;

    return NextResponse.json({ store: stores[0], products, categories, promotions });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
