import {
  Package,
  BarChart3,
  Tag,
  Ticket,
  CreditCard,
  Smartphone,
} from "lucide-react";

const features = [
  {
    icon: Package,
    title: "Gestao de Produtos",
    description:
      "Cadastre todas as suas bebidas com fotos, descricao, preco e controle de estoque completo.",
  },
  {
    icon: BarChart3,
    title: "Controle de Estoque",
    description:
      "Acompanhe entradas e saidas, receba alertas de estoque baixo e mantenha tudo organizado.",
  },
  {
    icon: Tag,
    title: "Promocoes e Combos",
    description:
      "Crie promocoes, descontos especiais e combos irresistiveis para atrair mais clientes.",
  },
  {
    icon: Ticket,
    title: "Cupons de Desconto",
    description:
      "Gere cupons exclusivos para fidelizar seus clientes e aumentar suas vendas.",
  },
  {
    icon: CreditCard,
    title: "Financeiro Completo",
    description:
      "Controle contas a pagar e receber de forma simples e eficiente.",
  },
  {
    icon: Smartphone,
    title: "100% Responsivo",
    description:
      "Seus clientes compram de qualquer dispositivo. Layout otimizado para mobile, tablet e desktop.",
  },
];

export function FeaturesSection() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section header */}
        <div className="text-center">
          <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-widest text-primary">
            Funcionalidades
          </span>
          <h2 className="text-balance text-3xl font-bold tracking-tight lg:text-5xl">
            Tudo que sua adega precisa
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Ferramentas essenciais para gerenciar sua adega de forma simples e
            eficiente, sem complicacao.
          </p>
        </div>

        {/* Features grid */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card/50 p-7 transition-all duration-300 hover:border-primary/40 hover:bg-card hover:shadow-lg hover:shadow-primary/5 lg:p-8"
            >
              {/* Subtle top glow on hover */}
              <div className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/0 to-transparent transition-all duration-300 group-hover:via-primary/60" />

              <div className="mb-5 flex h-13 w-13 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 transition-all duration-300 group-hover:bg-primary/15 group-hover:ring-primary/40">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">
                {feature.title}
              </h3>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
