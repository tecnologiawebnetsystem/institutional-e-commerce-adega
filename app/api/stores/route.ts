import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const sql = getDb();
    const stores = await sql`
      SELECT s.*, u.name as owner_name,
        (SELECT COUNT(*) FROM products p WHERE p.store_id = s.id AND p.is_active = true) as product_count
      FROM stores s
      JOIN users u ON s.owner_id = u.id
      WHERE s.is_active = true
      ORDER BY s.created_at DESC
    `;
    return NextResponse.json({ stores });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
