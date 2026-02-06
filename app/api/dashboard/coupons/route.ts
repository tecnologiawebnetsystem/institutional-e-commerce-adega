import { NextRequest, NextResponse } from "next/server";
import { getSession, getUserStore } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "owner") return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
    const store = await getUserStore(session.userId);
    if (!store) return NextResponse.json({ coupons: [] });

    const sql = getDb();
    const coupons = await sql`SELECT * FROM coupons WHERE store_id = ${store.id} ORDER BY created_at DESC`;
    return NextResponse.json({ coupons });
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
    const { code, description, discount_type, discount_value, min_purchase, max_uses, start_date, end_date } = body;
    if (!code || !discount_type || !discount_value || !start_date || !end_date)
      return NextResponse.json({ error: "Campos obrigatorios faltando" }, { status: 400 });

    const sql = getDb();
    const coupons = await sql`
      INSERT INTO coupons (store_id, code, description, discount_type, discount_value, min_purchase, max_uses, start_date, end_date)
      VALUES (${store.id}, ${code.toUpperCase()}, ${description || null}, ${discount_type}, ${discount_value}, ${min_purchase || 0}, ${max_uses || null}, ${start_date}, ${end_date})
      RETURNING *
    `;

    return NextResponse.json({ coupon: coupons[0] }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error && error.message.includes("unique") ? "Codigo ja existe" : "Erro ao criar cupom";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
