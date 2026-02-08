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
    const { name, description, price, original_price, cost_price, category_id, stock_quantity, min_stock, volume, alcohol_content, brand, barcode, ncm, supplier, packaging, origin_country, origin_region, grape_type, vintage, serving_temp, weight_grams, image_url_1, image_url_2 } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "Nome e preco obrigatorios" }, { status: 400 });
    }

    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
    const sql = getDb();

    const products = await sql`
      INSERT INTO products (store_id, category_id, name, slug, description, price, original_price, cost_price, stock_quantity, min_stock, volume, alcohol_content, brand, barcode, ncm, supplier, packaging, origin_country, origin_region, grape_type, vintage, serving_temp, weight_grams, image_url_1, image_url_2)
      VALUES (${store.id}, ${category_id || null}, ${name}, ${slug}, ${description || null}, ${price}, ${original_price || null}, ${cost_price || null}, ${stock_quantity || 0}, ${min_stock || 5}, ${volume || null}, ${alcohol_content || null}, ${brand || null}, ${barcode || null}, ${ncm || null}, ${supplier || null}, ${packaging || null}, ${origin_country || null}, ${origin_region || null}, ${grape_type || null}, ${vintage || null}, ${serving_temp || null}, ${weight_grams || null}, ${image_url_1 || null}, ${image_url_2 || null})
      RETURNING *
    `;

    return NextResponse.json({ product: products[0] }, { status: 201 });
  } catch (error) {
    console.error("Product create error:", error);
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "owner") {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
    }
    const store = await getUserStore(session.userId);
    if (!store) return NextResponse.json({ error: "Loja nao encontrada" }, { status: 404 });

    const body = await request.json();
    const { id, name, description, price, original_price, cost_price, category_id, stock_quantity, min_stock, volume, alcohol_content, brand, barcode, ncm, supplier, packaging, origin_country, origin_region, grape_type, vintage, serving_temp, weight_grams, image_url_1, image_url_2, toggleActive } = body;

    if (!id || !name || !price) {
      return NextResponse.json({ error: "ID, nome e preco obrigatorios" }, { status: 400 });
    }

    const sql = getDb();

    // Quick toggle active/inactive
    if (toggleActive !== undefined) {
      const products = await sql`
        UPDATE products SET is_active = ${toggleActive}, updated_at = NOW()
        WHERE id = ${id} AND store_id = ${store.id}
        RETURNING *
      `;
      if (products.length === 0) return NextResponse.json({ error: "Produto nao encontrado" }, { status: 404 });
      return NextResponse.json({ product: products[0] });
    }

    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");

    const products = await sql`
      UPDATE products SET
        name = ${name}, slug = ${slug}, description = ${description || null},
        price = ${price}, original_price = ${original_price || null}, cost_price = ${cost_price || null},
        category_id = ${category_id || null}, stock_quantity = ${stock_quantity || 0}, min_stock = ${min_stock || 5},
        volume = ${volume || null}, alcohol_content = ${alcohol_content || null},
        brand = ${brand || null}, barcode = ${barcode || null},
        ncm = ${ncm || null}, supplier = ${supplier || null}, packaging = ${packaging || null},
        origin_country = ${origin_country || null}, origin_region = ${origin_region || null},
        grape_type = ${grape_type || null}, vintage = ${vintage || null},
        serving_temp = ${serving_temp || null}, weight_grams = ${weight_grams || null},
        image_url_1 = ${image_url_1 || null}, image_url_2 = ${image_url_2 || null},
        updated_at = NOW()
      WHERE id = ${id} AND store_id = ${store.id}
      RETURNING *
    `;

    if (products.length === 0) {
      return NextResponse.json({ error: "Produto nao encontrado" }, { status: 404 });
    }
    return NextResponse.json({ product: products[0] });
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "owner") {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
    }
    const store = await getUserStore(session.userId);
    if (!store) return NextResponse.json({ error: "Loja nao encontrada" }, { status: 404 });

    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: "ID obrigatorio" }, { status: 400 });

    const sql = getDb();

    // Check for existing order_items referencing this product
    const refs = await sql`SELECT COUNT(*) as count FROM order_items WHERE product_id = ${id}`;
    if (Number(refs[0].count) > 0) {
      // Soft delete - deactivate instead of removing
      await sql`UPDATE products SET is_active = false, updated_at = NOW() WHERE id = ${id} AND store_id = ${store.id}`;
      return NextResponse.json({ message: "Produto desativado (possui pedidos vinculados)" });
    }

    // Hard delete - no references
    await sql`DELETE FROM stock_movements WHERE product_id = ${id}`;
    await sql`DELETE FROM promotion_products WHERE product_id = ${id}`;
    await sql`DELETE FROM combo_items WHERE product_id = ${id}`;
    await sql`DELETE FROM products WHERE id = ${id} AND store_id = ${store.id}`;
    return NextResponse.json({ message: "Produto excluido" });
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json({ error: "Erro ao excluir produto" }, { status: 500 });
  }
}
