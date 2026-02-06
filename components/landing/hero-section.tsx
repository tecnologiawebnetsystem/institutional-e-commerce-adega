import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Store } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Hero image background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-drinks.jpg"
          alt=""
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-background/90" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-20 lg:px-8 lg:pb-36 lg:pt-32">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 mb-8 inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary backdrop-blur-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>
            +500 adegas ja utilizam o AdegaExpress
          </div>

          {/* Headline */}
          <h1 className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 mx-auto max-w-5xl text-balance text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            A plataforma completa para sua{" "}
            <span className="inline-block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              adega
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground lg:mt-8 lg:text-xl">
            Gerencie produtos, estoque, promocoes e vendas. Tudo em uma unica
            plataforma intuitiva e poderosa para sua adega vender online.
          </p>

          {/* CTAs */}
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300 mt-10 flex flex-col items-center gap-4 sm:flex-row lg:mt-12">
            <Link
              href="/cadastro"
              className="group relative flex h-13 items-center gap-2.5 overflow-hidden rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-110"
            >
              Cadastrar Minha Adega
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/adegas"
              className="flex h-13 items-center gap-2.5 rounded-xl border border-border bg-card/50 px-8 text-base font-medium text-foreground backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-card"
            >
              <Store className="h-4.5 w-4.5" />
              Ver Adegas
            </Link>
          </div>

          {/* Stats row */}
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 delay-500 mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:mt-20 lg:gap-12">
            {[
              { value: "500+", label: "Adegas ativas" },
              { value: "10k+", label: "Produtos cadastrados" },
              { value: "50k+", label: "Pedidos realizados" },
              { value: "98%", label: "Satisfacao" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-foreground lg:text-3xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
