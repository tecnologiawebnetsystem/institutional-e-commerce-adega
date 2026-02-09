"use client";

import useSWR from "swr";
import { useState } from "react";
import { User, Bike, MapPin, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then(r => r.json());
const inputClass = "w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export default function ProfilePage() {
  const { data, mutate } = useSWR("/api/motoboy/profile", fetcher);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [cnh, setCnh] = useState("");
  const [vehicleType, setVehicleType] = useState("moto");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [motoboyMode, setMotoboyMode] = useState("freelancer");
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [initialized, setInitialized] = useState(false);

  if (data?.user && !initialized) {
    const u = data.user;
    setName(u.name || "");
    setPhone(u.phone || "");
    setCpf(u.cpf || "");
    setCnh(u.cnh || "");
    setVehicleType(u.vehicle_type || "moto");
    setVehiclePlate(u.vehicle_plate || "");
    setMotoboyMode(u.motoboy_mode || "freelancer");
    setCep(u.cep || "");
    setStreet(u.street || "");
    setNumber(u.number || "");
    setNeighborhood(u.neighborhood || "");
    setCity(u.city || "");
    setState(u.state || "");
    setInitialized(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/motoboy/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, cpf, cnh, vehicleType, vehiclePlate, motoboyMode, cep, street, number, neighborhood, city, state }),
      });
      if (!res.ok) { toast.error("Erro ao salvar"); return; }
      toast.success("Perfil atualizado!");
      mutate();
    } catch { toast.error("Erro de conexao"); } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal data */}
        <fieldset className="rounded-xl border border-border bg-card p-5">
          <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground"><User className="h-4 w-4 text-primary" /> Dados Pessoais</legend>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">Nome *</label>
                <input id="name" value={name} onChange={e => setName(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-foreground">Telefone</label>
                <input id="phone" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cpf" className="mb-1.5 block text-sm font-medium text-foreground">CPF</label>
                <input id="cpf" value={cpf} onChange={e => setCpf(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="mode" className="mb-1.5 block text-sm font-medium text-foreground">Modo de Trabalho</label>
                <select id="mode" value={motoboyMode} onChange={e => setMotoboyMode(e.target.value)} className={inputClass}>
                  <option value="freelancer">Freelancer (todas as adegas)</option>
                  <option value="linked">Vinculado (adega especifica)</option>
                </select>
              </div>
            </div>
          </div>
        </fieldset>

        {/* Vehicle data */}
        <fieldset className="rounded-xl border border-border bg-card p-5">
          <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground"><Bike className="h-4 w-4 text-primary" /> Dados do Veiculo</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="cnh" className="mb-1.5 block text-sm font-medium text-foreground">CNH *</label>
              <input id="cnh" value={cnh} onChange={e => setCnh(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="vtype" className="mb-1.5 block text-sm font-medium text-foreground">Tipo de Veiculo</label>
              <select id="vtype" value={vehicleType} onChange={e => setVehicleType(e.target.value)} className={inputClass}>
                <option value="moto">Moto</option>
                <option value="bicicleta">Bicicleta</option>
                <option value="carro">Carro</option>
              </select>
            </div>
            <div>
              <label htmlFor="plate" className="mb-1.5 block text-sm font-medium text-foreground">Placa *</label>
              <input id="plate" value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value.toUpperCase())} className={`${inputClass} uppercase`} required />
            </div>
          </div>
        </fieldset>

        {/* Address */}
        <fieldset className="rounded-xl border border-border bg-card p-5">
          <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground"><MapPin className="h-4 w-4 text-primary" /> Endereco Base</legend>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="cep" className="mb-1.5 block text-sm font-medium text-foreground">CEP</label>
                <input id="cep" value={cep} onChange={e => setCep(e.target.value)} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="str" className="mb-1.5 block text-sm font-medium text-foreground">Rua</label>
                <input id="str" value={street} onChange={e => setStreet(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label htmlFor="num" className="mb-1.5 block text-sm font-medium text-foreground">Numero</label>
                <input id="num" value={number} onChange={e => setNumber(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="nb" className="mb-1.5 block text-sm font-medium text-foreground">Bairro</label>
                <input id="nb" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="ct" className="mb-1.5 block text-sm font-medium text-foreground">Cidade</label>
                <input id="ct" value={city} onChange={e => setCity(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="st" className="mb-1.5 block text-sm font-medium text-foreground">Estado</label>
                <input id="st" value={state} onChange={e => setState(e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={loading}
          className="flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:brightness-110 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar Alteracoes
        </button>
      </form>
    </div>
  );
}
