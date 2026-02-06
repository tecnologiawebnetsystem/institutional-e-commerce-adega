"use client";

import React from "react"

import { useState } from "react";
import { Loader2, Plus, TrendingDown, TrendingUp, DollarSign, X } from "lucide-react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function FinanceiroPage() {
  const { data, isLoading } = useSWR("/api/dashboard/financeiro", fetcher);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: "payable",
    description: "",
    amount: "",
    due_date: "",
    category: "",
    notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description || !form.amount || !form.due_date) {
      toast.error("Preencha os campos obrigatorios"); return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/financeiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      });
      if (res.ok) {
        toast.success("Conta registrada!");
        mutate("/api/dashboard/financeiro");
        setForm({ type: "payable", description: "", amount: "", due_date: "", category: "", notes: "" });
        setShowForm(false);
      } else {
        const d = await res.json();
        toast.error(d.error || "Erro");
      }
    } catch { toast.error("Erro de conexao"); } finally { setSaving(false); }
  }

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const payable = data?.payable || [];
  const receivable = data?.receivable || [];

  const totalPayable = payable.filter((a: { status: string }) => a.status === "pending").reduce((sum: number, a: { amount: number }) => sum + Number(a.amount), 0);
  const totalReceivable = receivable.filter((a: { status: string }) => a.status === "pending").reduce((sum: number, a: { amount: number }) => sum + Number(a.amount), 0);
  const balance = totalReceivable - totalPayable;

  const inputClass = "flex h-11 w-full rounded-lg border border-input bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
          <p className="mt-1 text-muted-foreground">Contas a pagar e receber</p>
        </div>
        <button type="button" onClick={() => setShowForm(!showForm)} className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancelar" : "Nova Conta"}
        </button>
      </div>

      {/* Summary cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-destructive/10">
            <TrendingDown className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">A Pagar</p>
            <p className="text-xl font-bold text-destructive">R$ {totalPayable.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">A Receber</p>
            <p className="text-xl font-bold text-primary">R$ {totalReceivable.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary">
            <DollarSign className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Saldo</p>
            <p className={`text-xl font-bold ${balance >= 0 ? "text-primary" : "text-destructive"}`}>
              R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-2 text-lg font-semibold text-foreground">Nova Conta</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="fin-type" className="mb-1.5 block text-sm font-medium text-foreground">Tipo *</label>
              <select id="fin-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
                <option value="payable">A Pagar</option>
                <option value="receivable">A Receber</option>
              </select>
            </div>
            <div>
              <label htmlFor="fin-cat" className="mb-1.5 block text-sm font-medium text-foreground">Categoria</label>
              <input id="fin-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} placeholder="Fornecedor, Aluguel..." />
            </div>
          </div>
          <div>
            <label htmlFor="fin-desc" className="mb-1.5 block text-sm font-medium text-foreground">Descricao *</label>
            <input id="fin-desc" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} placeholder="Compra de vinhos importados" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="fin-amount" className="mb-1.5 block text-sm font-medium text-foreground">Valor (R$) *</label>
              <input id="fin-amount" required type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputClass} placeholder="1500.00" />
            </div>
            <div>
              <label htmlFor="fin-due" className="mb-1.5 block text-sm font-medium text-foreground">Vencimento *</label>
              <input id="fin-due" required type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div>
            <label htmlFor="fin-notes" className="mb-1.5 block text-sm font-medium text-foreground">Observacoes</label>
            <textarea id="fin-notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${inputClass} h-auto py-3`} />
          </div>
          <button type="submit" disabled={saving} className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 sm:w-auto sm:px-8">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Registrar Conta"}
          </button>
        </form>
      )}

      {/* Tables */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h3 className="flex items-center gap-2 font-semibold text-foreground">
              <TrendingDown className="h-4 w-4 text-destructive" /> Contas a Pagar
            </h3>
          </div>
          {payable.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Nenhuma conta a pagar</div>
          ) : (
            <div className="divide-y divide-border">
              {payable.map((a: { id: string; description: string; amount: number; due_date: string; status: string; category: string }) => (
                <div key={a.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.description}</p>
                    <p className="text-xs text-muted-foreground">{a.category ? `${a.category} - ` : ""}{new Date(a.due_date).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-destructive">R$ {Number(a.amount).toFixed(2)}</p>
                    <span className={`text-xs ${a.status === "paid" ? "text-primary" : "text-muted-foreground"}`}>
                      {a.status === "paid" ? "Pago" : a.status === "overdue" ? "Vencido" : "Pendente"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h3 className="flex items-center gap-2 font-semibold text-foreground">
              <TrendingUp className="h-4 w-4 text-primary" /> Contas a Receber
            </h3>
          </div>
          {receivable.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Nenhuma conta a receber</div>
          ) : (
            <div className="divide-y divide-border">
              {receivable.map((a: { id: string; description: string; amount: number; due_date: string; status: string; category: string }) => (
                <div key={a.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.description}</p>
                    <p className="text-xs text-muted-foreground">{a.category ? `${a.category} - ` : ""}{new Date(a.due_date).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">R$ {Number(a.amount).toFixed(2)}</p>
                    <span className={`text-xs ${a.status === "received" ? "text-primary" : "text-muted-foreground"}`}>
                      {a.status === "received" ? "Recebido" : a.status === "overdue" ? "Vencido" : "Pendente"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
