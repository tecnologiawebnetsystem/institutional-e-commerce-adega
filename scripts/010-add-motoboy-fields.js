import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  // Add motoboy role to users CHECK constraint
  // First drop the old constraint and recreate with new value
  await sql`
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check
  `;
  await sql`
    ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('customer', 'owner', 'admin', 'motoboy'))
  `;

  // Add motoboy-specific fields to users table
  const columns = [
    { name: "cpf", type: "VARCHAR(14)" },
    { name: "cnh", type: "VARCHAR(20)" },
    { name: "vehicle_type", type: "VARCHAR(30)" },
    { name: "vehicle_plate", type: "VARCHAR(10)" },
    { name: "is_available", type: "BOOLEAN DEFAULT false" },
  ];

  for (const col of columns) {
    try {
      await sql(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
    } catch (e) {
      console.log(`Column ${col.name} may already exist:`, e.message);
    }
  }

  // Also add cnpj to users table (for store owners)
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS cnpj VARCHAR(18)`;
  } catch (e) {
    console.log("cnpj column may already exist:", e.message);
  }

  console.log("Migration complete: motoboy fields and role added");
}

migrate().catch(console.error);
