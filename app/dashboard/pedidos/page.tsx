"use client";

import { useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

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

export default function PedidosPage() {
  const { data, isLoading } = useSWR("/api/dashboard/orders", fetcher);
  const [updating, setUpdating] = useState<string | null>(null);

  async function updateStatus(orderId: string, status: string) {
    setUpdating(orderId);
    try {
      const res = await fetch("/api/dashboard/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, status }),
      });
      if (res.ok) {
        toast.success("Status atualizado!");
        mutate("/api/dashboard/orders");
      }
    } catch {
      toast.error("Erro ao atualizar");
    } finally {
      setUpdating(null);
    }
  }

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const orders = data?.orders || [];
  const selectClass = "h-9 rounded-lg border border-input bg-secondary px-2 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
      <p className="mt-1 text-muted-foreground">{orders.length} pedido{orders.length !== 1 ? "s" : ""}</p>

      <div className="mt-6">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
            <ShoppingBag className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum pedido recebido</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Pedido</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Data</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Acao</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o: { id: string; order_number: string; customer_name: string; customer_email: string; total: number; status: string; created_at: string }) => (
                    <tr key={o.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-mono text-xs text-foreground">{o.order_number}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{o.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{o.customer_email}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">R$ {Number(o.total).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`rounded-md px-2 py-1 text-xs font-medium ${statusColors[o.status] || "bg-secondary text-muted-foreground"}`}>
                          {statusLabels[o.status] || o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={o.status}
                          onChange={(e) => updateStatus(o.id, e.target.value)}
                          disabled={updating === o.id}
                          className={selectClass}
                        >
                          {Object.entries(statusLabels).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
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
