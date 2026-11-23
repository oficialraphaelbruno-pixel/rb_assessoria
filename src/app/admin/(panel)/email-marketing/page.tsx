import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { Stat } from "@/components/admin/stat";
import { ActionButton } from "@/components/admin/action-button";
import { syncLead, syncPending } from "@/lib/admin/marketing-actions";
import { AUDIENCE_LABEL, resendConfigured } from "@/lib/resend";
import { formatDate } from "@/lib/utils";

export default async function EmailMarketingPage({ searchParams }: { searchParams: Promise<{ tipo?: string; q?: string }> }) {
  await requireAdmin();
  const { tipo = "", q = "" } = await searchParams;
  const db = await createClient();
  let query = db.from("leads").select("id, name, email, phone, company, service, audience, source, marketing_consent_at, resend_synced_at, resend_error, created_at")
    .eq("marketing_consent", true).order("created_at", { ascending: false }).limit(1000);
  if (["clube", "empresa", "outro"].includes(tipo)) query = query.eq("audience", tipo);
  if (q.trim()) { const s = q.trim().slice(0, 80).replace(/[%,()*]/g, " "); query = query.or(`name.ilike.%${s}%,email.ilike.%${s}%,company.ilike.%${s}%`); }
  const [{ data: rows }, { count: total }, { count: clubes }, { count: empresas }, { count: pend }] = await Promise.all([
    query,
    db.from("leads").select("id", { count: "exact", head: true }).eq("marketing_consent", true),
    db.from("leads").select("id", { count: "exact", head: true }).eq("marketing_consent", true).eq("audience", "clube"),
    db.from("leads").select("id", { count: "exact", head: true }).eq("marketing_consent", true).eq("audience", "empresa"),
    db.from("leads").select("id", { count: "exact", head: true }).eq("marketing_consent", true).is("resend_synced_at", null),
  ]);
  const configured = resendConfigured();
  const exportHref = `/admin/leads/exportar?marketing=1${tipo ? `&tipo=${tipo}` : ""}`;

  return (
    <>
      <PageHeader title="E-mail marketing" description="Base de contatos que aceitaram receber campanhas. Quem marca a opção no formulário do site entra aqui e no Resend automaticamente, classificado como clube/escolinha ou empresa."
        actions={<>
          <a href={exportHref} className="btn-ghost px-4 py-2.5 text-xs">Exportar planilha</a>
          {configured && <ActionButton variant="dark" action={syncPending}>Enviar pendentes ao Resend</ActionButton>}
        </>} />
      {!configured && (
        <div role="alert" className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Resend não conectado neste ambiente.</strong> Defina <code>RESEND_API_KEY</code> e <code>RESEND_SEGMENT_ID</code> na Vercel e faça Redeploy. Os contatos continuam sendo salvos aqui e serão enviados quando a conexão for feita.
        </div>
      )}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Contatos na base" value={String(total ?? 0)} tone="dark" />
        <Link href="?tipo=clube"><Stat label="Clubes / escolinhas" value={String(clubes ?? 0)} /></Link>
        <Link href="?tipo=empresa"><Stat label="Empresas / profissionais" value={String(empresas ?? 0)} /></Link>
        <Stat label="Aguardando envio ao Resend" value={String(pend ?? 0)} tone={pend ? "bad" : "default"} />
      </div>
      <Panel>
        <form className="mb-4 flex flex-col gap-3 sm:flex-row" role="search">
          <input name="q" defaultValue={q} placeholder="Buscar nome, e-mail ou empresa" className="input sm:max-w-sm" aria-label="Buscar" />
          <select name="tipo" defaultValue={tipo} className="input sm:w-56" aria-label="Tipo">
            <option value="">Todos os tipos</option>
            {Object.entries(AUDIENCE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button className="btn-ghost px-4 py-2">Filtrar</button>
        </form>
        <div className="-mx-6 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-y border-mist-200 bg-mist-50 text-xs uppercase text-mist-600"><tr>
              <th className="px-6 py-3">Nome</th><th className="px-6 py-3">E-mail</th><th className="px-6 py-3">Empresa / equipe</th><th className="px-6 py-3">Tipo</th><th className="px-6 py-3">Aceite</th><th className="px-6 py-3">Resend</th>
            </tr></thead>
            <tbody className="divide-y divide-mist-100">
              {(rows ?? []).map((l) => (
                <tr key={l.id} className="hover:bg-mist-50/60">
                  <td className="px-6 py-3"><Link href={`/admin/leads/${l.id}`} className="font-medium hover:text-teal-600">{l.name}</Link><span className="block text-xs text-mist-600">{l.service ?? "—"}</span></td>
                  <td className="px-6 py-3">{l.email}</td>
                  <td className="px-6 py-3">{l.company ?? "—"}</td>
                  <td className="px-6 py-3">{AUDIENCE_LABEL[l.audience]}</td>
                  <td className="px-6 py-3 text-xs">{formatDate(l.marketing_consent_at)}</td>
                  <td className="px-6 py-3 text-xs">
                    {l.resend_synced_at ? <span className="text-emerald-700">Sincronizado</span>
                      : <span className="flex flex-col gap-1">{l.resend_error ? <span className="text-red-600" title={l.resend_error}>Erro</span> : <span className="text-amber-700">Pendente</span>}
                        {configured && <ActionButton action={syncLead.bind(null, l.id)} className="px-2 py-1">Enviar</ActionButton>}</span>}
                  </td>
                </tr>
              ))}
              {!rows?.length && <tr><td colSpan={6} className="px-6 py-10 text-center text-mist-600">Nenhum contato com consentimento de marketing ainda.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="Como disparar uma campanha" className="mt-6">
        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-mist-600">
          <li>Os contatos daqui ficam no segmento <strong>“RB — Leads do site (todos)”</strong> no Resend, com os campos <code>rb_tipo</code> (clube / empresa), <code>rb_empresa</code> e <code>rb_servico</code>.</li>
          <li>Peça ao Claude o disparo informando o público (ex.: “só clubes e escolinhas”), o assunto e a mensagem. A campanha é montada como rascunho no Resend e enviada após a sua aprovação.</li>
          <li>Todo e-mail de campanha leva link de descadastro. Quem se descadastrar não recebe mais nada.</li>
          <li>Para envio, é necessário um domínio próprio da RB verificado no Resend (ex.: <code>rbassessoria.com.br</code>).</li>
        </ol>
      </Panel>
    </>
  );
}
