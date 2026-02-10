import { neon } from "@neondatabase/serverless";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const stores = await sql`
    SELECT pix_key, pix_key_type FROM stores WHERE owner_id = ${session.id} LIMIT 1
  `;

  if (stores.length === 0) {
    return NextResponse.json({ pixKey: null, pixKeyType: null });
  }

  return NextResponse.json({
    pixKey: stores[0].pix_key,
    pixKeyType: stores[0].pix_key_type,
  });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const { pixKey, pixKeyType } = await request.json();

  if (!pixKey || !pixKeyType) {
    return NextResponse.json({ error: "Chave PIX e tipo sao obrigatorios" }, { status: 400 });
  }

  const validTypes = ["cpf", "cnpj", "email", "telefone", "aleatoria"];
  if (!validTypes.includes(pixKeyType)) {
    return NextResponse.json({ error: "Tipo de chave invalido" }, { status: 400 });
  }

  await sql`
    UPDATE stores SET pix_key = ${pixKey}, pix_key_type = ${pixKeyType}
    WHERE owner_id = ${session.id}
  `;

  return NextResponse.json({ success: true });
}
