"use client";

import React from "react";
import { useState } from "react";
import {
  Loader2, Plus, Package, X, Barcode, Pencil, Trash2, Search,
  ChevronDown, ChevronUp, Wine, Grape, Thermometer, Weight, FileText,
  Truck, Copy, Download, ToggleLeft, ToggleRight, Upload, Image as ImageIcon,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const PACKAGING_OPTIONS = [
  "Garrafa 750ml", "Garrafa 1L", "Garrafa 375ml", "Garrafa 187ml",
  "Lata 269ml", "Lata 350ml", "Lata 473ml", "Lata 550ml",
  "Long Neck 275ml", "Long Neck 330ml", "Long Neck 355ml",
  "Garrafa 600ml", "Garrafa 2L",
  "Bag-in-Box 3L", "Bag-in-Box 5L",
  "Barril 5L", "Barril 30L", "Barril 50L",
  "Tetra Pak 1L", "Pet 2L", "Outro",
];

const emptyForm = {
  name: "", description: "", price: "", original_price: "", cost_price: "",
  category_id: "", stock_quantity: "0", min_stock: "5",
  volume: "", alcohol_content: "", brand: "", barcode: "",
  ncm: "", supplier: "", packaging: "", origin_country: "", origin_region: "",
  grape_type: "", vintage: "", serving_temp: "", weight_grams: "",
  image_url_1: "", image_url_2: "",
};

type FormState = typeof emptyForm;

interface Product {
  id: string; name: string; description: string; category_name: string; category_id: string;
  price: number; original_price: number; cost_price: number;
  stock_quantity: number; min_stock: number; is_active: boolean;
  brand: string; barcode: string; volume: string; alcohol_content: string;
  ncm: string; supplier: string; packaging: string;
  origin_country: string; origin_region: string; grape_type: string;
  vintage: string; serving_temp: string; weight_grams: number;
  image_url_1: string; image_url_2: string;
}

export default function ProdutosPage() {
  const { data, isLoading } = useSWR("/api/dashboard/products", fetcher);
  const { data: catData } = useSWR("/api/dashboard/categories", fetcher);
  const [showForm, setShowForm] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [form, setForm] = useState<FormState>({ ...emptyForm });
  const [uploading, setUploading] = useState<1 | 2 | null>(null);

  function resetForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowAdvanced(false);
  }

  function startEdit(p: Product) {
    setForm({
      name: p.name || "", description: p.description || "",
      price: p.price?.toString() || "", original_price: p.original_price?.toString() || "",
      cost_price: p.cost_price?.toString() || "", category_id: p.category_id || "",
      stock_quantity: p.stock_quantity?.toString() || "0", min_stock: p.min_stock?.toString() || "5",
      volume: p.volume || "", alcohol_content: p.alcohol_content || "",
      brand: p.brand || "", barcode: p.barcode || "",
      ncm: p.ncm || "", supplier: p.supplier || "",
      packaging: p.packaging || "", origin_country: p.origin_country || "",
      origin_region: p.origin_region || "", grape_type: p.grape_type || "",
      vintage: p.vintage || "", serving_temp: p.serving_temp || "",
      weight_grams: p.weight_grams?.toString() || "",
      image_url_1: p.image_url_1 || "", image_url_2: p.image_url_2 || "",
    });
    setEditingId(p.id);
    setShowForm(true);
    setShowAdvanced(true);
  }

  function duplicateProduct(p: Product) {
    setForm({
      name: `${p.name} (copia)`, description: p.description || "",
      price: p.price?.toString() || "", original_price: p.original_price?.toString() || "",
      cost_price: p.cost_price?.toString() || "", category_id: p.category_id || "",
      stock_quantity: "0", min_stock: p.min_stock?.toString() || "5",
      volume: p.volume || "", alcohol_content: p.alcohol_content || "",
      brand: p.brand || "", barcode: "",
      ncm: p.ncm || "", supplier: p.supplier || "",
      packaging: p.packaging || "", origin_country: p.origin_country || "",
      origin_region: p.origin_region || "", grape_type: p.grape_type || "",
      vintage: p.vintage || "", serving_temp: p.serving_temp || "",
      weight_grams: p.weight_grams?.toString() || "",
      image_url_1: p.image_url_1 || "", image_url_2: p.image_url_2 || "",
    });
    setEditingId(null);
    setShowForm(true);
    setShowAdvanced(true);
    toast.success("Produto duplicado. Ajuste os dados e salve.");
  }

  async function toggleActive(p: Product) {
    setTogglingId(p.id);
    try {
      const res = await fetch("/api/dashboard/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, name: p.name, price: p.price, toggleActive: !p.is_active }),
      });
      if (res.ok) {
        toast.success(p.is_active ? "Produto desativado!" : "Produto ativado!");
        mutate("/api/dashboard/products");
      } else {
        const d = await res.json();
        toast.error(d.error || "Erro");
      }
    } catch { toast.error("Erro de conexao"); }
    finally { setTogglingId(null); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/dashboard/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success("Produto excluido!");
        mutate("/api/dashboard/products");
      } else {
        const d = await res.json();
        toast.error(d.error || "Erro ao excluir");
      }
    } catch { toast.error("Erro de conexao"); }
    finally { setDeletingId(null); }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Imagem deve ter no maximo 5MB"); return; }
    setUploading(slot);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setForm({ ...form, [`image_url_${slot}`]: data.url });
        toast.success("Imagem enviada!");
      } else {
        toast.error(data.error || "Erro no upload");
      }
    } catch { toast.error("Erro de conexao"); }
    finally { setUploading(null); }
  }

  function exportCSV() {
    const products: Product[] = data?.products || [];
    const headers = ["Nome", "Marca", "Codigo Barras", "Categoria", "Preco Custo", "Preco Venda", "Preco Original", "Estoque", "Estoque Min", "Volume", "Teor", "Embalagem", "Pais", "Regiao", "Uva", "Safra", "Temp Servico", "NCM", "Fornecedor", "Peso (g)", "Ativo"];
    const rows = products.map(p => [
      p.name, p.brand, p.barcode, p.category_name, p.cost_price, p.price, p.original_price,
      p.stock_quantity, p.min_stock, p.volume, p.alcohol_content, p.packaging,
      p.origin_country, p.origin_region, p.grape_type, p.vintage, p.serving_temp,
      p.ncm, p.supplier, p.weight_grams, p.is_active ? "Sim" : "Nao",
    ].map(v => `"${(v ?? "").toString().replace(/"/g, '""')}"`).join(","));

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `produtos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success("CSV exportado!");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.price) { toast.error("Nome e preco sao obrigatorios"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        cost_price: form.cost_price ? parseFloat(form.cost_price) : null,
        stock_quantity: parseInt(form.stock_quantity) || 0,
        min_stock: parseInt(form.min_stock) || 5,
        category_id: form.category_id || null,
        barcode: form.barcode || null,
        weight_grams: form.weight_grams ? parseInt(form.weight_grams) : null,
        ...(editingId ? { id: editingId } : {}),
      };
      const res = await fetch("/api/dashboard/products", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(editingId ? "Produto atualizado!" : "Produto cadastrado!");
        mutate("/api/dashboard/products");
        resetForm();
        setShowForm(false);
      } else {
        const d = await res.json();
        toast.error(d.error || "Erro ao salvar");
      }
    } catch { toast.error("Erro de conexao"); }
    finally { setSaving(false); }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const products: Product[] = data?.products || [];
  const categories = catData?.categories || [];
  const filtered = products.filter((p) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.brand?.toLowerCase().includes(q) && !p.barcode?.includes(searchQuery)) return false;
    }
    if (filterCategory && p.category_id !== filterCategory) return false;
    if (filterStatus === "active" && !p.is_active) return false;
    if (filterStatus === "inactive" && p.is_active) return false;
    return true;
  });

  const totalStockValue = products.reduce((s, p) => s + (Number(p.price) * p.stock_quantity), 0);
  const lowStockCount = products.filter(p => p.is_active && p.stock_quantity <= p.min_stock).length;
  const activeCount = products.filter(p => p.is_active).length;

  const inputClass = "flex h-11 w-full rounded-lg border border-input bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary";
  const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
          <p className="mt-1 text-muted-foreground">
            {products.length} produto{products.length !== 1 ? "s" : ""} | {activeCount} ativo{activeCount !== 1 ? "s" : ""} | {lowStockCount > 0 ? <span className="text-destructive">{lowStockCount} estoque baixo</span> : "Estoque OK"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={exportCSV} className="flex h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground hover:text-foreground">
            <Download className="h-4 w-4" /> Exportar CSV
          </button>
          <button type="button"
            onClick={() => { if (showForm) { resetForm(); setShowForm(false); } else { resetForm(); setShowForm(true); } }}
            className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancelar" : "Novo Produto"}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Total Produtos</p>
          <p className="text-xl font-bold text-foreground">{products.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Ativos</p>
          <p className="text-xl font-bold text-primary">{activeCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Estoque Baixo</p>
          <p className={`text-xl font-bold ${lowStockCount > 0 ? "text-destructive" : "text-foreground"}`}>{lowStockCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Valor em Estoque</p>
          <p className="text-xl font-bold text-foreground">R$ {totalStockValue.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
        </div>
      </div>

      {/* ---------- FORM ---------- */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-5 text-lg font-semibold text-foreground">
            {editingId ? "Editar Produto" : "Novo Produto"}
          </h2>
          <div className="flex flex-col gap-5">
            {/* Row 1: Name, Brand, Barcode */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="p-name" className={labelClass}>Nome *</label>
                <input id="p-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Vinho Tinto Reserva" />
              </div>
              <div>
                <label htmlFor="p-brand" className={labelClass}>Marca</label>
                <input id="p-brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className={inputClass} placeholder="Casillero del Diablo" />
              </div>
              <div>
                <label htmlFor="p-barcode" className={labelClass}>Codigo de Barras (EAN)</label>
                <div className="relative">
                  <Barcode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input id="p-barcode" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value.replace(/\D/g, "") })} className={`${inputClass} pl-10`} placeholder="7890000000000" maxLength={13} />
                </div>
              </div>
            </div>

            {/* Row 2: Description */}
            <div>
              <label htmlFor="p-desc" className={labelClass}>Descricao</label>
              <textarea id="p-desc" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} h-auto py-3`} placeholder="Descricao do produto..." />
            </div>

            {/* Row 3: Prices */}
            <div className="grid gap-4 sm:grid-cols-5">
              <div>
                <label htmlFor="p-cost" className={labelClass}>Preco Custo (R$)</label>
                <input id="p-cost" type="number" step="0.01" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} className={inputClass} placeholder="25.00" />
              </div>
              <div>
                <label htmlFor="p-price" className={labelClass}>Preco Venda (R$) *</label>
                <input id="p-price" required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputClass} placeholder="49.90" />
              </div>
              <div>
                <label htmlFor="p-orig" className={labelClass}>Preco Original</label>
                <input id="p-orig" type="number" step="0.01" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} className={inputClass} placeholder="69.90" />
              </div>
              <div>
                <label htmlFor="p-stock" className={labelClass}>Estoque</label>
                <input id="p-stock" type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label htmlFor="p-min" className={labelClass}>Estoque Min.</label>
                <input id="p-min" type="number" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: e.target.value })} className={inputClass} />
              </div>
            </div>

            {/* Margin display */}
            {form.cost_price && form.price && parseFloat(form.cost_price) > 0 && (
              <div className="rounded-lg bg-secondary/50 px-4 py-2.5 text-sm">
                <span className="text-muted-foreground">Margem de lucro: </span>
                <span className={`font-bold ${((parseFloat(form.price) - parseFloat(form.cost_price)) / parseFloat(form.cost_price)) * 100 > 30 ? "text-green-400" : "text-amber-400"}`}>
                  {(((parseFloat(form.price) - parseFloat(form.cost_price)) / parseFloat(form.cost_price)) * 100).toFixed(1)}%
                </span>
                <span className="ml-3 text-muted-foreground">Lucro: </span>
                <span className="font-semibold text-foreground">
                  R$ {(parseFloat(form.price) - parseFloat(form.cost_price)).toFixed(2)}
                </span>
              </div>
            )}

            {/* Row: Category, Volume, Alcohol, Packaging */}
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label htmlFor="p-cat" className={labelClass}>Categoria</label>
                <select id="p-cat" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className={inputClass}>
                  <option value="">Sem categoria</option>
                  {categories.map((c: { id: string; name: string }) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="p-vol" className={labelClass}>Volume</label>
                <input id="p-vol" value={form.volume} onChange={(e) => setForm({ ...form, volume: e.target.value })} className={inputClass} placeholder="750ml" />
              </div>
              <div>
                <label htmlFor="p-alc" className={labelClass}>Teor Alcoolico</label>
                <input id="p-alc" value={form.alcohol_content} onChange={(e) => setForm({ ...form, alcohol_content: e.target.value })} className={inputClass} placeholder="13.5%" />
              </div>
              <div>
                <label htmlFor="p-pkg" className={labelClass}>Embalagem</label>
                <select id="p-pkg" value={form.packaging} onChange={(e) => setForm({ ...form, packaging: e.target.value })} className={inputClass}>
                  <option value="">Selecione</option>
                  {PACKAGING_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image Upload */}
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2].map((slot) => {
                const key = `image_url_${slot}` as keyof FormState;
                return (
                  <div key={slot}>
                    <label className={labelClass}>Imagem {slot}</label>
                    <div className="flex gap-2">
                      <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={`${inputClass} flex-1`} placeholder="URL da imagem ou faca upload..." />
                      <label className={`flex h-11 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 text-sm text-muted-foreground hover:border-primary hover:text-foreground ${uploading === slot ? "opacity-50" : ""}`}>
                        {uploading === slot ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, slot as 1 | 2)} disabled={uploading !== null} />
                      </label>
                    </div>
                    {form[key] && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-12 w-12 overflow-hidden rounded-lg border border-border bg-secondary">
                          <img src={form[key]} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        </div>
                        <button type="button" onClick={() => setForm({ ...form, [key]: "" })} className="text-xs text-destructive hover:underline">Remover</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Advanced Toggle */}
            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showAdvanced ? "Ocultar campos avancados" : "Mostrar campos avancados (vinho, fiscal, logistica)"}
            </button>

            {showAdvanced && (
              <>
                {/* Wine Details */}
                <div className="rounded-xl border border-border bg-secondary/30 p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Wine className="h-4 w-4 text-primary" />
                    Detalhes do Vinho / Bebida
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-4">
                    <div>
                      <label htmlFor="p-country" className={labelClass}>Pais de Origem</label>
                      <input id="p-country" value={form.origin_country} onChange={(e) => setForm({ ...form, origin_country: e.target.value })} className={inputClass} placeholder="Chile" />
                    </div>
                    <div>
                      <label htmlFor="p-region" className={labelClass}>Regiao</label>
                      <input id="p-region" value={form.origin_region} onChange={(e) => setForm({ ...form, origin_region: e.target.value })} className={inputClass} placeholder="Vale Central" />
                    </div>
                    <div>
                      <label htmlFor="p-grape" className={labelClass}>
                        <span className="flex items-center gap-1"><Grape className="h-3.5 w-3.5" /> Tipo de Uva</span>
                      </label>
                      <input id="p-grape" value={form.grape_type} onChange={(e) => setForm({ ...form, grape_type: e.target.value })} className={inputClass} placeholder="Cabernet Sauvignon" />
                    </div>
                    <div>
                      <label htmlFor="p-vintage" className={labelClass}>Safra / Ano</label>
                      <input id="p-vintage" value={form.vintage} onChange={(e) => setForm({ ...form, vintage: e.target.value })} className={inputClass} placeholder="2022" maxLength={4} />
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="p-temp" className={labelClass}>
                        <span className="flex items-center gap-1"><Thermometer className="h-3.5 w-3.5" /> Temperatura Ideal</span>
                      </label>
                      <input id="p-temp" value={form.serving_temp} onChange={(e) => setForm({ ...form, serving_temp: e.target.value })} className={inputClass} placeholder="16-18 C" />
                    </div>
                    <div>
                      <label className={labelClass}>Harmonizacao</label>
                      <input disabled className={`${inputClass} opacity-50`} placeholder="Em breve..." />
                    </div>
                  </div>
                </div>

                {/* Fiscal & Logistics */}
                <div className="rounded-xl border border-border bg-secondary/30 p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <FileText className="h-4 w-4 text-primary" />
                    Fiscal e Logistica
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label htmlFor="p-ncm" className={labelClass}>NCM</label>
                      <input id="p-ncm" value={form.ncm} onChange={(e) => setForm({ ...form, ncm: e.target.value.replace(/\D/g, "") })} className={inputClass} placeholder="22042100" maxLength={8} />
                    </div>
                    <div>
                      <label htmlFor="p-supplier" className={labelClass}>
                        <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Fornecedor</span>
                      </label>
                      <input id="p-supplier" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className={inputClass} placeholder="Distribuidora ABC" />
                    </div>
                    <div>
                      <label htmlFor="p-weight" className={labelClass}>
                        <span className="flex items-center gap-1"><Weight className="h-3.5 w-3.5" /> Peso (gramas)</span>
                      </label>
                      <input id="p-weight" type="number" value={form.weight_grams} onChange={(e) => setForm({ ...form, weight_grams: e.target.value })} className={inputClass} placeholder="1200" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Submit */}
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : editingId ? "Salvar Alteracoes" : "Cadastrar Produto"}
              </button>
              {editingId && (
                <button type="button" onClick={() => { resetForm(); setShowForm(false); }} className="flex h-11 items-center rounded-lg border border-border bg-transparent px-6 text-sm font-medium text-muted-foreground hover:bg-secondary">
                  Cancelar Edicao
                </button>
              )}
            </div>
          </div>
        </form>
      )}

      {/* ---------- SEARCH & FILTERS ---------- */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className={`${inputClass} pl-10`} placeholder="Buscar por nome, marca ou codigo de barras..." />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="h-11 rounded-lg border border-input bg-secondary px-3 text-sm text-foreground">
            <option value="">Todas categorias</option>
            {categories.map((c: { id: string; name: string }) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
            className="h-11 rounded-lg border border-input bg-secondary px-3 text-sm text-foreground">
            <option value="all">Todos status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ---------- TABLE ---------- */}
      <div className="mt-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
            <Package className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">{searchQuery || filterCategory || filterStatus !== "all" ? "Nenhum produto encontrado com esses filtros" : "Nenhum produto cadastrado"}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Produto</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Cod. Barras</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Categoria</th>
                    <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground md:table-cell">Custo</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Venda</th>
                    <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground md:table-cell">Margem</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Estoque</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const margin = p.cost_price ? (((p.price - p.cost_price) / p.cost_price) * 100) : null;
                    return (
                      <tr key={p.id} className={`border-b border-border last:border-0 hover:bg-secondary/30 ${!p.is_active ? "opacity-50" : ""}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {p.image_url_1 ? (
                              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-border">
                                <img src={p.image_url_1} alt="" className="h-full w-full object-cover" />
                              </div>
                            ) : (
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-secondary">
                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-foreground">{p.name}</p>
                              <div className="flex flex-wrap gap-1.5 mt-0.5">
                                {p.brand && <span className="text-xs text-muted-foreground">{p.brand}</span>}
                                {p.packaging && <span className="text-xs text-muted-foreground/60">| {p.packaging}</span>}
                                {p.origin_country && <span className="text-xs text-muted-foreground/60">| {p.origin_country}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground sm:table-cell">{p.barcode || "-"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{p.category_name || "-"}</td>
                        <td className="hidden px-4 py-3 text-right text-xs text-muted-foreground md:table-cell">
                          {p.cost_price ? `R$ ${Number(p.cost_price).toFixed(2)}` : "-"}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-foreground">
                          R$ {Number(p.price).toFixed(2)}
                        </td>
                        <td className="hidden px-4 py-3 text-right md:table-cell">
                          {margin !== null ? (
                            <span className={`text-xs font-semibold ${margin > 30 ? "text-green-400" : margin > 15 ? "text-amber-400" : "text-red-400"}`}>
                              {margin.toFixed(1)}%
                            </span>
                          ) : "-"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={p.stock_quantity <= p.min_stock ? "font-semibold text-destructive" : "text-foreground"}>
                            {p.stock_quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button type="button" onClick={() => toggleActive(p)} disabled={togglingId === p.id}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors disabled:opacity-50 hover:bg-secondary"
                            title={p.is_active ? "Clique para desativar" : "Clique para ativar"}>
                            {togglingId === p.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : p.is_active ? (
                              <ToggleRight className="h-4 w-4 text-primary" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className={p.is_active ? "text-primary" : "text-muted-foreground"}>
                              {p.is_active ? "Ativo" : "Inativo"}
                            </span>
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-0.5">
                            <button type="button" onClick={() => startEdit(p)}
                              className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" title="Editar">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => duplicateProduct(p)}
                              className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" title="Duplicar">
                              <Copy className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}
                              className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50" title="Excluir">
                              {deletingId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
