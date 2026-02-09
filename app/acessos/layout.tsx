import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acessos | AdegaExpress",
  description: "Selecione seu perfil de acesso para entrar na plataforma AdegaExpress.",
};

export default function AcessosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        header, footer, nav { display: none !important; }
        main { min-height: 100vh !important; }
      `}</style>
      {children}
    </>
  );
}
