"use client";

import useSWR from "swr";
import { useState, useRef } from "react";
import { Bike, MapPin, Phone, Package, Camera, X, CheckCircle, AlertTriangle, Navigation, Clock } from "lucide-react";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then(r => r.json());
function fmt(v: number) { return `R$ ${v.toFixed(2).replace(".", ",")}`; }

const steps = [
  { key: "accepted", label: "Aceito", next: "picking_up", nextLabel: "Buscar Pedido" },
  { key: "picking_up", label: "Buscando", next: "in_transit", nextLabel: "Saindo para Entrega" },
  { key: "in_transit", label: "Em Transito", next: "arrived", nextLabel: "Cheguei no Destino" },
  { key: "arrived", label: "Chegou", next: "delivered", nextLabel: "Confirmar Entrega" },
];

export default function ActiveDeliveryPage() {
  const { data, mutate } = useSWR("/api/motoboy/deliveries?status=active", fetcher, { refreshInterval: 5000 });
  const [loading, setLoading] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showProof, setShowProof] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const delivery = data?.deliveries?.[0];

  async function updateStatus(action: string, extra?: Record<string, string>) {
    setLoading(true);
    try {
      const res = await fetch("/api/motoboy/deliveries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryId: delivery.id, action, ...extra }),
      });
      if (!res.ok) { const d = await res.json(); toast.error(d.error); return; }
      toast.success(action === "delivered" ? "Entrega confirmada!" : "Status atualizado!");
      mutate();
    } catch { toast.error("Erro de conexao"); } finally { setLoading(false); }
  }

  async function handleCancel() {
    if (!cancelReason.trim()) { toast.error("Informe o motivo"); return; }
    await updateStatus("cancel", { cancelReason });
    setShowCancel(false);
  }

  async function handleDeliveredWithProof() {
    const file = fileRef.current?.files?.[0];
    let proofUrl = "";
    if (file) {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (res.ok) { const d = await res.json(); proofUrl = d.url; }
    }
    await updateStatus("delivered", proofUrl ? { proofPhotoUrl: proofUrl } : {});
    setShowProof(false);
  }

  if (!delivery) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-12 text-center">
        <Bike className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-lg font-bold text-foreground">Nenhuma entrega ativa</h2>
        <p className="text-sm text-muted-foreground">Aceite um pedido para comecar</p>
      </div>
    );
  }

  const currentStep = steps.findIndex(s => s.key === delivery.status);
  const nextStep = steps[currentStep];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Entrega Ativa</h1>

      {/* Progress bar */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.key} className="flex flex-1 items-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                i <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {i < currentStep ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`mx-2 h-0.5 flex-1 ${i < currentStep ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between">
          {steps.map(s => (
            <span key={s.key} className="flex-1 text-center text-[10px] text-muted-foreground">{s.label}</span>
          ))}
        </div>
      </div>

      {/* Delivery info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <MapPin className="h-4 w-4 text-primary" /> Endereco de Entrega
          </h3>
          <p className="text-sm text-foreground">{delivery.delivery_address}</p>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(delivery.delivery_address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
          >
            <Navigation className="h-3 w-3" /> Abrir no Google Maps
          </a>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Package className="h-4 w-4 text-primary" /> Detalhes
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Adega</span><span className="text-foreground">{delivery.store_name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Cliente</span><span className="text-foreground">{delivery.customer_name || "N/A"}</span></div>
            {delivery.customer_phone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Telefone</span>
                <a href={`tel:${delivery.customer_phone}`} className="flex items-center gap-1 text-primary hover:underline">
                  <Phone className="h-3 w-3" />{delivery.customer_phone}
                </a>
              </div>
            )}
            <div className="flex justify-between"><span className="text-muted-foreground">Taxa</span><span className="font-bold text-green-400">{fmt(delivery.delivery_fee || 0)}</span></div>
            {delivery.distance_km && <div className="flex justify-between"><span className="text-muted-foreground">Distancia</span><span className="text-foreground">{delivery.distance_km} km</span></div>}
            {delivery.notes && <div className="flex justify-between"><span className="text-muted-foreground">Obs</span><span className="text-foreground">{delivery.notes}</span></div>}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {nextStep && nextStep.next !== "delivered" && (
          <button
            type="button"
            onClick={() => updateStatus(nextStep.next)}
            disabled={loading}
            className="flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:brightness-110 disabled:opacity-50"
          >
            {loading ? <Clock className="h-4 w-4 animate-spin" /> : <Bike className="h-4 w-4" />}
            {nextStep.nextLabel}
          </button>
        )}

        {nextStep && nextStep.next === "delivered" && (
          <button
            type="button"
            onClick={() => setShowProof(true)}
            disabled={loading}
            className="flex h-12 items-center gap-2 rounded-xl bg-green-600 px-6 text-sm font-bold text-primary-foreground shadow-md transition-all hover:brightness-110 disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4" />
            Confirmar Entrega
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowCancel(true)}
          className="flex h-12 items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-6 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20"
        >
          <AlertTriangle className="h-4 w-4" /> Cancelar Entrega
        </button>

        {delivery.customer_phone && (
          <a
            href={`https://wa.me/55${delivery.customer_phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 items-center gap-2 rounded-xl border border-border bg-card px-6 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <Phone className="h-4 w-4" /> WhatsApp
          </a>
        )}
      </div>

      {/* Cancel modal */}
      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Cancelar Entrega</h3>
              <button type="button" onClick={() => setShowCancel(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="Motivo do cancelamento..."
              rows={3}
              className="mb-4 w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowCancel(false)} className="flex-1 rounded-lg border border-border bg-transparent py-2.5 text-sm font-medium text-foreground hover:bg-secondary">Voltar</button>
              <button type="button" onClick={handleCancel} disabled={loading} className="flex-1 rounded-lg bg-destructive py-2.5 text-sm font-bold text-destructive-foreground hover:brightness-110 disabled:opacity-50">Confirmar Cancelamento</button>
            </div>
          </div>
        </div>
      )}

      {/* Proof of delivery modal */}
      {showProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Comprovante de Entrega</h3>
              <button type="button" onClick={() => setShowProof(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">Tire uma foto como comprovante (opcional)</p>
            <div className="mb-4">
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-8 text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                <Camera className="h-8 w-8" />
                <span className="text-sm">Tirar foto ou escolher arquivo</span>
                <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" />
              </label>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowProof(false); updateStatus("delivered"); }} className="flex-1 rounded-lg border border-border bg-transparent py-2.5 text-sm font-medium text-foreground hover:bg-secondary">Sem foto</button>
              <button type="button" onClick={handleDeliveredWithProof} disabled={loading} className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-bold text-primary-foreground hover:brightness-110 disabled:opacity-50">Confirmar com Foto</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
