"use client";

import Link from "next/link";
import { Loader2, MapPin, Package, Wine } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdegasPage() {
  const { data, isLoading } = useSWR("/api/stores", fetcher);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stores = data?.stores || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl text-balance">Adegas Cadastradas</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Encontre a melhor adega perto de voce e faca seu pedido online com entrega rapida.
        </p>
      </div>

      {stores.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <Wine className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">Nenhuma adega cadastrada ainda.</p>
          <Link href="/cadastro" className="mt-4 text-sm font-semibold text-primary hover:underline">
            Cadastre sua adega
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store: { id: string; name: string; description: string; city: string; state: string; logo_url: string; product_count: number }) => (
            <Link
              key={store.id}
              href={`/adegas/${store.id}`}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  {store.logo_url ? (
                    <img src={store.logo_url || "/placeholder.svg"} alt={store.name} className="h-10 w-10 rounded-lg object-cover" />
                  ) : (
                    <Wine className="h-7 w-7 text-primary" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="truncate text-lg font-bold text-foreground group-hover:text-primary transition-colors">{store.name}</h3>
                  {(store.city || store.state) && (
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {[store.city, store.state].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              </div>
              {store.description && (
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{store.description}</p>
              )}
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Package className="h-3.5 w-3.5" />
                {store.product_count} produto{Number(store.product_count) !== 1 ? "s" : ""}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
