"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, QrCode,
  CheckCircle, X, Tag, User, ReceiptText, Barcode, ScanLine, Keyboard,
  Volume2, Hash, Printer, DollarSign, ArrowDownUp, ClipboardList,
  Lock, Unlock, FileText, Clock, Percent, MessageSquare, XCircle, RotateCcw,
  Wallet, UserSearch,
} from "lucide-react";
import { toast } from "sonner";

/* -- types ------------------------------------------------- */
interface Product {
  id: string; name: string; price: number; stock_quantity: number;
  brand: string; volume: string; category_name: string; barcode: string | null;
}
interface Category { id: string; name: string; slug: string; }
interface CartItem extends Product { quantity: number; itemDiscount: number; }
interface CashRegister { id: string; opened_at: string; opening_balance: number; status: string; }
interface DailySale {
  order_number: string; total: number; payment_method: string;
  customer_name: string; created_at: string; items_count: number;
  order_id: string; status: string;
}

/* -- helpers ----------------------------------------------- */
const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
const beep = () => {
  try {
    const ctx = new AudioContext(); const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination); osc.frequency.value = 1200; gain.gain.value = 0.15;
    osc.start(); osc.stop(ctx.currentTime + 0.08);
  } catch { /* silent */ }
};

/* -- component --------------------------------------------- */
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
  const [customerCpf, setCustomerCpf] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"value" | "percent">("value");
  const [discountInput, setDiscountInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState<{
    orderNumber: string; total: number; paymentMethod: string;
    change: number; items: { name: string; quantity: number; price: number; total: number }[];
    customerName: string; customerCpf: string; date: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [scanMode, setScanMode] = useState<"barcode" | "search">("barcode");
  const [lastScanned, setLastScanned] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [editingQty, setEditingQty] = useState<string | null>(null);
  const [qtyInput, setQtyInput] = useState("");
  const [saleNotes, setSaleNotes] = useState("");

  /* Cash/change */
  const [cashReceived, setCashReceived] = useState("");
  const [showChangeCalc, setShowChangeCalc] = useState(false);

  /* Split payment */
  const [splitMode, setSplitMode] = useState(false);
  const [splitPayments, setSplitPayments] = useState<{ method: string; amount: string }[]>([]);

  /* Cash register */
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null);
  const [showOpenRegister, setShowOpenRegister] = useState(false);
  const [openingBalance, setOpeningBalance] = useState("");
  const [showCloseRegister, setShowCloseRegister] = useState(false);
  const [closingBalance, setClosingBalance] = useState("");
  const [closingNotes, setClosingNotes] = useState("");

  /* Sangria/Suprimento */
  const [showCashMovement, setShowCashMovement] = useState(false);
  const [cashMovementType, setCashMovementType] = useState<"sangria" | "suprimento">("sangria");
  const [cashMovementAmount, setCashMovementAmount] = useState("");
  const [cashMovementReason, setCashMovementReason] = useState("");

  /* Daily history */
  const [showHistory, setShowHistory] = useState(false);
  const [dailySales, setDailySales] = useState<DailySale[]>([]);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTargetOrder, setCancelTargetOrder] = useState("");

  /* Customer lookup */
  const [showCustomerLookup, setShowCustomerLookup] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customerResults, setCustomerResults] = useState<{ id: string; name: string; email: string; cpf: string; phone: string }[]>([]);
  const [searchingCustomer, setSearchingCustomer] = useState(false);

  /* Fiado (credit tab) */
  const [isFiado, setIsFiado] = useState(false);

  /* refs */
  const barcodeRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  /* -- cash register check on load ------------------------- */
  useEffect(() => {
    fetch("/api/dashboard/pdv/cash-register").then((r) => r.json()).then((d) => {
      if (d.register) setCashRegister(d.register);
    }).catch(() => {});
  }, []);

  /* -- fetch products -------------------------------------- */
  const fetchProducts = useCallback(async (q: string, catId: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (catId) params.set("category", catId);
      const res = await fetch(`/api/dashboard/pdv?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      if (data.categories) setCategories(data.categories);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts("", ""); }, [fetchProducts]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { fetchProducts(search, selectedCategory); }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, selectedCategory, fetchProducts]);

  /* -- barcode scanner logic -------------------------------- */
  const lookupBarcode = useCallback(async (code: string) => {
    if (!code || code.length < 8) return;
    setLastScanned(code);
    try {
      const res = await fetch(`/api/dashboard/pdv?barcode=${code}`);
      const data = await res.json();
      if (data.product) { beep(); addToCart(data.product); }
      else { setLastScanned(`${code} - NAO ENCONTRADO`); }
    } catch { /* silent */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scanMode !== "barcode") return;
    let buffer = ""; let timer: ReturnType<typeof setTimeout>;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" && target !== barcodeRef.current) return;
      if (e.key === "Enter" && buffer.length >= 8) {
        e.preventDefault(); lookupBarcode(buffer); buffer = ""; setBarcodeBuffer("");
        if (barcodeRef.current) barcodeRef.current.value = "";
        return;
      }
      if (/^\d$/.test(e.key)) {
        buffer += e.key; setBarcodeBuffer(buffer);
        clearTimeout(timer); timer = setTimeout(() => { buffer = ""; setBarcodeBuffer(""); }, 200);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => { window.removeEventListener("keydown", handleKeyDown); clearTimeout(timer); };
  }, [scanMode, lookupBarcode]);

  /* -- keyboard shortcuts ----------------------------------- */
  useEffect(() => {
    const anyModal = showSuccess || showOpenRegister || showCloseRegister || showCashMovement || showHistory || showCustomerLookup || showCancelModal;
    const handleKey = (e: KeyboardEvent) => {
      if (anyModal) return;
      switch (e.key) {
        case "F2": e.preventDefault(); setScanMode("search"); setTimeout(() => searchRef.current?.focus(), 50); break;
        case "F3": e.preventDefault(); setScanMode("barcode"); setTimeout(() => barcodeRef.current?.focus(), 50); break;
        case "F4": e.preventDefault(); document.getElementById("pdv-discount")?.focus(); break;
        case "F8": e.preventDefault(); setShowCustomerLookup(true); break;
        case "F12": e.preventDefault(); if (cart.length > 0 && (paymentMethod || isFiado)) finalizeSale(); break;
        case "Escape":
          e.preventDefault();
          if (editingQty) { setEditingQty(null); }
          else { setScanMode("barcode"); setTimeout(() => barcodeRef.current?.focus(), 50); }
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, paymentMethod, isFiado, showSuccess, editingQty, showOpenRegister, showCloseRegister, showCashMovement, showHistory, showCustomerLookup, showCancelModal]);

  /* -- cart management -------------------------------------- */
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) return prev;
        return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1, itemDiscount: 0 }];
    });
  };
  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) => prev.map((item) => {
      if (item.id !== productId) return item;
      const newQty = item.quantity + delta;
      if (newQty <= 0) return null;
      if (newQty > item.stock_quantity) return item;
      return { ...item, quantity: newQty };
    }).filter(Boolean) as CartItem[]);
  };
  const setCartQty = (productId: string, qty: number) => {
    setCart((prev) => prev.map((item) => {
      if (item.id !== productId) return item;
      if (qty <= 0) return null;
      if (qty > item.stock_quantity) return { ...item, quantity: item.stock_quantity };
      return { ...item, quantity: qty };
    }).filter(Boolean) as CartItem[]);
  };
  const removeFromCart = (productId: string) => { setCart((prev) => prev.filter((i) => i.id !== productId)); };

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity) - item.itemDiscount, 0);
  const itemDiscountTotal = cart.reduce((sum, item) => sum + item.itemDiscount, 0);

  /* Discount calc (supports value and %) */
  const effectiveDiscount = discountType === "percent"
    ? (subtotal * (parseFloat(discountInput) || 0)) / 100
    : discount;
  const total = Math.max(subtotal - effectiveDiscount, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const changeAmount = paymentMethod === "dinheiro" && cashReceived ? Math.max(parseFloat(cashReceived) - total, 0) : 0;

  /* Split payment helpers */
  const splitTotal = splitPayments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const splitRemaining = total - splitTotal;

  /* -- Customer lookup ------------------------------------ */
  async function searchCustomer() {
    if (!customerSearchQuery.trim()) return;
    setSearchingCustomer(true);
    try {
      const res = await fetch(`/api/dashboard/pdv/customer-lookup?q=${encodeURIComponent(customerSearchQuery)}`);
      const d = await res.json();
      setCustomerResults(d.customers || []);
    } catch { toast.error("Erro ao buscar cliente"); }
    finally { setSearchingCustomer(false); }
  }

  function selectCustomer(c: { name: string; email: string; cpf: string; phone: string }) {
    setCustomerName(c.name);
    setCustomerCpf(c.cpf ? maskCpf(c.cpf) : "");
    setCustomerPhone(c.phone || "");
    setShowCustomerLookup(false);
    setCustomerSearchQuery("");
    setCustomerResults([]);
    toast.success(`Cliente: ${c.name}`);
  }

  /* -- Open cash register --------------------------------- */
  async function openCashRegister() {
    try {
      const res = await fetch("/api/dashboard/pdv/cash-register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "open", opening_balance: parseFloat(openingBalance) || 0 }),
      });
      const d = await res.json();
      if (d.register) { setCashRegister(d.register); setShowOpenRegister(false); setOpeningBalance(""); toast.success("Caixa aberto!"); }
      else { toast.error(d.error || "Erro"); }
    } catch { toast.error("Erro de conexao"); }
  }

  /* -- Close cash register -------------------------------- */
  async function closeCashRegister() {
    try {
      const res = await fetch("/api/dashboard/pdv/cash-register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close", closing_balance: parseFloat(closingBalance) || 0, notes: closingNotes }),
      });
      const d = await res.json();
      if (d.success) { setCashRegister(null); setShowCloseRegister(false); setClosingBalance(""); setClosingNotes(""); toast.success("Caixa fechado!"); }
      else { toast.error(d.error || "Erro"); }
    } catch { toast.error("Erro de conexao"); }
  }

  /* -- Sangria/Suprimento --------------------------------- */
  async function handleCashMovement() {
    try {
      const res = await fetch("/api/dashboard/pdv/cash-register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "movement", type: cashMovementType,
          amount: parseFloat(cashMovementAmount) || 0,
          reason: cashMovementReason,
        }),
      });
      const d = await res.json();
      if (d.success) {
        setShowCashMovement(false); setCashMovementAmount(""); setCashMovementReason("");
        toast.success(cashMovementType === "sangria" ? "Sangria registrada!" : "Suprimento registrado!");
      } else { toast.error(d.error || "Erro"); }
    } catch { toast.error("Erro de conexao"); }
  }

  /* -- Daily history -------------------------------------- */
  async function loadDailyHistory() {
    try {
      const res = await fetch("/api/dashboard/pdv/history");
      const d = await res.json();
      setDailySales(d.sales || []);
      setDailyTotal(d.total || 0);
      setShowHistory(true);
    } catch { toast.error("Erro ao carregar historico"); }
  }

  /* -- Cancel sale ---------------------------------------- */
  async function cancelSale() {
    if (!cancelTargetOrder || !cancelReason.trim()) { toast.error("Informe o motivo do cancelamento"); return; }
    setCancellingOrder(cancelTargetOrder);
    try {
      const res = await fetch("/api/dashboard/pdv/cancel", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: cancelTargetOrder, reason: cancelReason }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success("Venda cancelada e estoque restaurado!");
        setCancelReason(""); setCancelTargetOrder(""); setShowCancelModal(false);
        loadDailyHistory();
      } else { toast.error(d.error || "Erro ao cancelar"); }
    } catch { toast.error("Erro de conexao"); }
    finally { setCancellingOrder(null); }
  }

  /* -- Print receipt -------------------------------------- */
  function printReceipt() {
    if (!lastOrder) return;
    const w = window.open("", "_blank", "width=350,height=600");
    if (!w) return;
    const lines = lastOrder.items.map(i => `
      <tr>
        <td style="padding:2px 0">${i.name}</td>
        <td style="text-align:center">${i.quantity}</td>
        <td style="text-align:right">${fmt(i.price)}</td>
        <td style="text-align:right">${fmt(i.total)}</td>
      </tr>
    `).join("");
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Recibo</title>
      <style>
        body{font-family:monospace;font-size:12px;margin:10px;width:300px}
        .center{text-align:center} .bold{font-weight:bold} .line{border-top:1px dashed #000;margin:8px 0}
        table{width:100%;border-collapse:collapse} th{text-align:left;padding:2px 0;border-bottom:1px solid #000}
        .big{font-size:18px} @media print{body{margin:0}}
      </style></head><body>
      <div class="center bold big">ADEGA</div>
      <div class="center" style="font-size:10px">Comprovante de Venda</div>
      <div class="line"></div>
      <div><strong>Pedido:</strong> ${lastOrder.orderNumber}</div>
      <div><strong>Data:</strong> ${lastOrder.date}</div>
      ${lastOrder.customerName ? `<div><strong>Cliente:</strong> ${lastOrder.customerName}</div>` : ""}
      ${lastOrder.customerCpf ? `<div><strong>CPF:</strong> ${lastOrder.customerCpf}</div>` : ""}
      <div class="line"></div>
      <table><thead><tr><th>Item</th><th style="text-align:center">Qtd</th><th style="text-align:right">Unit</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>${lines}</tbody></table>
      <div class="line"></div>
      <div style="display:flex;justify-content:space-between"><span>TOTAL:</span><strong class="big">${fmt(lastOrder.total)}</strong></div>
      <div><strong>Pagamento:</strong> ${lastOrder.paymentMethod}</div>
      ${lastOrder.change > 0 ? `<div><strong>Troco:</strong> ${fmt(lastOrder.change)}</div>` : ""}
      <div class="line"></div>
      <div class="center" style="font-size:10px;margin-top:10px">Obrigado pela preferencia!</div>
      <script>window.onload=function(){window.print()}</script>
    </body></html>`);
    w.document.close();
  }

  /* -- finalize sale --------------------------------------- */
  const finalizeSale = async () => {
    if (cart.length === 0 || (!paymentMethod && !splitMode && !isFiado)) return;
    if (splitMode && splitRemaining > 0.01) { toast.error(`Faltam ${fmt(splitRemaining)} para completar`); return; }
    if (isFiado && !customerName.trim()) { toast.error("Informe o nome do cliente para venda fiado"); return; }
    setSubmitting(true);
    try {
      const cartItems = cart.map((i) => ({ id: i.id, name: i.name, price: Number(i.price), quantity: i.quantity, itemDiscount: i.itemDiscount }));
      const payload: Record<string, unknown> = {
        items: cartItems,
        paymentMethod: isFiado ? "fiado" : splitMode ? "misto" : paymentMethod,
        customerName: customerName || undefined,
        customerCpf: customerCpf || undefined,
        customerPhone: customerPhone || undefined,
        discount: effectiveDiscount || 0,
        cashRegisterId: cashRegister?.id || undefined,
        notes: saleNotes || undefined,
      };
      if (splitMode) { payload.splitPayments = splitPayments; }
      if (paymentMethod === "dinheiro" && cashReceived) {
        payload.cashReceived = parseFloat(cashReceived);
      }
      const res = await fetch("/api/dashboard/pdv", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) {
        setLastOrder({
          orderNumber: data.orderNumber, total: data.total,
          paymentMethod: isFiado ? "Fiado" : splitMode ? "Misto" : paymentMethod,
          change: data.change || 0,
          items: cartItems.map(i => ({ name: i.name, quantity: i.quantity, price: i.price, total: i.price * i.quantity - (i.itemDiscount || 0) })),
          customerName, customerCpf,
          date: new Date().toLocaleString("pt-BR"),
        });
        setShowSuccess(true); setCart([]); setDiscount(0); setDiscountInput(""); setCustomerName(""); setCustomerCpf(""); setCustomerPhone("");
        setPaymentMethod(""); setCashReceived(""); setSplitMode(false); setSplitPayments([]); setIsFiado(false); setSaleNotes("");
        fetchProducts(search, selectedCategory);
      } else { toast.error(data.error || "Erro ao finalizar"); }
    } catch { toast.error("Erro de conexao"); } finally { setSubmitting(false); }
  };

  const newSale = () => {
    setShowSuccess(false); setLastOrder(null); setSearch(""); setSelectedCategory("");
    setLastScanned(""); setScanMode("barcode"); setShowChangeCalc(false);
    setTimeout(() => barcodeRef.current?.focus(), 100);
  };

  /* -- CPF mask ------------------------------------------- */
  const maskCpf = (val: string) => {
    const nums = val.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 3) return nums;
    if (nums.length <= 6) return `${nums.slice(0, 3)}.${nums.slice(3)}`;
    if (nums.length <= 9) return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`;
    return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`;
  };

  /* -- phone mask ----------------------------------------- */
  const maskPhone = (val: string) => {
    const nums = val.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 2) return nums;
    if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
  };

  /* ======================================================= */
  /* MODALS                                                   */
  /* ======================================================= */

  /* -- no register open ----------------------------------- */
  if (!cashRegister && !showOpenRegister) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
            <Lock className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-card-foreground">Caixa Fechado</h2>
          <p className="mt-2 text-sm text-muted-foreground">Abra o caixa para iniciar as vendas do dia.</p>
          <button onClick={() => setShowOpenRegister(true)} className="mt-6 w-full rounded-lg bg-primary py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary/90">
            <span className="flex items-center justify-center gap-2"><Unlock className="h-4 w-4" /> Abrir Caixa</span>
          </button>
        </div>
      </div>
    );
  }

  /* -- open register modal -------------------------------- */
  if (showOpenRegister) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
          <h2 className="mb-4 text-center text-xl font-bold text-card-foreground">Abertura de Caixa</h2>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Saldo Inicial (R$)</label>
          <input type="number" step="0.01" value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)}
            placeholder="200.00" className="mb-4 flex h-14 w-full rounded-lg border border-input bg-secondary px-4 text-center text-2xl font-bold text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary" autoFocus />
          <div className="flex gap-3">
            <button onClick={() => setShowOpenRegister(false)} className="flex-1 rounded-lg border border-border py-3 text-sm font-medium text-muted-foreground hover:bg-secondary">Cancelar</button>
            <button onClick={openCashRegister} className="flex-1 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90">Abrir Caixa</button>
          </div>
        </div>
      </div>
    );
  }

  /* -- success overlay with receipt ----------------------- */
  if (showSuccess && lastOrder) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-card-foreground">Venda Finalizada!</h2>
          <p className="mt-2 font-mono text-lg text-muted-foreground">{lastOrder.orderNumber}</p>
          <p className="mt-4 text-4xl font-bold text-primary">{fmt(lastOrder.total)}</p>
          <p className="mt-1 text-sm capitalize text-muted-foreground">Pagamento: {lastOrder.paymentMethod}</p>
          {lastOrder.customerName && <p className="mt-1 text-sm text-muted-foreground">Cliente: {lastOrder.customerName}</p>}
          {lastOrder.change > 0 && (
            <div className="mt-3 rounded-lg bg-amber-500/10 px-4 py-3">
              <p className="text-sm text-amber-600">Troco</p>
              <p className="text-2xl font-bold text-amber-600">{fmt(lastOrder.change)}</p>
            </div>
          )}
          <div className="mt-6 flex gap-3">
            <button onClick={printReceipt} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border py-4 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
              <Printer className="h-4 w-4" /> Imprimir Recibo
            </button>
            <button onClick={newSale} className="flex-1 rounded-lg bg-primary py-4 text-sm font-bold text-primary-foreground hover:bg-primary/90">
              Nova Venda (ESC)
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* -- close register modal ------------------------------- */
  if (showCloseRegister) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
          <h2 className="mb-4 text-center text-xl font-bold text-card-foreground">Fechamento de Caixa</h2>
          <p className="mb-1 text-xs text-muted-foreground">Aberto em: {new Date(cashRegister!.opened_at).toLocaleString("pt-BR")}</p>
          <p className="mb-4 text-xs text-muted-foreground">Saldo inicial: {fmt(cashRegister!.opening_balance)}</p>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Saldo Final em Caixa (R$)</label>
          <input type="number" step="0.01" value={closingBalance} onChange={(e) => setClosingBalance(e.target.value)}
            placeholder="0.00" className="mb-3 flex h-14 w-full rounded-lg border border-input bg-secondary px-4 text-center text-2xl font-bold text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary" autoFocus />
          <label className="mb-1.5 block text-sm font-medium text-foreground">Observacoes</label>
          <textarea value={closingNotes} onChange={(e) => setClosingNotes(e.target.value)} rows={2}
            className="mb-4 flex w-full rounded-lg border border-input bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Observacoes do fechamento..." />
          <div className="flex gap-3">
            <button onClick={() => setShowCloseRegister(false)} className="flex-1 rounded-lg border border-border py-3 text-sm font-medium text-muted-foreground hover:bg-secondary">Cancelar</button>
            <button onClick={closeCashRegister} className="flex-1 rounded-lg bg-destructive py-3 text-sm font-bold text-white hover:bg-destructive/90">Fechar Caixa</button>
          </div>
        </div>
      </div>
    );
  }

  /* -- cash movement modal -------------------------------- */
  if (showCashMovement) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
          <h2 className="mb-4 text-center text-xl font-bold text-card-foreground">
            {cashMovementType === "sangria" ? "Sangria (Retirada)" : "Suprimento (Entrada)"}
          </h2>
          <div className="mb-4 flex rounded-lg border border-border">
            <button onClick={() => setCashMovementType("sangria")}
              className={`flex-1 rounded-l-lg py-2.5 text-sm font-medium transition-colors ${cashMovementType === "sangria" ? "bg-destructive text-white" : "text-muted-foreground hover:text-foreground"}`}>
              Sangria
            </button>
            <button onClick={() => setCashMovementType("suprimento")}
              className={`flex-1 rounded-r-lg py-2.5 text-sm font-medium transition-colors ${cashMovementType === "suprimento" ? "bg-green-600 text-white" : "text-muted-foreground hover:text-foreground"}`}>
              Suprimento
            </button>
          </div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Valor (R$)</label>
          <input type="number" step="0.01" value={cashMovementAmount} onChange={(e) => setCashMovementAmount(e.target.value)}
            className="mb-3 flex h-12 w-full rounded-lg border border-input bg-secondary px-4 text-lg font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary" autoFocus />
          <label className="mb-1.5 block text-sm font-medium text-foreground">Motivo</label>
          <input value={cashMovementReason} onChange={(e) => setCashMovementReason(e.target.value)}
            className="mb-4 flex h-11 w-full rounded-lg border border-input bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Ex: Troco, pagamento fornecedor..." />
          <div className="flex gap-3">
            <button onClick={() => setShowCashMovement(false)} className="flex-1 rounded-lg border border-border py-3 text-sm font-medium text-muted-foreground hover:bg-secondary">Cancelar</button>
            <button onClick={handleCashMovement} disabled={!cashMovementAmount || !cashMovementReason}
              className="flex-1 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">Registrar</button>
          </div>
        </div>
      </div>
    );
  }

  /* -- customer lookup modal ------------------------------ */
  if (showCustomerLookup) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold text-card-foreground"><UserSearch className="h-5 w-5 text-primary" /> Buscar Cliente</h2>
            <button onClick={() => { setShowCustomerLookup(false); setCustomerResults([]); setCustomerSearchQuery(""); }} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"><X className="h-5 w-5" /></button>
          </div>
          <div className="flex gap-2">
            <input value={customerSearchQuery} onChange={(e) => setCustomerSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") searchCustomer(); }}
              placeholder="Buscar por nome, CPF, email ou telefone..."
              className="flex h-11 flex-1 rounded-lg border border-input bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary" autoFocus />
            <button onClick={searchCustomer} disabled={searchingCustomer}
              className="flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              <Search className="h-4 w-4" /> Buscar
            </button>
          </div>
          <div className="mt-4 max-h-64 overflow-y-auto">
            {customerResults.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{customerSearchQuery ? "Nenhum cliente encontrado" : "Digite para buscar"}</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {customerResults.map((c) => (
                  <button key={c.id} onClick={() => selectCustomer(c)}
                    className="flex items-center justify-between rounded-lg border border-border p-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/5">
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}{c.phone ? ` | ${c.phone}` : ""}</p>
                    </div>
                    {c.cpf && <span className="rounded bg-secondary px-2 py-0.5 font-mono text-xs text-muted-foreground">{c.cpf}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* -- cancel sale modal ---------------------------------- */
  if (showCancelModal) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="mb-1 text-center text-xl font-bold text-card-foreground">Cancelar Venda</h2>
          <p className="mb-4 text-center font-mono text-sm text-muted-foreground">{cancelTargetOrder}</p>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Motivo do cancelamento *</label>
          <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3}
            className="mb-4 flex w-full rounded-lg border border-input bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Ex: Cliente desistiu, erro na venda..." autoFocus />
          <div className="flex gap-3">
            <button onClick={() => { setShowCancelModal(false); setCancelTargetOrder(""); setCancelReason(""); }}
              className="flex-1 rounded-lg border border-border py-3 text-sm font-medium text-muted-foreground hover:bg-secondary">Voltar</button>
            <button onClick={cancelSale} disabled={!cancelReason.trim() || cancellingOrder !== null}
              className="flex-1 rounded-lg bg-destructive py-3 text-sm font-bold text-white hover:bg-destructive/90 disabled:opacity-50">
              {cancellingOrder ? "Cancelando..." : "Confirmar Cancelamento"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* -- daily history modal -------------------------------- */
  if (showHistory) {
    const activeSales = dailySales.filter(s => s.status !== "cancelled");
    const cancelledSales = dailySales.filter(s => s.status === "cancelled");
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-card-foreground">Vendas do Dia</h2>
            <button onClick={() => setShowHistory(false)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"><X className="h-5 w-5" /></button>
          </div>
          <div className="mb-4 rounded-lg bg-primary/10 p-4 text-center">
            <p className="text-sm text-muted-foreground">{activeSales.length} venda{activeSales.length !== 1 ? "s" : ""} ativa{activeSales.length !== 1 ? "s" : ""}</p>
            <p className="text-3xl font-bold text-primary">{fmt(dailyTotal)}</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {dailySales.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">Nenhuma venda hoje</p>
            ) : (
              <div className="flex flex-col gap-2">
                {dailySales.map((sale) => (
                  <div key={sale.order_number} className={`flex items-center justify-between rounded-lg border p-3 ${sale.status === "cancelled" ? "border-destructive/20 bg-destructive/5 opacity-60" : "border-border"}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm font-medium text-foreground">{sale.order_number}</p>
                        {sale.status === "cancelled" && (
                          <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">CANCELADA</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(sale.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        {sale.customer_name ? ` - ${sale.customer_name}` : ""}
                        {` - ${sale.items_count} item(s)`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className={`font-bold ${sale.status === "cancelled" ? "text-muted-foreground line-through" : "text-foreground"}`}>{fmt(sale.total)}</p>
                        <p className="text-xs capitalize text-muted-foreground">{sale.payment_method}</p>
                      </div>
                      {sale.status !== "cancelled" && (
                        <button onClick={() => { setCancelTargetOrder(sale.order_number); setShowCancelModal(true); setShowHistory(false); }}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="Cancelar venda">
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
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

  /* ======================================================= */
  /* MAIN RENDER                                              */
  /* ======================================================= */
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-3 overflow-hidden lg:flex-row">
      {/* --- LEFT: products -------------------------------- */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Header row */}
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <ReceiptText className="h-5 w-5 text-primary" /> PDV - Caixa
          </h1>
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            <button onClick={() => setShowCashMovement(true)} className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground" title="Sangria / Suprimento">
              <ArrowDownUp className="h-3.5 w-3.5" /> Sangria
            </button>
            <button onClick={loadDailyHistory} className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground" title="Historico do dia">
              <ClipboardList className="h-3.5 w-3.5" /> Vendas
            </button>
            <button onClick={() => setShowCloseRegister(true)} className="flex items-center gap-1 rounded-lg border border-destructive/30 px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10" title="Fechar caixa">
              <Lock className="h-3.5 w-3.5" /> Fechar
            </button>
            <div className="h-5 w-px bg-border" />
            <div className="flex rounded-lg border border-border">
              <button onClick={() => { setScanMode("barcode"); setTimeout(() => barcodeRef.current?.focus(), 50); }}
                className={`flex items-center gap-1.5 rounded-l-lg px-3 py-1.5 text-xs font-medium transition-colors ${scanMode === "barcode" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <ScanLine className="h-3.5 w-3.5" /> Leitor
              </button>
              <button onClick={() => { setScanMode("search"); setTimeout(() => searchRef.current?.focus(), 50); }}
                className={`flex items-center gap-1.5 rounded-r-lg px-3 py-1.5 text-xs font-medium transition-colors ${scanMode === "search" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Search className="h-3.5 w-3.5" /> Busca
              </button>
            </div>
            <button onClick={() => setShowShortcuts(!showShortcuts)} className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground">
              <Keyboard className="h-3.5 w-3.5" /> Atalhos
            </button>
          </div>
        </div>

        {/* Shortcut bar */}
        {showShortcuts && (
          <div className="mt-2 flex flex-wrap gap-2 rounded-lg border border-border bg-card/50 p-2.5 text-xs text-muted-foreground">
            {[["F2", "Buscar"], ["F3", "Leitor"], ["F4", "Desconto"], ["F8", "Cliente"], ["F12", "Finalizar"], ["ESC", "Voltar"]].map(([k, v]) => (
              <span key={k} className="inline-flex items-center gap-1">
                <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-foreground">{k}</kbd> {v}
              </span>
            ))}
          </div>
        )}

        {/* Barcode input */}
        {scanMode === "barcode" && (
          <div className="mt-3">
            <div className="relative">
              <Barcode className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
              <input ref={barcodeRef} type="text" inputMode="numeric" value={barcodeBuffer}
                onChange={(e) => setBarcodeBuffer(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => { if (e.key === "Enter" && barcodeBuffer.length >= 8) { lookupBarcode(barcodeBuffer); setBarcodeBuffer(""); } }}
                placeholder="Bipe o codigo de barras ou digite o EAN..."
                className="h-14 w-full rounded-xl border-2 border-primary/40 bg-card pl-12 pr-4 font-mono text-lg text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" autoFocus />
              <ScanLine className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-pulse text-primary/50" />
            </div>
            {lastScanned && (
              <div className="mt-1.5 flex items-center gap-2 text-xs">
                <Volume2 className="h-3 w-3 text-green-500" />
                <span className="text-muted-foreground">Ultimo: <span className="font-mono text-foreground">{lastScanned}</span></span>
              </div>
            )}
          </div>
        )}

        {/* Text search input */}
        {scanMode === "search" && (
          <div className="mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input ref={searchRef} type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, marca ou codigo de barras..."
                className="h-12 w-full rounded-xl border border-border bg-card pl-12 pr-10 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" autoFocus />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Category filter */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button onClick={() => setSelectedCategory("")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!selectedCategory ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
            Todos
          </button>
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setSelectedCategory(selectedCategory === cat.id ? "" : cat.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${selectedCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="mt-2 flex-1 overflow-y-auto rounded-xl border border-border bg-card/50 p-2">
          {loading ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">Buscando produtos...</div>
          ) : products.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-sm text-muted-foreground">
              <Search className="mb-2 h-6 w-6 opacity-30" /> Nenhum produto encontrado
            </div>
          ) : (
            <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {products.map((product) => {
                const inCart = cart.find((i) => i.id === product.id);
                return (
                  <button key={product.id} onClick={() => { beep(); addToCart(product); }}
                    className={`group flex flex-col items-start rounded-lg border p-2.5 text-left transition-all hover:border-primary/40 hover:bg-primary/5 ${inCart ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
                    <div className="flex w-full items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-card-foreground">{product.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{product.brand}{product.volume ? ` - ${product.volume}` : ""}</p>
                      </div>
                      {inCart && (
                        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">{inCart.quantity}</span>
                      )}
                    </div>
                    <div className="mt-1.5 flex w-full items-center justify-between">
                      <span className="text-sm font-bold text-primary">{fmt(Number(product.price))}</span>
                      <div className="flex items-center gap-2">
                        {product.barcode && <span className="font-mono text-[10px] text-muted-foreground/60">{product.barcode}</span>}
                        <span className="text-xs text-muted-foreground">Est: {product.stock_quantity}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* --- RIGHT: Cart ----------------------------------- */}
      <div className="flex w-full flex-col rounded-xl border border-border bg-card lg:w-[420px]">
        {/* Cart header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-card-foreground">Venda Atual</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{itemCount} {itemCount === 1 ? "item" : "itens"}</span>
            {cart.length > 0 && (
              <button onClick={() => { setCart([]); setDiscount(0); setDiscountInput(""); }} className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="Limpar carrinho">
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
              <p className="text-xs">Bipe um produto ou clique para adicionar</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {cart.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-2 rounded-lg border border-border bg-background p-2">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-secondary text-xs font-bold text-muted-foreground">{idx + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{fmt(Number(item.price))} un.</span>
                      {item.barcode && <span className="font-mono text-[10px]">{item.barcode}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateCartQty(item.id, -1)} className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80">
                      <Minus className="h-3 w-3" />
                    </button>
                    {editingQty === item.id ? (
                      <input type="number" min="1" max={item.stock_quantity} value={qtyInput}
                        onChange={(e) => setQtyInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { const qty = parseInt(qtyInput); if (qty > 0) setCartQty(item.id, qty); setEditingQty(null); } if (e.key === "Escape") setEditingQty(null); }}
                        onBlur={() => { const qty = parseInt(qtyInput); if (qty > 0) setCartQty(item.id, qty); setEditingQty(null); }}
                        className="h-7 w-12 rounded-md border border-primary bg-background text-center text-sm font-semibold text-foreground focus:outline-none" autoFocus />
                    ) : (
                      <button onClick={() => { setEditingQty(item.id); setQtyInput(String(item.quantity)); }}
                        className="flex h-7 w-10 items-center justify-center rounded-md border border-border text-sm font-semibold text-foreground hover:border-primary" title="Clique para digitar quantidade">
                        {item.quantity}
                      </button>
                    )}
                    <button onClick={() => updateCartQty(item.id, 1)} className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="min-w-16 text-right text-sm font-bold text-primary">{fmt(Number(item.price) * item.quantity)}</span>
                    <button onClick={() => removeFromCart(item.id)} className="flex h-7 w-7 items-center justify-center rounded-md text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- Sale footer --------------------------------- */}
        <div className="border-t border-border p-3">
          {/* Customer + CPF + Phone */}
          <div className="mb-2 grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <User className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <input id="pdv-customer" type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Cliente" className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <input type="text" value={customerCpf} onChange={(e) => setCustomerCpf(maskCpf(e.target.value))} placeholder="CPF" maxLength={14} className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
            </div>
            <div className="flex items-center gap-1">
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                <Hash className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(maskPhone(e.target.value))} placeholder="Telefone" maxLength={15} className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
              </div>
              <button onClick={() => setShowCustomerLookup(true)} className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary" title="Buscar cliente (F8)">
                <UserSearch className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Discount + Notes row */}
          <div className="mb-2 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-2">
              <Tag className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <input id="pdv-discount" type="number" min="0" step="0.01"
                value={discountType === "percent" ? discountInput : (discount || "")}
                onChange={(e) => {
                  if (discountType === "percent") { setDiscountInput(e.target.value); }
                  else { setDiscount(Number(e.target.value) || 0); }
                }}
                placeholder="Desconto" className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
              <button onClick={() => {
                if (discountType === "value") { setDiscountType("percent"); setDiscountInput(""); setDiscount(0); }
                else { setDiscountType("value"); setDiscountInput(""); setDiscount(0); }
              }}
                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-xs font-bold ${discountType === "percent" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                title={discountType === "percent" ? "Modo: porcentagem" : "Modo: valor fixo"}>
                {discountType === "percent" ? <Percent className="h-3 w-3" /> : <DollarSign className="h-3 w-3" />}
              </button>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <input type="text" value={saleNotes} onChange={(e) => setSaleNotes(e.target.value)}
                placeholder="Obs. da venda" className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
            </div>
          </div>

          {/* Totals */}
          <div className="mb-3 space-y-0.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal ({itemCount} itens)</span><span>{fmt(subtotal + itemDiscountTotal)}</span>
            </div>
            {itemDiscountTotal > 0 && (
              <div className="flex justify-between text-green-500"><span>Desc. itens</span><span>- {fmt(itemDiscountTotal)}</span></div>
            )}
            {effectiveDiscount > 0 && (
              <div className="flex justify-between text-green-500">
                <span>Desconto {discountType === "percent" ? `(${discountInput}%)` : ""}</span>
                <span>- {fmt(effectiveDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 text-xl font-bold text-card-foreground">
              <span>TOTAL</span><span className="text-primary">{fmt(total)}</span>
            </div>
          </div>

          {/* Payment method */}
          <div className="mb-3">
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Pagamento</p>
              <div className="flex items-center gap-2">
                <button onClick={() => {
                  setIsFiado(!isFiado);
                  if (!isFiado) { setPaymentMethod(""); setSplitMode(false); }
                }}
                  className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium ${isFiado ? "bg-amber-500/10 text-amber-600" : "text-muted-foreground hover:text-foreground"}`}>
                  <Wallet className="h-3 w-3" /> Fiado
                </button>
                {!isFiado && (
                  <button onClick={() => { setSplitMode(!splitMode); if (!splitMode) setSplitPayments([{ method: "dinheiro", amount: "" }]); }}
                    className={`rounded px-2 py-0.5 text-[10px] font-medium ${splitMode ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                    {splitMode ? "Pagamento unico" : "Dividir"}
                  </button>
                )}
              </div>
            </div>

            {isFiado ? (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-center">
                <Wallet className="mx-auto mb-1 h-6 w-6 text-amber-600" />
                <p className="text-sm font-medium text-amber-600">Venda Fiado</p>
                <p className="text-xs text-muted-foreground">O cliente pagara depois. Informe o nome do cliente acima.</p>
              </div>
            ) : !splitMode ? (
              <>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { key: "dinheiro", label: "Dinheiro", icon: Banknote },
                    { key: "debito", label: "Debito", icon: CreditCard },
                    { key: "credito", label: "Credito", icon: CreditCard },
                    { key: "pix", label: "PIX", icon: QrCode },
                  ].map((method) => (
                    <button key={method.key} onClick={() => { setPaymentMethod(method.key); if (method.key === "dinheiro") setShowChangeCalc(true); else setShowChangeCalc(false); }}
                      className={`flex flex-col items-center gap-1 rounded-lg border py-2 text-[11px] font-medium transition-all ${paymentMethod === method.key ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}>
                      <method.icon className="h-4 w-4" />{method.label}
                    </button>
                  ))}
                </div>
                {paymentMethod === "dinheiro" && showChangeCalc && (
                  <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                    <label className="mb-1 block text-xs font-medium text-amber-600">Valor Recebido (R$)</label>
                    <input type="number" step="0.01" value={cashReceived} onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="0.00" className="mb-2 flex h-11 w-full rounded-lg border border-amber-500/30 bg-background px-4 text-lg font-bold text-foreground focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" autoFocus />
                    {cashReceived && parseFloat(cashReceived) >= total && (
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Troco</p>
                        <p className="text-2xl font-bold text-amber-600">{fmt(changeAmount)}</p>
                      </div>
                    )}
                    {cashReceived && parseFloat(cashReceived) < total && (
                      <p className="text-center text-xs font-medium text-destructive">Valor insuficiente</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-2">
                {splitPayments.map((sp, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select value={sp.method} onChange={(e) => { const arr = [...splitPayments]; arr[idx].method = e.target.value; setSplitPayments(arr); }}
                      className="h-9 rounded-lg border border-border bg-secondary px-2 text-xs text-foreground">
                      <option value="dinheiro">Dinheiro</option>
                      <option value="debito">Debito</option>
                      <option value="credito">Credito</option>
                      <option value="pix">PIX</option>
                    </select>
                    <input type="number" step="0.01" value={sp.amount} onChange={(e) => { const arr = [...splitPayments]; arr[idx].amount = e.target.value; setSplitPayments(arr); }}
                      placeholder="R$" className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground focus:border-primary focus:outline-none" />
                    {splitPayments.length > 1 && (
                      <button onClick={() => setSplitPayments(splitPayments.filter((_, i) => i !== idx))} className="text-destructive"><X className="h-4 w-4" /></button>
                    )}
                  </div>
                ))}
                <button onClick={() => setSplitPayments([...splitPayments, { method: "pix", amount: "" }])}
                  className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-border py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary">
                  <Plus className="h-3 w-3" /> Adicionar forma
                </button>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total informado: {fmt(splitTotal)}</span>
                  <span className={splitRemaining > 0.01 ? "font-medium text-destructive" : "font-medium text-green-500"}>
                    {splitRemaining > 0.01 ? `Faltam ${fmt(splitRemaining)}` : "OK"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Finalize */}
          <button onClick={finalizeSale}
            disabled={cart.length === 0 || (!paymentMethod && !splitMode && !isFiado) || (splitMode && splitRemaining > 0.01) || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
            <CheckCircle className="h-5 w-5" />
            {submitting ? "Finalizando..." : isFiado ? "Registrar Fiado (F12)" : "Finalizar Venda (F12)"}
          </button>
        </div>
      </div>
    </div>
  );
}
