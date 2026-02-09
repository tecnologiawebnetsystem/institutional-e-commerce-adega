import { neon } from "@neondatabase/serverless";

async function migrate() {
  const sql = neon(process.env.DATABASE_URL);

  console.log("Adding new product fields...");

  // Add new columns to products table
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2)`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS ncm VARCHAR(10)`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier VARCHAR(255)`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS packaging VARCHAR(50)`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS origin_country VARCHAR(100)`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS origin_region VARCHAR(100)`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS grape_type VARCHAR(100)`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS vintage VARCHAR(10)`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS serving_temp VARCHAR(50)`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_grams INTEGER`;

  console.log("Product fields added.");

  // Create cash_register table for open/close cash register
  console.log("Creating cash_register table...");
  await sql`
    CREATE TABLE IF NOT EXISTS cash_register (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      opened_by UUID NOT NULL REFERENCES users(id),
      opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      closed_at TIMESTAMP WITH TIME ZONE,
      opening_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
      closing_balance DECIMAL(10,2),
      total_sales DECIMAL(10,2) DEFAULT 0,
      total_cash DECIMAL(10,2) DEFAULT 0,
      total_debit DECIMAL(10,2) DEFAULT 0,
      total_credit DECIMAL(10,2) DEFAULT 0,
      total_pix DECIMAL(10,2) DEFAULT 0,
      total_discount DECIMAL(10,2) DEFAULT 0,
      sales_count INTEGER DEFAULT 0,
      withdrawals DECIMAL(10,2) DEFAULT 0,
      deposits DECIMAL(10,2) DEFAULT 0,
      notes TEXT,
      status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed'))
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_cash_register_store ON cash_register(store_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_cash_register_status ON cash_register(store_id, status)`;

  console.log("Creating cash_movements table...");
  await sql`
    CREATE TABLE IF NOT EXISTS cash_movements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      cash_register_id UUID NOT NULL REFERENCES cash_register(id) ON DELETE CASCADE,
      store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      type VARCHAR(20) NOT NULL CHECK (type IN ('sale', 'withdrawal', 'deposit')),
      amount DECIMAL(10,2) NOT NULL,
      payment_method VARCHAR(20),
      description VARCHAR(255),
      order_id UUID REFERENCES orders(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_cash_movements_register ON cash_movements(cash_register_id)`;

  // Add payment_method and customer_cpf to orders
  console.log("Adding payment fields to orders...");
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50)`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_cpf VARCHAR(14)`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS cash_register_id UUID REFERENCES cash_register(id)`;

  console.log("All migrations complete!");
}

migrate().catch((e) => { console.error(e); process.exit(1); });
