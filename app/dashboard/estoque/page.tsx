"use client";

import React from "react"

import { useState } from "react";
import { Loader2, ArrowUpCircle, ArrowDownCircle, Package } from "lucide-react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function EstoquePage() {
  const { data, isLoading } = useSWR("/api/dashboard/stock", fetcher);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ product_id: "", type: "in", quantity: "", reason: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.product_id || !form.quantity) { toast.error("Selecione o produto e quantidade"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, quantity: parseInt(form.quantity) }),
      });
      if (res.ok) {
        toast.success("Movimentacao registrada!");
        mutate("/api/dashboard/stock");
        setForm({ product_id: "", type: "in", quantity: "", reason: "" });
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

  const products = data?.products || [];
  const movements = data?.movements || [];
  const lowStock = products.filter((p: { stock_quantity: number; min_stock: number; is_active: boolean }) => p.is_active && p.stock_quantity <= p.min_stock);

  const inputClass = "flex h-11 w-full rounded-lg border border-input bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Controle de Estoque</h1>
      <p className="mt-1 text-muted-foreground">{products.length} produtos no estoque</p>

      {lowStock.length > 0 && (
        <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-destructive">
            <Package className="h-4 w-4" /> Estoque Baixo ({lowStock.length} produto{lowStock.length !== 1 ? "s" : ""})
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {lowStock.map((p: { id: string; name: string; stock_quantity: number }) => (
              <span key={p.id} className="rounded-md bg-destructive/10 px-2 py-1 text-xs text-destructive">
                {p.name} ({p.stock_quantity} un.)
              </span>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Nova Movimentacao</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="stk-prod" className="mb-1.5 block text-sm font-medium text-foreground">Produto *</label>
            <select id="stk-prod" required value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} className={inputClass}>
              <option value="">Selecione</option>
              {products.map((p: { id: string; name: string }) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="stk-type" className="mb-1.5 block text-sm font-medium text-foreground">Tipo *</label>
            <select id="stk-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
              <option value="in">Entrada</option>
              <option value="out">Saida</option>
              <option value="adjustment">Ajuste</option>
            </select>
          </div>
          <div>
            <label htmlFor="stk-qty" className="mb-1.5 block text-sm font-medium text-foreground">Quantidade *</label>
            <input id="stk-qty" required type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label htmlFor="stk-reason" className="mb-1.5 block text-sm font-medium text-foreground">Motivo</label>
            <input id="stk-reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className={inputClass} placeholder="Compra fornecedor" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="mt-4 flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Registrar"}
        </button>
      </form>

      {/* Stock overview */}
      <div className="mt-6 rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h3 className="font-semibold text-foreground">Visao do Estoque</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Produto</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Estoque</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Minimo</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: { id: string; name: string; stock_quantity: number; min_stock: number; is_active: boolean }) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                  <td className="px-4 py-3 text-right text-foreground">{p.stock_quantity}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{p.min_stock}</td>
                  <td className="px-4 py-3 text-center">
                    {p.stock_quantity <= p.min_stock ? (
                      <span className="rounded-md bg-destructive/10 px-2 py-1 text-xs text-destructive">Baixo</span>
                    ) : (
                      <span className="rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movements history */}
      {movements.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h3 className="font-semibold text-foreground">Ultimas Movimentacoes</h3>
          </div>
          <div className="divide-y divide-border">
            {movements.map((m: { id: string; product_name: string; type: string; quantity: number; reason: string; created_at: string }) => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                {m.type === "in" ? (
                  <ArrowUpCircle className="h-5 w-5 shrink-0 text-primary" />
                ) : (
                  <ArrowDownCircle className="h-5 w-5 shrink-0 text-destructive" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{m.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.type === "in" ? "Entrada" : m.type === "out" ? "Saida" : "Ajuste"} de {m.quantity} un.
                    {m.reason ? ` - ${m.reason}` : ""}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(m.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
