import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

// GET /api/chat?store_id=xxx  -> customer gets their conversation with that store
// GET /api/chat?conversation_id=xxx -> get messages for a conversation
// GET /api/chat?dashboard=1  -> store owner gets all conversations for their store
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const sql = getDb();
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("store_id");
  const conversationId = searchParams.get("conversation_id");
  const dashboard = searchParams.get("dashboard");

  // Dashboard mode: owner gets all conversations for their store
  if (dashboard === "1") {
    const store = await sql`SELECT id FROM stores WHERE owner_id = ${session.userId} LIMIT 1`;
    if (store.length === 0) return NextResponse.json({ error: "Loja nao encontrada" }, { status: 404 });

    const conversations = await sql`
      SELECT c.*, u.name as customer_name, u.email as customer_email, u.avatar_url as customer_avatar,
        (SELECT content FROM chat_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*)::int FROM chat_messages WHERE conversation_id = c.id AND sender_id != ${session.userId} AND is_read = false) as unread_count
      FROM conversations c
      JOIN users u ON c.customer_id = u.id
      WHERE c.store_id = ${store[0].id} AND c.is_archived = false
      ORDER BY c.last_message_at DESC
    `;
    return NextResponse.json({ conversations });
  }

  // Get messages for a specific conversation
  if (conversationId) {
    // Verify user is part of this conversation
    const conv = await sql`
      SELECT c.*, s.owner_id FROM conversations c
      JOIN stores s ON c.store_id = s.id
      WHERE c.id = ${conversationId}
    `;
    if (conv.length === 0) return NextResponse.json({ error: "Conversa nao encontrada" }, { status: 404 });
    if (conv[0].customer_id !== session.userId && conv[0].owner_id !== session.userId) {
      return NextResponse.json({ error: "Sem permissao" }, { status: 403 });
    }

    // Mark messages as read (ones sent by the other party)
    await sql`
      UPDATE chat_messages SET is_read = true
      WHERE conversation_id = ${conversationId} AND sender_id != ${session.userId} AND is_read = false
    `;

    const messages = await sql`
      SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar
      FROM chat_messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ${conversationId}
      ORDER BY m.created_at ASC
    `;

    // Get conversation partner info
    const isOwner = conv[0].owner_id === session.userId;
    let partner;
    if (isOwner) {
      const p = await sql`SELECT name, email, avatar_url FROM users WHERE id = ${conv[0].customer_id}`;
      partner = p[0];
    } else {
      const s = await sql`SELECT s.name, s.logo_url FROM stores s WHERE s.id = ${conv[0].store_id}`;
      partner = { name: s[0].name, avatar_url: s[0].logo_url };
    }

    return NextResponse.json({ messages, conversation: conv[0], partner });
  }

  // Customer gets or creates conversation with a store
  if (storeId) {
    let conv = await sql`
      SELECT * FROM conversations WHERE store_id = ${storeId} AND customer_id = ${session.userId}
    `;
    if (conv.length === 0) {
      conv = await sql`
        INSERT INTO conversations (store_id, customer_id)
        VALUES (${storeId}, ${session.userId})
        RETURNING *
      `;
    }

    const messages = await sql`
      SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar
      FROM chat_messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ${conv[0].id}
      ORDER BY m.created_at ASC
    `;

    const store = await sql`SELECT name, logo_url FROM stores WHERE id = ${storeId}`;

    return NextResponse.json({ conversation: conv[0], messages, store: store[0] });
  }

  return NextResponse.json({ error: "Parametros invalidos" }, { status: 400 });
}

// POST /api/chat -> send message
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const sql = getDb();
  const body = await req.json();
  const { conversation_id, content } = body;

  if (!conversation_id || !content?.trim()) {
    return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
  }

  // Verify user is part of conversation
  const conv = await sql`
    SELECT c.*, s.owner_id FROM conversations c
    JOIN stores s ON c.store_id = s.id
    WHERE c.id = ${conversation_id}
  `;
  if (conv.length === 0) return NextResponse.json({ error: "Conversa nao encontrada" }, { status: 404 });
  if (conv[0].customer_id !== session.userId && conv[0].owner_id !== session.userId) {
    return NextResponse.json({ error: "Sem permissao" }, { status: 403 });
  }

  // Insert message
  const msg = await sql`
    INSERT INTO chat_messages (conversation_id, sender_id, content)
    VALUES (${conversation_id}, ${session.userId}, ${content.trim()})
    RETURNING *
  `;

  // Update conversation last_message_at
  await sql`
    UPDATE conversations SET last_message_at = NOW() WHERE id = ${conversation_id}
  `;

  return NextResponse.json({
    message: { ...msg[0], sender_name: session.name, sender_avatar: session.avatarUrl },
  });
}
