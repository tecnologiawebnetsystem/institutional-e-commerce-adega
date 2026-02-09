import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 px-8 py-20 text-center lg:px-20 lg:py-28">
          {/* Glow effects */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: "700px",
              height: "400px",
              background:
                "radial-gradient(ellipse at center, oklch(0.65 0.22 30 / 0.12) 0%, transparent 70%)",
            }}
          />
          <div
            className="pointer-events-none absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4"
            style={{
              width: "400px",
              height: "300px",
              background:
                "radial-gradient(ellipse at center, oklch(0.55 0.2 15 / 0.08) 0%, transparent 70%)",
            }}
          />

          <div className="relative">
            <span className="mb-6 inline-block text-sm font-semibold uppercase tracking-widest text-primary">
              Comece agora
            </span>
            <h2 className="mx-auto max-w-3xl text-balance text-3xl font-bold tracking-tight lg:text-5xl">
              Pronto para levar sua adega para o{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                proximo nivel
              </span>
              ?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Cadastre-se agora e comece a vender online de forma simples e
              eficiente. A plataforma e <strong className="text-primary">100% gratuita para sempre</strong> --
              sem taxa de administracao, sem planos mensais, sem cobrancas ocultas.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/cadastro"
                className="group relative flex h-14 items-center gap-2.5 overflow-hidden rounded-xl bg-primary px-10 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-110"
              >
                Comecar Gratuitamente
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/adegas"
                className="flex h-14 items-center gap-2.5 rounded-xl border border-border bg-background/50 px-10 text-base font-medium text-foreground backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-card"
              >
                Explorar Adegas
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
