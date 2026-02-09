"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
  Wine,
  ShoppingCart,
  User,
  LogIn,
  ChevronDown,
  LayoutDashboard,
  ClipboardList,
  UserCog,
  LogOut,
  MessageCircle,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";

interface HeaderProps {
  user: {
    name: string;
    email: string;
    role: string;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const router = useRouter();

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/adegas", label: "Adegas" },
    { href: "/blog", label: "Blog" },
    { href: "/quem-somos", label: "Quem Somos" },
  ];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* Announcement bar */}
      <div className="relative flex items-center justify-center overflow-hidden bg-gradient-to-r from-primary via-primary to-accent px-4 py-2.5 text-center text-sm font-medium text-primary-foreground">
        <span>
          Sua adega online favorita! Cadastre-se e encontre as melhores bebidas.{" "}
          <Link
            href="/cadastro"
            className="underline underline-offset-2 font-semibold hover:no-underline"
          >
            Saiba mais
          </Link>
        </span>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:h-18 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Wine className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Adega<span className="text-primary">Express</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                {/* Cart */}
                <Link
                  href="/carrinho"
                  className="relative flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="Carrinho"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm shadow-primary/30">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {/* User dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex h-10 items-center gap-2 rounded-lg bg-secondary/80 px-3.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                        onKeyDown={() => {}}
                        role="button"
                        tabIndex={-1}
                      />
                      <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-background/50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* User info */}
                        <div className="border-b border-border px-4 py-3">
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>

                        <div className="p-1.5">
                          {user.role === "owner" ? (
                            <Link
                              href="/dashboard"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary"
                            >
                              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                              Painel da Adega
                            </Link>
                          ) : (
                            <>
                              <Link
                                href="/meus-pedidos"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary"
                              >
                                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                Meus Pedidos
                              </Link>
                              <Link
                                href="/mensagens"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary"
                              >
                                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                                Mensagens
                              </Link>
                              <Link
                                href="/perfil"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary"
                              >
                                <UserCog className="h-4 w-4 text-muted-foreground" />
                                Meu Perfil
                              </Link>
                            </>
                          )}
                        </div>

                        <div className="border-t border-border p-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false);
                              handleLogout();
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                          >
                            <LogOut className="h-4 w-4" />
                            Sair
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <LogIn className="h-4 w-4" />
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:shadow-md hover:shadow-primary/30 hover:brightness-110"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-1.5 md:hidden">
            {user && (
              <Link
                href="/carrinho"
                className="relative flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground"
                aria-label="Carrinho"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary"
              aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="border-t border-border bg-background animate-in fade-in slide-in-from-top-2 duration-200 md:hidden">
            <nav className="flex flex-col px-4 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex h-12 items-center rounded-lg px-3 text-base font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-3 flex flex-col gap-2.5 border-t border-border pt-4">
                {user ? (
                  <>
                    {/* User info */}
                    <div className="mb-1 px-3">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    {user.role === "owner" ? (
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="flex h-12 items-center gap-3 rounded-lg px-3 text-base font-medium text-muted-foreground hover:bg-secondary"
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        Painel da Adega
                      </Link>
                    ) : (
                      <>
                        <Link
                          href="/meus-pedidos"
                          onClick={() => setMobileOpen(false)}
                          className="flex h-12 items-center gap-3 rounded-lg px-3 text-base font-medium text-muted-foreground hover:bg-secondary"
                        >
                          <ClipboardList className="h-5 w-5" />
                          Meus Pedidos
                        </Link>
                        <Link
                          href="/mensagens"
                          onClick={() => setMobileOpen(false)}
                          className="flex h-12 items-center gap-3 rounded-lg px-3 text-base font-medium text-muted-foreground hover:bg-secondary"
                        >
                          <MessageCircle className="h-5 w-5" />
                          Mensagens
                        </Link>
                        <Link
                          href="/perfil"
                          onClick={() => setMobileOpen(false)}
                          className="flex h-12 items-center gap-3 rounded-lg px-3 text-base font-medium text-muted-foreground hover:bg-secondary"
                        >
                          <UserCog className="h-5 w-5" />
                          Meu Perfil
                        </Link>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        handleLogout();
                      }}
                      className="flex h-12 items-center gap-3 rounded-lg px-3 text-base font-medium text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-5 w-5" />
                      Sair
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex h-12 items-center justify-center rounded-xl border border-border text-base font-medium text-foreground hover:bg-secondary"
                    >
                      Entrar
                    </Link>
                    <Link
                      href="/cadastro"
                      onClick={() => setMobileOpen(false)}
                      className="flex h-12 items-center justify-center rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-sm shadow-primary/20"
                    >
                      Cadastrar
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
