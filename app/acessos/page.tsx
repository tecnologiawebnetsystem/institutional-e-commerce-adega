"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wine,
  User,
  Store,
  Bike,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  LogIn,
} from "lucide-react";
import { toast } from "sonner";

const profiles = [
  {
    id: "customer",
    label: "Cliente",
    description: "Compre bebidas e receba em casa",
    icon: User,
    color: "from-blue-600/20 to-blue-800/10 border-blue-500/30",
    iconColor: "text-blue-400",
    redirect: "/adegas",
    role: "customer",
  },
  {
    id: "owner",
    label: "Dono de Adega",
    description: "Gerencie sua loja e vendas",
    icon: Store,
    color: "from-primary/20 to-primary/5 border-primary/30",
    iconColor: "text-primary",
    redirect: "/dashboard",
    role: "owner",
  },
  {
    id: "motoboy",
    label: "Motoboy",
    description: "Faca entregas e ganhe dinheiro",
    icon: Bike,
    color: "from-emerald-600/20 to-emerald-800/10 border-emerald-500/30",
    iconColor: "text-emerald-400",
    redirect: "/motoboy",
    role: "motoboy",
  },
  {
    id: "admin",
    label: "Administrador",
    description: "Painel de controle geral",
    icon: ShieldCheck,
    color: "from-amber-600/20 to-amber-800/10 border-amber-500/30",
    iconColor: "text-amber-400",
    redirect: "/dashboard",
    role: "owner",
  },
];

export default function AcessosPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", pin: "" });

  const selectedProfile = profiles.find((p) => p.id === selected);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProfile) return;
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erro ao fazer login");
        setLoading(false);
        return;
      }

      // Verify role matches (except admin which can be any owner)
      if (selected !== "admin" && data.user.role !== selectedProfile.role) {
        const roleLabels: Record<string, string> = {
          customer: "Cliente",
          owner: "Dono de Adega",
          motoboy: "Motoboy",
        };
        toast.error(
          `Esta conta e do tipo "${roleLabels[data.user.role] || data.user.role}". Selecione o perfil correto.`
        );
        setLoading(false);
        return;
      }

      toast.success(`Bem-vindo, ${data.user.name}!`);

      if (data.user.role === "owner") {
        router.push("/dashboard");
      } else if (data.user.role === "motoboy") {
        router.push("/motoboy");
      } else {
        router.push("/adegas");
      }
      router.refresh();
    } catch {
      toast.error("Erro de conexao. Tente novamente.");
      setLoading(false);
    }
  }

  const inputClass =
    "flex h-11 w-full rounded-lg border border-input bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      {/* Logo */}
      <Link href="/" className="mb-10 inline-flex items-center gap-2.5">
        <Wine className="h-9 w-9 text-primary" />
        <span className="text-3xl font-bold text-foreground">
          Adega<span className="text-primary">Express</span>
        </span>
      </Link>

      {!selected ? (
        /* ------- PROFILE SELECTION ------- */
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-foreground text-balance">
              Selecione seu perfil de acesso
            </h1>
            <p className="mt-2 text-muted-foreground">
              Escolha como deseja entrar na plataforma
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => setSelected(profile.id)}
                className={`group relative flex flex-col items-center gap-3 rounded-xl border bg-gradient-to-br p-6 text-center transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20 ${profile.color}`}
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl bg-background/50 ${profile.iconColor} transition-transform group-hover:scale-110`}
                >
                  <profile.icon className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {profile.label}
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {profile.description}
                  </p>
                </div>
                <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/30 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  <LogIn className="h-4 w-4" />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o inicio
            </Link>
          </div>
        </div>
      ) : (
        /* ------- LOGIN FORM ------- */
        <div className="w-full max-w-md">
          <button
            onClick={() => {
              setSelected(null);
              setForm({ email: "", password: "", pin: "" });
              setShowPassword(false);
            }}
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos perfis
          </button>

          {selectedProfile && (
            <div className="mb-6 text-center">
              <div
                className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${selectedProfile.color}`}
              >
                <selectedProfile.icon
                  className={`h-8 w-8 ${selectedProfile.iconColor}`}
                />
              </div>
              <h1 className="text-xl font-bold text-foreground">
                Acessar como {selectedProfile.label}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedProfile.description}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
                placeholder="seu@email.com"
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className={`${inputClass} pr-10`}
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="pin"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                PIN numerico
              </label>
              <input
                id="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={form.pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setForm({ ...form, pin: val });
                }}
                className={`${inputClass} text-center tracking-[0.5em]`}
                placeholder="0 0 0 0"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-11 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Entrar
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Nao tem uma conta?{" "}
            <Link
              href="/cadastro"
              className="font-medium text-primary hover:underline"
            >
              Cadastre-se gratuitamente
            </Link>
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 text-center text-xs text-muted-foreground/60">
        <p>AdegaExpress - Desenvolvido por WebNetSystem</p>
      </div>
    </div>
  );
}
