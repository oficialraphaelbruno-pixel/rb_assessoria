import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface Tx { id: string; kind: "receita" | "despesa"; description: string; amount_cents: number; paid_amount_cents: number | null; due_date: string; paid_at: string | null; status: string; effective_status: string; category_name: string | null; client_name: string | null; client_id: string | null; expense_type: string | null; recurrence: string }

export const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function monthRange(month: string) {
  const [y, m] = month.split("-").map(Number);
  return { start: `${month}-01`, end: new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10) };
}

export function currentMonth() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" }).slice(0, 7);
}

/** Resumo financeiro do mês (previsto x realizado) e série de 12 meses do realizado. */
export async function financeSummary(db: SupabaseClient, month: string) {
  const { start, end } = monthRange(month);
  const [y, m] = month.split("-").map(Number);
  const from = new Date(Date.UTC(y, m - 12, 1)).toISOString().slice(0, 10);
  const [{ data: monthTx }, { data: paid12 }, { data: overdue }, { data: clients }] = await Promise.all([
    db.from("v_fin_transactions").select("*").gte("due_date", start).lte("due_date", end).neq("status", "cancelado"),
    db.from("fin_transactions").select("kind, paid_amount_cents, amount_cents, paid_at").eq("status", "pago").gte("paid_at", from).lte("paid_at", end),
    db.from("v_fin_transactions").select("*").eq("effective_status", "vencido").order("due_date"),
    db.from("crm_clients").select("monthly_value_cents").eq("status", "ativo"),
  ]);
  const tx = (monthTx ?? []) as Tx[];
  const sum = (arr: Tx[], f: (t: Tx) => number) => arr.reduce((s, t) => s + f(t), 0);
  const inc = tx.filter((t) => t.kind === "receita"), exp = tx.filter((t) => t.kind === "despesa");
  const realized = (t: Tx) => (t.status === "pago" ? t.paid_amount_cents ?? t.amount_cents : 0);

  const series = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 12 + i, 1));
    return { key: d.toISOString().slice(0, 7), month: `${MONTHS[d.getUTCMonth()]}/${String(d.getUTCFullYear()).slice(2)}`, receitas: 0, despesas: 0 };
  });
  for (const p of paid12 ?? []) {
    const s = series.find((x) => x.key === String(p.paid_at).slice(0, 7));
    if (s) s[p.kind === "receita" ? "receitas" : "despesas"] += p.paid_amount_cents ?? p.amount_cents;
  }
  const byCategory = new Map<string, number>();
  exp.forEach((t) => byCategory.set(t.category_name ?? "Sem categoria", (byCategory.get(t.category_name ?? "Sem categoria") ?? 0) + t.amount_cents));

  const od = (overdue ?? []) as Tx[];
  return {
    incomeExpected: sum(inc, (t) => t.amount_cents), incomeReceived: sum(inc, realized),
    expenseExpected: sum(exp, (t) => t.amount_cents), expensePaid: sum(exp, realized),
    fixedExpenses: sum(exp.filter((t) => t.expense_type === "fixa"), (t) => t.amount_cents),
    variableExpenses: sum(exp.filter((t) => t.expense_type === "variavel"), (t) => t.amount_cents),
    overdueReceivable: od.filter((t) => t.kind === "receita"), overduePayable: od.filter((t) => t.kind === "despesa"),
    mrr: (clients ?? []).reduce((s, c) => s + (c.monthly_value_cents ?? 0), 0),
    series: series.map(({ month, receitas, despesas }) => ({ month, receitas, despesas })),
    byCategory: [...byCategory.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
  };
}
