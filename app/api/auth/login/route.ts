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

    console.log("[v0] Login request received - email:", email, "has password:", !!password, "has pin:", !!pin);

    if (!email || !password || !pin) {
      console.log("[v0] Missing fields - email:", !!email, "password:", !!password, "pin:", !!pin);
      return NextResponse.json({ error: "Email, senha e PIN sao obrigatorios" }, { status: 400 });
    }

    console.log("[v0] Getting DB connection...");
    const sql = getDb();
    console.log("[v0] DB connection OK");
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;

    console.log("[v0] Login attempt for:", email, "found users:", users.length);

    if (users.length === 0) {
      return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 });
    }

    const user = users[0];

    console.log("[v0] User found:", user.email, "role:", user.role, "hash preview:", user.password_hash?.substring(0, 40));

    const pwOk = verifyPassword(password, user.password_hash);
    console.log("[v0] Password verify result:", pwOk);

    if (!pwOk) {
      return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 });
    }

    const pinOk = verifyPassword(pin, user.pin_hash);
    console.log("[v0] PIN verify result:", pinOk);

    if (!pinOk) {
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
    console.error("[v0] Login CATCH error:", error);
    return NextResponse.json({ error: "Erro ao fazer login" }, { status: 500 });
  }
}
