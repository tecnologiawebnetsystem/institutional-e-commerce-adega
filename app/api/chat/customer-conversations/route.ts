import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const sql = getDb();

  const conversations = await sql`
    SELECT c.*, s.name as store_name, s.logo_url as store_logo,
      (SELECT content FROM chat_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT COUNT(*)::int FROM chat_messages WHERE conversation_id = c.id AND sender_id != ${session.userId} AND is_read = false) as unread_count
    FROM conversations c
    JOIN stores s ON c.store_id = s.id
    WHERE c.customer_id = ${session.userId} AND c.is_archived = false
    ORDER BY c.last_message_at DESC
  `;

  return NextResponse.json({ conversations });
}
