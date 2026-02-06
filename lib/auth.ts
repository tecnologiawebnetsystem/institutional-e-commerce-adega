import { cookies } from "next/headers";
import { getDb } from "./db";

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return null;

  const sql = getDb();
  const sessions = await sql`
    SELECT s.*, u.id as user_id, u.name, u.email, u.role, u.phone, u.avatar_url,
           u.cep, u.street, u.number, u.complement, u.neighborhood, u.city, u.state
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;

  if (sessions.length === 0) return null;

  return {
    userId: sessions[0].user_id,
    name: sessions[0].name,
    email: sessions[0].email,
    role: sessions[0].role,
    phone: sessions[0].phone,
    avatarUrl: sessions[0].avatar_url,
    cep: sessions[0].cep,
    street: sessions[0].street,
    number: sessions[0].number,
    complement: sessions[0].complement,
    neighborhood: sessions[0].neighborhood,
    city: sessions[0].city,
    state: sessions[0].state,
  };
}

export async function getUserStore(userId: string) {
  const sql = getDb();
  const stores = await sql`
    SELECT * FROM stores WHERE owner_id = ${userId} LIMIT 1
  `;
  return stores.length > 0 ? stores[0] : null;
}
