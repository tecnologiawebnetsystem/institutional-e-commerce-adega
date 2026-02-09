"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bike,
  LayoutDashboard,
  Package,
  History,
  DollarSign,
  User,
  Star,
  MessageCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/motoboy", label: "Painel", icon: LayoutDashboard },
  { href: "/motoboy/pedidos", label: "Pedidos Disponiveis", icon: Package },
  { href: "/motoboy/entrega", label: "Entrega Ativa", icon: Bike },
  { href: "/motoboy/historico", label: "Historico", icon: History },
  { href: "/motoboy/ganhos", label: "Ganhos", icon: DollarSign },
  { href: "/motoboy/avaliacoes", label: "Avaliacoes", icon: Star },
  { href: "/motoboy/chat", label: "Mensagens", icon: MessageCircle },
  { href: "/motoboy/perfil", label: "Meu Perfil", icon: User },
];

export function MotoboySidebar({
  userName,
  vehicleType,
  isOnline,
}: {
  userName: string;
  vehicleType?: string;
  isOnline?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const vehicleLabel = vehicleType === "moto" ? "Moto" : vehicleType === "bicicleta" ? "Bicicleta" : vehicleType === "carro" ? "Carro" : "Veiculo";

  const sidebar = (
    <div className="flex h-full flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <Bike className="h-6 w-6 text-primary" />
        <span className="text-sm font-bold text-foreground">
          Adega<span className="text-primary">Express</span>
        </span>
      </div>

      <div className="px-4 py-4">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
          <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-green-500" : "bg-muted-foreground"}`} />
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {vehicleLabel} - {isOnline ? "Online" : "Offline"}
        </p>
      </div>

      <nav className="flex-1 px-2">
        {navItems.map((item) => {
          const isActive = item.href === "/motoboy" ? pathname === "/motoboy" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-2">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-card border border-border text-foreground lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            onKeyDown={() => {}}
            role="button"
            tabIndex={-1}
          />
          <div className="relative h-full w-64">
            {sidebar}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-2 top-4 text-muted-foreground"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="hidden w-60 shrink-0 lg:block">{sidebar}</div>
    </>
  );
}
