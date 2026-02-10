"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  QrCode,
  Save,
  Copy,
  Download,
  CreditCard,
  Smartphone,
  Mail,
  Building2,
  Key,
  Check,
  Loader2,
} from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const keyTypes = [
  { value: "cpf", label: "CPF", icon: CreditCard, placeholder: "000.000.000-00" },
  { value: "cnpj", label: "CNPJ", icon: Building2, placeholder: "00.000.000/0000-00" },
  { value: "email", label: "E-mail", icon: Mail, placeholder: "adega@email.com" },
  { value: "telefone", label: "Telefone", icon: Smartphone, placeholder: "+5512999999999" },
  { value: "aleatoria", label: "Chave Aleatoria", icon: Key, placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
];

export default function PixSettingsPage() {
  const { data, mutate } = useSWR("/api/dashboard/pix", fetcher);
  const [pixKey, setPixKey] = useState("");
  const [pixKeyType, setPixKeyType] = useState("cpf");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // QR Code generation
  const [amount, setAmount] = useState("");
  const [generating, setGenerating] = useState(false);
  const [pixPayload, setPixPayload] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (data?.pixKey) {
      setPixKey(data.pixKey);
      setPixKeyType(data.pixKeyType || "cpf");
    }
  }, [data]);

  const handleSave = async () => {
    if (!pixKey.trim()) {
      toast.error("Informe sua chave PIX");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/pix", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pixKey: pixKey.trim(), pixKeyType }),
      });
      if (!res.ok) throw new Error();
      toast.success("Chave PIX salva com sucesso!");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      mutate();
    } catch {
      toast.error("Erro ao salvar chave PIX");
    } finally {
      setSaving(false);
    }
  };

  const generateQrCode = async () => {
    if (!data?.pixKey) {
      toast.error("Cadastre sua chave PIX primeiro");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/dashboard/pix/qrcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount ? parseFloat(amount) : undefined,
          txId: `AE${Date.now()}`,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setPixPayload(json.payload);
      renderQrCode(json.payload);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao gerar QR Code";
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const renderQrCode = async (text: string) => {
    const QRCode = (await import("qrcode")).default;
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, text, {
        width: 280,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });
    }
  };

  const copyPayload = () => {
    navigator.clipboard.writeText(pixPayload);
    toast.success("Codigo PIX copiado!");
  };

  const downloadQr = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "pix-qrcode.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
    toast.success("QR Code baixado!");
  };

  const selectedType = keyTypes.find((t) => t.value === pixKeyType);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuracoes PIX</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre sua chave PIX e gere QR Codes para receber pagamentos
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cadastro da Chave PIX */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Key className="h-5 w-5 text-primary" />
            Chave PIX da Adega
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Tipo de Chave</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {keyTypes.map((type) => {
                  const Icon = type.icon;
                  const isActive = pixKeyType === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setPixKeyType(type.value)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="pixKey" className="mb-1.5 block text-sm font-medium text-foreground">
                Chave PIX
              </label>
              <input
                id="pixKey"
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder={selectedType?.placeholder || "Sua chave PIX"}
                className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !pixKey.trim()}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saved ? (
                <Check className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar Chave PIX"}
            </button>
          </div>

          {data?.pixKey && (
            <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
              <p className="text-xs font-medium text-emerald-400">Chave PIX ativa</p>
              <p className="mt-1 break-all font-mono text-sm text-foreground">{data.pixKey}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Tipo: {keyTypes.find((t) => t.value === data.pixKeyType)?.label || data.pixKeyType}
              </p>
            </div>
          )}
        </div>

        {/* Gerador de QR Code */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <QrCode className="h-5 w-5 text-primary" />
            Gerar QR Code PIX
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="pixAmount" className="mb-1.5 block text-sm font-medium text-foreground">
                Valor (opcional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                <input
                  id="pixAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Deixe vazio para gerar QR Code sem valor definido
              </p>
            </div>

            <button
              type="button"
              onClick={generateQrCode}
              disabled={generating || !data?.pixKey}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <QrCode className="h-4 w-4" />
              )}
              {generating ? "Gerando..." : "Gerar QR Code"}
            </button>

            {!data?.pixKey && (
              <p className="text-center text-xs text-amber-400">
                Cadastre sua chave PIX primeiro para gerar QR Codes
              </p>
            )}
          </div>

          {pixPayload && (
            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="rounded-xl bg-white p-4">
                <canvas ref={canvasRef} />
              </div>

              <div className="flex w-full gap-2">
                <button
                  type="button"
                  onClick={copyPayload}
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <Copy className="h-4 w-4" />
                  Copiar Codigo
                </button>
                <button
                  type="button"
                  onClick={downloadQr}
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <Download className="h-4 w-4" />
                  Baixar QR Code
                </button>
              </div>

              <div className="w-full rounded-lg border border-border bg-background p-3">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Codigo PIX (Copia e Cola)</p>
                <p className="break-all font-mono text-xs text-foreground">{pixPayload}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Formas de Pagamento Aceitas</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <CreditCard className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Debito</p>
              <p className="text-xs text-muted-foreground">Cartao de debito</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <CreditCard className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Credito</p>
              <p className="text-xs text-muted-foreground">Cartao de credito</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <QrCode className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">PIX</p>
              <p className="text-xs text-muted-foreground">Pagamento instantaneo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
