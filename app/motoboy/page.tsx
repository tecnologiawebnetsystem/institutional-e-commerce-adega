"use client";

import useSWR from "swr";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Bike, Package, DollarSign, Star, Clock, MapPin, Power, Volume2, VolumeX, TrendingUp, AlertCircle } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function fmt(v: number) { return `R$ ${v.toFixed(2).replace(".", ",")}`; }

export default function MotoboyDashboardPage() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevPendingCount = useRef(0);

  const { data: stats, mutate: mutateStats } = useSWR("/api/motoboy/stats", fetcher, { refreshInterval: 10000 });
  const { data: statusData, mutate: mutateStatus } = useSWR("/api/motoboy/status", fetcher);
  const { data: pendingData } = useSWR("/api/motoboy/deliveries?status=pending", fetcher, { refreshInterval: 5000 });
  const { data: activeData } = useSWR("/api/motoboy/deliveries?status=active", fetcher, { refreshInterval: 5000 });

  const isOnline = statusData?.isAvailable || false;
  const activeDelivery = activeData?.deliveries?.[0];
  const pendingOrders = pendingData?.deliveries || [];

  // Sound notification when new orders arrive
  useEffect(() => {
    if (soundEnabled && pendingOrders.length > prevPendingCount.current && prevPendingCount.current >= 0 && isOnline) {
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2LkZSPi4eDfHR0eH+Gi42LiIaDfnp2d3t/hIiKiomHhIB9ent8f4SHiYqJh4WCfnx7fH6BhYeJiYiFgoB+fHx9f4KFh4mIhoOAfn18fX+ChYeIiIaDgH5+fX5/goWHiIiGg4B+fnx+f4KFh4iIhoOAfn59fn+ChYeIiIaDgH5+fX5/goWHiIiGg4B+fn1+f4KFh4eIhoSBfn59fn+ChYeIh4aEgX5+fX5/goWHiIeGhIF+fn5+f4KFh4eIhoSBfn5+fn+ChYeHiIaEgX5+fn5/goWHh4iGhIF+fn5+f4KFh4eHhoSBf35+fn+ChYeHh4aEgX9+fn5/goWHh4eGhIF/fn5+f4KFh4eHhoSBf35+fn+ChYeHh4aEgX9+fn5/goWHh4eGhIF/fn5+f4KFh4eHhoSBf35+fn+Bg4WHh4eGhIF/fn5+f4KFh4eHhoSBf35+fn+ChYeHh4aEgX9+fn5/goWHh4eGhIF/fn5+f4A=");
        }
        audioRef.current.play().catch(() => {});
      } catch {}
    }
    prevPendingCount.current = pendingOrders.length;
  }, [pendingOrders.length, soundEnabled, isOnline]);

  const toggleOnline = useCallback(async () => {
    await fetch("/api/motoboy/status", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !isOnline }),
    });
    mutateStatus();
    mutateStats();
  }, [isOnline, mutateStatus, mutateStats]);

  const todayEarnings = stats?.todayEarnings || 0;
  const todayDeliveries = stats?.todayDeliveries || 0;
  const weekEarnings = stats?.weekEarnings || 0;
  const avgRating = stats?.avgRating || 0;
  const totalDeliveries = stats?.totalDeliveries || 0;

  const statusLabels: Record<string, string> = {
    accepted: "Aceito",
    picking_up: "Buscando",
    in_transit: "Em transito",
    arrived: "Chegou no destino",
  };

  return (
    <div className="space-y-6">
      {/* Header with online toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel do Motoboy</h1>
          <p className="text-sm text-muted-foreground">Gerencie suas entregas em tempo real</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
            title={soundEnabled ? "Desativar notificacao sonora" : "Ativar notificacao sonora"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={toggleOnline}
            className={`flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold transition-all ${
              isOnline
                ? "bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25"
                : "bg-muted text-muted-foreground border border-border hover:bg-secondary"
            }`}
          >
            <Power className="h-4 w-4" />
            {isOnline ? "Online" : "Offline"}
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ganho Hoje</p>
              <p className="text-lg font-bold text-foreground">{fmt(todayEarnings)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Entregas Hoje</p>
              <p className="text-lg font-bold text-foreground">{todayDeliveries}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <TrendingUp className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Semana</p>
              <p className="text-lg font-bold text-foreground">{fmt(weekEarnings)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
              <Star className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avaliacao</p>
              <p className="text-lg font-bold text-foreground">{avgRating > 0 ? avgRating.toFixed(1) : "-"} <span className="text-xs font-normal text-muted-foreground">({totalDeliveries} entregas)</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Active delivery */}
      {activeDelivery && (
        <div className="rounded-xl border-2 border-primary bg-primary/5 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary">
              <Bike className="h-5 w-5" />
              Entrega Ativa
            </h2>
            <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              {statusLabels[activeDelivery.status] || activeDelivery.status}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Entregar em</p>
                <p className="text-sm font-medium text-foreground">{activeDelivery.delivery_address}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Cliente</p>
                <p className="text-sm font-medium text-foreground">{activeDelivery.customer_name || "N/A"}</p>
                {activeDelivery.customer_phone && <p className="text-xs text-muted-foreground">{activeDelivery.customer_phone}</p>}
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Link
              href="/motoboy/entrega"
              className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
            >
              Ver Detalhes
            </Link>
            {activeDelivery.delivery_address && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeDelivery.delivery_address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <MapPin className="h-4 w-4" />
                Abrir Mapa
              </a>
            )}
          </div>
        </div>
      )}

      {/* Pending orders */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Pedidos Disponiveis</h2>
          {pendingOrders.length > 0 && (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-primary-foreground">
              {pendingOrders.length}
            </span>
          )}
        </div>

        {!isOnline ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-8 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Fique online para receber pedidos de entrega.</p>
            <button type="button" onClick={toggleOnline} className="flex h-10 items-center gap-2 rounded-lg bg-green-500/15 px-4 text-sm font-semibold text-green-400 border border-green-500/30 hover:bg-green-500/25 transition-all">
              <Power className="h-4 w-4" /> Ficar Online
            </button>
          </div>
        ) : pendingOrders.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-8 text-center">
            <Package className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Nenhum pedido disponivel no momento.</p>
            <p className="text-xs text-muted-foreground">Aguarde, novos pedidos aparecerao automaticamente.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingOrders.slice(0, 5).map((d: { id: string; store_name: string; delivery_address: string; delivery_fee: number; distance_km: number; estimated_time_min: number; created_at: string }) => (
              <div key={d.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/30">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{d.store_name || "Adega"}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{d.delivery_address}</p>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                    {d.distance_km && <span>{d.distance_km} km</span>}
                    {d.estimated_time_min && <span>{d.estimated_time_min} min</span>}
                    <span className="font-semibold text-green-400">{fmt(d.delivery_fee || 0)}</span>
                  </div>
                </div>
                <Link
                  href={`/motoboy/pedidos?accept=${d.id}`}
                  className="flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:brightness-110 transition-all"
                >
                  Aceitar
                </Link>
              </div>
            ))}
            {pendingOrders.length > 5 && (
              <Link href="/motoboy/pedidos" className="block text-center text-sm font-medium text-primary hover:underline">
                Ver todos ({pendingOrders.length})
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
