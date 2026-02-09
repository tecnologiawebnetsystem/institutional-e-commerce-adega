import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "motoboy") {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const sql = getDb();
  const deliveryId = request.nextUrl.searchParams.get("delivery_id");
  const type = request.nextUrl.searchParams.get("type"); // "store" or "customer"

  if (!deliveryId || !type) {
    return NextResponse.json({ error: "Parametros obrigatorios" }, { status: 400 });
  }

  // Verify motoboy owns this delivery
  const [delivery] = await sql`SELECT * FROM deliveries WHERE id = ${deliveryId} AND motoboy_id = ${session.userId}`;
  if (!delivery) {
    return NextResponse.json({ error: "Entrega nao encontrada" }, { status: 404 });
  }

  const messages = await sql`
    SELECT dm.*, u.name as sender_name
    FROM delivery_messages dm
    JOIN users u ON dm.sender_id = u.id
    WHERE dm.delivery_id = ${deliveryId} AND dm.recipient_type = ${type}
    ORDER BY dm.created_at ASC
  `;

  return NextResponse.json({ messages, myId: session.userId });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "motoboy") {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const sql = getDb();
  const { delivery_id, type, content } = await request.json();

  if (!delivery_id || !type || !content?.trim()) {
    return NextResponse.json({ error: "Dados obrigatorios" }, { status: 400 });
  }

  const [delivery] = await sql`SELECT * FROM deliveries WHERE id = ${delivery_id} AND motoboy_id = ${session.userId}`;
  if (!delivery) {
    return NextResponse.json({ error: "Entrega nao encontrada" }, { status: 404 });
  }

  const [msg] = await sql`
    INSERT INTO delivery_messages (delivery_id, sender_id, recipient_type, content)
    VALUES (${delivery_id}, ${session.userId}, ${type}, ${content.trim()})
    RETURNING *
  `;

  return NextResponse.json({ message: { ...msg, sender_name: session.name } });
}
