"use client";

import useSWR from "swr";
import { useState } from "react";
import { History, MapPin, CheckCircle, XCircle, Clock } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(r => r.json());
function fmt(v: number) { return `R$ ${v.toFixed(2).replace(".", ",")}`; }

export default function HistoryPage() {
  const [period, setPeriod] = useState("today");
  const { data } = useSWR(`/api/motoboy/deliveries?period=${period}`, fetcher);

  const deliveries = data?.deliveries || [];
  const total = deliveries.filter((d: { status: string }) => d.status === "delivered").reduce((sum: number, d: { delivery_fee: number }) => sum + (d.delivery_fee || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Historico de Entregas</h1>
          <p className="text-sm text-muted-foreground">{deliveries.length} entrega(s) - Total: {fmt(total)}</p>
        </div>
        <div className="flex gap-2">
          {[
            { key: "today", label: "Hoje" },
            { key: "week", label: "Semana" },
            { key: "month", label: "Mes" },
            { key: "all", label: "Todas" },
          ].map(p => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriod(p.key)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                period === p.key ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border hover:bg-secondary"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {deliveries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-12 text-center">
          <History className="h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Nenhuma entrega neste periodo</p>
        </div>
      ) : (
        <div className="space-y-2">
          {deliveries.map((d: { id: string; store_name: string; delivery_address: string; delivery_fee: number; status: string; delivered_at: string; cancelled_at: string; created_at: string; cancel_reason: string; distance_km: number }) => (
            <div key={d.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${d.status === "delivered" ? "bg-green-500/10" : "bg-destructive/10"}`}>
                {d.status === "delivered" ? <CheckCircle className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-destructive" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{d.store_name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{d.delivery_address}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(d.delivered_at || d.cancelled_at || d.created_at).toLocaleString("pt-BR")}</span>
                  {d.distance_km && <span>{d.distance_km} km</span>}
                </div>
                {d.cancel_reason && <p className="mt-1 text-xs italic text-destructive">Cancelado: {d.cancel_reason}</p>}
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${d.status === "delivered" ? "text-green-400" : "text-muted-foreground line-through"}`}>{fmt(d.delivery_fee || 0)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
