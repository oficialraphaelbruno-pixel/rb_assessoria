import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { ActionButton } from "@/components/admin/action-button";
import { toggleIntegration } from "@/lib/admin/system-actions";
import { env } from "@/lib/env";

export default async function IntegrationsPage() {
  await requireAdmin();
  const db = await createClient();
  const { data } = await db.from("integrations").select("*").order("name");
  const checks = [
    ["Supabase (chave de servidor)", !!env.supabaseServiceKey],
    ["IA — Anthropic", !!env.anthropicKey], ["IA — OpenAI", !!env.openaiKey],
    ["E-mail — Resend", !!env.resendKey && !!env.notifyTo], ["Webhook de leads", !!env.leadsWebhookToken], ["Tarefas agendadas (cron)", !!env.cronSecret],
  ] as const;
  return (
    <>
      <PageHeader title="Integrações" description="Arquitetura preparada para canais externos. Nenhum serviço pago é contratado ou ativado automaticamente." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Variáveis de ambiente" className="lg:col-span-1">
          <ul className="space-y-2 text-sm">{checks.map(([l, ok]) => <li key={l} className="flex justify-between"><span>{l}</span><span className={ok ? "text-emerald-700" : "text-mist-400"}>{ok ? "configurado" : "não configurado"}</span></li>)}</ul>
          <p className="mt-4 text-xs text-mist-600">Segredos ficam só nas variáveis de ambiente da Vercel — nunca no banco ou no código.</p>
        </Panel>
        <Panel title="Canais" className="lg:col-span-2">
          <ul className="divide-y divide-mist-100">
            {(data ?? []).map((i) => (
              <li key={i.key} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="font-medium">{i.name} <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${i.enabled ? "bg-emerald-50 text-emerald-700" : "bg-mist-100 text-mist-600"}`}>{i.enabled ? "ativo" : "inativo"}</span></p><p className="text-xs text-mist-600">{i.notes}</p></div>
                <ActionButton action={toggleIntegration.bind(null, i.key, !i.enabled)} confirm={i.enabled ? undefined : `Marcar ${i.name} como ativo? (Isso apenas libera o recebimento de leads com essa origem; a conta no serviço externo deve ser criada por você.)`}>{i.enabled ? "Desativar" : "Ativar"}</ActionButton>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Webhook para receber leads (ManyChat, formulários de anúncios, Zapier/Make)" className="lg:col-span-3">
          <pre className="overflow-x-auto rounded-xl bg-ink-900 p-4 text-xs text-turq-200">{`POST ${env.siteUrl}/api/webhooks/leads
Authorization: Bearer <LEADS_WEBHOOK_TOKEN>
Content-Type: application/json

{ "source": "manychat", "name": "Maria", "phone": "31999999999", "email": "",
  "service": "Social Media", "message": "Comentou PENEIRA", "consent": true,
  "utm": { "utm_campaign": "peneira-2027" } }`}</pre>
          <p className="mt-3 text-xs text-mist-600">A origem precisa estar ativa nesta página. O lead entra no funil com a origem informada e gera notificação.</p>
        </Panel>
      </div>
    </>
  );
}
