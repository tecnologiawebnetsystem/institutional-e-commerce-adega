import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);

try {
  await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS cnpj VARCHAR(20)`;
  await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS address VARCHAR(500)`;
  console.log("Migration complete: cnpj and address added to stores");
} catch (e) {
  console.log("Column may already exist:", e.message);
}
