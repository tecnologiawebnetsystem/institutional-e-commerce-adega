import Link from "next/link";
import { Wine } from "lucide-react";

const footerLinks = {
  plataforma: [
    { href: "/adegas", label: "Adegas" },
    { href: "/blog", label: "Blog" },
    { href: "/cadastro", label: "Cadastrar Adega" },
    { href: "/login", label: "Entrar" },
  ],
  institucional: [
    { href: "/quem-somos", label: "Quem Somos" },
    { href: "#", label: "Termos de Uso" },
    { href: "#", label: "Politica de Privacidade" },
    { href: "#", label: "Contato" },
  ],
};

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-background">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-5 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Wine className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-bold text-foreground">
                Adega<span className="text-primary">Express</span>
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              A plataforma completa para adegas venderem online e clientes
              encontrarem as melhores bebidas.
            </p>
          </div>

          {/* Plataforma */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-foreground">
              Plataforma
            </h3>
            <ul className="flex flex-col gap-3.5">
              {footerLinks.plataforma.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Institucional */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-foreground">
              Institucional
            </h3>
            <ul className="flex flex-col gap-3.5">
              {footerLinks.institucional.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-foreground">
              Contato
            </h3>
            <ul className="flex flex-col gap-3.5">
              <li className="text-sm text-muted-foreground">
                contato@adegaexpress.com.br
              </li>
              <li className="text-sm text-muted-foreground">(11) 99999-9999</li>
              <li className="text-sm text-muted-foreground">
                Sao Paulo, SP - Brasil
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 flex flex-col items-center gap-4 border-t border-border pt-8 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">
            AdegaExpress - Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Beba com moderacao. Venda proibida para menores de 18 anos.
          </p>
        </div>
      </div>
    </footer>
  );
}
