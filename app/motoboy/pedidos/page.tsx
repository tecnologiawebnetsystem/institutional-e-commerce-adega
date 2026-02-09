"use client";

import useSWR from "swr";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Package, MapPin, Clock, DollarSign, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then(r => r.json());
function fmt(v: number) { return `R$ ${v.toFixed(2).replace(".", ",")}`; }

export default function AvailableOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const acceptId = searchParams.get("accept");
  const { data, mutate } = useSWR("/api/motoboy/deliveries?status=pending", fetcher, { refreshInterval: 5000 });
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const deliveries = data?.deliveries || [];

  async function acceptDelivery(id: string) {
    setLoadingId(id);
    try {
      const res = await fetch("/api/motoboy/deliveries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryId: id, action: "accept" }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error || "Erro ao aceitar"); return; }
      toast.success("Entrega aceita! Dirija-se a adega.");
      mutate();
      router.push("/motoboy/entrega");
    } catch { toast.error("Erro de conexao"); } finally { setLoadingId(null); }
  }

  // Auto-accept if redirected with accept param
  if (acceptId && deliveries.length > 0 && !loadingId) {
    const found = deliveries.find((d: { id: string }) => d.id === acceptId);
    if (found) acceptDelivery(acceptId);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pedidos Disponiveis</h1>
          <p className="text-sm text-muted-foreground">{deliveries.length} pedido(s) aguardando entregador</p>
        </div>
      </div>

      {deliveries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-bold text-foreground">Nenhum pedido disponivel</h2>
          <p className="text-sm text-muted-foreground">Novos pedidos aparecerao automaticamente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deliveries.map((d: { id: string; store_name: string; delivery_address: string; store_address: string; delivery_fee: number; distance_km: number; estimated_time_min: number; customer_name: string; created_at: string; notes: string }) => (
            <div key={d.id} className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-secondary/20">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">{d.store_name || "Adega"}</h3>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Novo</span>
                  </div>

                  {d.store_address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 text-amber-400" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Retirar em</p>
                        <p className="text-xs text-foreground">{d.store_address}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 text-primary" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Entregar em</p>
                      <p className="text-xs text-foreground">{d.delivery_address}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {d.distance_km && (
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{d.distance_km} km</span>
                    )}
                    {d.estimated_time_min && (
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{d.estimated_time_min} min</span>
                    )}
                    <span className="flex items-center gap-1 font-bold text-green-400">
                      <DollarSign className="h-3 w-3" />{fmt(d.delivery_fee || 0)}
                    </span>
                  </div>

                  {d.notes && <p className="text-xs italic text-muted-foreground">Obs: {d.notes}</p>}
                </div>

                <button
                  type="button"
                  onClick={() => acceptDelivery(d.id)}
                  disabled={loadingId === d.id}
                  className="flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {loadingId === d.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Aceitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
