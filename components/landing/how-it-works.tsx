import { UserPlus, Store, ShoppingBag, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Crie sua conta",
    description: "Cadastre-se 100% gratis em menos de 2 minutos. Sem taxas, sem planos pagos, sem cartao de credito.",
  },
  {
    icon: Store,
    step: "02",
    title: "Configure sua adega",
    description: "Adicione seus produtos, precos, fotos e configure sua vitrine online.",
  },
  {
    icon: ShoppingBag,
    step: "03",
    title: "Receba pedidos",
    description: "Seus clientes encontram sua adega e fazem pedidos diretamente pela plataforma.",
  },
  {
    icon: TrendingUp,
    step: "04",
    title: "Cresca suas vendas",
    description: "Use promocoes, cupons e combos para aumentar seu faturamento continuamente.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section header */}
        <div className="text-center">
          <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-widest text-primary">
            Como funciona
          </span>
          <h2 className="text-balance text-3xl font-bold tracking-tight lg:text-5xl">
            Comece em 4 passos simples
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Do cadastro a primeira venda, tudo rapido e sem complicacao.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-8">
          {steps.map((step, i) => (
            <div key={step.title} className="group relative flex flex-col items-center text-center">
              {/* Connector line (hidden on first, visible on lg) */}
              {i > 0 && (
                <div className="pointer-events-none absolute -left-4 top-10 hidden h-px w-8 bg-border lg:block" />
              )}

              {/* Icon circle */}
              <div className="relative mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-card border border-border transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/5">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                {/* Step number badge */}
                <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm shadow-primary/30">
                  {step.step}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2.5 max-w-[220px] text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
