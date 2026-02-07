"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle,
  X,
  Tag,
  User,
  ReceiptText,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  brand: string;
  volume: string;
  category_name: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function PDVPage() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState<{ orderNumber: string; total: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchProducts = useCallback(
    async (q: string, catId: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (catId) params.set("category", catId);
        const res = await fetch(`/api/dashboard/pdv?${params}`);
        const data = await res.json();
        setProducts(data.products || []);
        if (data.categories) setCategories(data.categories);
      } catch {
        console.error("Erro ao buscar produtos");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchProducts("", "");
  }, [fetchProducts]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchProducts(search, selectedCategory);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, selectedCategory, fetchProducts]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) return prev;
        return prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id !== productId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.stock_quantity) return item;
          return { ...item, quantity: newQty };
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = Math.max(subtotal - discount, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const finalizeSale = async () => {
    if (cart.length === 0 || !paymentMethod) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/pdv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
          paymentMethod,
          customerName: customerName || undefined,
          discount: discount || 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLastOrder({ orderNumber: data.orderNumber, total: data.total });
        setShowSuccess(true);
        setCart([]);
        setDiscount(0);
        setCustomerName("");
        setPaymentMethod("");
        fetchProducts(search, selectedCategory);
      }
    } catch {
      console.error("Erro ao finalizar venda");
    } finally {
      setSubmitting(false);
    }
  };

  const newSale = () => {
    setShowSuccess(false);
    setLastOrder(null);
    setSearch("");
    setSelectedCategory("");
    searchRef.current?.focus();
  };

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  // Success overlay
  if (showSuccess && lastOrder) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-card-foreground">Venda Finalizada!</h2>
          <p className="mt-2 font-mono text-lg text-muted-foreground">{lastOrder.orderNumber}</p>
          <p className="mt-4 text-3xl font-bold text-primary">{formatCurrency(lastOrder.total)}</p>
          <button
            onClick={newSale}
            className="mt-8 w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Nova Venda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 overflow-hidden lg:flex-row">
      {/* LEFT: Product search and list */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-col gap-3">
          <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <ReceiptText className="h-5 w-5 text-primary" />
            PDV - Ponto de Venda
          </h1>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto por nome ou marca..."
              className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                !selectedCategory
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? "" : cat.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products grid */}
        <div className="mt-3 flex-1 overflow-y-auto rounded-xl border border-border bg-card/50 p-3">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              Buscando produtos...
            </div>
          ) : products.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              Nenhum produto encontrado
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => {
                const inCart = cart.find((i) => i.id === product.id);
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className={`group flex flex-col items-start rounded-lg border p-3 text-left transition-all hover:border-primary/40 hover:bg-primary/5 ${
                      inCart ? "border-primary/30 bg-primary/5" : "border-border bg-card"
                    }`}
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-card-foreground">{product.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {product.brand} {product.volume ? `- ${product.volume}` : ""}
                        </p>
                      </div>
                      {inCart && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
                          {inCart.quantity}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex w-full items-center justify-between">
                      <span className="text-sm font-bold text-primary">{formatCurrency(Number(product.price))}</span>
                      <span className="text-xs text-muted-foreground">Est: {product.stock_quantity}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Cart / Sale summary */}
      <div className="flex w-full flex-col rounded-xl border border-border bg-card lg:w-96">
        {/* Cart header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-card-foreground">Venda Atual</span>
          </div>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {itemCount} {itemCount === 1 ? "item" : "itens"}
          </span>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-3">
          {cart.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-center text-muted-foreground">
              <ShoppingCart className="mb-2 h-8 w-8 opacity-30" />
              <p className="text-sm">Nenhum item adicionado</p>
              <p className="text-xs">Clique em um produto para adicionar</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background p-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(Number(item.price))} un.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateCartQty(item.id, -1)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-foreground">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQty(item.id, 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="min-w-16 text-right text-sm font-bold text-primary">
                      {formatCurrency(Number(item.price) * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sale footer */}
        <div className="border-t border-border p-4">
          {/* Customer name (optional) */}
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nome do cliente (opcional)"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          {/* Discount */}
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <input
              type="number"
              min="0"
              step="0.01"
              value={discount || ""}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              placeholder="Desconto (R$)"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          {/* Totals */}
          <div className="mb-4 space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-500">
                <span>Desconto</span>
                <span>- {formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 text-lg font-bold text-card-foreground">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Payment method */}
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Forma de Pagamento
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "dinheiro", label: "Dinheiro", icon: Banknote },
                { key: "cartao", label: "Cartao", icon: CreditCard },
                { key: "pix", label: "PIX", icon: QrCode },
              ].map((method) => (
                <button
                  key={method.key}
                  onClick={() => setPaymentMethod(method.key)}
                  className={`flex flex-col items-center gap-1 rounded-lg border py-2.5 text-xs font-medium transition-all ${
                    paymentMethod === method.key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  <method.icon className="h-5 w-5" />
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {/* Finalize button */}
          <button
            onClick={finalizeSale}
            disabled={cart.length === 0 || !paymentMethod || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4" />
            {submitting ? "Finalizando..." : "Finalizar Venda"}
          </button>
        </div>
      </div>
    </div>
  );
}
