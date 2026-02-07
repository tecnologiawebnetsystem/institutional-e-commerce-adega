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
  Barcode,
  ScanLine,
  Keyboard,
  Volume2,
  Hash,
} from "lucide-react";

/* ── types ──────────────────────────────────────────────── */
interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  brand: string;
  volume: string;
  category_name: string;
  barcode: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CartItem extends Product {
  quantity: number;
}

/* ── helpers ────────────────────────────────────────────── */
const fmt = (v: number) =>
  `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

const beep = () => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1200;
    gain.gain.value = 0.15;
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    /* silent */
  }
};

/* ── component ──────────────────────────────────────────── */
export default function PDVPage() {
  /* state */
  const [search, setSearch] = useState("");
  const [barcodeBuffer, setBarcodeBuffer] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState<{
    orderNumber: string;
    total: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [scanMode, setScanMode] = useState<"barcode" | "search">("barcode");
  const [lastScanned, setLastScanned] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [editingQty, setEditingQty] = useState<string | null>(null);
  const [qtyInput, setQtyInput] = useState("");

  /* refs */
  const barcodeRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  /* ── fetch products ───────────────────────────────────── */
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
        /* silent */
      } finally {
        setLoading(false);
      }
    },
    [],
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

  /* ── barcode scanner logic ────────────────────────────── */
  const lookupBarcode = useCallback(
    async (code: string) => {
      if (!code || code.length < 8) return;
      setLastScanned(code);
      try {
        const res = await fetch(`/api/dashboard/pdv?barcode=${code}`);
        const data = await res.json();
        if (data.product) {
          beep();
          addToCart(data.product);
        } else {
          setLastScanned(`${code} - NAO ENCONTRADO`);
        }
      } catch {
        /* silent */
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /* Listen for scanner input (global keydown when in barcode mode) */
  useEffect(() => {
    if (scanMode !== "barcode") return;
    let buffer = "";
    let timer: ReturnType<typeof setTimeout>;

    const handleKeyDown = (e: KeyboardEvent) => {
      /* ignore if typing in other inputs */
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" &&
        target !== barcodeRef.current
      )
        return;

      if (e.key === "Enter" && buffer.length >= 8) {
        e.preventDefault();
        lookupBarcode(buffer);
        buffer = "";
        setBarcodeBuffer("");
        if (barcodeRef.current) barcodeRef.current.value = "";
        return;
      }

      if (/^\d$/.test(e.key)) {
        buffer += e.key;
        setBarcodeBuffer(buffer);
        clearTimeout(timer);
        timer = setTimeout(() => {
          buffer = "";
          setBarcodeBuffer("");
        }, 200);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [scanMode, lookupBarcode]);

  /* ── keyboard shortcuts ───────────────────────────────── */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (showSuccess) return;
      switch (e.key) {
        case "F2":
          e.preventDefault();
          setScanMode("search");
          setTimeout(() => searchRef.current?.focus(), 50);
          break;
        case "F3":
          e.preventDefault();
          setScanMode("barcode");
          setTimeout(() => barcodeRef.current?.focus(), 50);
          break;
        case "F4":
          e.preventDefault();
          document.getElementById("pdv-discount")?.focus();
          break;
        case "F8":
          e.preventDefault();
          document.getElementById("pdv-customer")?.focus();
          break;
        case "F12":
          e.preventDefault();
          if (cart.length > 0 && paymentMethod) finalizeSale();
          break;
        case "Escape":
          e.preventDefault();
          if (editingQty) {
            setEditingQty(null);
          } else {
            setScanMode("barcode");
            setTimeout(() => barcodeRef.current?.focus(), 50);
          }
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, paymentMethod, showSuccess, editingQty]);

  /* ── cart management ──────────────────────────────────── */
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) return prev;
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== productId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.stock_quantity) return item;
          return { ...item, quantity: newQty };
        })
        .filter(Boolean) as CartItem[],
    );
  };

  const setCartQty = (productId: string, qty: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== productId) return item;
          if (qty <= 0) return null;
          if (qty > item.stock_quantity) return { ...item, quantity: item.stock_quantity };
          return { ...item, quantity: qty };
        })
        .filter(Boolean) as CartItem[],
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const total = Math.max(subtotal - discount, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  /* ── finalize sale ────────────────────────────────────── */
  const finalizeSale = async () => {
    if (cart.length === 0 || !paymentMethod) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/pdv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({
            id: i.id,
            name: i.name,
            price: Number(i.price),
            quantity: i.quantity,
          })),
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
      /* silent */
    } finally {
      setSubmitting(false);
    }
  };

  const newSale = () => {
    setShowSuccess(false);
    setLastOrder(null);
    setSearch("");
    setSelectedCategory("");
    setLastScanned("");
    setScanMode("barcode");
    setTimeout(() => barcodeRef.current?.focus(), 100);
  };

  /* ── success overlay ──────────────────────────────────── */
  if (showSuccess && lastOrder) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-card-foreground">
            Venda Finalizada!
          </h2>
          <p className="mt-2 font-mono text-lg text-muted-foreground">
            {lastOrder.orderNumber}
          </p>
          <p className="mt-4 text-4xl font-bold text-primary">
            {fmt(lastOrder.total)}
          </p>
          <button
            onClick={newSale}
            className="mt-8 w-full rounded-lg bg-primary py-4 text-sm font-bold text-primary-foreground hover:bg-primary/90"
          >
            Nova Venda (ESC)
          </button>
        </div>
      </div>
    );
  }

  /* ── main render ──────────────────────────────────────── */
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-3 overflow-hidden lg:flex-row">
      {/* ─── LEFT: products ─────────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Header row */}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <ReceiptText className="h-5 w-5 text-primary" />
            PDV - Caixa
          </h1>

          {/* Mode toggle */}
          <div className="ml-auto flex rounded-lg border border-border">
            <button
              onClick={() => {
                setScanMode("barcode");
                setTimeout(() => barcodeRef.current?.focus(), 50);
              }}
              className={`flex items-center gap-1.5 rounded-l-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                scanMode === "barcode"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ScanLine className="h-3.5 w-3.5" />
              Leitor
            </button>
            <button
              onClick={() => {
                setScanMode("search");
                setTimeout(() => searchRef.current?.focus(), 50);
              }}
              className={`flex items-center gap-1.5 rounded-r-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                scanMode === "search"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              Busca
            </button>
          </div>

          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Keyboard className="h-3.5 w-3.5" />
            Atalhos
          </button>
        </div>

        {/* Shortcut bar */}
        {showShortcuts && (
          <div className="mt-2 flex flex-wrap gap-2 rounded-lg border border-border bg-card/50 p-2.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-foreground">F2</kbd> Buscar
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-foreground">F3</kbd> Leitor
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-foreground">F4</kbd> Desconto
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-foreground">F8</kbd> Cliente
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-foreground">F12</kbd> Finalizar
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-foreground">ESC</kbd> Voltar ao leitor
            </span>
          </div>
        )}

        {/* Barcode input */}
        {scanMode === "barcode" && (
          <div className="mt-3">
            <div className="relative">
              <Barcode className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
              <input
                ref={barcodeRef}
                type="text"
                inputMode="numeric"
                value={barcodeBuffer}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setBarcodeBuffer(val);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && barcodeBuffer.length >= 8) {
                    lookupBarcode(barcodeBuffer);
                    setBarcodeBuffer("");
                  }
                }}
                placeholder="Bipe o codigo de barras ou digite o EAN..."
                className="h-14 w-full rounded-xl border-2 border-primary/40 bg-card pl-12 pr-4 font-mono text-lg text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <ScanLine className="h-5 w-5 animate-pulse text-primary/50" />
              </div>
            </div>
            {lastScanned && (
              <div className="mt-1.5 flex items-center gap-2 text-xs">
                <Volume2 className="h-3 w-3 text-green-500" />
                <span className="text-muted-foreground">
                  Ultimo: <span className="font-mono text-foreground">{lastScanned}</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Text search input */}
        {scanMode === "search" && (
          <div className="mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, marca ou codigo de barras..."
                className="h-12 w-full rounded-xl border border-border bg-card pl-12 pr-10 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
          </div>
        )}

        {/* Category filter */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCategory("")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
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
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === cat.id ? "" : cat.id,
                )
              }
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="mt-2 flex-1 overflow-y-auto rounded-xl border border-border bg-card/50 p-2">
          {loading ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              Buscando produtos...
            </div>
          ) : products.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-sm text-muted-foreground">
              <Search className="mb-2 h-6 w-6 opacity-30" />
              Nenhum produto encontrado
            </div>
          ) : (
            <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {products.map((product) => {
                const inCart = cart.find((i) => i.id === product.id);
                return (
                  <button
                    key={product.id}
                    onClick={() => {
                      beep();
                      addToCart(product);
                    }}
                    className={`group flex flex-col items-start rounded-lg border p-2.5 text-left transition-all hover:border-primary/40 hover:bg-primary/5 ${
                      inCart
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-card-foreground">
                          {product.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {product.brand}
                          {product.volume ? ` - ${product.volume}` : ""}
                        </p>
                      </div>
                      {inCart && (
                        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
                          {inCart.quantity}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex w-full items-center justify-between">
                      <span className="text-sm font-bold text-primary">
                        {fmt(Number(product.price))}
                      </span>
                      <div className="flex items-center gap-2">
                        {product.barcode && (
                          <span className="font-mono text-[10px] text-muted-foreground/60">
                            {product.barcode}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Est: {product.stock_quantity}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── RIGHT: Cart ────────────────────────────────── */}
      <div className="flex w-full flex-col rounded-xl border border-border bg-card lg:w-[420px]">
        {/* Cart header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-card-foreground">
              Venda Atual
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {itemCount} {itemCount === 1 ? "item" : "itens"}
            </span>
            {cart.length > 0 && (
              <button
                onClick={() => {
                  setCart([]);
                  setDiscount(0);
                }}
                className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Limpar carrinho"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-2">
          {cart.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-center text-muted-foreground">
              <ScanLine className="mb-2 h-10 w-10 opacity-20" />
              <p className="text-sm font-medium">Aguardando leitura...</p>
              <p className="text-xs">
                Bipe um produto ou clique para adicionar
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {cart.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background p-2"
                >
                  {/* Index number */}
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-secondary text-xs font-bold text-muted-foreground">
                    {idx + 1}
                  </span>

                  {/* Product info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{fmt(Number(item.price))} un.</span>
                      {item.barcode && (
                        <span className="font-mono text-[10px]">
                          {item.barcode}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateCartQty(item.id, -1)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    >
                      <Minus className="h-3 w-3" />
                    </button>

                    {editingQty === item.id ? (
                      <input
                        type="number"
                        min="1"
                        max={item.stock_quantity}
                        value={qtyInput}
                        onChange={(e) => setQtyInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const qty = parseInt(qtyInput);
                            if (qty > 0) setCartQty(item.id, qty);
                            setEditingQty(null);
                          }
                          if (e.key === "Escape") setEditingQty(null);
                        }}
                        onBlur={() => {
                          const qty = parseInt(qtyInput);
                          if (qty > 0) setCartQty(item.id, qty);
                          setEditingQty(null);
                        }}
                        className="h-7 w-12 rounded-md border border-primary bg-background text-center text-sm font-semibold text-foreground focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => {
                          setEditingQty(item.id);
                          setQtyInput(String(item.quantity));
                        }}
                        className="flex h-7 w-10 items-center justify-center rounded-md border border-border text-sm font-semibold text-foreground hover:border-primary"
                        title="Clique para digitar quantidade"
                      >
                        {item.quantity}
                      </button>
                    )}

                    <button
                      onClick={() => updateCartQty(item.id, 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Total + delete */}
                  <div className="flex items-center gap-1.5">
                    <span className="min-w-16 text-right text-sm font-bold text-primary">
                      {fmt(Number(item.price) * item.quantity)}
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

        {/* ─── Sale footer ──────────────────────────────── */}
        <div className="border-t border-border p-3">
          {/* Customer + discount */}
          <div className="mb-3 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <User className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <input
                id="pdv-customer"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Cliente"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <Tag className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <input
                id="pdv-discount"
                type="number"
                min="0"
                step="0.01"
                value={discount || ""}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                placeholder="Desconto (R$)"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>

          {/* Totals */}
          <div className="mb-3 space-y-0.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal ({itemCount} itens)</span>
              <span>{fmt(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-500">
                <span>Desconto</span>
                <span>- {fmt(discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 text-xl font-bold text-card-foreground">
              <span>TOTAL</span>
              <span className="text-primary">{fmt(total)}</span>
            </div>
          </div>

          {/* Payment method */}
          <div className="mb-3">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Pagamento
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { key: "dinheiro", label: "Dinheiro", icon: Banknote },
                { key: "debito", label: "Debito", icon: CreditCard },
                { key: "credito", label: "Credito", icon: CreditCard },
                { key: "pix", label: "PIX", icon: QrCode },
              ].map((method) => (
                <button
                  key={method.key}
                  onClick={() => setPaymentMethod(method.key)}
                  className={`flex flex-col items-center gap-1 rounded-lg border py-2 text-[11px] font-medium transition-all ${
                    paymentMethod === method.key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  <method.icon className="h-4 w-4" />
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {/* Finalize */}
          <button
            onClick={finalizeSale}
            disabled={cart.length === 0 || !paymentMethod || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle className="h-5 w-5" />
            {submitting ? "Finalizando..." : "Finalizar Venda (F12)"}
          </button>
        </div>
      </div>
    </div>
  );
}
