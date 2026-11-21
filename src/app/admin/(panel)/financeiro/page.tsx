import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { Stat } from "@/components/admin/stat";
import { CashFlowChart, SingleBarChart } from "@/components/admin/charts";
import { ActionButton } from "@/components/admin/action-button";
import { generateMonthlyInvoices } from "@/lib/admin/finance-actions";
import { currentMonth, financeSummary } from "@/lib/finance";
import { formatBRL, formatDate } from "@/lib/utils";

export default async function FinancePage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  await requireAdmin();
  const { mes } = await searchParams;
  const month = mes && /^\d{4}-\d{2}$/.test(mes) ? mes : currentMonth();
  const db = await createClient();
  const s = await financeSummary(db, month);
  const balance = s.incomeReceived - s.expensePaid;
  const overdueTotal = s.overdueReceivable.reduce((a, t) => a + t.amount_cents, 0);

  return (
    <>
      <PageHeader title="Financeiro" description="Previsto x realizado. Um valor só conta como pago/recebido após a sua confirmação manual (ou conciliação de extrato)."
        actions={<>
          <form className="flex gap-2"><input type="month" name="mes" defaultValue={month} className="input py-2" aria-label="Mês" /><button className="btn-ghost px-4 py-2 text-xs">Ver</button></form>
          <ActionButton variant="dark" action={generateMonthlyInvoices.bind(null, month)} confirm="Lançar como “previsto” as mensalidades deste mês dos clientes ativos que ainda não têm lançamento?">Gerar mensalidades do mês</ActionButton>
          <a href={`/admin/financeiro/exportar?mes=${month}`} className="btn-ghost px-4 py-2 text-xs">Exportar CSV</a>
        </>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="A receber (previsto)" value={formatBRL(s.incomeExpected)} hint={`Recebido: ${formatBRL(s.incomeReceived)}`} />
        <Stat label="A pagar (previsto)" value={formatBRL(s.expenseExpected)} hint={`Pago: ${formatBRL(s.expensePaid)} · Fixas ${formatBRL(s.fixedExpenses)} · Variáveis ${formatBRL(s.variableExpenses)}`} />
        <Stat label="Saldo realizado no mês" value={formatBRL(balance)} tone={balance >= 0 ? "good" : "bad"} />
        <Stat label="Receita recorrente (MRR)" value={formatBRL(s.mrr)} hint="Soma das mensalidades de clientes ativos" tone="dark" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="Fluxo de caixa realizado — 12 meses" className="xl:col-span-2"><CashFlowChart data={s.series} /></Panel>
        <Panel title="Despesas do mês por categoria"><SingleBarChart data={s.byCategory} label="Despesas" money horizontal /></Panel>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title={`Inadimplência — ${formatBRL(overdueTotal)}`} actions={<Link href="/admin/financeiro/lancamentos?status=vencido&tipo=receita" className="text-xs font-semibold text-teal-600 hover:underline">Ver todos</Link>}>
          <ul className="divide-y divide-mist-100 text-sm">
            {s.overdueReceivable.slice(0, 10).map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-2">
                <Link href={`/admin/financeiro/lancamentos/${t.id}`} className="min-w-0 truncate hover:text-teal-600">{t.client_name ?? t.description}</Link>
                <span className="shrink-0 text-red-600">{formatBRL(t.amount_cents)} · venceu {formatDate(t.due_date)}</span>
              </li>
            ))}
            {!s.overdueReceivable.length && <li className="py-4 text-mist-600">Nenhum recebimento vencido. 🎉</li>}
          </ul>
        </Panel>
        <Panel title="Contas a pagar vencidas">
          <ul className="divide-y divide-mist-100 text-sm">
            {s.overduePayable.slice(0, 10).map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-2">
                <Link href={`/admin/financeiro/lancamentos/${t.id}`} className="min-w-0 truncate hover:text-teal-600">{t.description}</Link>
                <span className="shrink-0 text-red-600">{formatBRL(t.amount_cents)} · {formatDate(t.due_date)}</span>
              </li>
            ))}
            {!s.overduePayable.length && <li className="py-4 text-mist-600">Nenhuma conta vencida.</li>}
          </ul>
        </Panel>
      </div>
    </>
  );
}
