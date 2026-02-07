"use client";

import React from "react"

import { useState } from "react";
import { Loader2, Plus, Package, X, Barcode } from "lucide-react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ProdutosPage() {
  const { data, isLoading } = useSWR("/api/dashboard/products", fetcher);
  const { data: catData } = useSWR("/api/dashboard/categories", fetcher);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    original_price: "",
    category_id: "",
    stock_quantity: "0",
    min_stock: "5",
    volume: "",
    alcohol_content: "",
    brand: "",
    barcode: "",
    image_url_1: "",
    image_url_2: "",
  });

  function resetForm() {
    setForm({
      name: "", description: "", price: "", original_price: "",
      category_id: "", stock_quantity: "0", min_stock: "5",
      volume: "", alcohol_content: "", brand: "", barcode: "", image_url_1: "", image_url_2: "",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error("Nome e preco sao obrigatorios");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          original_price: form.original_price ? parseFloat(form.original_price) : null,
          stock_quantity: parseInt(form.stock_quantity) || 0,
          min_stock: parseInt(form.min_stock) || 5,
          category_id: form.category_id || null,
          barcode: form.barcode || null,
        }),
      });
      if (res.ok) {
        toast.success("Produto cadastrado!");
        mutate("/api/dashboard/products");
        resetForm();
        setShowForm(false);
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

  const products = data?.products || [];
  const categories = catData?.categories || [];
  const inputClass =
    "flex h-11 w-full rounded-lg border border-input bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
          <p className="mt-1 text-muted-foreground">
            {products.length} produto{products.length !== 1 ? "s" : ""} cadastrado{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancelar" : "Novo Produto"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Novo Produto</h2>
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="p-name" className="mb-1.5 block text-sm font-medium text-foreground">Nome *</label>
                <input id="p-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Vinho Tinto Reserva" />
              </div>
              <div>
                <label htmlFor="p-brand" className="mb-1.5 block text-sm font-medium text-foreground">Marca</label>
                <input id="p-brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className={inputClass} placeholder="Casillero del Diablo" />
              </div>
              <div>
                <label htmlFor="p-barcode" className="mb-1.5 block text-sm font-medium text-foreground">Codigo de Barras (EAN)</label>
                <div className="relative">
                  <Barcode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input id="p-barcode" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value.replace(/\D/g, "") })} className={`${inputClass} pl-10`} placeholder="7890000000000" maxLength={13} />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="p-desc" className="mb-1.5 block text-sm font-medium text-foreground">Descricao</label>
              <textarea id="p-desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} h-auto py-3`} placeholder="Descricao do produto..." />
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label htmlFor="p-price" className="mb-1.5 block text-sm font-medium text-foreground">Preco (R$) *</label>
                <input id="p-price" required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputClass} placeholder="49.90" />
              </div>
              <div>
                <label htmlFor="p-orig" className="mb-1.5 block text-sm font-medium text-foreground">Preco Original</label>
                <input id="p-orig" type="number" step="0.01" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} className={inputClass} placeholder="69.90" />
              </div>
              <div>
                <label htmlFor="p-stock" className="mb-1.5 block text-sm font-medium text-foreground">Estoque</label>
                <input id="p-stock" type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label htmlFor="p-min" className="mb-1.5 block text-sm font-medium text-foreground">Estoque Min.</label>
                <input id="p-min" type="number" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: e.target.value })} className={inputClass} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="p-cat" className="mb-1.5 block text-sm font-medium text-foreground">Categoria</label>
                <select id="p-cat" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className={inputClass}>
                  <option value="">Sem categoria</option>
                  {categories.map((c: { id: string; name: string }) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="p-vol" className="mb-1.5 block text-sm font-medium text-foreground">Volume (ml)</label>
                <input id="p-vol" value={form.volume} onChange={(e) => setForm({ ...form, volume: e.target.value })} className={inputClass} placeholder="750ml" />
              </div>
              <div>
                <label htmlFor="p-alc" className="mb-1.5 block text-sm font-medium text-foreground">Teor Alcoolico</label>
                <input id="p-alc" value={form.alcohol_content} onChange={(e) => setForm({ ...form, alcohol_content: e.target.value })} className={inputClass} placeholder="13.5%" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="p-img1" className="mb-1.5 block text-sm font-medium text-foreground">URL Imagem 1</label>
                <input id="p-img1" value={form.image_url_1} onChange={(e) => setForm({ ...form, image_url_1: e.target.value })} className={inputClass} placeholder="https://..." />
              </div>
              <div>
                <label htmlFor="p-img2" className="mb-1.5 block text-sm font-medium text-foreground">URL Imagem 2</label>
                <input id="p-img2" value={form.image_url_2} onChange={(e) => setForm({ ...form, image_url_2: e.target.value })} className={inputClass} placeholder="https://..." />
              </div>
            </div>

            <button type="submit" disabled={saving} className="mt-2 flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 sm:w-auto sm:px-8">
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Cadastrar Produto"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
            <Package className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum produto cadastrado</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Produto</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Codigo de Barras</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Categoria</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Preco</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Estoque</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p: { id: string; name: string; category_name: string; price: number; stock_quantity: number; min_stock: number; is_active: boolean; brand: string; barcode: string }) => (
                    <tr key={p.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{p.name}</p>
                        {p.brand && <p className="text-xs text-muted-foreground">{p.brand}</p>}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.barcode || "-"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.category_name || "-"}</td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        R$ {Number(p.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={p.stock_quantity <= p.min_stock ? "font-semibold text-destructive" : "text-foreground"}>
                          {p.stock_quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`rounded-md px-2 py-1 text-xs ${p.is_active ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                          {p.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
