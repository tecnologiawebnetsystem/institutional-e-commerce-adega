import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  published_at: string;
  image_url?: string;
}

function timeAgo(dateStr: string) {
  const days = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days === 0) return "Hoje";
  if (days === 1) return "Ontem";
  return `${days} dias atras`;
}

const fallbackImages = [
  "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600",
  "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600",
  "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600",
  "https://images.unsplash.com/photo-1572463395542-5765cfed4392?w=600",
  "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600",
  "https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=600",
];

export function BlogPreview({ posts }: { posts: BlogPost[] }) {
  if (!posts || posts.length === 0) return null;

  const featured = posts[0];
  const rest = posts.slice(1, 4);

  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-widest text-primary">
              Blog
            </span>
            <h2 className="text-balance text-3xl font-bold tracking-tight lg:text-5xl">
              Dicas e novidades
            </h2>
            <p className="mt-4 max-w-xl text-pretty text-lg text-muted-foreground">
              Artigos sobre vinhos, cervejas, destilados e muito mais para voce.
            </p>
          </div>
          <Link
            href="/blog"
            className="group hidden items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80 sm:flex"
          >
            Ver todos os artigos
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Blog grid: featured + 3 smaller */}
        <div className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-2 lg:gap-8">
          {/* Featured post */}
          <Link
            href={`/blog/${featured.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
          >
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src={featured.image_url || fallbackImages[0]}
                alt={featured.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            </div>
            <div className="flex flex-1 flex-col p-6 lg:p-8">
              <div className="mb-3 flex flex-wrap gap-2">
                {featured.tags?.slice(0, 2).map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="text-xl font-bold text-card-foreground transition-colors group-hover:text-primary lg:text-2xl">
                {featured.title}
              </h3>
              <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {featured.excerpt}
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {timeAgo(featured.published_at)}
              </div>
            </div>
          </Link>

          {/* Smaller posts */}
          <div className="flex flex-col gap-6 lg:gap-8">
            {rest.map((post, i) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex gap-5 overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="relative hidden h-24 w-24 shrink-0 overflow-hidden rounded-xl sm:block">
                  <Image
                    src={post.image_url || fallbackImages[i + 1]}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-center">
                  <div className="mb-2 flex gap-2">
                    {post.tags?.slice(0, 2).map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="line-clamp-2 font-semibold text-card-foreground transition-colors group-hover:text-primary">
                    {post.title}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                    {post.excerpt}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {timeAgo(post.published_at)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile link */}
        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            Ver todos os artigos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
