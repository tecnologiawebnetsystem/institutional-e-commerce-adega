import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { StoresShowcase } from "@/components/landing/stores-showcase";
import { BlogPreview } from "@/components/landing/blog-preview";
import { HowItWorks } from "@/components/landing/how-it-works";
import { CtaSection } from "@/components/landing/cta-section";
import { getDb } from "@/lib/db";

export default async function HomePage() {
  let blogPosts: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    tags: string[];
    published_at: string;
    image_url?: string;
  }> = [];

  let stores: Array<{
    id: string;
    name: string;
    city: string;
    state: string;
    product_count: number;
  }> = [];

  try {
    const sql = getDb();

    const [postsResult, storesResult] = await Promise.all([
      sql`
        SELECT id, title, slug, excerpt, tags, published_at, image_url
        FROM blog_posts 
        WHERE is_published = true 
        ORDER BY published_at DESC 
        LIMIT 4
      `,
      sql`
        SELECT s.id, s.name, s.city, s.state,
               COUNT(p.id)::int as product_count
        FROM stores s
        LEFT JOIN products p ON p.store_id = s.id AND p.is_active = true
        WHERE s.is_active = true
        GROUP BY s.id, s.name, s.city, s.state
        ORDER BY product_count DESC
        LIMIT 8
      `,
    ]);

    blogPosts = postsResult as typeof blogPosts;
    stores = storesResult as typeof stores;
  } catch (err) {
    console.error("[v0] Error fetching homepage data:", err);
  }

  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <StoresShowcase stores={stores} />
      <BlogPreview posts={blogPosts} />
      <CtaSection />
    </>
  );
}
