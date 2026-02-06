"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Eye, ArrowRight, BookOpen } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  cover_image: string | null;
  tags: string[];
  published_at: string;
  author: string;
  author_name: string | null;
  views: number;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog")
      .then((res) => res.json())
      .then((data) => setPosts(data.posts || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl text-balance">
          Blog AdegaExpress
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Dicas, novidades e tudo sobre o universo das bebidas para voce pedir com mais confianca.
        </p>
      </div>

      {loading ? (
        <div className="mt-16 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : posts.length === 0 ? (
        <div className="mt-16 text-center text-muted-foreground">
          <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>Nenhum artigo encontrado.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const image = post.cover_image || post.image_url;
            const authorDisplay = post.author_name || post.author || "AdegaExpress";
            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                {image ? (
                  <div className="h-48 overflow-hidden bg-secondary">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex h-48 items-center justify-center bg-secondary">
                    <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  {post.tags && post.tags.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(post.published_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      {post.views > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" /> {post.views}
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1 font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Ler mais <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
