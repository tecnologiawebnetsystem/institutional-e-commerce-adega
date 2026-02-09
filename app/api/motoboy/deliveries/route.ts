import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "motoboy") {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const sql = getDb();
  const uid = session.userId;
  const status = request.nextUrl.searchParams.get("status");
  const period = request.nextUrl.searchParams.get("period"); // today, week, month, all

  if (status === "pending") {
    // Get user motoboy_mode and linked stores
    const [user] = await sql`SELECT motoboy_mode FROM users WHERE id = ${uid}`;
    const mode = user?.motoboy_mode || "freelancer";

    let deliveries;
    if (mode === "linked") {
      const linkedStores = await sql`SELECT store_id FROM motoboy_store_links WHERE motoboy_id = ${uid} AND status = 'active'`;
      const storeIds = linkedStores.map((s: { store_id: string }) => s.store_id);
      if (storeIds.length === 0) {
        return NextResponse.json({ deliveries: [] });
      }
      deliveries = await sql`
        SELECT d.*, s.name as store_name
        FROM deliveries d
        JOIN stores s ON d.store_id = s.id
        WHERE d.status = 'pending' AND d.motoboy_id IS NULL AND d.store_id = ANY(${storeIds})
        ORDER BY d.created_at DESC
      `;
    } else {
      deliveries = await sql`
        SELECT d.*, s.name as store_name
        FROM deliveries d
        JOIN stores s ON d.store_id = s.id
        WHERE d.status = 'pending' AND d.motoboy_id IS NULL
        ORDER BY d.created_at DESC
      `;
    }
    return NextResponse.json({ deliveries });
  }

  if (status === "active") {
    const deliveries = await sql`
      SELECT d.*, s.name as store_name
      FROM deliveries d
      JOIN stores s ON d.store_id = s.id
      WHERE d.motoboy_id = ${uid} AND d.status IN ('accepted','picking_up','in_transit','arrived')
      ORDER BY d.updated_at DESC
    `;
    return NextResponse.json({ deliveries });
  }

  // History
  let dateFilter = "";
  if (period === "today") {
    const deliveries = await sql`
      SELECT d.*, s.name as store_name FROM deliveries d JOIN stores s ON d.store_id = s.id
      WHERE d.motoboy_id = ${uid} AND d.status IN ('delivered','cancelled') AND d.created_at >= CURRENT_DATE
      ORDER BY d.created_at DESC
    `;
    return NextResponse.json({ deliveries });
  }
  if (period === "week") {
    const deliveries = await sql`
      SELECT d.*, s.name as store_name FROM deliveries d JOIN stores s ON d.store_id = s.id
      WHERE d.motoboy_id = ${uid} AND d.status IN ('delivered','cancelled') AND d.created_at >= DATE_TRUNC('week', CURRENT_DATE)
      ORDER BY d.created_at DESC
    `;
    return NextResponse.json({ deliveries });
  }
  if (period === "month") {
    const deliveries = await sql`
      SELECT d.*, s.name as store_name FROM deliveries d JOIN stores s ON d.store_id = s.id
      WHERE d.motoboy_id = ${uid} AND d.status IN ('delivered','cancelled') AND d.created_at >= DATE_TRUNC('month', CURRENT_DATE)
      ORDER BY d.created_at DESC
    `;
    return NextResponse.json({ deliveries });
  }

  const deliveries = await sql`
    SELECT d.*, s.name as store_name FROM deliveries d JOIN stores s ON d.store_id = s.id
    WHERE d.motoboy_id = ${uid}
    ORDER BY d.created_at DESC LIMIT 100
  `;
  return NextResponse.json({ deliveries });
}

// Accept, update status, cancel delivery
export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "motoboy") {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const sql = getDb();
  const uid = session.userId;
  const body = await request.json();
  const { deliveryId, action, cancelReason, proofPhotoUrl } = body;

  if (!deliveryId || !action) {
    return NextResponse.json({ error: "deliveryId e action obrigatorios" }, { status: 400 });
  }

  if (action === "accept") {
    // Check not already taken
    const [delivery] = await sql`SELECT * FROM deliveries WHERE id = ${deliveryId} AND status = 'pending' AND motoboy_id IS NULL`;
    if (!delivery) {
      return NextResponse.json({ error: "Entrega ja aceita por outro motoboy" }, { status: 409 });
    }
    await sql`UPDATE deliveries SET motoboy_id = ${uid}, status = 'accepted', updated_at = NOW() WHERE id = ${deliveryId}`;
    return NextResponse.json({ success: true, status: "accepted" });
  }

  // Only the assigned motoboy can update
  const [delivery] = await sql`SELECT * FROM deliveries WHERE id = ${deliveryId} AND motoboy_id = ${uid}`;
  if (!delivery) {
    return NextResponse.json({ error: "Entrega nao encontrada" }, { status: 404 });
  }

  if (action === "picking_up") {
    await sql`UPDATE deliveries SET status = 'picking_up', picked_up_at = NOW(), updated_at = NOW() WHERE id = ${deliveryId}`;
  } else if (action === "in_transit") {
    await sql`UPDATE deliveries SET status = 'in_transit', updated_at = NOW() WHERE id = ${deliveryId}`;
  } else if (action === "arrived") {
    await sql`UPDATE deliveries SET status = 'arrived', updated_at = NOW() WHERE id = ${deliveryId}`;
  } else if (action === "delivered") {
    await sql`UPDATE deliveries SET status = 'delivered', delivered_at = NOW(), proof_photo_url = ${proofPhotoUrl || null}, updated_at = NOW() WHERE id = ${deliveryId}`;
    // Update order status too
    if (delivery.order_id) {
      await sql`UPDATE orders SET status = 'delivered', updated_at = NOW() WHERE id = ${delivery.order_id}`;
    }
  } else if (action === "cancel") {
    await sql`UPDATE deliveries SET status = 'cancelled', cancelled_at = NOW(), cancel_reason = ${cancelReason || null}, motoboy_id = NULL, updated_at = NOW() WHERE id = ${deliveryId}`;
  } else {
    return NextResponse.json({ error: "Acao invalida" }, { status: 400 });
  }

  return NextResponse.json({ success: true, status: action });
}
