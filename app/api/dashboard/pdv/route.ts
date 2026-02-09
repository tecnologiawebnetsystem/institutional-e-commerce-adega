import { getSession, getUserStore } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

// GET - search products for POS (supports barcode, text search, category)
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const store = await getUserStore(session.userId);
  if (!store) return NextResponse.json({ error: "Loja nao encontrada" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const barcode = searchParams.get("barcode") || "";
  const query = searchParams.get("q") || "";
  const categoryId = searchParams.get("category") || "";

  const sql = getDb();

  // If barcode lookup - return single product
  if (barcode) {
    const products = await sql`
      SELECT p.id, p.name, p.price, p.stock_quantity, p.brand, p.volume, p.barcode, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.store_id = ${store.id} AND p.is_active = true AND p.stock_quantity > 0
        AND p.barcode = ${barcode}
      LIMIT 1
    `;
    if (products.length > 0) {
      return NextResponse.json({ product: products[0] });
    }
    return NextResponse.json({ product: null, error: "Produto nao encontrado com esse codigo de barras" });
  }

  // Get categories for filter
  const categories = await sql`
    SELECT id, name, slug FROM categories WHERE store_id = ${store.id} ORDER BY name
  `;

  // Build product query based on filters
  let products;
  const searchTerm = query ? `%${query.toLowerCase()}%` : "";

  if (query && categoryId) {
    products = await sql`
      SELECT p.id, p.name, p.price, p.stock_quantity, p.brand, p.volume, p.barcode, c.name as category_name
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.store_id = ${store.id} AND p.is_active = true AND p.stock_quantity > 0
        AND p.category_id = ${categoryId}
        AND (LOWER(p.name) LIKE ${searchTerm} OR LOWER(p.brand) LIKE ${searchTerm} OR p.barcode LIKE ${searchTerm})
      ORDER BY p.name LIMIT 60
    `;
  } else if (query) {
    products = await sql`
      SELECT p.id, p.name, p.price, p.stock_quantity, p.brand, p.volume, p.barcode, c.name as category_name
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.store_id = ${store.id} AND p.is_active = true AND p.stock_quantity > 0
        AND (LOWER(p.name) LIKE ${searchTerm} OR LOWER(p.brand) LIKE ${searchTerm} OR p.barcode LIKE ${searchTerm})
      ORDER BY p.name LIMIT 60
    `;
  } else if (categoryId) {
    products = await sql`
      SELECT p.id, p.name, p.price, p.stock_quantity, p.brand, p.volume, p.barcode, c.name as category_name
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.store_id = ${store.id} AND p.is_active = true AND p.stock_quantity > 0
        AND p.category_id = ${categoryId}
      ORDER BY p.name LIMIT 60
    `;
  } else {
    products = await sql`
      SELECT p.id, p.name, p.price, p.stock_quantity, p.brand, p.volume, p.barcode, c.name as category_name
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.store_id = ${store.id} AND p.is_active = true AND p.stock_quantity > 0
      ORDER BY p.name LIMIT 60
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
  const { items, paymentMethod, customerName, customerCpf, customerPhone, discount, cashRegisterId, cashReceived, splitPayments, notes: saleNotes } = body;

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Nenhum item na venda" }, { status: 400 });
  }
  if (!paymentMethod) {
    return NextResponse.json({ error: "Forma de pagamento obrigatoria" }, { status: 400 });
  }

  const sql = getDb();

  // Validate stock availability
  for (const item of items) {
    const product = await sql`
      SELECT stock_quantity FROM products WHERE id = ${item.id} AND store_id = ${store.id}
    `;
    if (product.length === 0) {
      return NextResponse.json({ error: `Produto ${item.name} nao encontrado` }, { status: 400 });
    }
    if (product[0].stock_quantity < item.quantity) {
      return NextResponse.json({
        error: `Estoque insuficiente para ${item.name}. Disponivel: ${product[0].stock_quantity}`,
      }, { status: 400 });
    }
  }

  // Calculate totals
  let subtotal = 0;
  for (const item of items) {
    subtotal += item.price * item.quantity - (item.itemDiscount || 0);
  }
  const discountValue = discount || 0;
  const total = Math.max(subtotal - discountValue, 0);

  // Calculate change
  let changeAmount = 0;
  if (paymentMethod === "dinheiro" && cashReceived) {
    changeAmount = Math.max(cashReceived - total, 0);
  }

  // Generate order number: PDV-YYMMDD-XXXXX
  const now = new Date();
  const dateStr = now.toISOString().slice(2, 10).replace(/-/g, "");
  const orderCount = await sql`
    SELECT COUNT(*) as count FROM orders WHERE store_id = ${store.id} AND channel = 'pos'
    AND created_at::date = CURRENT_DATE
  `;
  const seq = String(Number(orderCount[0].count) + 1).padStart(4, "0");
  const orderNumber = `PDV-${dateStr}-${seq}`;

  // Build notes
  const noteParts = [`Pagamento: ${paymentMethod}`];
  if (customerName) noteParts.push(`Cliente: ${customerName}`);
  if (customerCpf) noteParts.push(`CPF: ${customerCpf}`);
  if (customerPhone) noteParts.push(`Tel: ${customerPhone}`);
  if (changeAmount > 0) noteParts.push(`Troco: R$ ${changeAmount.toFixed(2)}`);
  if (cashReceived) noteParts.push(`Recebido: R$ ${Number(cashReceived).toFixed(2)}`);
  if (splitPayments && splitPayments.length > 0) {
    noteParts.push(`Pagamentos: ${splitPayments.map((sp: { method: string; amount: string }) => `${sp.method} R$ ${Number(sp.amount).toFixed(2)}`).join(", ")}`);
  }
  if (saleNotes) noteParts.push(`Obs: ${saleNotes}`);
  noteParts.push(`Itens: ${items.length}`);

  // Create order with new fields
  const order = await sql`
    INSERT INTO orders (order_number, customer_id, store_id, status, subtotal, discount, total, delivery_address, notes, channel, payment_method, customer_cpf, cash_register_id)
    VALUES (${orderNumber}, ${session.userId}, ${store.id}, 'delivered', ${subtotal + discountValue}, ${discountValue}, ${total}, 'Venda no balcao', ${noteParts.join(" | ")}, 'pos', ${paymentMethod}, ${customerCpf || null}, ${cashRegisterId || null})
    RETURNING id, order_number
  `;

  // Insert items, update stock, and register movements
  for (const item of items) {
    await Promise.all([
      sql`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
        VALUES (${order[0].id}, ${item.id}, ${item.name}, ${item.quantity}, ${item.price}, ${item.price * item.quantity - (item.itemDiscount || 0)})
      `,
      sql`
        UPDATE products SET stock_quantity = stock_quantity - ${item.quantity}, updated_at = NOW()
        WHERE id = ${item.id} AND store_id = ${store.id}
      `,
      sql`
        INSERT INTO stock_movements (product_id, store_id, type, quantity, reason)
        VALUES (${item.id}, ${store.id}, 'out', ${item.quantity}, ${"Venda PDV " + orderNumber})
      `,
    ]);
  }

  // Register in accounts receivable
  await sql`
    INSERT INTO accounts_receivable (store_id, order_id, description, amount, due_date, received_date, status, category)
    VALUES (${store.id}, ${order[0].id}, ${"Venda PDV " + orderNumber + " (" + paymentMethod + ")"}, ${total}, CURRENT_DATE, CURRENT_DATE, 'received', 'Vendas PDV')
  `;

  return NextResponse.json({
    success: true,
    orderId: order[0].id,
    orderNumber: order[0].order_number,
    total,
    change: changeAmount,
    items: items.length,
    paymentMethod,
  });
}
