"use client";

import React from "react"

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wine, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import PinPad from "@/components/pin-pad";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", pin: "" });

  async function handleSubmit(pinFromPad?: string) {
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

      toast.success("Login realizado com sucesso!");
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

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Wine className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">
              Adega<span className="text-primary">Express</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Entrar na sua conta</h1>
          <p className="mt-2 text-muted-foreground">
            Informe seu email, senha e PIN para acessar
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="flex h-11 w-full rounded-lg border border-input bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="flex h-11 w-full rounded-lg border border-input bg-secondary px-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Sua senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <PinPad
            onComplete={(pin) => handleSubmit(pin)}
            accentColor="bg-primary"
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
          <Link href="/cadastro" className="font-medium text-primary hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
