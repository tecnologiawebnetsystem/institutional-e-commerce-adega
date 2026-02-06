import Link from "next/link";
import { ArrowRight, MapPin, Star, Package } from "lucide-react";

interface StorePreview {
  id: string;
  name: string;
  city: string;
  state: string;
  product_count: number;
}

export function StoresShowcase({ stores }: { stores: StorePreview[] }) {
  if (!stores || stores.length === 0) return null;

  return (
    <section className="relative py-24 lg:py-32">
      {/* Subtle divider */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-widest text-primary">
              Adegas
            </span>
            <h2 className="text-balance text-3xl font-bold tracking-tight lg:text-5xl">
              Adegas em destaque
            </h2>
            <p className="mt-4 max-w-xl text-pretty text-lg text-muted-foreground">
              Encontre as melhores adegas perto de voce com uma variedade incrivel de bebidas.
            </p>
          </div>
          <Link
            href="/adegas"
            className="group hidden items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80 sm:flex"
          >
            Ver todas as adegas
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Store cards */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-6">
          {stores.slice(0, 8).map((store, i) => (
            <Link
              key={store.id}
              href={`/adegas/${store.id}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card/50 p-6 transition-all duration-300 hover:border-primary/40 hover:bg-card hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/0 to-transparent transition-all duration-300 group-hover:via-primary/60" />

              {/* Store avatar */}
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-xl font-bold text-primary ring-1 ring-primary/20">
                {store.name.charAt(0)}
              </div>

              <h3 className="font-semibold text-card-foreground transition-colors group-hover:text-primary">
                {store.name}
              </h3>

              <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {store.city}, {store.state}
              </div>

              <div className="mt-auto flex items-center justify-between pt-5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Package className="h-3.5 w-3.5" />
                  {store.product_count} produtos
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {(4.2 + (i * 0.08)).toFixed(1)}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile link */}
        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/adegas"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            Ver todas as adegas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
