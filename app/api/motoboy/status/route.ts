import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "motoboy") {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }
  const sql = getDb();
  const [user] = await sql`SELECT is_available FROM users WHERE id = ${session.userId}`;
  return NextResponse.json({ isAvailable: user?.is_available || false });
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "motoboy") {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }
  const { isAvailable } = await request.json();
  const sql = getDb();
  await sql`UPDATE users SET is_available = ${!!isAvailable} WHERE id = ${session.userId}`;
  return NextResponse.json({ isAvailable: !!isAvailable });
}
