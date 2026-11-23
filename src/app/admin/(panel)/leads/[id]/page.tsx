import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { ActionButton } from "@/components/admin/action-button";
import { HistoryForm } from "@/components/admin/history-form";
import { LeadEditForm, type LeadRow } from "@/components/admin/lead-edit-form";
import { addLeadActivity, convertLeadToClient, deleteLead } from "@/lib/admin/crm-actions";
import { SOURCE_LABEL } from "@/lib/admin/crm-constants";
import { grantMarketingConsent, revokeMarketingConsent, syncLead } from "@/lib/admin/marketing-actions";
import { AUDIENCE_LABEL } from "@/lib/resend";
import { formatDate, whatsappLink } from "@/lib/utils";

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const db = await createClient();
  const [{ data: lead }, { data: acts }, { data: conv }] = await Promise.all([
    db.from("leads").select("*").eq("id", id).maybeSingle(),
    db.from("lead_activities").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
    db.from("chat_conversations").select("id").eq("lead_id", id).maybeSingle(),
  ]);
  if (!lead) notFound();
  const wa = lead.phone ? whatsappLink(lead.phone.replace(/\D/g, "").length <= 11 ? "55" + lead.phone : lead.phone) : null;
  const utm = Object.entries((lead.utm ?? {}) as Record<string, string>);

  return (
    <>
      <PageHeader title={lead.name} back={{ href: "/admin/leads", label: "Leads" }}
        description={`Recebido em ${formatDate(lead.created_at, { dateStyle: "long" } as Intl.DateTimeFormatOptions)} · Origem: ${SOURCE_LABEL[lead.source] ?? lead.source}`}
        actions={<>
          {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-ghost px-4 py-2 text-xs">Abrir WhatsApp</a>}
          {lead.email && <a href={`mailto:${lead.email}`} className="btn-ghost px-4 py-2 text-xs">Enviar e-mail</a>}
          {lead.crm_client_id
            ? <Link href={`/admin/clientes/${lead.crm_client_id}`} className="btn-primary px-4 py-2 text-xs">Ver cliente no CRM</Link>
            : <ActionButton variant="primary" action={convertLeadToClient.bind(null, id)} confirm="Converter este lead em cliente no CRM?">Converter em cliente</ActionButton>}
          <ActionButton variant="danger" action={deleteLead.bind(null, id)} redirectTo="/admin/leads" confirm="Excluir definitivamente este lead e seu histórico? (use para pedidos de exclusão de dados — LGPD)">Excluir</ActionButton>
        </>} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {lead.message && <Panel title="Mensagem recebida"><p className="whitespace-pre-wrap text-sm text-mist-600">{lead.message}</p></Panel>}
          <Panel title="Dados do lead"><LeadEditForm lead={lead as LeadRow} /></Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Histórico comercial">
            <HistoryForm action={addLeadActivity.bind(null, id)} withKind />
            <ol className="mt-5 space-y-3 border-l-2 border-mist-200 pl-4">
              {(acts ?? []).map((a) => (
                <li key={a.id}>
                  <p className="text-xs text-mist-400">{new Date(a.created_at).toLocaleString("pt-BR")} · {a.kind}</p>
                  <p className="whitespace-pre-wrap text-sm">{a.content}</p>
                </li>
              ))}
              {!acts?.length && <li className="text-sm text-mist-600">Sem registros.</li>}
            </ol>
          </Panel>
          <Panel title="E-mail marketing">
            <dl className="space-y-2 text-sm">
              <div><dt className="text-xs text-mist-400">Tipo de público</dt><dd>{AUDIENCE_LABEL[lead.audience] ?? lead.audience}</dd></div>
              <div><dt className="text-xs text-mist-400">Aceita receber campanhas</dt><dd>{lead.marketing_consent ? `Sim — ${formatDate(lead.marketing_consent_at)}` : "Não"}</dd></div>
              {lead.marketing_consent && <div><dt className="text-xs text-mist-400">Resend</dt><dd>{lead.resend_synced_at ? `Sincronizado em ${formatDate(lead.resend_synced_at)}` : lead.resend_error ? `Erro: ${lead.resend_error}` : "Pendente"}</dd></div>}
            </dl>
            <div className="mt-3 flex flex-wrap gap-2">
              {lead.marketing_consent ? <>
                {!lead.resend_synced_at && <ActionButton variant="dark" action={syncLead.bind(null, id)}>Enviar ao Resend</ActionButton>}
                <ActionButton variant="danger" action={revokeMarketingConsent.bind(null, id)} confirm="Remover este contato da base de campanhas (descadastrar no Resend)?">Remover da base</ActionButton>
              </> : lead.email && <ActionButton action={grantMarketingConsent.bind(null, id)} confirm="Confirme que este contato autorizou receber e-mails de campanhas da RB (ex.: por escrito no WhatsApp). Registrar consentimento?">Registrar consentimento</ActionButton>}
            </div>
          </Panel>
          <Panel title="Rastreamento e consentimento">
            <dl className="space-y-2 text-sm">
              <div><dt className="text-xs text-mist-400">Consentimento LGPD</dt><dd>{lead.consent ? `Sim — ${formatDate(lead.consent_at)}` : "Não registrado"}</dd></div>
              {lead.landing_page && <div><dt className="text-xs text-mist-400">Página de entrada</dt><dd className="break-all">{lead.landing_page}</dd></div>}
              {utm.map(([k, v]) => <div key={k}><dt className="text-xs text-mist-400">{k}</dt><dd className="break-all">{v}</dd></div>)}
              {conv && <div><Link className="text-teal-600 hover:underline" href={`/admin/chatbot/conversas/${conv.id}`}>Ver conversa do chatbot</Link></div>}
            </dl>
          </Panel>
        </div>
      </div>
    </>
  );
}
