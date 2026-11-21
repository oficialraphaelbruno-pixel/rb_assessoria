import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Panel, StatusBadge } from "@/components/admin/page-header";
import { NewTransactionButton } from "@/components/admin/finance-forms";
import { monthRange } from "@/lib/finance";
import { formatBRL, formatDate } from "@/lib/utils";

type SP = { tipo?: string; status?: string; mes?: string; cliente?: string; categoria?: string; q?: string };

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdmin();
  const sp = await searchParams;
  const db = await createClient();
  let q = db.from("v_fin_transactions").select("*").order("due_date", { ascending: true }).limit(500);
  if (sp.tipo === "receita" || sp.tipo === "despesa") q = q.eq("kind", sp.tipo);
  if (sp.status && ["previsto", "pago", "cancelado", "vencido"].includes(sp.status)) q = q.eq("effective_status", sp.status);
  if (sp.mes && /^\d{4}-\d{2}$/.test(sp.mes)) { const r = monthRange(sp.mes); q = q.gte("due_date", r.start).lte("due_date", r.end); }
  if (sp.cliente && /^[0-9a-f-]{36}$/i.test(sp.cliente)) q = q.eq("client_id", sp.cliente);
  if (sp.categoria && /^[0-9a-f-]{36}$/i.test(sp.categoria)) q = q.eq("category_id", sp.categoria);
  if (sp.q?.trim()) q = q.ilike("description", `%${sp.q.trim().slice(0, 80).replace(/[%_]/g, "")}%`);
  const [{ data: rows }, { data: cats }, { data: clients }] = await Promise.all([
    q, db.from("fin_categories").select("id, name, kind").order("name"), db.from("crm_clients").select("id, name").order("name"),
  ]);
  const catOpts = (cats ?? []).map((c) => ({ value: c.id, label: c.name, kind: c.kind }));
  const clientOpts = (clients ?? []).map((c) => ({ value: c.id, label: c.name }));
  const totals = (rows ?? []).reduce((acc, t) => { if (t.status !== "cancelado") acc[t.kind as "receita" | "despesa"] += t.amount_cents; return acc; }, { receita: 0, despesa: 0 });

  return (
    <>
      <PageHeader title="Lançamentos" description="Contas a pagar e a receber, receitas recorrentes, despesas fixas e variáveis." actions={<NewTransactionButton categories={catOpts} clients={clientOpts} />} />
      <Panel>
        <form className="mb-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-7" role="search">
          <input name="q" defaultValue={sp.q} placeholder="Descrição" className="input lg:col-span-2" aria-label="Buscar descrição" />
          <select name="tipo" defaultValue={sp.tipo ?? ""} className="input" aria-label="Tipo"><option value="">Receitas e despesas</option><option value="receita">A receber</option><option value="despesa">A pagar</option></select>
          <select name="status" defaultValue={sp.status ?? ""} className="input" aria-label="Status"><option value="">Todos os status</option><option value="previsto">Previsto</option><option value="vencido">Vencido</option><option value="pago">Pago/recebido</option><option value="cancelado">Cancelado</option></select>
          <input type="month" name="mes" defaultValue={sp.mes} className="input" aria-label="Mês" />
          <select name="cliente" defaultValue={sp.cliente ?? ""} className="input" aria-label="Cliente"><option value="">Todos os clientes</option>{clientOpts.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select>
          <button className="btn-ghost px-4 py-2">Filtrar</button>
        </form>
        <p className="mb-3 text-sm text-mist-600">Total filtrado — a receber: <strong className="text-navy-800">{formatBRL(totals.receita)}</strong> · a pagar: <strong className="text-navy-800">{formatBRL(totals.despesa)}</strong></p>
        <div className="-mx-6 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-y border-mist-200 bg-mist-50 text-xs uppercase text-mist-600"><tr>
              <th className="px-6 py-3">Vencimento</th><th className="px-6 py-3">Descrição</th><th className="px-6 py-3">Categoria</th><th className="px-6 py-3">Cliente</th><th className="px-6 py-3 text-right">Valor</th><th className="px-6 py-3">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-mist-100">
              {(rows ?? []).map((t) => (
                <tr key={t.id} className="hover:bg-mist-50/60">
                  <td className="whitespace-nowrap px-6 py-3">{formatDate(t.due_date)}</td>
                  <td className="px-6 py-3"><Link href={`/admin/financeiro/lancamentos/${t.id}`} className="font-medium hover:text-teal-600">{t.description}</Link></td>
                  <td className="px-6 py-3 text-mist-600">{t.category_name ?? "—"}</td>
                  <td className="px-6 py-3 text-mist-600">{t.client_name ?? "—"}</td>
                  <td className={`whitespace-nowrap px-6 py-3 text-right font-medium ${t.kind === "receita" ? "text-emerald-700" : "text-navy-800"}`}>{t.kind === "despesa" ? "− " : ""}{formatBRL(t.amount_cents)}</td>
                  <td className="px-6 py-3"><StatusBadge value={t.effective_status} /></td>
                </tr>
              ))}
              {!rows?.length && <tr><td colSpan={6} className="px-6 py-10 text-center text-mist-600">Nenhum lançamento.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
