import { getSession, getUserStore } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

// GET - check current open register
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const store = await getUserStore(session.userId);
  if (!store) return NextResponse.json({ error: "Loja nao encontrada" }, { status: 404 });

  const sql = getDb();
  const registers = await sql`
    SELECT * FROM cash_register
    WHERE store_id = ${store.id} AND status = 'open'
    ORDER BY opened_at DESC LIMIT 1
  `;
  return NextResponse.json({ register: registers[0] || null });
}

// POST - open/close register, sangria/suprimento
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const store = await getUserStore(session.userId);
  if (!store) return NextResponse.json({ error: "Loja nao encontrada" }, { status: 404 });

  const body = await request.json();
  const { action } = body;
  const sql = getDb();

  if (action === "open") {
    // Check if already open
    const existing = await sql`
      SELECT id FROM cash_register WHERE store_id = ${store.id} AND status = 'open' LIMIT 1
    `;
    if (existing.length > 0) {
      return NextResponse.json({ error: "Ja existe um caixa aberto" }, { status: 400 });
    }
    const register = await sql`
      INSERT INTO cash_register (store_id, opened_by, opening_balance, status)
      VALUES (${store.id}, ${session.userId}, ${body.opening_balance || 0}, 'open')
      RETURNING *
    `;
    return NextResponse.json({ register: register[0] });
  }

  if (action === "close") {
    const register = await sql`
      SELECT * FROM cash_register
      WHERE store_id = ${store.id} AND status = 'open'
      ORDER BY opened_at DESC LIMIT 1
    `;
    if (register.length === 0) {
      return NextResponse.json({ error: "Nenhum caixa aberto" }, { status: 400 });
    }

    await sql`
      UPDATE cash_register SET
        status = 'closed',
        closed_by = ${session.userId},
        closed_at = NOW(),
        closing_balance = ${body.closing_balance || 0},
        notes = ${body.notes || null}
      WHERE id = ${register[0].id}
    `;
    return NextResponse.json({ success: true });
  }

  if (action === "movement") {
    const register = await sql`
      SELECT id FROM cash_register
      WHERE store_id = ${store.id} AND status = 'open'
      ORDER BY opened_at DESC LIMIT 1
    `;
    if (register.length === 0) {
      return NextResponse.json({ error: "Nenhum caixa aberto" }, { status: 400 });
    }

    const { type, amount, reason } = body;
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valor invalido" }, { status: 400 });
    }
    if (!reason) {
      return NextResponse.json({ error: "Motivo obrigatorio" }, { status: 400 });
    }

    await sql`
      INSERT INTO cash_movements (cash_register_id, store_id, type, amount, reason, performed_by)
      VALUES (${register[0].id}, ${store.id}, ${type}, ${amount}, ${reason}, ${session.userId})
    `;
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Acao invalida" }, { status: 400 });
}
