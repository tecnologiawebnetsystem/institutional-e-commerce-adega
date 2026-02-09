import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "motoboy") {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("photo") as File;
    const deliveryId = formData.get("deliveryId") as string;

    if (!file || !deliveryId) {
      return NextResponse.json({ error: "Foto e ID da entrega obrigatorios" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Foto deve ter no maximo 5MB" }, { status: 400 });
    }

    const sql = getDb();

    // Verify delivery belongs to this motoboy
    const deliveries = await sql`
      SELECT id FROM deliveries WHERE id = ${deliveryId} AND motoboy_id = ${session.userId}
    `;
    if (deliveries.length === 0) {
      return NextResponse.json({ error: "Entrega nao encontrada" }, { status: 404 });
    }

    // Upload photo to Vercel Blob
    const blob = await put(`delivery-proofs/${deliveryId}-${Date.now()}.jpg`, file, {
      access: "public",
    });

    // Update delivery with proof
    await sql`
      UPDATE deliveries SET
        proof_photo_url = ${blob.url},
        status = 'delivered',
        delivered_at = NOW(),
        updated_at = NOW()
      WHERE id = ${deliveryId}
    `;

    // Update the order status too
    await sql`
      UPDATE orders SET status = 'delivered', updated_at = NOW()
      WHERE id = (SELECT order_id FROM deliveries WHERE id = ${deliveryId})
    `;

    return NextResponse.json({ success: true, photoUrl: blob.url });
  } catch (error) {
    console.error("Delivery proof error:", error);
    return NextResponse.json({ error: "Erro ao enviar comprovante" }, { status: 500 });
  }
}
