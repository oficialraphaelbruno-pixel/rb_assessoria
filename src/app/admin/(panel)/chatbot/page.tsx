import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { Stat } from "@/components/admin/stat";
import { ChatSettingsForm } from "@/components/admin/chat-admin";
import { MODEL_SUGGESTIONS } from "@/lib/ai/providers";
import { env } from "@/lib/env";

export default async function ChatbotPage() {
  await requireAdmin();
  const db = await createClient();
  const start = new Date(); start.setUTCDate(1); start.setUTCHours(0, 0, 0, 0);
  const [{ data: s }, { data: usage }, { count: convs }, { count: handoffs }] = await Promise.all([
    db.from("chat_settings").select("*").eq("id", 1).single(),
    db.from("v_ai_usage_monthly").select("*").order("month", { ascending: false }).limit(6),
    db.from("chat_conversations").select("id", { count: "exact", head: true }).gte("created_at", start.toISOString()),
    db.from("chat_conversations").select("id", { count: "exact", head: true }).eq("needs_human", true),
  ]);
  const cur = usage?.[0] && new Date(usage[0].month).getUTCMonth() === start.getUTCMonth() ? usage[0] : null;
  const spent = Number(cur?.cost_usd ?? 0);
  const budget = Number(s?.monthly_budget_usd ?? 0);
  const perConv = convs ? spent / convs : 0;
  const keys = { anthropic: !!env.anthropicKey, openai: !!env.openaiKey, service: !!env.supabaseServiceKey };

  return (
    <>
      <PageHeader title="Chatbot com IA" description="Atendimento automático do site com base de conhecimento, limites de custo e fila de atendimento humano."
        actions={<><Link href="/admin/chatbot/testar" className="btn-ghost px-4 py-2 text-xs">Testar o bot</Link><Link href="/admin/chatbot/conhecimento" className="btn-dark px-4 py-2 text-xs">Base de conhecimento</Link></>} />
      {(!keys.service || !keys[s?.provider as "anthropic" | "openai"]) && (
        <div role="alert" className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Configuração pendente:</strong>{" "}
          {!keys.service && "a variável SUPABASE_SERVICE_ROLE_KEY não está definida no servidor. "}
          {!keys[s?.provider as "anthropic" | "openai"] && `a chave de API do provedor “${s?.provider}” não está definida (${s?.provider === "openai" ? "OPENAI_API_KEY" : "ANTHROPIC_API_KEY"}). `}
          Enquanto isso, o site usa a resposta estática. Não use a assinatura ChatGPT Plus/Claude Pro: é preciso uma chave de API com faturamento próprio.
        </div>
      )}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Custo estimado no mês" value={`US$ ${spent.toFixed(4)}`} hint={budget ? `${Math.round((spent / budget) * 100)}% do limite de US$ ${budget.toFixed(2)}` : "Sem limite"} tone={budget && spent >= budget ? "bad" : "default"} />
        <Stat label="Conversas no mês" value={String(convs ?? 0)} hint={`Custo médio: US$ ${perConv.toFixed(5)}/conversa`} />
        <Stat label="Respostas da IA no mês" value={String(cur?.replies ?? 0)} hint={`${Number(cur?.tokens_in ?? 0).toLocaleString("pt-BR")} tokens entrada · ${Number(cur?.tokens_out ?? 0).toLocaleString("pt-BR")} saída`} />
        <Link href="/admin/chatbot/conversas?fila=1"><Stat label="Aguardando humano" value={String(handoffs ?? 0)} hint="Ver fila de atendimento" tone={handoffs ? "dark" : "default"} /></Link>
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Configurações" className="xl:col-span-2">{s && <ChatSettingsForm s={s} models={MODEL_SUGGESTIONS} keys={keys} />}</Panel>
        <Panel title="Histórico de consumo">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-mist-600"><tr><th className="pb-2">Mês</th><th className="pb-2">Respostas</th><th className="pb-2 text-right">Custo</th></tr></thead>
            <tbody className="divide-y divide-mist-100">
              {(usage ?? []).map((u) => <tr key={u.month}><td className="py-2">{new Date(u.month).toLocaleDateString("pt-BR", { month: "short", year: "numeric", timeZone: "UTC" })}</td><td className="py-2">{u.replies}</td><td className="py-2 text-right">US$ {Number(u.cost_usd).toFixed(4)}</td></tr>)}
              {!usage?.length && <tr><td colSpan={3} className="py-4 text-mist-600">Sem consumo registrado.</td></tr>}
            </tbody>
          </table>
          <p className="mt-4 text-xs text-mist-600">Estimativa calculada pelos tokens informados pelo provedor × preços configurados. A fatura oficial é a do provedor.</p>
        </Panel>
      </div>
    </>
  );
}
