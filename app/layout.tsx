import React from "react"
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartProvider } from "@/lib/cart-context";
import { getSession } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: {
    default: "AdegaExpress - A Plataforma Completa para sua Adega",
    template: "%s | AdegaExpress",
  },
  description:
    "Plataforma completa para adegas venderem online. Gerencie estoque, promocoes, combos e muito mais.",
  keywords: ["adega", "bebidas", "vinho", "cerveja", "destilados", "ecommerce"],
  openGraph: {
    title: "AdegaExpress - A Plataforma Completa para sua Adega",
    description: "Gerencie sua adega online com estoque, promocoes, combos e muito mais.",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  themeColor: "#c2410c",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user = null;
  try {
    user = await getSession();
  } catch {
    // no session
  }

  return (
    <html lang="pt-BR" className={`${geistSans.className} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <CartProvider>
          <Header
            user={user ? { name: user.name, email: user.email, role: user.role } : null}
          />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </CartProvider>
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  );
}
