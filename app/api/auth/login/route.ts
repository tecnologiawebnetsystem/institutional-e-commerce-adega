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
    const { email, password, pin } = body;

    if (!email || !password || !pin) {
      return NextResponse.json({ error: "Email, senha e PIN sao obrigatorios" }, { status: 400 });
    }

    const sql = getDb();
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (users.length === 0) {
      return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 });
    }

    const user = users[0];

    if (!verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 });
    }

    if (!verifyPassword(pin, user.pin_hash)) {
      return NextResponse.json({ error: "PIN invalido" }, { status: 401 });
    }

    // Create session
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await sql`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (${user.id}, ${token}, ${expiresAt.toISOString()})
    `;

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
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
    console.error("Login error:", error);
    return NextResponse.json({ error: "Erro ao fazer login" }, { status: 500 });
  }
}
