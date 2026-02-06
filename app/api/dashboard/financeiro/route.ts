import { NextRequest, NextResponse } from "next/server";
import { getSession, getUserStore } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "owner") return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
    const store = await getUserStore(session.userId);
    if (!store) return NextResponse.json({ payable: [], receivable: [] });

    const type = request.nextUrl.searchParams.get("type");
    const sql = getDb();

    if (type === "payable") {
      const payable = await sql`SELECT * FROM accounts_payable WHERE store_id = ${store.id} ORDER BY due_date ASC`;
      return NextResponse.json({ payable });
    }
    if (type === "receivable") {
      const receivable = await sql`SELECT * FROM accounts_receivable WHERE store_id = ${store.id} ORDER BY due_date ASC`;
      return NextResponse.json({ receivable });
    }

    const [payable, receivable] = await Promise.all([
      sql`SELECT * FROM accounts_payable WHERE store_id = ${store.id} ORDER BY due_date ASC`,
      sql`SELECT * FROM accounts_receivable WHERE store_id = ${store.id} ORDER BY due_date ASC`,
    ]);

    return NextResponse.json({ payable, receivable });
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
    const { type, description, amount, due_date, category, notes } = body;

    if (!description || !amount || !due_date || !type)
      return NextResponse.json({ error: "Campos obrigatorios faltando" }, { status: 400 });

    const sql = getDb();

    if (type === "payable") {
      const result = await sql`
        INSERT INTO accounts_payable (store_id, description, amount, due_date, category, notes)
        VALUES (${store.id}, ${description}, ${amount}, ${due_date}, ${category || null}, ${notes || null})
        RETURNING *
      `;
      return NextResponse.json({ account: result[0] }, { status: 201 });
    }

    const result = await sql`
      INSERT INTO accounts_receivable (store_id, description, amount, due_date, category, notes)
      VALUES (${store.id}, ${description}, ${amount}, ${due_date}, ${category || null}, ${notes || null})
      RETURNING *
    `;
    return NextResponse.json({ account: result[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 });
  }
}
