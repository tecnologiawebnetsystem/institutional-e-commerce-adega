import { getSession, getUserStore } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

// GET - search products for POS
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const store = await getUserStore(session.userId);
  if (!store) return NextResponse.json({ error: "Loja nao encontrada" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const categoryId = searchParams.get("category") || "";

  const sql = getDb();

  // Get categories for filter
  const categories = await sql`
    SELECT id, name, slug FROM categories WHERE store_id = ${store.id} ORDER BY name
  `;

  let products;
  if (query && categoryId) {
    products = await sql`
      SELECT p.id, p.name, p.price, p.stock_quantity, p.brand, p.volume, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.store_id = ${store.id} AND p.is_active = true AND p.stock_quantity > 0
        AND p.category_id = ${categoryId}
        AND (LOWER(p.name) LIKE ${"%" + query.toLowerCase() + "%"} OR LOWER(p.brand) LIKE ${"%" + query.toLowerCase() + "%"})
      ORDER BY p.name
      LIMIT 50
    `;
  } else if (query) {
    products = await sql`
      SELECT p.id, p.name, p.price, p.stock_quantity, p.brand, p.volume, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.store_id = ${store.id} AND p.is_active = true AND p.stock_quantity > 0
        AND (LOWER(p.name) LIKE ${"%" + query.toLowerCase() + "%"} OR LOWER(p.brand) LIKE ${"%" + query.toLowerCase() + "%"})
      ORDER BY p.name
      LIMIT 50
    `;
  } else if (categoryId) {
    products = await sql`
      SELECT p.id, p.name, p.price, p.stock_quantity, p.brand, p.volume, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.store_id = ${store.id} AND p.is_active = true AND p.stock_quantity > 0
        AND p.category_id = ${categoryId}
      ORDER BY p.name
      LIMIT 50
    `;
  } else {
    products = await sql`
      SELECT p.id, p.name, p.price, p.stock_quantity, p.brand, p.volume, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.store_id = ${store.id} AND p.is_active = true AND p.stock_quantity > 0
      ORDER BY p.name
      LIMIT 50
    `;
  }

  return NextResponse.json({ products, categories });
}

// POST - finalize POS sale
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const store = await getUserStore(session.userId);
  if (!store) return NextResponse.json({ error: "Loja nao encontrada" }, { status: 404 });

  const body = await request.json();
  const { items, paymentMethod, customerName, discount } = body;

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Nenhum item na venda" }, { status: 400 });
  }

  const sql = getDb();

  // Calculate totals
  let subtotal = 0;
  for (const item of items) {
    subtotal += item.price * item.quantity;
  }
  const discountValue = discount || 0;
  const total = Math.max(subtotal - discountValue, 0);

  // Generate order number
  const orderCount = await sql`SELECT COUNT(*) as count FROM orders WHERE store_id = ${store.id}`;
  const orderNumber = `PDV-${String(Number(orderCount[0].count) + 1).padStart(5, "0")}`;

  // Create order
  const order = await sql`
    INSERT INTO orders (order_number, customer_id, store_id, status, subtotal, discount, total, delivery_address, notes, channel)
    VALUES (${orderNumber}, ${session.userId}, ${store.id}, 'delivered', ${subtotal}, ${discountValue}, ${total}, 'Venda no balcao', ${paymentMethod ? "Pagamento: " + paymentMethod + (customerName ? " | Cliente: " + customerName : "") : null}, 'pos')
    RETURNING id, order_number
  `;

  // Insert items
  for (const item of items) {
    await sql`
      INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
      VALUES (${order[0].id}, ${item.id}, ${item.name}, ${item.quantity}, ${item.price}, ${item.price * item.quantity})
    `;

    // Update stock
    await sql`UPDATE products SET stock_quantity = stock_quantity - ${item.quantity} WHERE id = ${item.id} AND store_id = ${store.id}`;
    await sql`
      INSERT INTO stock_movements (product_id, store_id, type, quantity, reason)
      VALUES (${item.id}, ${store.id}, 'out', ${item.quantity}, ${'Venda PDV ' + orderNumber})
    `;
  }

  // Register in accounts receivable
  await sql`
    INSERT INTO accounts_receivable (store_id, order_id, description, amount, due_date, received_date, status, category)
    VALUES (${store.id}, ${order[0].id}, ${'Venda PDV ' + orderNumber}, ${total}, CURRENT_DATE, CURRENT_DATE, 'received', 'Vendas PDV')
  `;

  return NextResponse.json({ success: true, orderNumber: order[0].order_number, total });
}
