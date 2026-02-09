import Link from "next/link";
import { Wine, Users, Store, Truck, MapPin, ArrowRight, Target, Eye, Heart, Building2, Globe, Code } from "lucide-react";

export const metadata = {
  title: "Quem Somos | AdegaExpress",
  description: "Conheca a historia da AdegaExpress, plataforma de gestao e marketplace para adegas, desenvolvida pela WebNetSystem.",
};

const stats = [
  { value: "500+", label: "Adegas Ativas", icon: Store },
  { value: "50k+", label: "Clientes Cadastrados", icon: Users },
  { value: "98%", label: "Satisfacao dos Clientes", icon: Heart },
  { value: "10+", label: "Cidades Atendidas", icon: MapPin },
];

const clients = [
  "Petrobras", "Claro", "BS2", "Caixa Economica",
  "Globo.com", "Zurich", "HDI", "Generali",
  "Excelsior", "Ergondata", "Alelo", "Banco do Brasil Assets",
  "Liberty Seguros", "Mercado Livre", "JSL",
];

const cities = [
  "Taubate", "Sao Jose dos Campos", "Cacapava",
  "Pindamonhangaba", "Guaratingueta", "Jacarei",
  "Caraguatatuba", "Ubatuba", "Campos do Jordao", "Lorena",
];

export default function QuemSomosPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-5xl px-4 text-center lg:px-8">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Wine className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
            Sobre a <span className="text-primary">AdegaExpress</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-balance">
            A plataforma de gestao e marketplace para adegas mais completa do Vale do Paraiba e do Brasil
          </p>
        </div>
      </section>

      {/* Nossa Historia */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="text-sm font-semibold uppercase tracking-widest text-primary">Nossa Historia</span>
              <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl text-balance">
                Da experiencia nasce a inovacao
              </h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
                <p>
                  A <strong className="text-foreground">AdegaExpress</strong> nasceu da experiencia da{" "}
                  <strong className="text-primary">WebNetSystem</strong>, empresa fundada em 2005 com o
                  objetivo de levar transformacao digital para empresas de todos os portes. Com mais de 20
                  anos de experiencia em desenvolvimento de sistemas, decidimos revolucionar o mercado de
                  bebidas.
                </p>
                <p>
                  Localizada no Vale do Paraiba, nossa equipe conhece de perto as necessidades das adegas,
                  distribuidoras e entregadores da regiao. Desenvolvemos a AdegaExpress para ser a solucao
                  completa que faltava no mercado: gestao de estoque, PDV profissional, marketplace online,
                  sistema de entregas e muito mais.
                </p>
                <p>
                  Nosso proposito e simples: conectar adegas aos seus clientes de forma rapida, segura e
                  inteligente, impulsionando o comercio local com tecnologia de ponta.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">WebNetSystem</h3>
                <p className="mt-1 text-sm text-muted-foreground">Fundada em 2005, empresa mae por tras da AdegaExpress</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">+20 Anos</h3>
                <p className="mt-1 text-sm text-muted-foreground">De experiencia em desenvolvimento de sistemas e tecnologia</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Brasil Inteiro</h3>
                <p className="mt-1 text-sm text-muted-foreground">Atendemos clientes em diversas regioes do pais</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Delivery</h3>
                <p className="mt-1 text-sm text-muted-foreground">Sistema completo de entregas com motoboys integrados</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Missao, Visao, Valores */}
      <section className="border-y border-border bg-card/50 py-16 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Missao</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Transformar a gestao de adegas e o comercio de bebidas atraves da tecnologia,
                proporcionando mais praticidade para donos, clientes e entregadores.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Eye className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Visao</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Ser a plataforma de marketplace e gestao para adegas mais utilizada do Brasil,
                presente em todas as cidades que buscam excelencia no comercio de bebidas.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Valores</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Inovacao continua, compromisso com resultados, proximidade com o cliente,
                transparencia e paixao pelo comercio local.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Numeros */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-foreground sm:text-4xl text-balance">
            Nossos Numeros
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-base text-muted-foreground text-balance">
            Resultados que mostram o impacto da AdegaExpress no mercado
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="group rounded-2xl border border-border bg-card p-6 text-center transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Presenca Regional */}
      <section className="border-y border-border bg-card/50 py-16 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 text-center lg:px-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <MapPin className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl text-balance">
            Presenca no Vale do Paraiba
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground text-balance">
            Atendemos adegas em toda a regiao do Vale do Paraiba e Litoral Norte
          </p>
          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-3">
            {cities.map((city) => (
              <span
                key={city}
                className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                {city}
              </span>
            ))}
          </div>
          <p className="mt-8 text-sm font-semibold text-primary">
            E expandindo para todo o Brasil!
          </p>
        </div>
      </section>

      {/* Clientes da WebNetSystem */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 text-center lg:px-8">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl text-balance">
            Clientes que Confiam na WebNetSystem
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground text-balance">
            Empresas de grande porte que escolheram a WebNetSystem como parceira de tecnologia
          </p>
          <div className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-4">
            {clients.map((client) => (
              <div
                key={client}
                className="flex items-center justify-center rounded-xl border border-border bg-card px-6 py-4 text-sm font-semibold text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground hover:shadow-md hover:shadow-primary/5"
              >
                {client}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-card/50 py-16 lg:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Wine className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl text-balance">
            Conheca a AdegaExpress
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground text-balance">
            Nossa mais recente inovacao: uma plataforma completa de gestao, marketplace e delivery para adegas
            de todo o Brasil.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/cadastro"
              className="flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:brightness-110"
            >
              Cadastre sua Adega
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/adegas"
              className="flex h-12 items-center gap-2 rounded-xl border border-border bg-card px-8 text-base font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Explorar Adegas
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
