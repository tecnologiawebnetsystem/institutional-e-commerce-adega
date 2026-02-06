import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import crypto from "crypto";

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, pin, role, phone, cep, street, number, complement, neighborhood, city, state } = body;

    if (!name || !email || !password || !pin) {
      return NextResponse.json({ error: "Campos obrigatorios faltando" }, { status: 400 });
    }

    if (!/^\d{4,6}$/.test(pin)) {
      return NextResponse.json({ error: "PIN deve conter entre 4 e 6 digitos numericos" }, { status: 400 });
    }

    const sql = getDb();

    // Check existing
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email ja cadastrado" }, { status: 409 });
    }

    const passwordHash = hashPassword(password);
    const pinHash = hashPassword(pin);
    const userRole = role === "owner" ? "owner" : "customer";

    const users = await sql`
      INSERT INTO users (name, email, password_hash, pin_hash, role, phone, cep, street, number, complement, neighborhood, city, state)
      VALUES (${name}, ${email}, ${passwordHash}, ${pinHash}, ${userRole}, ${phone || null}, ${cep || null}, ${street || null}, ${number || null}, ${complement || null}, ${neighborhood || null}, ${city || null}, ${state || null})
      RETURNING id, name, email, role
    `;

    // Create session
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await sql`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (${users[0].id}, ${token}, ${expiresAt.toISOString()})
    `;

    const response = NextResponse.json({ user: users[0] }, { status: 201 });
    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 });
  }
}
