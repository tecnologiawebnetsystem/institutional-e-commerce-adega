const { neon } = require("@neondatabase/serverless");

async function migrate() {
  const sql = neon(process.env.DATABASE_URL);

  // Add missing columns to blog_posts
  await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_name VARCHAR(255) DEFAULT 'AdegaExpress'`;
  await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS cover_image TEXT`;
  await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0`;

  // Copy author to author_name if needed
  await sql`UPDATE blog_posts SET author_name = author WHERE author_name IS NULL AND author IS NOT NULL`;

  console.log("Blog columns fixed!");
}

migrate().catch(console.error);
