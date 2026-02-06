"use client";

import React from "react"

import { useState } from "react";
import { Loader2, Plus, Layers, X } from "lucide-react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CategoriasPage() {
  const { data, isLoading } = useSWR("/api/dashboard/categories", fetcher);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) { toast.error("Nome obrigatorio"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Categoria criada!");
        mutate("/api/dashboard/categories");
        setForm({ name: "", description: "" });
        setShowForm(false);
      } else {
        const d = await res.json();
        toast.error(d.error || "Erro");
      }
    } catch {
      toast.error("Erro de conexao");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const categories = data?.categories || [];
  const inputClass = "flex h-11 w-full rounded-lg border border-input bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categorias</h1>
          <p className="mt-1 text-muted-foreground">{categories.length} categoria{categories.length !== 1 ? "s" : ""}</p>
        </div>
        <button type="button" onClick={() => setShowForm(!showForm)} className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancelar" : "Nova Categoria"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
          <div>
            <label htmlFor="cat-name" className="mb-1.5 block text-sm font-medium text-foreground">Nome *</label>
            <input id="cat-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Vinhos Tintos" />
          </div>
          <div>
            <label htmlFor="cat-desc" className="mb-1.5 block text-sm font-medium text-foreground">Descricao</label>
            <input id="cat-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} placeholder="Descricao da categoria" />
          </div>
          <button type="submit" disabled={saving} className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 sm:w-auto sm:px-8">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Criar Categoria"}
          </button>
        </form>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
            <Layers className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhuma categoria cadastrada</p>
          </div>
        ) : (
          categories.map((c: { id: string; name: string; description: string; product_count: number }) => (
            <div key={c.id} className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
              <h3 className="font-semibold text-foreground">{c.name}</h3>
              {c.description && <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>}
              <p className="mt-3 text-xs text-muted-foreground">{c.product_count} produto{Number(c.product_count) !== 1 ? "s" : ""}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
