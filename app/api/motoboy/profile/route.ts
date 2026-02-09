import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "motoboy") {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }
  const sql = getDb();
  const [user] = await sql`
    SELECT name, email, phone, cpf, cnh, vehicle_type, vehicle_plate, motoboy_mode, is_available,
           cep, street, number, complement, neighborhood, city, state
    FROM users WHERE id = ${session.userId}
  `;
  return NextResponse.json({ user });
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "motoboy") {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { name, phone, cpf, cnh, vehicleType, vehiclePlate, motoboyMode, cep, street, number, neighborhood, city, state } = body;

  const sql = getDb();
  await sql`
    UPDATE users SET
      name = ${name || session.name},
      phone = ${phone || null},
      cpf = ${cpf || null},
      cnh = ${cnh || null},
      vehicle_type = ${vehicleType || 'moto'},
      vehicle_plate = ${vehiclePlate || null},
      motoboy_mode = ${motoboyMode || 'freelancer'},
      cep = ${cep || null},
      street = ${street || null},
      number = ${number || null},
      neighborhood = ${neighborhood || null},
      city = ${city || null},
      state = ${state || null}
    WHERE id = ${session.userId}
  `;

  return NextResponse.json({ success: true });
}
