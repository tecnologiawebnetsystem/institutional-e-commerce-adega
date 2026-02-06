"use client";

import React from "react"

import { useState } from "react";
import { Loader2, Plus, Ticket, X, Copy } from "lucide-react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CuponsPage() {
  const { data, isLoading } = useSWR("/api/dashboard/coupons", fetcher);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "", description: "", discount_type: "percentage", discount_value: "", min_purchase: "", max_uses: "", start_date: "", end_date: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code || !form.discount_value || !form.start_date || !form.end_date) {
      toast.error("Preencha os campos obrigatorios"); return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          discount_value: parseFloat(form.discount_value),
          min_purchase: form.min_purchase ? parseFloat(form.min_purchase) : 0,
          max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        }),
      });
      if (res.ok) {
        toast.success("Cupom criado!");
        mutate("/api/dashboard/coupons");
        setForm({ code: "", description: "", discount_type: "percentage", discount_value: "", min_purchase: "", max_uses: "", start_date: "", end_date: "" });
        setShowForm(false);
      } else {
        const d = await res.json();
        toast.error(d.error || "Erro");
      }
    } catch { toast.error("Erro de conexao"); } finally { setSaving(false); }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    toast.success(`Codigo ${code} copiado!`);
  }

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const coupons = data?.coupons || [];
  const inputClass = "flex h-11 w-full rounded-lg border border-input bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cupons de Desconto</h1>
          <p className="mt-1 text-muted-foreground">{coupons.length} cupom{coupons.length !== 1 ? "ns" : ""}</p>
        </div>
        <button type="button" onClick={() => setShowForm(!showForm)} className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancelar" : "Novo Cupom"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-2 text-lg font-semibold text-foreground">Novo Cupom</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="cup-code" className="mb-1.5 block text-sm font-medium text-foreground">Codigo *</label>
              <input id="cup-code" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className={inputClass} placeholder="VERAO20" />
            </div>
            <div>
              <label htmlFor="cup-desc" className="mb-1.5 block text-sm font-medium text-foreground">Descricao</label>
              <input id="cup-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} placeholder="Cupom de verao" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="cup-type" className="mb-1.5 block text-sm font-medium text-foreground">Tipo *</label>
              <select id="cup-type" value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className={inputClass}>
                <option value="percentage">Percentual (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
            </div>
            <div>
              <label htmlFor="cup-val" className="mb-1.5 block text-sm font-medium text-foreground">Valor *</label>
              <input id="cup-val" required type="number" step="0.01" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} className={inputClass} placeholder="20" />
            </div>
            <div>
              <label htmlFor="cup-min" className="mb-1.5 block text-sm font-medium text-foreground">Compra Minima</label>
              <input id="cup-min" type="number" step="0.01" value={form.min_purchase} onChange={(e) => setForm({ ...form, min_purchase: e.target.value })} className={inputClass} placeholder="100.00" />
            </div>
            <div>
              <label htmlFor="cup-max" className="mb-1.5 block text-sm font-medium text-foreground">Usos Maximo</label>
              <input id="cup-max" type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} className={inputClass} placeholder="100" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="cup-start" className="mb-1.5 block text-sm font-medium text-foreground">Inicio *</label>
              <input id="cup-start" required type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label htmlFor="cup-end" className="mb-1.5 block text-sm font-medium text-foreground">Fim *</label>
              <input id="cup-end" required type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className={inputClass} />
            </div>
          </div>
          <button type="submit" disabled={saving} className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 sm:w-auto sm:px-8">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Criar Cupom"}
          </button>
        </form>
      )}

      <div className="mt-6">
        {coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
            <Ticket className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum cupom cadastrado</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {coupons.map((c: { id: string; code: string; description: string; discount_type: string; discount_value: number; min_purchase: number; max_uses: number | null; current_uses: number; start_date: string; end_date: string; is_active: boolean }) => (
              <div key={c.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => copyCode(c.code)} className="flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 font-mono text-sm font-bold text-primary hover:bg-secondary/80">
                    {c.code} <Copy className="h-3.5 w-3.5" />
                  </button>
                  <span className={`rounded-md px-2 py-1 text-xs font-medium ${c.is_active ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                    {c.is_active ? "Ativo" : "Inativo"}
                  </span>
                </div>
                {c.description && <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-bold text-primary">
                    {c.discount_type === "percentage" ? `${Number(c.discount_value)}%` : `R$ ${Number(c.discount_value).toFixed(2)}`}
                  </span>
                  {Number(c.min_purchase) > 0 && <span>Min: R$ {Number(c.min_purchase).toFixed(2)}</span>}
                  <span>Usos: {c.current_uses}{c.max_uses ? `/${c.max_uses}` : ""}</span>
                  <span>{new Date(c.start_date).toLocaleDateString("pt-BR")} - {new Date(c.end_date).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
