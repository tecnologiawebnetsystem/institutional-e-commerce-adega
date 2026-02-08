import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, customer_id)
  )
`;
console.log("OK: conversations table");

await sql`
  CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )
`;
console.log("OK: chat_messages table");

await sql`CREATE INDEX IF NOT EXISTS idx_conversations_store ON conversations(store_id)`;
await sql`CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations(customer_id)`;
await sql`CREATE INDEX IF NOT EXISTS idx_conversations_last_msg ON conversations(last_message_at DESC)`;
await sql`CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id)`;
await sql`CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at)`;
await sql`CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id)`;
console.log("OK: indexes created");

console.log("Chat tables created successfully!");
