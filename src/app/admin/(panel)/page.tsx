import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { Stat } from "@/components/admin/stat";
import { SingleBarChart } from "@/components/admin/charts";
import { currentMonth, financeSummary, MONTHS } from "@/lib/finance";
import { SOURCE_LABEL, STAGES } from "@/lib/admin/crm-constants";
import { formatBRL } from "@/lib/utils";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ periodo?: string; erro?: string }> }) {
  const staff = await requireStaff();
  const { periodo = "30", erro } = await searchParams;
  const db = await createClient();

  if (staff.role !== "admin") {
    const [{ count: services }, { count: clients }, { count: media }] = await Promise.all([
      db.from("services").select("id", { count: "exact", head: true }),
      db.from("portfolio_clients").select("id", { count: "exact", head: true }),
      db.from("media").select("id", { count: "exact", head: true }),
    ]);
    return (
      <>
        <PageHeader title={`Olá${staff.full_name ? `, ${staff.full_name}` : ""}!`} description="Você tem acesso ao gerenciamento de conteúdo do site." />
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/admin/servicos"><Stat label="Serviços" value={String(services ?? 0)} /></Link>
          <Link href="/admin/portfolio"><Stat label="Clientes & Projetos" value={String(clients ?? 0)} /></Link>
          <Link href="/admin/midia"><Stat label="Imagens na biblioteca" value={String(media ?? 0)} /></Link>
        </div>
      </>
    );
  }

  const days = ["7", "30", "90", "365"].includes(periodo) ? Number(periodo) : 30;
  const since = new Date(Date.now() - days * 864e5).toISOString();
  const prevSince = new Date(Date.now() - 2 * days * 864e5).toISOString();
  const yearAgo = new Date(); yearAgo.setUTCMonth(yearAgo.getUTCMonth() - 11, 1);

  const [{ data: leads }, { count: prevLeads }, { data: leads12 }, { count: crmActive }, { count: projActive }, { count: projDone }, { count: chats }, { count: handoffs }, fin] = await Promise.all([
    db.from("leads").select("source, stage, service, created_at").gte("created_at", since),
    db.from("leads").select("id", { count: "exact", head: true }).gte("created_at", prevSince).lt("created_at", since),
    db.from("leads").select("created_at").gte("created_at", yearAgo.toISOString()),
    db.from("crm_clients").select("id", { count: "exact", head: true }).eq("status", "ativo"),
    db.from("projects").select("id", { count: "exact", head: true }).eq("status", "ativo"),
    db.from("projects").select("id", { count: "exact", head: true }).eq("status", "concluido"),
    db.from("chat_conversations").select("id", { count: "exact", head: true }).gte("created_at", since),
    db.from("chat_conversations").select("id", { count: "exact", head: true }).eq("needs_human", true),
    financeSummary(db, currentMonth()),
  ]);
  const L = leads ?? [];
  const growth = prevLeads ? Math.round(((L.length - prevLeads) / prevLeads) * 100) : null;
  const won = L.filter((l) => l.stage === "fechado").length;
  const count = (key: "source" | "service") => {
    const m = new Map<string, number>();
    L.forEach((l) => { const k = (l[key] as string) || "Não informado"; m.set(k, (m.get(k) ?? 0) + 1); });
    return [...m.entries()].map(([name, value]) => ({ name: key === "source" ? SOURCE_LABEL[name] ?? name : name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  };
  const monthly = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(yearAgo); d.setUTCMonth(yearAgo.getUTCMonth() + i);
    const key = d.toISOString().slice(0, 7);
    return { name: `${MONTHS[d.getUTCMonth()]}`, value: (leads12 ?? []).filter((l) => l.created_at.slice(0, 7) === key).length };
  });
  const overdue = fin.overdueReceivable.reduce((s, t) => s + t.amount_cents, 0);

  return (
    <>
      <PageHeader title="Dashboard" description="Visão geral comercial, financeira e do atendimento."
        actions={<div className="flex gap-1">{[["7", "7 dias"], ["30", "30 dias"], ["90", "90 dias"], ["365", "12 meses"]].map(([v, l]) => (
          <Link key={v} href={`?periodo=${v}`} className={`rounded-lg px-3 py-2 text-sm ${String(days) === v ? "bg-navy-800 text-white" : "bg-white"}`}>{l}</Link>))}</div>} />
      {erro === "permissao" && <p role="alert" className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Você não tem permissão para acessar aquela área.</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/admin/leads"><Stat label={`Leads (${days} dias)`} value={String(L.length)} hint={growth == null ? "Sem período anterior para comparar" : `${growth >= 0 ? "+" : ""}${growth}% vs. período anterior`} tone="dark" /></Link>
        <Stat label="Solicitações de orçamento" value={String(L.filter((l) => l.source === "site").length)} hint={`${won} lead(s) fechado(s) no período`} />
        <Link href="/admin/clientes"><Stat label="Clientes ativos" value={String(crmActive ?? 0)} hint={`MRR ${formatBRL(fin.mrr)}`} /></Link>
        <Link href="/admin/projetos"><Stat label="Projetos" value={`${projActive ?? 0} ativos`} hint={`${projDone ?? 0} concluídos`} /></Link>
        <Link href="/admin/financeiro"><Stat label="Receita do mês (prevista)" value={formatBRL(fin.incomeExpected)} hint={`Recebido: ${formatBRL(fin.incomeReceived)}`} /></Link>
        <Link href="/admin/financeiro/lancamentos?tipo=receita&status=previsto"><Stat label="Contas a receber" value={formatBRL(fin.incomeExpected - fin.incomeReceived)} hint={overdue ? `${formatBRL(overdue)} vencido` : "Nada vencido"} tone={overdue ? "bad" : "default"} /></Link>
        <Link href="/admin/financeiro/lancamentos?tipo=despesa"><Stat label="Contas a pagar (mês)" value={formatBRL(fin.expenseExpected - fin.expensePaid)} hint={`Pago: ${formatBRL(fin.expensePaid)}`} /></Link>
        <Link href="/admin/chatbot/conversas"><Stat label={`Conversas com IA (${days} dias)`} value={String(chats ?? 0)} hint={handoffs ? `${handoffs} aguardando humano` : "Fila humana vazia"} /></Link>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="Leads por mês (12 meses)" className="xl:col-span-2"><SingleBarChart data={monthly} label="Leads" /></Panel>
        <Panel title="Funil (período)">
          <ul className="space-y-2">
            {STAGES.map((s) => {
              const n = L.filter((l) => l.stage === s.value).length;
              const pct = L.length ? (n / L.length) * 100 : 0;
              return (
                <li key={s.value}>
                  <div className="flex justify-between text-sm"><span>{s.label}</span><span className="font-semibold">{n}</span></div>
                  <div className="mt-1 h-2 rounded-full bg-mist-100"><div className="h-2 rounded-full bg-turq-400" style={{ width: `${pct}%` }} /></div>
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel title="Origem dos leads"><SingleBarChart data={count("source")} label="Leads" horizontal /></Panel>
        <Panel title="Serviços mais procurados" className="xl:col-span-2"><SingleBarChart data={count("service")} label="Leads" horizontal /></Panel>
      </div>
    </>
  );
}
