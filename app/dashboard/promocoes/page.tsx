"use client";

import React from "react"

import { useState } from "react";
import { Loader2, Plus, Tag, X } from "lucide-react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PromocoesPage() {
  const { data, isLoading } = useSWR("/api/dashboard/promotions", fetcher);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", discount_type: "percentage", discount_value: "", start_date: "", end_date: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.discount_value || !form.start_date || !form.end_date) {
      toast.error("Preencha todos os campos obrigatorios"); return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, discount_value: parseFloat(form.discount_value) }),
      });
      if (res.ok) {
        toast.success("Promocao criada!");
        mutate("/api/dashboard/promotions");
        setForm({ name: "", description: "", discount_type: "percentage", discount_value: "", start_date: "", end_date: "" });
        setShowForm(false);
      } else {
        const d = await res.json();
        toast.error(d.error || "Erro");
      }
    } catch { toast.error("Erro de conexao"); } finally { setSaving(false); }
  }

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const promotions = data?.promotions || [];
  const inputClass = "flex h-11 w-full rounded-lg border border-input bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Promocoes</h1>
          <p className="mt-1 text-muted-foreground">{promotions.length} promocao{promotions.length !== 1 ? "es" : ""}</p>
        </div>
        <button type="button" onClick={() => setShowForm(!showForm)} className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancelar" : "Nova Promocao"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-2 text-lg font-semibold text-foreground">Nova Promocao</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="promo-name" className="mb-1.5 block text-sm font-medium text-foreground">Nome *</label>
              <input id="promo-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Black Friday Vinhos" />
            </div>
            <div>
              <label htmlFor="promo-desc" className="mb-1.5 block text-sm font-medium text-foreground">Descricao</label>
              <input id="promo-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} placeholder="Descricao curta" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label htmlFor="promo-type" className="mb-1.5 block text-sm font-medium text-foreground">Tipo *</label>
              <select id="promo-type" value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className={inputClass}>
                <option value="percentage">Percentual (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
            </div>
            <div>
              <label htmlFor="promo-val" className="mb-1.5 block text-sm font-medium text-foreground">Valor *</label>
              <input id="promo-val" required type="number" step="0.01" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} className={inputClass} placeholder="10" />
            </div>
            <div>
              <label htmlFor="promo-start" className="mb-1.5 block text-sm font-medium text-foreground">Inicio *</label>
              <input id="promo-start" required type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label htmlFor="promo-end" className="mb-1.5 block text-sm font-medium text-foreground">Fim *</label>
              <input id="promo-end" required type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className={inputClass} />
            </div>
          </div>
          <button type="submit" disabled={saving} className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 sm:w-auto sm:px-8">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Criar Promocao"}
          </button>
        </form>
      )}

      <div className="mt-6">
        {promotions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
            <Tag className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhuma promocao cadastrada</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {promotions.map((p: { id: string; name: string; description: string; discount_type: string; discount_value: number; start_date: string; end_date: string; is_active: boolean }) => {
              const now = new Date();
              const isExpired = new Date(p.end_date) < now;
              const isUpcoming = new Date(p.start_date) > now;
              return (
                <div key={p.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-foreground">{p.name}</h3>
                    <span className={`rounded-md px-2 py-1 text-xs font-medium ${isExpired ? "bg-secondary text-muted-foreground" : isUpcoming ? "bg-yellow-900/20 text-yellow-400" : "bg-primary/10 text-primary"}`}>
                      {isExpired ? "Expirada" : isUpcoming ? "Futura" : "Ativa"}
                    </span>
                  </div>
                  {p.description && <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>}
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <span className="font-bold text-primary">
                      {p.discount_type === "percentage" ? `${Number(p.discount_value)}%` : `R$ ${Number(p.discount_value).toFixed(2)}`}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(p.start_date).toLocaleDateString("pt-BR")} - {new Date(p.end_date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
