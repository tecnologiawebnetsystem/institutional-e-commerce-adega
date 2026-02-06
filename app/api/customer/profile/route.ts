import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
    return NextResponse.json({ user: session });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

    const body = await request.json();
    const { name, phone, cep, street, number, complement, neighborhood, city, state } = body;

    const sql = getDb();
    await sql`
      UPDATE users SET
        name = COALESCE(${name || null}, name),
        phone = COALESCE(${phone || null}, phone),
        cep = COALESCE(${cep || null}, cep),
        street = COALESCE(${street || null}, street),
        number = COALESCE(${number || null}, number),
        complement = ${complement || null},
        neighborhood = COALESCE(${neighborhood || null}, neighborhood),
        city = COALESCE(${city || null}, city),
        state = COALESCE(${state || null}, state),
        updated_at = NOW()
      WHERE id = ${session.userId}
    `;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 });
  }
}
