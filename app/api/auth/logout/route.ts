import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("session_token")?.value;
    if (token) {
      const sql = getDb();
      await sql`DELETE FROM sessions WHERE token = ${token}`;
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("session_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Erro ao fazer logout" }, { status: 500 });
  }
}
