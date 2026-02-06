"use client";

import { Loader2, ShoppingBag } from "lucide-react";
import useSWR from "swr";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  preparing: "Preparando",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};
const statusColors: Record<string, string> = {
  pending: "bg-yellow-900/20 text-yellow-400",
  confirmed: "bg-blue-900/20 text-blue-400",
  preparing: "bg-primary/10 text-primary",
  shipped: "bg-cyan-900/20 text-cyan-400",
  delivered: "bg-green-900/20 text-green-400",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function MeusPedidosPage() {
  const { data, isLoading, error } = useSWR("/api/customer/orders", fetcher);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || data?.error) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-32 text-center">
        <p className="text-muted-foreground">Faca login para ver seus pedidos.</p>
        <Link href="/login" className="mt-4 text-sm font-semibold text-primary hover:underline">Entrar</Link>
      </div>
    );
  }

  const orders = data?.orders || [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <h1 className="text-2xl font-bold text-foreground">Meus Pedidos</h1>
      <p className="mt-1 text-muted-foreground">{orders.length} pedido{orders.length !== 1 ? "s" : ""}</p>

      {orders.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">Voce ainda nao fez nenhum pedido.</p>
          <Link href="/adegas" className="mt-4 text-sm font-semibold text-primary hover:underline">Explorar Adegas</Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {orders.map((order: { id: string; order_number: string; store_name: string; total: number; subtotal: number; discount: number; status: string; created_at: string; delivery_address: string; coupon_code: string }) => (
            <div key={order.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-bold text-foreground">{order.order_number}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{order.store_name}</p>
                </div>
                <span className={`rounded-md px-3 py-1 text-xs font-medium ${statusColors[order.status] || "bg-secondary text-muted-foreground"}`}>
                  {statusLabels[order.status] || order.status}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>{new Date(order.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span>
                {Number(order.discount) > 0 && (
                  <span className="text-primary">Desconto: R$ {Number(order.discount).toFixed(2)}</span>
                )}
                {order.coupon_code && <span>Cupom: {order.coupon_code}</span>}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-bold text-primary">R$ {Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
