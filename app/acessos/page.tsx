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
  Monitor,
} from "lucide-react";
import { toast } from "sonner";
import PinPad from "@/components/pin-pad";

type ProfileId = "customer" | "owner" | "motoboy" | "admin" | "pdv";

const profiles = [
  {
    id: "pdv" as ProfileId,
    label: "PDV / Caixa",
    description: "Acesso rapido ao ponto de venda",
    icon: Monitor,
    color: "from-violet-600/20 to-violet-800/10 border-violet-500/30",
    iconColor: "text-violet-400",
    redirect: "/dashboard/pdv",
    role: "owner",
    isPdv: true,
  },
  {
    id: "owner" as ProfileId,
    label: "Dono de Adega",
    description: "Gerencie sua loja e vendas",
    icon: Store,
    color: "from-primary/20 to-primary/5 border-primary/30",
    iconColor: "text-primary",
    redirect: "/dashboard",
    role: "owner",
    isPdv: false,
  },
  {
    id: "customer" as ProfileId,
    label: "Cliente",
    description: "Compre bebidas e receba em casa",
    icon: User,
    color: "from-blue-600/20 to-blue-800/10 border-blue-500/30",
    iconColor: "text-blue-400",
    redirect: "/adegas",
    role: "customer",
    isPdv: false,
  },
  {
    id: "motoboy" as ProfileId,
    label: "Motoboy",
    description: "Faca entregas e ganhe dinheiro",
    icon: Bike,
    color: "from-emerald-600/20 to-emerald-800/10 border-emerald-500/30",
    iconColor: "text-emerald-400",
    redirect: "/motoboy",
    role: "motoboy",
    isPdv: false,
  },
  {
    id: "admin" as ProfileId,
    label: "Administrador",
    description: "Painel de controle geral",
    icon: ShieldCheck,
    color: "from-amber-600/20 to-amber-800/10 border-amber-500/30",
    iconColor: "text-amber-400",
    redirect: "/dashboard",
    role: "owner",
    isPdv: false,
  },
];

export default function AcessosPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<ProfileId | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", pin: "" });

  // PIN-only form for PDV
  const [pdvEmail, setPdvEmail] = useState("");
  const [pdvCpf, setPdvCpf] = useState("");

  const selectedProfile = profiles.find((p) => p.id === selected);

  function maskCpf(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  async function handlePdvLogin(pin: string) {
    if ((!pdvEmail && !pdvCpf) || pin.length !== 4) {
      toast.error("Preencha email ou CPF e o PIN de 4 digitos");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/pin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pdvEmail || undefined, cpf: pdvCpf.replace(/\D/g, "") || undefined, pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao fazer login");
        setLoading(false);
        return;
      }
      toast.success(`PDV - ${data.store.name}`);
      router.push("/dashboard/pdv");
      router.refresh();
    } catch {
      toast.error("Erro de conexao");
      setLoading(false);
    }
  }

  async function handleSubmit(pinFromPad?: string) {
    if (!selectedProfile) return;
    const pinToUse = pinFromPad || form.pin;
    if (!form.email || !form.password || !pinToUse) {
      toast.error("Preencha email, senha e digite o PIN");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, pin: pinToUse }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao fazer login");
        setLoading(false);
        return;
      }

      if (selected !== "admin" && data.user.role !== selectedProfile.role) {
        const roleLabels: Record<string, string> = { customer: "Cliente", owner: "Dono de Adega", motoboy: "Motoboy" };
        toast.error(`Esta conta e do tipo "${roleLabels[data.user.role] || data.user.role}". Selecione o perfil correto.`);
        setLoading(false);
        return;
      }

      toast.success(`Bem-vindo, ${data.user.name}!`);
      router.push(selectedProfile.redirect);
      router.refresh();
    } catch {
      toast.error("Erro de conexao. Tente novamente.");
      setLoading(false);
    }
  }

  const inputClass = "flex h-11 w-full rounded-lg border border-input bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary";

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
        <div className="w-full max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-foreground text-balance">Selecione seu perfil de acesso</h1>
            <p className="mt-2 text-muted-foreground">Escolha como deseja entrar na plataforma</p>
          </div>

          {/* PDV card - full width highlight */}
          <button
            onClick={() => setSelected("pdv")}
            className="group relative mb-4 flex w-full items-center gap-5 rounded-xl border-2 border-violet-500/40 bg-gradient-to-r from-violet-600/15 to-violet-900/10 p-5 text-left transition-all hover:scale-[1.01] hover:border-violet-500/60 hover:shadow-lg hover:shadow-violet-500/10"
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-400 transition-transform group-hover:scale-110">
              <Monitor className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">PDV / Caixa</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Acesso rapido com email + PIN de 4 digitos. Ideal para o dia a dia do caixa.
              </p>
            </div>
            <div className="hidden items-center gap-2 rounded-lg bg-violet-500/20 px-4 py-2 text-sm font-medium text-violet-300 sm:flex">
              <LogIn className="h-4 w-4" />
              Acesso Rapido
            </div>
          </button>

          {/* Other profiles */}
          <div className="grid gap-3 sm:grid-cols-2">
            {profiles.filter((p) => p.id !== "pdv").map((profile) => (
              <button
                key={profile.id}
                onClick={() => setSelected(profile.id)}
                className={`group relative flex flex-col items-center gap-3 rounded-xl border bg-gradient-to-br p-5 text-center transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20 ${profile.color}`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-background/50 ${profile.iconColor} transition-transform group-hover:scale-110`}>
                  <profile.icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">{profile.label}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">{profile.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Credentials info */}
          <div className="mt-8 w-full rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
              <ShieldCheck className="h-5 w-5 text-amber-400" />
              Credenciais de Demonstracao
            </h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Todos os usuarios usam <strong className="text-foreground">Senha: 123456</strong> e <strong className="text-foreground">PIN: 1234</strong>
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* PDV */}
              <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-violet-400">
                  <Monitor className="h-4 w-4" />
                  PDV / Caixa (Acesso Rapido)
                </h3>
                <p className="text-xs text-muted-foreground">Email ou CPF + PIN</p>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-muted-foreground/70">
                        <th className="pb-1 pr-2 font-medium">Email</th>
                        <th className="pb-1 pr-2 font-medium">CPF</th>
                        <th className="pb-1 font-medium">PIN</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-t border-border/30">
                        <td className="py-1 pr-2">carlos@adega1.com</td>
                        <td className="py-1 pr-2 font-mono text-violet-400">341.256.789-10</td>
                        <td className="py-1 font-mono text-violet-400">1234</td>
                      </tr>
                      <tr className="border-t border-border/30">
                        <td className="py-1 pr-2">fernanda@adega2.com</td>
                        <td className="py-1 pr-2 font-mono text-violet-400">528.143.679-02</td>
                        <td className="py-1 font-mono text-violet-400">1234</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Owner */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                  <Store className="h-4 w-4" />
                  Dono de Adega
                </h3>
                <p className="text-xs text-muted-foreground">Email + Senha + PIN</p>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-muted-foreground/70">
                        <th className="pb-1 pr-2 font-medium">Email</th>
                        <th className="pb-1 pr-2 font-medium">CPF</th>
                        <th className="pb-1 pr-2 font-medium">Senha</th>
                        <th className="pb-1 font-medium">PIN</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-t border-border/30">
                        <td className="py-1 pr-2">carlos@adega1.com</td>
                        <td className="py-1 pr-2 font-mono text-primary">341.256.789-10</td>
                        <td className="py-1 pr-2 font-mono text-primary">123456</td>
                        <td className="py-1 font-mono text-primary">1234</td>
                      </tr>
                      <tr className="border-t border-border/30">
                        <td className="py-1 pr-2">fernanda@adega2.com</td>
                        <td className="py-1 pr-2 font-mono text-primary">528.143.679-02</td>
                        <td className="py-1 pr-2 font-mono text-primary">123456</td>
                        <td className="py-1 font-mono text-primary">1234</td>
                      </tr>
                      <tr className="border-t border-border/30">
                        <td className="py-1 pr-2">roberto@adega3.com</td>
                        <td className="py-1 pr-2 font-mono text-primary">673.412.985-33</td>
                        <td className="py-1 pr-2 font-mono text-primary">123456</td>
                        <td className="py-1 font-mono text-primary">1234</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Customer */}
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-400">
                  <User className="h-4 w-4" />
                  Cliente
                </h3>
                <p className="text-xs text-muted-foreground">Email + Senha + PIN</p>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-muted-foreground/70">
                        <th className="pb-1 pr-2 font-medium">Email</th>
                        <th className="pb-1 pr-2 font-medium">CPF</th>
                        <th className="pb-1 pr-2 font-medium">Senha</th>
                        <th className="pb-1 font-medium">PIN</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-t border-border/30">
                        <td className="py-1 pr-2">joao@email.com</td>
                        <td className="py-1 pr-2 font-mono text-blue-400">192.834.567-44</td>
                        <td className="py-1 pr-2 font-mono text-blue-400">123456</td>
                        <td className="py-1 font-mono text-blue-400">1234</td>
                      </tr>
                      <tr className="border-t border-border/30">
                        <td className="py-1 pr-2">maria@email.com</td>
                        <td className="py-1 pr-2 font-mono text-blue-400">456.789.012-55</td>
                        <td className="py-1 pr-2 font-mono text-blue-400">123456</td>
                        <td className="py-1 font-mono text-blue-400">1234</td>
                      </tr>
                      <tr className="border-t border-border/30">
                        <td className="py-1 pr-2">camila@email.com</td>
                        <td className="py-1 pr-2 font-mono text-blue-400">789.012.345-66</td>
                        <td className="py-1 pr-2 font-mono text-blue-400">123456</td>
                        <td className="py-1 font-mono text-blue-400">1234</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Motoboy */}
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-400">
                  <Bike className="h-4 w-4" />
                  Motoboy
                </h3>
                <p className="text-xs text-muted-foreground">Email + Senha + PIN</p>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-muted-foreground/70">
                        <th className="pb-1 pr-2 font-medium">Email</th>
                        <th className="pb-1 pr-2 font-medium">CPF</th>
                        <th className="pb-1 pr-2 font-medium">Senha</th>
                        <th className="pb-1 font-medium">PIN</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-t border-border/30">
                        <td className="py-1 pr-2">diego@motoboy.com</td>
                        <td className="py-1 pr-2 font-mono text-emerald-400">123.456.789-01</td>
                        <td className="py-1 pr-2 font-mono text-emerald-400">123456</td>
                        <td className="py-1 font-mono text-emerald-400">1234</td>
                      </tr>
                      <tr className="border-t border-border/30">
                        <td className="py-1 pr-2">lucas@motoboy.com</td>
                        <td className="py-1 pr-2 font-mono text-emerald-400">987.654.321-00</td>
                        <td className="py-1 pr-2 font-mono text-emerald-400">123456</td>
                        <td className="py-1 font-mono text-emerald-400">1234</td>
                      </tr>
                      <tr className="border-t border-border/30">
                        <td className="py-1 pr-2">rafael@motoboy.com</td>
                        <td className="py-1 pr-2 font-mono text-emerald-400">456.789.123-02</td>
                        <td className="py-1 pr-2 font-mono text-emerald-400">123456</td>
                        <td className="py-1 font-mono text-emerald-400">1234</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Voltar para o inicio
            </Link>
          </div>
        </div>
      ) : selected === "pdv" ? (
        /* ------- PDV QUICK LOGIN ------- */
        <div className="w-full max-w-md">
          <button
            onClick={() => { setSelected(null); setPdvEmail(""); setPdvCpf(""); }}
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos perfis
          </button>

          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/20 to-violet-800/10 border border-violet-500/30">
              <Monitor className="h-8 w-8 text-violet-400" />
            </div>
            <h1 className="text-xl font-bold text-foreground">PDV / Caixa</h1>
            <p className="mt-1 text-sm text-muted-foreground">Login rapido com email ou CPF + PIN</p>
          </div>

          <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6">
            {/* Step 1: Email */}
            <div>
              <label htmlFor="pdv-email" className="mb-1.5 block text-sm font-medium text-foreground">Email do dono da adega</label>
              <input
                id="pdv-email"
                type="email"
                value={pdvEmail}
                onChange={(e) => setPdvEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && pdvEmail) pinRefs[0].current?.focus(); }}
                className={inputClass}
                placeholder="dono@adega.com"
                autoFocus
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">ou</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Step 1b: CPF */}
            <div>
              <label htmlFor="pdv-cpf" className="mb-1.5 block text-sm font-medium text-foreground">CPF do dono da adega</label>
              <input
                id="pdv-cpf"
                type="text"
                inputMode="numeric"
                value={pdvCpf}
                onChange={(e) => setPdvCpf(maskCpf(e.target.value))}
                onKeyDown={(e) => { if (e.key === "Enter" && pdvCpf.replace(/\D/g, "").length === 11) pinRefs[0].current?.focus(); }}
                className={inputClass}
                placeholder="000.000.000-00"
              />
            </div>

            {/* Step 2: PIN Pad */}
            <PinPad
              onComplete={(pin) => handlePdvLogin(pin)}
              accentColor="bg-violet-500"
              disabled={loading || (!pdvEmail && !pdvCpf)}
              label="PIN de 4 digitos"
            />

            {loading && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Entrando no PDV...
              </div>
            )}
          </div>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Dica: O PIN e o mesmo definido no cadastro da sua conta.
            <br />
            Sessao do PDV expira em 12 horas para seguranca.
          </p>
        </div>
      ) : (
        /* ------- STANDARD LOGIN FORM ------- */
        <div className="w-full max-w-md">
          <button
            onClick={() => { setSelected(null); setForm({ email: "", password: "", pin: "" }); setShowPassword(false); }}
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos perfis
          </button>

          {selectedProfile && (
            <div className="mb-6 text-center">
              <div className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${selectedProfile.color}`}>
                <selectedProfile.icon className={`h-8 w-8 ${selectedProfile.iconColor}`} />
              </div>
              <h1 className="text-xl font-bold text-foreground">Acessar como {selectedProfile.label}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{selectedProfile.description}</p>
            </div>
          )}

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
              <input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="seu@email.com" autoFocus />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">Senha</label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={`${inputClass} pr-10`} placeholder="Sua senha" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <PinPad
              onComplete={(pin) => handleSubmit(pin)}
              accentColor={selectedProfile?.id === "motoboy" ? "bg-emerald-500" : selectedProfile?.id === "customer" ? "bg-blue-500" : "bg-primary"}
              disabled={loading || !form.email || !form.password}
            />

            {loading && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Entrando...
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Nao tem uma conta?{" "}
            <Link href="/cadastro" className="font-medium text-primary hover:underline">Cadastre-se gratuitamente</Link>
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
