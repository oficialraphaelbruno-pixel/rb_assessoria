import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { LeadBoard, type BoardLead } from "@/components/admin/lead-board";
import { ManualLeadForm } from "@/components/admin/manual-lead-form";
import { STAGES, SOURCES, SOURCE_LABEL } from "@/lib/admin/crm-constants";
import { formatDate } from "@/lib/utils";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ q?: string; origem?: string; view?: string }> }) {
  await requireAdmin();
  const { q = "", origem = "", view = "funil" } = await searchParams;
  const db = await createClient();
  let query = db.from("leads").select("id, name, company, email, phone, service, source, stage, created_at, estimated_value_cents, next_followup_at, city").order("created_at", { ascending: false }).limit(500);
  if (origem && SOURCES.includes(origem)) query = query.eq("source", origem);
  if (q.trim()) {
    const s = q.trim().slice(0, 80).replace(/[%,()*]/g, " ");
    query = query.or(`name.ilike.%${s}%,company.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%,service.ilike.%${s}%,city.ilike.%${s}%`);
  }
  const { data } = await query;
  const leads = (data ?? []) as (BoardLead & { email: string | null; phone: string | null })[];

  return (
    <>
      <PageHeader title="Leads" description="Funil comercial: Novo lead → Contato iniciado → Qualificado → Proposta enviada → Negociação → Cliente fechado / Perdido."
        actions={<>
          <details className="relative">
            <summary className="btn-ghost cursor-pointer list-none px-4 py-2.5 text-xs">Exportar planilha ▾</summary>
            <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-mist-200 bg-white p-2 text-sm shadow-card">
              <a className="block rounded-lg px-3 py-2 hover:bg-mist-50" href={`/admin/leads/exportar${origem ? `?origem=${origem}` : ""}`}>Todos os contatos{origem ? " (origem filtrada)" : ""}</a>
              <a className="block rounded-lg px-3 py-2 hover:bg-mist-50" href="/admin/leads/exportar?tipo=clube">Só clubes e escolinhas</a>
              <a className="block rounded-lg px-3 py-2 hover:bg-mist-50" href="/admin/leads/exportar?tipo=empresa">Só empresas e profissionais</a>
              <a className="block rounded-lg px-3 py-2 hover:bg-mist-50" href="/admin/leads/exportar?etapa=novo">Só leads novos (sem contato)</a>
              <a className="block rounded-lg px-3 py-2 hover:bg-mist-50" href="/admin/leads/exportar?marketing=1">Só quem aceita e-mails</a>
              <a className="block rounded-lg px-3 py-2 text-mist-600 hover:bg-mist-50" href="/admin/leads/exportar?formato=csv">Todos em CSV</a>
            </div>
          </details>
          <Link href="/admin/leads/importar" className="btn-ghost px-4 py-2.5 text-xs">Importar planilha</Link>
          <ManualLeadForm />
        </>} />
      <form className="mb-4 flex flex-col gap-3 sm:flex-row" role="search">
        <input name="q" defaultValue={q} placeholder="Buscar por nome, empresa, e-mail, telefone…" className="input sm:max-w-sm" aria-label="Buscar leads" />
        <select name="origem" defaultValue={origem} className="input sm:w-48" aria-label="Origem">
          <option value="">Todas as origens</option>
          {SOURCES.map((s) => <option key={s} value={s}>{SOURCE_LABEL[s]}</option>)}
        </select>
        <input type="hidden" name="view" value={view} />
        <button className="btn-ghost px-4 py-2">Filtrar</button>
        <div className="flex gap-1 sm:ml-auto">
          <Link href={`?view=funil&q=${encodeURIComponent(q)}&origem=${origem}`} className={`rounded-lg px-3 py-2 text-sm ${view !== "lista" ? "bg-navy-800 text-white" : "bg-white"}`}>Funil</Link>
          <Link href={`?view=lista&q=${encodeURIComponent(q)}&origem=${origem}`} className={`rounded-lg px-3 py-2 text-sm ${view === "lista" ? "bg-navy-800 text-white" : "bg-white"}`}>Lista</Link>
        </div>
      </form>
      {view === "lista" ? (
        <Panel>
          <div className="-mx-6 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-y border-mist-200 bg-mist-50 text-xs uppercase text-mist-600"><tr>
                <th className="px-6 py-3">Nome</th><th className="px-6 py-3">Contato</th><th className="px-6 py-3">Serviço</th><th className="px-6 py-3">Origem</th><th className="px-6 py-3">Etapa</th><th className="px-6 py-3">Data</th>
              </tr></thead>
              <tbody className="divide-y divide-mist-100">
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-mist-50/60">
                    <td className="px-6 py-3"><Link href={`/admin/leads/${l.id}`} className="font-medium hover:text-teal-600">{l.name}</Link>{l.company && <span className="block text-xs text-mist-600">{l.company}</span>}</td>
                    <td className="px-6 py-3 text-xs">{l.email}<br />{l.phone}</td>
                    <td className="px-6 py-3">{l.service ?? "—"}</td>
                    <td className="px-6 py-3">{SOURCE_LABEL[l.source] ?? l.source}</td>
                    <td className="px-6 py-3">{STAGES.find((s) => s.value === l.stage)?.label}</td>
                    <td className="px-6 py-3">{formatDate(l.created_at)}</td>
                  </tr>
                ))}
                {!leads.length && <tr><td colSpan={6} className="px-6 py-10 text-center text-mist-600">Nenhum lead ainda.</td></tr>}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : <LeadBoard leads={leads} />}
    </>
  );
}
