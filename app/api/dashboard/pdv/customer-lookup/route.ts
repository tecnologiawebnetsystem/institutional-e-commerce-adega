import { getSession, getUserStore } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const store = await getUserStore(session.userId);
  if (!store) return NextResponse.json({ error: "Loja nao encontrada" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  if (!q) return NextResponse.json({ customers: [] });

  const sql = getDb();
  const searchTerm = `%${q.toLowerCase()}%`;

  // Search users who have placed orders in this store, or all users by name/email/cpf
  const customers = await sql`
    SELECT DISTINCT u.id, u.name, u.email,
      COALESCE(
        (SELECT o.notes FROM orders o WHERE o.customer_id = u.id AND o.store_id = ${store.id} AND o.notes LIKE '%CPF:%' ORDER BY o.created_at DESC LIMIT 1),
        ''
      ) as last_notes
    FROM users u
    WHERE u.role = 'customer'
      AND (
        LOWER(u.name) LIKE ${searchTerm}
        OR LOWER(u.email) LIKE ${searchTerm}
      )
    ORDER BY u.name
    LIMIT 20
  `;

  // Extract CPF and phone from notes if available
  const formatted = customers.map((c: Record<string, string>) => {
    const cpfMatch = (c.last_notes || "").match(/CPF: ([\d./-]+)/);
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      cpf: cpfMatch ? cpfMatch[1] : "",
      phone: "",
    };
  });

  return NextResponse.json({ customers: formatted });
}
