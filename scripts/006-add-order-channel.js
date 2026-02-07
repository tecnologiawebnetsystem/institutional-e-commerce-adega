const { neon } = require("@neondatabase/serverless");

async function migrate() {
  const sql = neon(process.env.DATABASE_URL);

  console.log("Adding 'channel' column to orders table...");
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS channel VARCHAR(20) DEFAULT 'online'`;
  
  console.log("Updating existing orders to 'online' channel...");
  await sql`UPDATE orders SET channel = 'online' WHERE channel IS NULL`;

  console.log("Migration complete: orders.channel column added.");
}

migrate().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
