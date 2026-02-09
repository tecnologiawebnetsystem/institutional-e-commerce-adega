"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wine, Eye, EyeOff, Loader2, User, Store, Bike, Check } from "lucide-react";
import { toast } from "sonner";

const inputClass =
  "w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

type Role = "customer" | "owner" | "motoboy";

const roles: { value: Role; label: string; desc: string; icon: typeof User }[] = [
  { value: "customer", label: "Sou Cliente", desc: "Quero comprar bebidas", icon: User },
  { value: "owner", label: "Tenho uma Adega", desc: "Quero vender na plataforma", icon: Store },
  { value: "motoboy", label: "Sou Motoboy", desc: "Quero fazer entregas", icon: Bike },
];

export default function CadastroPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("customer");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [error, setError] = useState("");

  // Common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");

  // Address
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Owner-specific
  const [cnpj, setCnpj] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");

  // Motoboy-specific
  const [cnh, setCnh] = useState("");
  const [vehicleType, setVehicleType] = useState("moto");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [motoboyMode, setMotoboyMode] = useState("freelancer");

  function maskPhone(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : "";
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  function maskCpf(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  }
  function maskCnpj(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 14);
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
    if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
    if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  }
  function maskCep(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 8);
    if (d.length <= 5) return d;
    return `${d.slice(0, 5)}-${d.slice(5)}`;
  }
  function maskPlate(v: string) {
    return v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  }

  async function lookupCep(value: string) {
    const digits = value.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`/api/cep/${digits}`);
      if (res.ok) {
        const data = await res.json();
        if (data.street) setStreet(data.street);
        if (data.neighborhood) setNeighborhood(data.neighborhood);
        if (data.city) setCity(data.city);
        if (data.state) setState(data.state);
        toast.success("Endereco encontrado!");
      } else {
        toast.error("CEP nao encontrado");
      }
    } catch {
      toast.error("Erro ao buscar CEP");
    } finally {
      setCepLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !pin) {
      setError("Preencha todos os campos obrigatorios.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter no minimo 6 caracteres.");
      return;
    }
    if (pin.length !== 4) {
      setError("O PIN deve ter 4 digitos.");
      return;
    }
    if (role === "owner" && (!cnpj || !storeName)) {
      setError("CNPJ e nome da adega sao obrigatorios para donos de adega.");
      return;
    }
    if (role === "motoboy" && (!cpf || !cnh || !vehiclePlate)) {
      setError("CPF, CNH e placa do veiculo sao obrigatorios para motoboys.");
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, string> = {
        name, email, password, pin, phone, role,
        cep: cep.replace(/\D/g, ""), street, number, complement, neighborhood, city, state,
        cpf: cpf.replace(/\D/g, ""),
      };
      if (role === "owner") {
        body.cnpj = cnpj.replace(/\D/g, "");
        body.storeName = storeName;
        body.storeDescription = storeDescription;
      }
      if (role === "motoboy") {
        body.cnh = cnh;
        body.vehicleType = vehicleType;
        body.vehiclePlate = vehiclePlate;
        body.motoboyMode = motoboyMode;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro no cadastro");
        setLoading(false);
        return;
      }

      toast.success("Conta criada com sucesso!");
      if (data.user.role === "owner") {
        router.push("/dashboard");
      } else if (data.user.role === "motoboy") {
        router.push("/motoboy");
      } else {
        router.push("/adegas");
      }
      router.refresh();
    } catch {
      setError("Erro de conexao. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-start justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-flex items-center gap-2 text-2xl font-bold text-primary">
            <Wine className="h-7 w-7" />
            <span>Adega<span className="italic">Express</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Criar sua conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">Escolha seu perfil e preencha os dados</p>
        </div>

        {/* Role Selection */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {roles.map((r) => {
            const Icon = r.icon;
            const active = role === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-muted-foreground/40 hover:bg-secondary/50"
                }`}
              >
                {active && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </span>
                )}
                <Icon className="h-6 w-6" />
                <span className="text-sm font-semibold">{r.label}</span>
                <span className="text-xs opacity-70">{r.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/20">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
          )}

          {/* --- Section: Dados Pessoais --- */}
          <fieldset>
            <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Dados Pessoais
            </legend>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">Nome completo *</label>
                <input id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Seu nome completo" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">Email *</label>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="seu@email.com" required />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-foreground">Telefone</label>
                  <input id="phone" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} className={inputClass} placeholder="(12) 99999-9999" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="pw" className="mb-1.5 block text-sm font-medium text-foreground">Senha *</label>
                  <div className="relative">
                    <input id="pw" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pr-11`} placeholder="Min. 6 caracteres" required />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPw ? "Esconder senha" : "Mostrar senha"}>
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="pin" className="mb-1.5 block text-sm font-medium text-foreground">PIN numerico (4 digitos) *</label>
                  <input id="pin" type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} className={`${inputClass} text-center tracking-[0.5em]`} placeholder="0000" required />
                </div>
              </div>

              {/* CPF and CNPJ row */}
              <div className={role === "owner" ? "grid gap-4 sm:grid-cols-2" : ""}>
                <div>
                  <label htmlFor="cpf" className="mb-1.5 block text-sm font-medium text-foreground">
                    CPF {role === "motoboy" ? "*" : ""}
                  </label>
                  <input id="cpf" value={cpf} onChange={(e) => setCpf(maskCpf(e.target.value))} className={inputClass} placeholder="000.000.000-00" required={role === "motoboy"} />
                </div>
                {role === "owner" && (
                  <div>
                    <label htmlFor="cnpj" className="mb-1.5 block text-sm font-medium text-foreground">CNPJ *</label>
                    <input id="cnpj" value={cnpj} onChange={(e) => setCnpj(maskCnpj(e.target.value))} className={inputClass} placeholder="00.000.000/0000-00" required />
                  </div>
                )}
              </div>
            </div>
          </fieldset>

          {/* --- Section: Dados da Adega (owner only) --- */}
          {role === "owner" && (
            <fieldset>
              <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
                Dados da Adega
              </legend>
              <div className="space-y-4">
                <div>
                  <label htmlFor="storeName" className="mb-1.5 block text-sm font-medium text-foreground">Nome da Adega *</label>
                  <input id="storeName" value={storeName} onChange={(e) => setStoreName(e.target.value)} className={inputClass} placeholder="Ex: Adega do Joao" required />
                </div>
                <div>
                  <label htmlFor="storeDesc" className="mb-1.5 block text-sm font-medium text-foreground">Descricao da Adega</label>
                  <textarea id="storeDesc" value={storeDescription} onChange={(e) => setStoreDescription(e.target.value)} rows={3} className={inputClass} placeholder="Conte um pouco sobre sua adega, produtos, diferenciais..." />
                </div>
              </div>
            </fieldset>
          )}

          {/* --- Section: Dados do Veiculo (motoboy only) --- */}
          {role === "motoboy" && (
            <fieldset>
              <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
                Dados do Veiculo
              </legend>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="cnh" className="mb-1.5 block text-sm font-medium text-foreground">CNH *</label>
                    <input id="cnh" value={cnh} onChange={(e) => setCnh(e.target.value.replace(/\D/g, "").slice(0, 11))} className={inputClass} placeholder="N. do registro" required />
                  </div>
                  <div>
                    <label htmlFor="vehicleType" className="mb-1.5 block text-sm font-medium text-foreground">Tipo de Veiculo *</label>
                    <select id="vehicleType" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className={inputClass}>
                      <option value="moto">Moto</option>
                      <option value="bicicleta">Bicicleta</option>
                      <option value="carro">Carro</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="vehiclePlate" className="mb-1.5 block text-sm font-medium text-foreground">Placa *</label>
                    <input id="vehiclePlate" value={vehiclePlate} onChange={(e) => setVehiclePlate(maskPlate(e.target.value))} className={`${inputClass} uppercase`} placeholder="ABC1D23" required />
                  </div>
                </div>
                <div>
                  <label htmlFor="motoboyMode" className="mb-1.5 block text-sm font-medium text-foreground">Modo de Trabalho *</label>
                  <select id="motoboyMode" value={motoboyMode} onChange={(e) => setMotoboyMode(e.target.value)} className={inputClass}>
                    <option value="freelancer">Freelancer - Disponivel para todas as adegas</option>
                    <option value="linked">Vinculado - Trabalhar com adega especifica</option>
                  </select>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {motoboyMode === "freelancer" ? "Voce recebera pedidos de qualquer adega na plataforma." : "Voce trabalhara exclusivamente para adegas vinculadas. Pode alterar depois no perfil."}
                  </p>
                </div>
              </div>
            </fieldset>
          )}

          {/* --- Section: Endereco --- */}
          <fieldset>
            <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {role === "owner" ? "Endereco da Adega" : role === "motoboy" ? "Endereco (base de operacao)" : "Endereco de Entrega"}
            </legend>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="cep" className="mb-1.5 block text-sm font-medium text-foreground">CEP</label>
                  <div className="relative">
                    <input id="cep" value={cep} onChange={(e) => { const v = maskCep(e.target.value); setCep(v); if (v.replace(/\D/g, "").length === 8) lookupCep(v); }} className={inputClass} placeholder="12345-678" />
                    {cepLoading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />}
                  </div>
                </div>
                <div>
                  <label htmlFor="street" className="mb-1.5 block text-sm font-medium text-foreground">Rua</label>
                  <input id="street" value={street} onChange={(e) => setStreet(e.target.value)} className={inputClass} placeholder="Nome da rua" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="num" className="mb-1.5 block text-sm font-medium text-foreground">Numero</label>
                  <input id="num" value={number} onChange={(e) => setNumber(e.target.value)} className={inputClass} placeholder="123" />
                </div>
                <div>
                  <label htmlFor="comp" className="mb-1.5 block text-sm font-medium text-foreground">Complemento</label>
                  <input id="comp" value={complement} onChange={(e) => setComplement(e.target.value)} className={inputClass} placeholder="Apto, Sala..." />
                </div>
                <div>
                  <label htmlFor="neigh" className="mb-1.5 block text-sm font-medium text-foreground">Bairro</label>
                  <input id="neigh" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className={inputClass} placeholder="Bairro" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-foreground">Cidade</label>
                  <input id="city" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} placeholder="Cidade" />
                </div>
                <div>
                  <label htmlFor="state" className="mb-1.5 block text-sm font-medium text-foreground">Estado</label>
                  <select id="state" value={state} onChange={(e) => setState(e.target.value)} className={inputClass}>
                    <option value="">Selecione</option>
                    {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </fieldset>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:brightness-110 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Criando conta...
              </>
            ) : (
              role === "customer" ? "Criar minha conta" :
              role === "owner" ? "Cadastrar minha adega" :
              "Cadastrar como motoboy"
            )}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Ja tem conta?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">Entrar</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
