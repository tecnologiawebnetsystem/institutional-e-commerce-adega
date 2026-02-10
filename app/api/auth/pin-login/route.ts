import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import crypto from "crypto";

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return hash === verifyHash;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, cpf, pin } = body;

    if ((!email && !cpf) || !pin) {
      return NextResponse.json({ error: "Email ou CPF e PIN sao obrigatorios" }, { status: 400 });
    }

    const sql = getDb();
    let users;
    if (email) {
      users = await sql`SELECT * FROM users WHERE email = ${email} AND role = 'owner'`;
    } else {
      users = await sql`SELECT * FROM users WHERE cpf = ${cpf} AND role = 'owner'`;
    }

    if (users.length === 0) {
      return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 });
    }

    const user = users[0];

    if (!verifyPassword(pin, user.pin_hash)) {
      return NextResponse.json({ error: "PIN invalido" }, { status: 401 });
    }

    // Verify user has a store
    const stores = await sql`SELECT id, name FROM stores WHERE owner_id = ${user.id} LIMIT 1`;
    if (stores.length === 0) {
      return NextResponse.json({ error: "Nenhuma adega cadastrada para este usuario" }, { status: 403 });
    }

    // Create session
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12h session for PDV

    await sql`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (${user.id}, ${token}, ${expiresAt.toISOString()})
    `;

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      store: { id: stores[0].id, name: stores[0].name },
    });

    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return response;
  } catch (error) {
    console.error("PIN login error:", error);
    return NextResponse.json({ error: "Erro ao fazer login" }, { status: 500 });
  }
}
