import { NextRequest, NextResponse } from "next/server";
import { getSession, getUserStore } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "owner") return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
    const store = await getUserStore(session.userId);
    if (!store) return NextResponse.json({ promotions: [] });

    const sql = getDb();
    const promotions = await sql`SELECT * FROM promotions WHERE store_id = ${store.id} ORDER BY created_at DESC`;
    return NextResponse.json({ promotions });
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
    const { name, description, discount_type, discount_value, start_date, end_date } = body;
    if (!name || !discount_type || !discount_value || !start_date || !end_date)
      return NextResponse.json({ error: "Campos obrigatorios faltando" }, { status: 400 });

    const sql = getDb();
    const promotions = await sql`
      INSERT INTO promotions (store_id, name, description, discount_type, discount_value, start_date, end_date)
      VALUES (${store.id}, ${name}, ${description || null}, ${discount_type}, ${discount_value}, ${start_date}, ${end_date})
      RETURNING *
    `;

    return NextResponse.json({ promotion: promotions[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar promocao" }, { status: 500 });
  }
}
