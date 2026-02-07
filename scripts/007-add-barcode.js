const { neon } = require("@neondatabase/serverless");

async function migrate() {
  const sql = neon(process.env.DATABASE_URL);

  console.log("Adding barcode column to products...");
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(50)`;

  console.log("Creating index on barcode...");
  await sql`CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode)`;

  // Seed EAN-13 barcodes for existing products
  console.log("Seeding barcodes for existing products...");
  const products = await sql`SELECT id FROM products ORDER BY created_at`;

  // Batch update in groups of 10
  for (let i = 0; i < products.length; i += 10) {
    const batch = products.slice(i, i + 10);
    await Promise.all(
      batch.map((p, idx) => {
        // Generate realistic EAN-13: 789 (Brazil) + 0000 (company) + 5-digit sequence + check digit
        const seq = String(i + idx + 1).padStart(5, "0");
        const base = "789" + "0000" + seq;
        // Calculate EAN-13 check digit
        let sum = 0;
        for (let d = 0; d < 12; d++) {
          sum += parseInt(base[d]) * (d % 2 === 0 ? 1 : 3);
        }
        const check = (10 - (sum % 10)) % 10;
        const ean = base + check;
        return sql`UPDATE products SET barcode = ${ean} WHERE id = ${p.id}`;
      })
    );
  }

  console.log(`Done! ${products.length} products now have barcodes.`);
}

migrate().catch(console.error);
