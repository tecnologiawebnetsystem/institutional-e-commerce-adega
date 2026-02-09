"use client";

import useSWR from "swr";
import { Star } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(r => r.json());

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`h-4 w-4 ${i <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
      ))}
    </div>
  );
}

export default function RatingsPage() {
  const { data } = useSWR("/api/motoboy/ratings", fetcher);

  const avgRating = data?.avgRating || 0;
  const totalRatings = data?.totalRatings || 0;
  const distribution = data?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const reviews = data?.reviews || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Minhas Avaliacoes</h1>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-8">
          <p className="text-5xl font-bold text-foreground">{avgRating > 0 ? avgRating.toFixed(1) : "-"}</p>
          <Stars rating={Math.round(avgRating)} />
          <p className="mt-2 text-sm text-muted-foreground">{totalRatings} avaliacao(es)</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Distribuicao</h3>
          {[5, 4, 3, 2, 1].map(star => {
            const count = distribution[star] || 0;
            const pct = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
            return (
              <div key={star} className="mb-2 flex items-center gap-3">
                <span className="w-4 text-xs text-muted-foreground">{star}</span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <div className="h-2 flex-1 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-yellow-400 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right text-xs text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews list */}
      {reviews.length > 0 && (
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-bold text-foreground">Ultimas Avaliacoes</h2>
          </div>
          <div className="divide-y divide-border">
            {reviews.map((r: { id: string; rating: number; comment: string; rated_by_name: string; created_at: string }) => (
              <div key={r.id} className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Stars rating={r.rating} />
                    <span className="text-sm font-medium text-foreground">{r.rated_by_name || "Cliente"}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
                {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {totalRatings === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-12 text-center">
          <Star className="h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Voce ainda nao recebeu avaliacoes</p>
        </div>
      )}
    </div>
  );
}
