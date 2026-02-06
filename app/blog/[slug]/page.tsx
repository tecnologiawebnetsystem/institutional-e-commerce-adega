"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Eye, User, BookOpen } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  image_url: string | null;
  tags: string[];
  published_at: string;
  author: string;
  author_name: string | null;
  views: number;
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then((res) => {
        if (!res.ok) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.post) setPost(data.post);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <BookOpen className="h-16 w-16 text-muted-foreground/30" />
        <p className="text-lg text-muted-foreground">Artigo nao encontrado.</p>
        <Link href="/blog" className="text-sm font-semibold text-primary hover:underline">
          Voltar ao blog
        </Link>
      </div>
    );
  }

  const image = post.cover_image || post.image_url;
  const authorDisplay = post.author_name || post.author || "AdegaExpress";

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao blog
      </Link>

      {image && (
        <div className="mb-8 overflow-hidden rounded-xl">
          <img src={image || "/placeholder.svg"} alt={post.title} className="h-64 w-full object-cover sm:h-80" />
        </div>
      )}

      {post.tags && post.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {post.tags.map((tag: string) => (
            <span
              key={tag}
              className="rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <h1 className="text-3xl font-bold text-foreground sm:text-4xl text-balance leading-tight">
        {post.title}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <User className="h-4 w-4" /> {authorDisplay}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />{" "}
          {new Date(post.published_at).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </span>
        {post.views > 0 && (
          <span className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" /> {post.views} visualizacoes
          </span>
        )}
      </div>

      <div className="mt-8 max-w-none text-lg leading-relaxed text-muted-foreground">
        {post.content.split("\n\n").map((paragraph: string, i: number) => (
          <p key={i} className="mb-4">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-12 border-t border-border pt-8">
        <Link href="/blog" className="text-sm font-semibold text-primary hover:underline">
          Voltar para todos os artigos
        </Link>
      </div>
    </article>
  );
}
