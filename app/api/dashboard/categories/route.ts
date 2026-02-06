import { NextRequest, NextResponse } from "next/server";
import { getSession, getUserStore } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "owner") {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
    }
    const store = await getUserStore(session.userId);
    if (!store) return NextResponse.json({ categories: [] });

    const sql = getDb();
    const categories = await sql`
      SELECT c.*, COUNT(p.id) as product_count 
      FROM categories c 
      LEFT JOIN products p ON p.category_id = c.id 
      WHERE c.store_id = ${store.id} 
      GROUP BY c.id 
      ORDER BY c.name
    `;
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "owner") {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
    }
    const store = await getUserStore(session.userId);
    if (!store) return NextResponse.json({ error: "Loja nao encontrada" }, { status: 404 });

    const body = await request.json();
    const { name, description } = body;
    if (!name) return NextResponse.json({ error: "Nome obrigatorio" }, { status: 400 });

    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
    const sql = getDb();

    const categories = await sql`
      INSERT INTO categories (store_id, name, slug, description)
      VALUES (${store.id}, ${name}, ${slug}, ${description || null})
      RETURNING *
    `;

    return NextResponse.json({ category: categories[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar categoria" }, { status: 500 });
  }
}
