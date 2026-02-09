import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  // Deliveries table - links orders to motoboys
  await sql`
    CREATE TABLE IF NOT EXISTS deliveries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      motoboy_id UUID REFERENCES users(id) ON DELETE SET NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','accepted','picking_up','in_transit','arrived','delivered','cancelled')),
      delivery_address TEXT NOT NULL,
      delivery_lat DECIMAL(10,7),
      delivery_lng DECIMAL(10,7),
      store_address TEXT,
      customer_name VARCHAR(255),
      customer_phone VARCHAR(20),
      delivery_fee DECIMAL(10,2) DEFAULT 0,
      distance_km DECIMAL(6,2),
      estimated_time_min INTEGER,
      picked_up_at TIMESTAMP WITH TIME ZONE,
      delivered_at TIMESTAMP WITH TIME ZONE,
      cancelled_at TIMESTAMP WITH TIME ZONE,
      cancel_reason TEXT,
      proof_photo_url TEXT,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  // Motoboy ratings
  await sql`
    CREATE TABLE IF NOT EXISTS motoboy_ratings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
      motoboy_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rated_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(delivery_id, rated_by)
    )
  `;

  // Motoboy-store link for "vinculado" mode
  await sql`
    CREATE TABLE IF NOT EXISTS motoboy_store_links (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      motoboy_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','active','rejected','removed')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(motoboy_id, store_id)
    )
  `;

  // Add motoboy mode field (freelancer or linked)
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS motoboy_mode VARCHAR(20) DEFAULT 'freelancer'`;
  } catch(e) { console.log("motoboy_mode may already exist:", e.message); }

  // Add delivery_id to orders for linking
  try {
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_id UUID REFERENCES deliveries(id)`;
  } catch(e) { console.log("delivery_id may already exist:", e.message); }

  // Indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_deliveries_motoboy ON deliveries(motoboy_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_deliveries_store ON deliveries(store_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_motoboy_ratings_motoboy ON motoboy_ratings(motoboy_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_motoboy_store_links_motoboy ON motoboy_store_links(motoboy_id)`;

  console.log("Delivery tables created successfully!");
}

migrate().catch(console.error);
