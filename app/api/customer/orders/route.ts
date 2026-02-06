import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

    const sql = getDb();
    const orders = await sql`
      SELECT o.*, s.name as store_name, s.logo_url as store_logo
      FROM orders o
      JOIN stores s ON o.store_id = s.id
      WHERE o.customer_id = ${session.userId}
      ORDER BY o.created_at DESC
    `;

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Faca login para comprar" }, { status: 401 });

    const body = await request.json();
    const { store_id, items, coupon_code } = body;
    // items: [{ product_id, quantity }]

    if (!store_id || !items?.length) {
      return NextResponse.json({ error: "Dados do pedido invalidos" }, { status: 400 });
    }

    const sql = getDb();

    // Fetch products for price calculation
    const productIds = items.map((i: { product_id: string }) => i.product_id);
    const products = await sql`SELECT * FROM products WHERE id = ANY(${productIds}) AND store_id = ${store_id} AND is_active = true`;

    if (products.length !== items.length) {
      return NextResponse.json({ error: "Alguns produtos nao estao disponiveis" }, { status: 400 });
    }

    let subtotal = 0;
    const orderItems = items.map((item: { product_id: string; quantity: number }) => {
      const product = products.find((p: { id: string }) => p.id === item.product_id);
      const itemTotal = Number(product.price) * item.quantity;
      subtotal += itemTotal;
      return { product_id: item.product_id, quantity: item.quantity, unit_price: product.price, total: itemTotal, product_name: product.name };
    });

    // Apply coupon
    let discount = 0;
    if (coupon_code) {
      const coupons = await sql`
        SELECT * FROM coupons
        WHERE store_id = ${store_id} AND code = ${coupon_code.toUpperCase()} AND is_active = true
        AND start_date <= NOW() AND end_date >= NOW()
        AND (max_uses IS NULL OR current_uses < max_uses)
      `;
      if (coupons.length > 0) {
        const coupon = coupons[0];
        if (subtotal >= Number(coupon.min_purchase)) {
          if (coupon.discount_type === "percentage") {
            discount = subtotal * (Number(coupon.discount_value) / 100);
          } else {
            discount = Number(coupon.discount_value);
          }
          await sql`UPDATE coupons SET current_uses = current_uses + 1 WHERE id = ${coupon.id}`;
        }
      }
    }

    const total = Math.max(subtotal - discount, 0);
    const orderNumber = `AE-${Date.now().toString(36).toUpperCase()}`;

    const [order] = await sql`
      INSERT INTO orders (store_id, customer_id, order_number, subtotal, discount, total, coupon_code, delivery_address)
      VALUES (${store_id}, ${session.userId}, ${orderNumber}, ${subtotal}, ${discount}, ${total}, ${coupon_code || null}, ${`${session.street}, ${session.number} - ${session.neighborhood}, ${session.city}/${session.state}`})
      RETURNING *
    `;

    // Insert order items
    for (const item of orderItems) {
      await sql`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total)
        VALUES (${order.id}, ${item.product_id}, ${item.product_name}, ${item.quantity}, ${item.unit_price}, ${item.total})
      `;
      // Reduce stock
      await sql`UPDATE products SET stock_quantity = GREATEST(stock_quantity - ${item.quantity}, 0) WHERE id = ${item.product_id}`;
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Order error:", error);
    return NextResponse.json({ error: "Erro ao criar pedido" }, { status: 500 });
  }
}
