"use client";

import React from "react"

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PerfilPage() {
  const { data, isLoading, error } = useSWR("/api/customer/profile", fetcher);
  const [saving, setSaving] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", cep: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "",
  });

  useEffect(() => {
    if (data?.user) {
      setForm({
        name: data.user.name || "",
        phone: data.user.phone || "",
        cep: data.user.cep || "",
        street: data.user.street || "",
        number: data.user.number || "",
        complement: data.user.complement || "",
        neighborhood: data.user.neighborhood || "",
        city: data.user.city || "",
        state: data.user.state || "",
      });
    }
  }, [data]);

  async function lookupCep(cep: string) {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`/api/cep/${clean}`);
      const d = await res.json();
      if (res.ok) {
        setForm((prev) => ({
          ...prev,
          street: d.street || prev.street,
          neighborhood: d.neighborhood || prev.neighborhood,
          city: d.city || prev.city,
          state: d.state || prev.state,
        }));
      }
    } catch { /* ignore */ } finally {
      setCepLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Perfil atualizado!");
        mutate("/api/customer/profile");
      } else {
        toast.error("Erro ao atualizar");
      }
    } catch {
      toast.error("Erro de conexao");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (error || data?.error) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-32 text-center">
        <p className="text-muted-foreground">Faca login para acessar seu perfil.</p>
        <Link href="/login" className="mt-4 text-sm font-semibold text-primary hover:underline">Entrar</Link>
      </div>
    );
  }

  const inputClass = "flex h-11 w-full rounded-lg border border-input bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
      <p className="mt-1 text-muted-foreground">{data.user.email}</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pf-name" className="mb-1.5 block text-sm font-medium text-foreground">Nome</label>
            <input id="pf-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label htmlFor="pf-phone" className="mb-1.5 block text-sm font-medium text-foreground">Telefone</label>
            <input id="pf-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Endereco</h3>
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="pf-cep" className="mb-1.5 block text-sm font-medium text-foreground">CEP</label>
                <div className="relative">
                  <input
                    id="pf-cep"
                    value={form.cep}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setForm({ ...form, cep: val });
                      if (val.length === 8) lookupCep(val);
                    }}
                    className={inputClass}
                    placeholder="00000-000"
                  />
                  {cepLoading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="pf-street" className="mb-1.5 block text-sm font-medium text-foreground">Rua</label>
                <input id="pf-street" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label htmlFor="pf-num" className="mb-1.5 block text-sm font-medium text-foreground">Numero</label>
                <input id="pf-num" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label htmlFor="pf-comp" className="mb-1.5 block text-sm font-medium text-foreground">Complemento</label>
                <input id="pf-comp" value={form.complement} onChange={(e) => setForm({ ...form, complement: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label htmlFor="pf-bairro" className="mb-1.5 block text-sm font-medium text-foreground">Bairro</label>
                <input id="pf-bairro" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label htmlFor="pf-city" className="mb-1.5 block text-sm font-medium text-foreground">Cidade</label>
                <input id="pf-city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-4 flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 sm:w-auto sm:px-8"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Salvar Alteracoes"}
        </button>
      </form>
    </div>
  );
}
