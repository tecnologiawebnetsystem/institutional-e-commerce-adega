"use client";

import useSWR from "swr";
import { DollarSign, TrendingUp, Package, Calendar } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(r => r.json());
function fmt(v: number) { return `R$ ${v.toFixed(2).replace(".", ",")}`; }

export default function EarningsPage() {
  const { data } = useSWR("/api/motoboy/earnings", fetcher);

  const today = data?.today || { total: 0, count: 0 };
  const week = data?.week || { total: 0, count: 0 };
  const month = data?.month || { total: 0, count: 0 };
  const allTime = data?.allTime || { total: 0, count: 0 };
  const dailyBreakdown = data?.dailyBreakdown || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Meus Ganhos</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Hoje", value: today.total, count: today.count, icon: DollarSign, color: "green" },
          { label: "Esta Semana", value: week.total, count: week.count, icon: TrendingUp, color: "primary" },
          { label: "Este Mes", value: month.total, count: month.count, icon: Calendar, color: "amber" },
          { label: "Total Geral", value: allTime.total, count: allTime.count, icon: Package, color: "primary" },
        ].map(item => (
          <div key={item.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.color === "green" ? "bg-green-500/10" : item.color === "amber" ? "bg-amber-500/10" : "bg-primary/10"}`}>
                <item.icon className={`h-5 w-5 ${item.color === "green" ? "text-green-400" : item.color === "amber" ? "text-amber-400" : "text-primary"}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-xl font-bold text-foreground">{fmt(item.value)}</p>
                <p className="text-xs text-muted-foreground">{item.count} entrega(s)</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Daily breakdown */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold text-foreground">Resumo por Dia (ultimos 30 dias)</h2>
        </div>
        {dailyBreakdown.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Nenhum dado disponivel</div>
        ) : (
          <div className="divide-y divide-border">
            {dailyBreakdown.map((day: { date: string; total: number; count: number }) => (
              <div key={day.date} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(day.date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })}
                  </p>
                  <p className="text-xs text-muted-foreground">{day.count} entrega(s)</p>
                </div>
                <p className="text-sm font-bold text-green-400">{fmt(day.total)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
