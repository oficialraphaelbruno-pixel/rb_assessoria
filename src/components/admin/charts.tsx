"use client";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

/** Paleta validada (CVD ΔE 11, contraste ≥ 3:1): receitas = turquesa RB, despesas = terracota. */
export const CHART = { income: "#13a09b", expense: "#d9774b", single: "#13a09b", grid: "#e5ecee", axis: "#8aa1a8", text: "#52676e" };
const brl = (v: number) => (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const tooltipStyle = { borderRadius: 12, border: "1px solid #d6e1e4", fontSize: 12, boxShadow: "0 8px 24px -12px rgb(13 56 69 / .25)" };

export function CashFlowChart({ data }: { data: { month: string; receitas: number; despesas: number }[] }) {
  return (
    <div className="h-72" role="img" aria-label="Gráfico de fluxo de caixa realizado por mês: receitas e despesas">
      <ResponsiveContainer>
        <BarChart data={data} barGap={2} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={CHART.grid} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: CHART.text, fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: CHART.axis, fontSize: 11 }} tickFormatter={brl} width={80} />
          <Tooltip cursor={{ fill: "rgb(13 56 69 / .04)" }} contentStyle={tooltipStyle} formatter={(v) => brl(Number(v))} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: CHART.text }} />
          <Bar dataKey="receitas" name="Receitas" fill={CHART.income} radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="despesas" name="Despesas" fill={CHART.expense} radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SingleBarChart({ data, label, money = false, horizontal = false }: { data: { name: string; value: number }[]; label: string; money?: boolean; horizontal?: boolean }) {
  const fmt = (v: number) => (money ? brl(v) : v.toLocaleString("pt-BR"));
  if (!data.length) return <p className="py-10 text-center text-sm text-mist-600">Sem dados no período.</p>;
  return (
    <div style={{ height: horizontal ? Math.max(160, data.length * 36) : 256 }} role="img" aria-label={label}>
      <ResponsiveContainer>
        <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid vertical={horizontal} horizontal={!horizontal} stroke={CHART.grid} />
          {horizontal ? (
            <>
              <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: CHART.axis, fontSize: 11 }} tickFormatter={fmt} />
              <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fill: CHART.text, fontSize: 12 }} width={140} />
            </>
          ) : (
            <>
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: CHART.text, fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: CHART.axis, fontSize: 11 }} tickFormatter={fmt} allowDecimals={false} width={money ? 80 : 32} />
            </>
          )}
          <Tooltip cursor={{ fill: "rgb(13 56 69 / .04)" }} contentStyle={tooltipStyle} formatter={(v) => [fmt(Number(v)), label]} />
          <Bar dataKey="value" name={label} fill={CHART.single} radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
