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
    return NextResponse.json({ store });
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

    const body = await request.json();
    const { name, description, phone, email, cep, street, number, complement, neighborhood, city, state } = body;

    if (!name) {
      return NextResponse.json({ error: "Nome obrigatorio" }, { status: 400 });
    }

    const sql = getDb();
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existingStore = await getUserStore(session.userId);

    if (existingStore) {
      await sql`
        UPDATE stores SET name = ${name}, slug = ${slug}, description = ${description || null},
        phone = ${phone || null}, email = ${email || null}, cep = ${cep || null},
        street = ${street || null}, number = ${number || null}, complement = ${complement || null},
        neighborhood = ${neighborhood || null}, city = ${city || null}, state = ${state || null},
        updated_at = NOW()
        WHERE id = ${existingStore.id}
      `;
    } else {
      await sql`
        INSERT INTO stores (owner_id, name, slug, description, phone, email, cep, street, number, complement, neighborhood, city, state)
        VALUES (${session.userId}, ${name}, ${slug}, ${description || null}, ${phone || null}, ${email || null},
        ${cep || null}, ${street || null}, ${number || null}, ${complement || null}, ${neighborhood || null}, ${city || null}, ${state || null})
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Store error:", error);
    return NextResponse.json({ error: "Erro ao salvar loja" }, { status: 500 });
  }
}
