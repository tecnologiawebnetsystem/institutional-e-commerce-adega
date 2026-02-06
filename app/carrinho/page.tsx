"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Minus, Plus, ShoppingCart, Trash2, Wine } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";
import Link from "next/link";

export default function CarrinhoPage() {
  const { items, updateQuantity, removeItem, clearCart, total, storeId } = useCart();
  const [coupon, setCoupon] = useState("");
  const [ordering, setOrdering] = useState(false);
  const router = useRouter();

  async function handleCheckout() {
    if (items.length === 0) return;
    setOrdering(true);
    try {
      const res = await fetch("/api/customer/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: storeId,
          items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
          coupon_code: coupon || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Pedido ${data.order.order_number} criado com sucesso!`);
        clearCart();
        router.push("/meus-pedidos");
      } else {
        toast.error(data.error || "Erro ao finalizar pedido");
      }
    } catch {
      toast.error("Erro de conexao");
    } finally {
      setOrdering(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-32 text-center">
        <ShoppingCart className="mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Carrinho Vazio</h1>
        <p className="mt-2 text-muted-foreground">Adicione produtos de uma adega para comecar.</p>
        <Link
          href="/adegas"
          className="mt-6 flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Explorar Adegas
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <h1 className="text-2xl font-bold text-foreground">Meu Carrinho</h1>
      <p className="mt-1 text-muted-foreground">{items[0]?.store_name}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card">
            {items.map((item) => (
              <div key={item.product_id} className="flex items-center gap-4 border-b border-border p-4 last:border-0">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  {item.image_url ? (
                    <img src={item.image_url || "/placeholder.svg"} alt={item.name} className="h-full w-full rounded-lg object-cover" />
                  ) : (
                    <Wine className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="truncate font-semibold text-foreground">{item.name}</h3>
                  <p className="text-sm text-primary">R$ {item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground hover:text-foreground">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[2rem] text-center font-semibold text-foreground">{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground hover:text-foreground">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <p className="w-24 text-right font-bold text-foreground">R$ {(item.price * item.quantity).toFixed(2)}</p>
                <button type="button" onClick={() => removeItem(item.product_id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground">Resumo</h3>

            <div className="mt-4">
              <label htmlFor="coupon" className="mb-1.5 block text-sm font-medium text-foreground">Cupom de desconto</label>
              <input
                id="coupon"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                className="flex h-11 w-full rounded-lg border border-input bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="CODIGO"
              />
            </div>

            <div className="mt-6 space-y-2 border-t border-border pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">R$ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-primary">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={ordering}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {ordering ? <Loader2 className="h-5 w-5 animate-spin" /> : "Finalizar Pedido"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
