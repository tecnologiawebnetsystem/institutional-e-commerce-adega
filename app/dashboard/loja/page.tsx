"use client";

import React from "react"

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function LojaPage() {
  const { data, isLoading } = useSWR("/api/dashboard/store", fetcher);
  const [saving, setSaving] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    if (data?.store) {
      setForm({
        name: data.store.name || "",
        description: data.store.description || "",
        phone: data.store.phone || "",
        email: data.store.email || "",
        cep: data.store.cep || "",
        street: data.store.street || "",
        number: data.store.number || "",
        complement: data.store.complement || "",
        neighborhood: data.store.neighborhood || "",
        city: data.store.city || "",
        state: data.store.state || "",
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
    if (!form.name) {
      toast.error("Nome da adega e obrigatorio");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Dados da adega salvos!");
        mutate("/api/dashboard/store");
      } else {
        const d = await res.json();
        toast.error(d.error || "Erro ao salvar");
      }
    } catch {
      toast.error("Erro de conexao");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const inputClass =
    "flex h-11 w-full rounded-lg border border-input bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Minha Adega</h1>
      <p className="mt-1 text-muted-foreground">Configure os dados da sua adega</p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl flex flex-col gap-4">
        <div>
          <label htmlFor="store-name" className="mb-1.5 block text-sm font-medium text-foreground">
            Nome da Adega *
          </label>
          <input
            id="store-name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
            placeholder="Adega do Joao"
          />
        </div>

        <div>
          <label htmlFor="store-desc" className="mb-1.5 block text-sm font-medium text-foreground">
            Descricao
          </label>
          <textarea
            id="store-desc"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={`${inputClass} h-auto py-3`}
            placeholder="Fale um pouco sobre sua adega..."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="store-phone" className="mb-1.5 block text-sm font-medium text-foreground">Telefone</label>
            <input
              id="store-phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClass}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div>
            <label htmlFor="store-email" className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
            <input
              id="store-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Endereco</h3>
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="s-cep" className="mb-1.5 block text-sm font-medium text-foreground">CEP</label>
                <div className="relative">
                  <input
                    id="s-cep"
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
                <label htmlFor="s-street" className="mb-1.5 block text-sm font-medium text-foreground">Rua</label>
                <input
                  id="s-street"
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label htmlFor="s-num" className="mb-1.5 block text-sm font-medium text-foreground">Numero</label>
                <input id="s-num" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label htmlFor="s-compl" className="mb-1.5 block text-sm font-medium text-foreground">Complemento</label>
                <input id="s-compl" value={form.complement} onChange={(e) => setForm({ ...form, complement: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label htmlFor="s-bairro" className="mb-1.5 block text-sm font-medium text-foreground">Bairro</label>
                <input id="s-bairro" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label htmlFor="s-city" className="mb-1.5 block text-sm font-medium text-foreground">Cidade</label>
                <input id="s-city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-4 flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 sm:w-auto sm:px-8"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Salvar Dados"}
        </button>
      </form>
    </div>
  );
}
