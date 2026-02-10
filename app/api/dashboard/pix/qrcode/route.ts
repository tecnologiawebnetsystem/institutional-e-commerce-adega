import { neon } from "@neondatabase/serverless";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  crc &= 0xffff;
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function tlv(id: string, value: string): string {
  return `${id}${value.length.toString().padStart(2, "0")}${value}`;
}

function generatePixPayload(pixKey: string, merchantName: string, merchantCity: string, amount?: number, txId?: string): string {
  let payload = "";

  // Payload Format Indicator
  payload += tlv("00", "01");

  // Merchant Account Information (PIX)
  let mai = "";
  mai += tlv("00", "br.gov.bcb.pix");
  mai += tlv("01", pixKey);
  payload += tlv("26", mai);

  // Merchant Category Code
  payload += tlv("52", "0000");

  // Transaction Currency (BRL = 986)
  payload += tlv("53", "986");

  // Transaction Amount (optional)
  if (amount && amount > 0) {
    payload += tlv("54", amount.toFixed(2));
  }

  // Country Code
  payload += tlv("58", "BR");

  // Merchant Name (max 25 chars)
  payload += tlv("59", merchantName.substring(0, 25));

  // Merchant City (max 15 chars)
  payload += tlv("60", merchantCity.substring(0, 15));

  // Additional Data Field
  const tx = txId || "***";
  payload += tlv("62", tlv("05", tx));

  // CRC16 placeholder
  payload += "6304";
  const checksum = crc16(payload);
  payload += checksum;

  return payload;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const { amount, txId } = await request.json();

  const stores = await sql`
    SELECT name, city, pix_key FROM stores WHERE owner_id = ${session.id} LIMIT 1
  `;

  if (stores.length === 0 || !stores[0].pix_key) {
    return NextResponse.json({ error: "Chave PIX nao cadastrada" }, { status: 400 });
  }

  const store = stores[0];
  const payload = generatePixPayload(
    store.pix_key,
    store.name || "ADEGA",
    store.city || "SAO JOSE DOS CAMPOS",
    amount,
    txId
  );

  return NextResponse.json({ payload });
}
