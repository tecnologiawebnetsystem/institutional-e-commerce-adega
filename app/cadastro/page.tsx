"use client";

import React from "react"

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wine, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CadastroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    pin: "",
    role: "customer" as "customer" | "owner",
    phone: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  async function lookupCep(cep: string) {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;

    setCepLoading(true);
    try {
      const res = await fetch(`/api/cep/${clean}`);
      const data = await res.json();
      if (res.ok) {
        setForm((prev) => ({
          ...prev,
          street: data.street || prev.street,
          neighborhood: data.neighborhood || prev.neighborhood,
          city: data.city || prev.city,
          state: data.state || prev.state,
          complement: data.complement || prev.complement,
        }));
        toast.success("Endereco encontrado!");
      } else {
        toast.error("CEP nao encontrado");
      }
    } catch {
      toast.error("Erro ao buscar CEP");
    } finally {
      setCepLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (form.pin.length < 4) {
      toast.error("PIN deve ter pelo menos 4 digitos");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erro ao criar conta");
        setLoading(false);
        return;
      }

      toast.success("Conta criada com sucesso!");
      if (data.user.role === "owner") {
        router.push("/dashboard");
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
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Wine className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">
              Adega<span className="text-primary">Express</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Criar sua conta</h1>
          <p className="mt-2 text-muted-foreground">
            Preencha os dados abaixo para se cadastrar
          </p>
        </div>

        {/* Role selector */}
        <div className="mb-6 flex rounded-lg border border-border bg-secondary p-1">
          <button
            type="button"
            onClick={() => setForm({ ...form, role: "customer" })}
            className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
              form.role === "customer"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sou Cliente
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, role: "owner" })}
            className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
              form.role === "owner"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Tenho uma Adega
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
              Nome completo
            </label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass}
              placeholder="seu@email.com"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-foreground">
                Senha
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`${inputClass} pr-10`}
                  placeholder="Min. 6 caracteres"
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
            <div>
              <label htmlFor="reg-pin" className="mb-1.5 block text-sm font-medium text-foreground">
                PIN numerico
              </label>
              <input
                id="reg-pin"
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
                className={`${inputClass} tracking-[0.5em] text-center`}
                placeholder="0000"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-foreground">
              Telefone
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClass}
              placeholder="(11) 99999-9999"
            />
          </div>

          {/* Address */}
          <div className="border-t border-border pt-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Endereco</h3>
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <label htmlFor="cep" className="mb-1.5 block text-sm font-medium text-foreground">
                    CEP
                  </label>
                  <div className="relative">
                    <input
                      id="cep"
                      type="text"
                      maxLength={9}
                      value={form.cep}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setForm({ ...form, cep: val });
                        if (val.length === 8) lookupCep(val);
                      }}
                      className={inputClass}
                      placeholder="00000-000"
                    />
                    {cepLoading && (
                      <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
                    )}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="street" className="mb-1.5 block text-sm font-medium text-foreground">
                    Rua
                  </label>
                  <input
                    id="street"
                    type="text"
                    value={form.street}
                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                    className={inputClass}
                    placeholder="Rua, Avenida..."
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="num" className="mb-1.5 block text-sm font-medium text-foreground">
                    Numero
                  </label>
                  <input
                    id="num"
                    type="text"
                    value={form.number}
                    onChange={(e) => setForm({ ...form, number: e.target.value })}
                    className={inputClass}
                    placeholder="123"
                  />
                </div>
                <div>
                  <label htmlFor="compl" className="mb-1.5 block text-sm font-medium text-foreground">
                    Complemento
                  </label>
                  <input
                    id="compl"
                    type="text"
                    value={form.complement}
                    onChange={(e) => setForm({ ...form, complement: e.target.value })}
                    className={inputClass}
                    placeholder="Apto, sala..."
                  />
                </div>
                <div>
                  <label htmlFor="neighborhood" className="mb-1.5 block text-sm font-medium text-foreground">
                    Bairro
                  </label>
                  <input
                    id="neighborhood"
                    type="text"
                    value={form.neighborhood}
                    onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-foreground">
                    Cidade
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="state" className="mb-1.5 block text-sm font-medium text-foreground">
                    Estado
                  </label>
                  <input
                    id="state"
                    type="text"
                    maxLength={2}
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })}
                    className={inputClass}
                    placeholder="SP"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-11 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Criar Conta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Ja tem uma conta?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
