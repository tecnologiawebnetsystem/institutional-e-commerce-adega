import { NextRequest, NextResponse } from "next/server";
import { getSession, getUserStore } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "owner") {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
    }
    const store = await getUserStore(session.userId);
    if (!store) return NextResponse.json({ products: [] });

    const sql = getDb();
    const products = await sql`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.store_id = ${store.id} 
      ORDER BY p.created_at DESC
    `;
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "owner") {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
    }
    const store = await getUserStore(session.userId);
    if (!store) return NextResponse.json({ error: "Loja nao encontrada" }, { status: 404 });

    const body = await request.json();
    const { name, description, price, original_price, category_id, stock_quantity, min_stock, volume, alcohol_content, brand, barcode, image_url_1, image_url_2 } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "Nome e preco obrigatorios" }, { status: 400 });
    }

    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
    const sql = getDb();

    const products = await sql`
      INSERT INTO products (store_id, category_id, name, slug, description, price, original_price, stock_quantity, min_stock, volume, alcohol_content, brand, barcode, image_url_1, image_url_2)
      VALUES (${store.id}, ${category_id || null}, ${name}, ${slug}, ${description || null}, ${price}, ${original_price || null}, ${stock_quantity || 0}, ${min_stock || 5}, ${volume || null}, ${alcohol_content || null}, ${brand || null}, ${barcode || null}, ${image_url_1 || null}, ${image_url_2 || null})
      RETURNING *
    `;

    return NextResponse.json({ product: products[0] }, { status: 201 });
  } catch (error) {
    console.error("Product error:", error);
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 });
  }
}
