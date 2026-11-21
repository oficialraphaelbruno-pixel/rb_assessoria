import Link from "next/link";
import { ResourceEditView } from "@/components/admin/resource-views";
import { Panel, StatusBadge } from "@/components/admin/page-header";
import { HistoryForm } from "@/components/admin/history-form";
import { addClientHistory } from "@/lib/admin/crm-actions";
import { createClient } from "@/lib/supabase/server";
import { formatBRL, formatDate } from "@/lib/utils";

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "novo") return <ResourceEditView resourceKey="crm" id={id} />;
  const db = await createClient();
  const [{ data: history }, { data: projects }, { data: tx }] = await Promise.all([
    db.from("client_history").select("*").eq("client_id", id).order("created_at", { ascending: false }),
    db.from("projects").select("id, name, status, due_date").eq("client_id", id).order("due_date"),
    db.from("v_fin_transactions").select("id, description, amount_cents, due_date, effective_status, kind").eq("client_id", id).order("due_date", { ascending: false }).limit(24),
  ]);
  return (
    <ResourceEditView resourceKey="crm" id={id}>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Histórico comercial" className="lg:col-span-1">
          <HistoryForm action={addClientHistory.bind(null, id)} />
          <ol className="mt-5 space-y-3 border-l-2 border-mist-200 pl-4">
            {(history ?? []).map((h) => <li key={h.id}><p className="text-xs text-mist-400">{new Date(h.created_at).toLocaleString("pt-BR")}</p><p className="whitespace-pre-wrap text-sm">{h.content}</p></li>)}
            {!history?.length && <li className="text-sm text-mist-600">Sem registros.</li>}
          </ol>
        </Panel>
        <Panel title="Projetos associados" actions={<Link href="/admin/projetos/novo" className="text-xs font-semibold text-teal-600 hover:underline">+ Novo projeto</Link>}>
          <ul className="space-y-2">
            {(projects ?? []).map((p) => <li key={p.id} className="flex items-center justify-between gap-2"><Link href={`/admin/projetos/${p.id}`} className="text-sm font-medium hover:text-teal-600">{p.name}</Link><span className="flex items-center gap-2 text-xs text-mist-600">{formatDate(p.due_date)} <StatusBadge value={p.status} /></span></li>)}
            {!projects?.length && <li className="text-sm text-mist-600">Nenhum projeto.</li>}
          </ul>
        </Panel>
        <Panel title="Pagamentos" actions={<Link href={`/admin/financeiro/lancamentos?cliente=${id}`} className="text-xs font-semibold text-teal-600 hover:underline">Ver todos</Link>}>
          <ul className="space-y-2">
            {(tx ?? []).map((t) => <li key={t.id} className="flex items-center justify-between gap-2 text-sm"><span className="min-w-0 truncate">{formatDate(t.due_date)} · {t.description}</span><span className="flex shrink-0 items-center gap-2">{formatBRL(t.amount_cents)} <StatusBadge value={t.effective_status} /></span></li>)}
            {!tx?.length && <li className="text-sm text-mist-600">Nenhum lançamento.</li>}
          </ul>
        </Panel>
      </div>
    </ResourceEditView>
  );
}
